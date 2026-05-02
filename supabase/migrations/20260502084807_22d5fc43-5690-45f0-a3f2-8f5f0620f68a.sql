
-- ============================================================
-- ROLES
-- ============================================================
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'gift_recorder', 'viewer');

CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  password_hash TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
-- No public policies; only service role (edge function) accesses.

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Bootstrap super-admin (password set on first login via edge function fallback to ADMIN_PASSWORD)
INSERT INTO public.admin_users (id, email, name, is_active)
VALUES ('00000000-0000-0000-0000-000000000001', 'owner@wedding.local', 'Wedding Owner', true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'super_admin')
ON CONFLICT DO NOTHING;

-- ============================================================
-- GIFT RECORDS (unified ledger)
-- ============================================================
CREATE TABLE public.gift_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_type TEXT NOT NULL DEFAULT 'individual' CHECK (donor_type IN ('individual','family','group','anonymous')),
  donor_name TEXT NOT NULL,
  donor_phone TEXT,
  donor_email TEXT,
  gift_type TEXT NOT NULL DEFAULT 'cash' CHECK (gift_type IN ('cash','momo','bank','physical','in_kind')),
  amount NUMERIC,
  currency TEXT NOT NULL DEFAULT 'GHS',
  description TEXT,
  received_by TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  is_visible_on_wall BOOLEAN NOT NULL DEFAULT true,
  thank_you_sent BOOLEAN NOT NULL DEFAULT false,
  created_by_user_id UUID REFERENCES public.admin_users(id),
  last_modified_by_user_id UUID REFERENCES public.admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gift_records ENABLE ROW LEVEL SECURITY;

-- Public can read only visible entries (for the public Gift Wall)
CREATE POLICY "Public reads visible gift records"
ON public.gift_records FOR SELECT
USING (is_visible_on_wall = true);

CREATE INDEX idx_gift_records_received_at ON public.gift_records(received_at DESC);
CREATE INDEX idx_gift_records_donor_phone ON public.gift_records(donor_phone);

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE public.gift_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID,
  action TEXT NOT NULL CHECK (action IN ('create','update','delete')),
  actor_user_id UUID,
  actor_name TEXT,
  actor_role TEXT,
  reason TEXT,
  before JSONB,
  after JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gift_audit_log ENABLE ROW LEVEL SECURITY;
-- No public policies; only service role accesses.
CREATE INDEX idx_gift_audit_record ON public.gift_audit_log(record_id);
CREATE INDEX idx_gift_audit_created ON public.gift_audit_log(created_at DESC);

-- Trigger function reads actor + reason from session GUCs set by edge function
CREATE OR REPLACE FUNCTION public.log_gift_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id UUID;
  v_actor_name TEXT;
  v_actor_role TEXT;
  v_reason TEXT;
BEGIN
  BEGIN v_actor_id := NULLIF(current_setting('app.actor_id', true), '')::UUID; EXCEPTION WHEN OTHERS THEN v_actor_id := NULL; END;
  v_actor_name := NULLIF(current_setting('app.actor_name', true), '');
  v_actor_role := NULLIF(current_setting('app.actor_role', true), '');
  v_reason     := NULLIF(current_setting('app.reason', true), '');

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.gift_audit_log(record_id, action, actor_user_id, actor_name, actor_role, reason, before, after)
    VALUES (NEW.id, 'create', v_actor_id, v_actor_name, v_actor_role, v_reason, NULL, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.gift_audit_log(record_id, action, actor_user_id, actor_name, actor_role, reason, before, after)
    VALUES (NEW.id, 'update', v_actor_id, v_actor_name, v_actor_role, v_reason, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.gift_audit_log(record_id, action, actor_user_id, actor_name, actor_role, reason, before, after)
    VALUES (OLD.id, 'delete', v_actor_id, v_actor_name, v_actor_role, v_reason, to_jsonb(OLD), NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_gift_records_audit
AFTER INSERT OR UPDATE OR DELETE ON public.gift_records
FOR EACH ROW EXECUTE FUNCTION public.log_gift_change();

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_gift_records_touch
BEFORE UPDATE ON public.gift_records
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_admin_users_touch
BEFORE UPDATE ON public.admin_users
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================
-- COPY existing gift_wall entries into gift_records
-- ============================================================
INSERT INTO public.gift_records (donor_name, donor_phone, donor_email, gift_type, description, received_at, is_visible_on_wall, created_at)
SELECT
  donor_name,
  phone,
  email,
  CASE
    WHEN gift_type = 'cash' THEN 'cash'
    WHEN gift_type = 'momo' THEN 'momo'
    WHEN gift_type = 'bank' THEN 'bank'
    WHEN gift_type = 'physical' THEN 'physical'
    WHEN gift_type IN ('kind','both') THEN 'in_kind'
    ELSE 'cash'
  END,
  message,
  created_at,
  is_visible,
  created_at
FROM public.gift_wall
WHERE NOT EXISTS (
  SELECT 1 FROM public.gift_records gr
  WHERE gr.donor_name = public.gift_wall.donor_name
    AND gr.created_at = public.gift_wall.created_at
);

-- ============================================================
-- RSVP CHECK-IN
-- ============================================================
ALTER TABLE public.rsvps
  ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS checked_in_by TEXT;

-- Allow public update only of check-in fields (guarded in edge function instead)
-- We keep RLS strict; check-in goes through edge function with service role.
