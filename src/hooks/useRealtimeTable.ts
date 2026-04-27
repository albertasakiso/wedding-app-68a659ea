import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribe to realtime changes on a Postgres table and run a callback
 * whenever an INSERT/UPDATE/DELETE event fires. Auto-cleans the channel.
 */
export function useRealtimeTable(table: string, onChange: () => void, channelKey?: string) {
  useEffect(() => {
    const channel = supabase
      .channel(channelKey || `${table}-realtime-${Math.random().toString(36).slice(2, 8)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => onChange()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);
}
