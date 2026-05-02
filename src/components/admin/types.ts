export interface RSVPRow {
  id: string;
  guest_name: string;
  phone: string | null;
  email: string | null;
  attending: boolean | null;
  plus_one_name: string | null;
  message: string | null;
  created_at: string;
  checked_in_at?: string | null;
  checked_in_by?: string | null;
}

export interface GiftWallRow {
  id: string;
  donor_name: string;
  gift_type: string;
  message: string | null;
  is_visible: boolean;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export interface GiftPaymentRow {
  id: string;
  gift_option_id: string;
  donor_name: string;
  donor_email: string | null;
  donor_phone: string | null;
  amount: number;
  currency: string;
  payment_method: string | null;
  payment_provider: string | null;
  payment_reference: string | null;
  status: string;
  created_at: string;
}

export interface GiftRecordRow {
  id: string;
  donor_type: "individual" | "family" | "group" | "anonymous";
  donor_name: string;
  donor_phone: string | null;
  donor_email: string | null;
  gift_type: "cash" | "momo" | "bank" | "physical" | "in_kind";
  amount: number | null;
  currency: string;
  description: string | null;
  received_by: string | null;
  received_at: string;
  notes: string | null;
  is_visible_on_wall: boolean;
  thank_you_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLogRow {
  id: string;
  record_id: string | null;
  action: "create" | "update" | "delete";
  actor_user_id: string | null;
  actor_name: string | null;
  actor_role: string | null;
  reason: string | null;
  before: any;
  after: any;
  created_at: string;
}

export interface DashboardData {
  rsvps: RSVPRow[];
  events: any[];
  venue: any;
  photos: any[];
  settings: any;
  email_list: any[];
  gift_options: any[];
  gift_payments: GiftPaymentRow[];
  payment_settings: any;
  email_settings: any;
  gift_wall: GiftWallRow[];
  gift_records: GiftRecordRow[];
  actor?: { uid: string; role: string; name: string };
}
