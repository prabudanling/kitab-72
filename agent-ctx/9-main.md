# Task 9 — Luxury Features for KNBMP Flipbook

## Status: COMPLETED

## What was done

### Feature 1: Page Numbers on Every Page
- Created `PageNumber` component showing `— {index + 1} —` in DM Serif Display, color `#C5A05960`
- Modified `renderPage(page, index)` → `renderPage(page, index, total)`
- Cover and back-cover pages skip page numbers
- All other pages wrapped in `<>content<PageNumber /></>` fragments

### Feature 2: Scroll Indicator
- Created `ScrollIndicator` component with ResizeObserver + scroll event
- Animated bouncing ChevronDown (framer-motion y: [0,5,0] infinite)
- Added to TocPage, PillarDetailPage01, and PillarDetailPage
- Each has its own `useRef<HTMLDivElement>(null)` for the scroll container

### Feature 3: Fix PGA-01 Font Issues
- Scroll container padding: `py-5 sm:py-7` → `pt-5 sm:pt-7 pb-14 sm:pb-16`
- PillarDetailPage also got `pb-14 sm:pb-16`
- Font sizes bumped: `text-[12px]` → `text-[13px]`, `text-[11px]` → `text-xs`, `text-[10px] sm:text-[11px]` → `text-[11px] sm:text-xs`

### Feature 4: Luxury Touches
- Gold edge shimmer: 3px gradient strip on right edge of book (desktop + mobile)
- Book spine shadow: `.book-spine-shadow` CSS class with `inset 8px 0 16px -8px rgba(0,0,0,0.06)`
- Refined navigation: gold separator lines, DM Serif Display font, wider letter-spacing

## Files Modified
- `src/app/page.tsx` (~2580 lines)
- `src/app/globals.css` (added book-spine-shadow class)

## Quality
- `bun run lint`: 0 errors
- Dev server: Compiles successfully (GET / 200)
