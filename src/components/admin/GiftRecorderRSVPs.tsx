import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/lib/admin-api";
import RSVPsTab from "./RSVPsTab";
import type { RSVPRow } from "./types";

export default function GiftRecorderRSVPs() {
  const [rsvps, setRsvps] = useState<RSVPRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi("get-dashboard");
      setRsvps((data?.rsvps || []) as RSVPRow[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  if (loading) return <p className="text-center text-muted-foreground py-8 animate-pulse">Loading…</p>;
  return <RSVPsTab rsvps={rsvps} onRefresh={refresh} />;
}
