import { useCallback, useMemo, useState } from "react";

export function useRowSelection() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback((ids: string[]) => {
    setSelected((prev) => {
      const allSelected = ids.length > 0 && ids.every((i) => prev.has(i));
      if (allSelected) {
        const next = new Set(prev);
        ids.forEach((i) => next.delete(i));
        return next;
      }
      const next = new Set(prev);
      ids.forEach((i) => next.add(i));
      return next;
    });
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);
  const has = useCallback((id: string) => selected.has(id), [selected]);

  return useMemo(
    () => ({ selected, ids: Array.from(selected), count: selected.size, toggle, toggleAll, clear, has }),
    [selected, toggle, toggleAll, clear, has]
  );
}
