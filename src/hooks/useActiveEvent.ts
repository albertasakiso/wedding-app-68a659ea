import { useEffect, useState } from "react";

export interface TimedEvent {
  id: string;
  event_time: string;
  title: string;
  description?: string | null;
  location?: string | null;
}

/**
 * Returns the index of the event currently happening (or -1).
 * Active = the most-recently-started event whose successor hasn't started yet.
 * Re-evaluates every minute.
 */
export function useActiveEvent(events: TimedEvent[]) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  let activeIndex = -1;
  events.forEach((e, i) => {
    const start = new Date(e.event_time).getTime();
    const next = events[i + 1] ? new Date(events[i + 1].event_time).getTime() : Infinity;
    if (now >= start && now < next) activeIndex = i;
  });

  return { activeIndex, activeEvent: activeIndex >= 0 ? events[activeIndex] : null, now };
}
