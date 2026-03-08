

## Create Deployment Redirect Files

For SPA (Single Page Application) routing to work on deployment, we need redirect/rewrite rules so that all routes (like `/rsvp`, `/gallery`, `/admin`) don't return 404 when accessed directly or refreshed.

### Files to Create

1. **`public/_redirects`** - Netlify-style redirect (also used by Lovable's hosting)
   - Single rule: `/* /index.html 200`

2. **`public/_headers`** - Security and caching headers
   - Cache control for assets, security headers (X-Frame-Options, etc.)

3. **`vercel.json`** - Vercel deployment support
   - Rewrite all routes to `/index.html`

4. **`public/404.html`** - Fallback for hosts that serve custom 404 pages
   - Meta refresh redirect to `/` with the original path preserved

These are standard SPA deployment files that ensure deep links and page refreshes work correctly across common hosting platforms.

