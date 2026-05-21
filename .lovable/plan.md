## Goal
Display the couple's full names in the Hero, between the "Together with their families" tagline and the "Request the pleasure of your company" line, with the first names *Albert* and *Ruby* italicized.

## Layout
```
Together with their families
       ─── ♥ ───
  *Albert* Asakiso Apiligu
            &
  *Ruby* Teye-Doryumu
Request the pleasure of your company
            13th June, 2026
```

## Changes

### `src/components/Hero.tsx`
- After the divider (heart + lines) block and before the "Request the pleasure of your company" paragraph, insert a new block rendering the full names.
- Derive `firstNames` from `settings.couple_names.split("&")` (already done) and pair with hardcoded surnames: `Asakiso Apiligu` for Albert, `Teye-Doryumu` for Ruby. Render with the first name wrapped in `<em>` using the display serif font, the rest in the body weight.
- Use existing design tokens: `font-display`, `text-foreground`, responsive sizes (e.g. `text-xl md:text-2xl`), and `animate-fade-in` with a delay between the divider (0.3s) and the next line (0.4s), e.g. `0.35s`.
- Center-aligned, stacked, with an "&" separator styled in `text-primary`.
- Also gate behind `settingsLoaded` only if needed — names are hardcoded surnames + parsed first names from defaults, so safe to render immediately.

## Out of scope
- No DB/schema changes (surnames are hardcoded in the component since `site_settings.couple_names` only stores short names).
- No changes to Footer, Navigation, or other pages.
