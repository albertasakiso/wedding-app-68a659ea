# Speed & Polish: Programme + QR Landing

## Why the programme doesn't load from QR

`src/pages/Programme.tsx` imports `src/lib/programme-pdf.ts` at the top, which statically imports `jspdf` (~150 KB gz) and `html2canvas` (~50 KB gz). Both ship in the Programme route chunk even though they are only used when the user taps "Download PDF". On a phone over 3G/4G this can stall or fail the route, so the page never appears after scanning the QR.

There are also 7 separate Supabase round-trips fired in parallel on mount (one per programme table) and no skeleton — the user sees a blank spinner the entire time.

## Plan

### 1. Lazy-load PDF generation (biggest win)
- In `Programme.tsx`, replace the static `import { downloadElementAsPdf } from "@/lib/programme-pdf"` with a dynamic import **inside the click handler**:
  ```ts
  const { downloadElementAsPdf } = await import("@/lib/programme-pdf");
  ```
- Result: `jspdf` + `html2canvas` move into their own chunk, fetched only when a guest taps "Download PDF". Programme route chunk shrinks dramatically.

### 2. Manual Vite chunk splitting
Update `vite.config.ts` `build.rollupOptions.output.manualChunks` to isolate heavy/optional libs so they don't bloat the main bundle:
- `pdf` → `jspdf`, `html2canvas`
- `charts`/`motion` → `framer-motion`
- `vendor-react` → react, react-dom, react-router-dom
- `vendor-supabase` → `@supabase/supabase-js`
- `qrcode` → `qrcode`

Also set `build.target: "es2020"` and `build.cssCodeSplit: true` (default but explicit).

### 3. Single RPC for programme data
Add a Postgres RPC `get_programme()` (security definer, returns json) that returns all 7 tables in one round-trip. Update `useProgramme.ts` to call `supabase.rpc("get_programme")` instead of 7 separate selects. Falls back to the current parallel queries if the RPC errors (defensive). One TLS round-trip vs seven ⇒ noticeably faster on mobile.

### 4. Prefetch programme data + route from QR landing
In `QrLanding.tsx`:
- Prefetch the Programme route chunk on mount: `import("@/pages/Programme")` (fire-and-forget).
- Prefetch programme data via `queryClient.prefetchQuery(["programme"], fetchProgramme)`.
- When the guest then taps "Wedding Programme", the page is already warm.

### 5. Programme page UX polish
- Replace the full-screen spinner with a **shimmer skeleton** matching the programme layout (cover + order-of-service list) so it feels instant.
- Add `loading="lazy"` / `decoding="async"` to any imagery.
- Add `<link rel="preconnect">` for the Supabase project URL in `index.html` to cut TLS handshake latency on first call.
- Render sections in a `<Suspense>` boundary per major block to allow progressive paint (cover renders immediately even before data arrives).

### 6. QR landing micro-fixes
- Combine the two Supabase selects into a single Promise.all (already cheap, but use one effect, set both atomically).
- Add subtle entrance fade and ensure tap targets meet 44 px on mobile (cards are already large — verify spacing).
- Add `prefetch` `<link rel="modulepreload">` hints for the most-tapped routes (Programme, MyDay).

### 7. Service-worker cache (optional, defer)
`public/sw.js` exists. Add cache-first strategy for `/assets/*.js|css|woff2` and a stale-while-revalidate for the programme RPC response. Flagged optional — only do this if you want the page to work offline for guests with bad reception at the venue.

## Files

**Edit**
- `src/pages/Programme.tsx` — dynamic import for PDF, skeleton, suspense
- `src/lib/programme-pdf.ts` — no change to logic (kept for dynamic import target)
- `src/hooks/useProgramme.ts` — switch to `rpc("get_programme")` with fallback
- `src/pages/QrLanding.tsx` — prefetch route + data
- `vite.config.ts` — manualChunks + target
- `index.html` — preconnect to Supabase

**New**
- `supabase/migrations/<ts>_get_programme_rpc.sql` — single RPC returning all programme tables as JSON
- `src/components/ProgrammeSkeleton.tsx` — shimmer skeleton for programme page

## Expected impact
- Programme route JS: ~250 KB → ~30 KB gz (PDF libs deferred)
- Programme data fetch: 7 requests → 1 request
- Perceived load on QR scan: blank spinner → instant skeleton, content within ~300 ms on 4G
- "Download PDF" delay shifts to the moment of click (acceptable, user expects it)

Confirm and I'll implement, or tell me which sections to drop (e.g. skip the RPC if you'd rather not add a migration, or skip the service worker).
