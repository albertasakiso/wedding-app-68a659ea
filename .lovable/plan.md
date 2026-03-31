

## Visual Polish, Performance & Mobile Improvements

### 1. Homepage — Entrance Animations & Lazy Loading

**`src/components/Hero.tsx`**:
- Add `will-change-transform` to floating decorative blobs for smoother GPU-accelerated animation
- On mobile, reduce blob sizes and hide the ornamental double border (too tight on small screens)
- Make countdown grid `grid-cols-2 gap-3` on very small screens (`<400px`) so numbers don't squeeze

**`src/components/EventTimeline.tsx`**:
- Add scroll-triggered fade-in using Intersection Observer (wrap each timeline card in a component that fades in when visible)
- On mobile, the timeline dots overlap with text — increase `ml-24` to `ml-28` and reduce icon container from `w-16 h-16` to `w-12 h-12` on small screens

**`src/components/VenueSection.tsx`**:
- Lazy-load the OpenStreetMap iframe with `loading="lazy"` (already done) + add a placeholder skeleton while loading
- Hotel cards: add subtle hover scale effect

**`src/components/GalleryPreview.tsx`**:
- Add `loading="lazy"` (already done) + add fade-in on image load using `onLoad` state
- Add scroll-triggered animation for the section entry

**`src/components/MessagesWall.tsx`**:
- Pause animation on hover (add `whileHover` or CSS `hover:animation-play-state: paused` equivalent via framer-motion)
- Add `will-change-transform` to the motion div for smoother scrolling
- On mobile (single column visible), ensure the column is centered

### 2. Gallery Page — Performance & Polish

**`src/pages/Gallery.tsx`**:
- Add image skeleton/placeholder (shimmer effect) while images load using `onLoad` state toggle
- Add fade-in transition when each image loads (`opacity-0 → opacity-100`)
- Lightbox: add swipe gesture support on mobile using touch events (touchstart/touchend delta)
- Lightbox: add image loading indicator for large photos
- Preload adjacent images in lightbox for faster navigation

### 3. Gifts Page — Mobile & Visual Polish

**`src/pages/Gifts.tsx`**:
- Payment cards: add subtle `hover:scale-[1.01]` and `transition-transform` for tactile feel
- Copy button: add a brief highlight animation on the copied number (flash the text primary color)
- Celebration Wall: on mobile, stack columns vertically with reduced max-height (`max-h-[300px]`) so both sections are visible without excessive scrolling
- Add section fade-in animations on scroll

### 4. Shared: Scroll Animation Utility

**`src/hooks/useScrollReveal.ts`** (new):
- Small custom hook using Intersection Observer that returns a `ref` and `isVisible` boolean
- Used across EventTimeline, VenueSection, GalleryPreview, and Gifts page for consistent scroll-triggered fade-in animations
- Configurable threshold and rootMargin

### 5. Tailwind Config — New Utility Animations

**`tailwind.config.ts`**:
- Add `scale-in` keyframe (from `scale(0.95) opacity(0)` to `scale(1) opacity(1)`)
- Add `shimmer` keyframe for image loading placeholder

### Files Summary

| File | Change |
|------|--------|
| `src/hooks/useScrollReveal.ts` | New: reusable Intersection Observer hook |
| `tailwind.config.ts` | Add `scale-in` and `shimmer` keyframes |
| `src/components/Hero.tsx` | GPU hints, mobile blob sizing, responsive countdown |
| `src/components/EventTimeline.tsx` | Scroll-reveal animation, mobile spacing fix |
| `src/components/VenueSection.tsx` | Iframe skeleton, hover effects |
| `src/components/GalleryPreview.tsx` | Image fade-in on load |
| `src/components/MessagesWall.tsx` | Pause on hover, GPU hints, mobile centering |
| `src/pages/Gallery.tsx` | Image skeletons, lightbox swipe + preload |
| `src/pages/Gifts.tsx` | Card hover effects, mobile wall layout, scroll animations |

