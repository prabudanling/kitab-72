---
Task ID: 3
Agent: Main
Task: Complete concept transformation from website to premium digital flipbook — immersive sequential reading experience

Work Log:
- User requested full concept change: from multi-section website to a **digital flipbook** where readers focus on reading from front to back, page by page
- Designed flipbook architecture: 87 pages total with CSS 3D page flip animation
- Page structure:
  - Page 1: Front Cover (warm parchment #FAF9F6, gold borders, KNBMP PGA-72 branding)
  - Page 2: Dedication/Introduction (philosophy quote + classification box)
  - Page 3: Table of Contents (all 9 domains with all 72 pillar names listed)
  - Pages 4-84: 9 Domain Openers + 72 Individual Pillar Pages (dynamically generated from pillar-data.ts)
  - Page 85: Philosophy (φ symbol, "Mengapa 72? Mengapa 9 Domain?")
  - Page 86: Covenant of Civilization (sacred oath)
  - Page 87: Back Cover (MERDEKA watermark, Grand Architect's Office)
- CSS 3D page flip implementation:
  - `transform-origin: left center` with `rotateY(-180deg)` for flipped pages
  - `backface-visibility: hidden` for clean page hiding
  - `perspective: 2500px` for realistic depth
  - Cubic-bezier easing (0.645, 0.045, 0.355, 1) for natural page motion
  - Dynamic box-shadow that changes during flip (right shadow → left shadow)
  - Z-index management: current page always on top, proper stacking for flipped/unflipped pages
- Navigation:
  - Click left/right halves of book to navigate
  - Arrow keys (Left/Right) and Spacebar
  - Touch swipe (50px threshold) for mobile
  - Animation lock (850ms) prevents rapid clicking
- Responsive design:
  - Desktop: Centered book with max-width 780px, 3:4 aspect ratio, navigation arrows outside
  - Mobile: Full-screen pages with bottom navigation bar and safe area support
- UI elements: Progress bar (gold), page indicator ("Halaman X / 87"), keyboard hint (fades after 5s)
- Each pillar page shows: code badge, name, English name, description, vision quote (gold-bordered), dimensions grid, principles (gold bullets), cross-references
- Book container uses dark warm background (#1A1814) for premium "reading under lamp" feel, while ALL page content is on WHITE backgrounds
- Lint passes cleanly, dev server compiles successfully (GET / 200)

Stage Summary:
- Complete transformation from website to digital flipbook experience
- 87 pages: Cover + Dedication + TOC + 9 Domain Openers + 72 Pillar Pages + Philosophy + Covenant + Back Cover
- Realistic CSS 3D page flip with proper z-index management and animation locking
- All 72 pillars dynamically generated with full content (vision, dimensions, principles, cross-refs)
- Navigation: click, keyboard, touch swipe
- Files: page.tsx (1022 lines), layout.tsx (unchanged), globals.css (unchanged)
