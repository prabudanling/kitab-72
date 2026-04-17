# Task 7 — Agent: Main

## Changes Made

### 1. BookPage Type Updated
- Removed `domain-opener` and `pillar` variants
- Added `{ type: 'domain-pillars'; data: Domain }`

### 2. DomainPillarsPage Component (~150 lines)
- Replaced both DomainOpenerPage and PillarPage with single scrollable page per domain
- Sticky domain header (emoji, name, Indonesian subtitle, range, pillar count)
- All pillars rendered as cards with alternating backgrounds
- Each pillar card: code badge, badge type, ID/72, name (BIG), English name, description, vision quote, dimensions, principles, cross-refs

### 3. TableOfContentsPage Enlarged
- All fonts increased 1-2 steps bigger
- Header: text-xl sm:text-2xl (was text-base sm:text-lg)
- Subtitle: text-base sm:text-lg (was text-sm sm:text-base)
- Domain emoji: text-lg sm:text-xl (was text-sm sm:text-base)
- Domain name: text-xs sm:text-sm (was text-[11px] sm:text-xs)
- Domain Indonesian: text-sm sm:text-base (was text-[10px] sm:text-[11px])
- Pillar entries: text-[12px] sm:text-sm (was text-[10px] sm:text-[11px])
- Left accent bar widened, spacing increased throughout

### 4. bookPages Array Simplified
- `domains.flatMap(...)` → `domains.map(domain => ({ type: 'domain-pillars', data: domain }))`

### 5. renderPage & currentPageInfo Updated
- Single case for domain-pillars
- Shows emoji + domain name and range as pillarCode

### 6. Cleanup
- Removed unused Pillar type import

## Lint Result
- ESLint: 0 errors, 0 warnings

## Page Count
- **New total: 22 pages** (was 94)
- Breakdown: Cover (1) + Kata Pengantar (4) + Mukadimah (4) + TOC (1) + Domain-Pillar pages (9) + Philosophy (1) + Covenant (1) + Back Cover (1)
