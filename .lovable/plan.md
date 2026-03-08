

## Implement Deployment Redirects

The project already has redirect configs for Netlify (`_redirects`), Vercel (`vercel.json`), and a `404.html` fallback for GitHub Pages. However, the `404.html` redirect stores the path in `sessionStorage` but `App.tsx` never reads it back to restore the route. Let me fix the full SPA redirect chain.

### Changes

**`public/404.html`** — Already correct, stores path in `sessionStorage` and redirects to `/`.

**`src/App.tsx`** — Add redirect restoration logic: on mount, check `sessionStorage` for a stored redirect path and use `navigate()` to restore it. This completes the GitHub Pages SPA redirect flow.

**`public/_redirects`** — Already correct for Netlify (`/* /index.html 200`).

**`vercel.json`** — Already correct for Vercel.

**`netlify.toml`** (new) — Add as a backup Netlify config with the same SPA redirect rule, ensuring it works regardless of deployment method.

### Files
| File | Change |
|------|--------|
| `src/App.tsx` | Wrap `BrowserRouter` content with a `RedirectHandler` component that reads `sessionStorage.redirect` on mount and navigates to the stored path |
| `netlify.toml` | New file with `[[redirects]]` SPA fallback rule |

