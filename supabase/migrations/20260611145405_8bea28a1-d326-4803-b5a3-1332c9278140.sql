
CREATE OR REPLACE FUNCTION public.get_programme()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'sections',       COALESCE((SELECT jsonb_agg(s ORDER BY s.order_index) FROM public.programme_sections s), '[]'::jsonb),
    'functionaries',  COALESCE((SELECT jsonb_agg(f ORDER BY f.order_index) FROM public.programme_functionaries f), '[]'::jsonb),
    'orderOfService', COALESCE((SELECT jsonb_agg(o ORDER BY o.order_index) FROM public.programme_order_of_service o), '[]'::jsonb),
    'hymns',          COALESCE((SELECT jsonb_agg(h ORDER BY h.order_index) FROM public.programme_hymns h), '[]'::jsonb),
    'photography',    COALESCE((SELECT jsonb_agg(p ORDER BY p.order_index) FROM public.programme_photography p), '[]'::jsonb),
    'credits',        COALESCE((SELECT jsonb_agg(c ORDER BY c.order_index) FROM public.programme_credits c), '[]'::jsonb),
    'thankYou',       (SELECT to_jsonb(t) FROM public.programme_thank_you t LIMIT 1)
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_programme() TO anon, authenticated, service_role;
