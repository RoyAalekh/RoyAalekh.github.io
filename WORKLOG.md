# Worklog
This is a living document to track changes, rationale, and learnings while evolving this portfolio.

## 2025-12-15 — Journey redesign (Option A tabs) + Selected Work block
Context
The previous Journey UI used a horizontal progress bar + long-form paragraphs. In practice it created too much visual whitespace, made interaction unclear, and hid the most important content (impact + progression) behind a “decorative” control.

Goals
Make Journey feel elegant, minimal, and highly scannable:
- Put content first (not a progress track)
- Reduce visual noise and whitespace
- Improve readability on desktop and mobile
- Keep the interaction obvious and accessible
- Align the Career content with the updated resume

Decisions
1. Replaced progress bar timeline with a segmented tab control
- Implemented a compact “pill” tablist (Bachelor’s / Master’s / Career) with a single content card.
- The selected state uses a subtle shadow + white background for clarity without heavy styling.
- This matches the site’s broader minimal aesthetic and makes the interaction self-evident.

2. Converted paragraphs into structured, scan-friendly content
- Rewrote each tab as short bullet points.
- For the Career tab, placed an “Impact metrics” row above bullets to surface numbers early.
- Added a dedicated “Role progression” block for quick chronological parsing.

3. Accessibility and keyboard UX
- Tabs use ARIA roles (tablist/tab/tabpanel) and reflect state via aria-selected.
- Keyboard navigation supports ArrowLeft/ArrowRight plus Home/End.

4. Resume alignment
- Updated SmartHelio timeline to end in Nov 2025:
  - SmartHelio (YC-22): Sep 2022–Nov 2025
  - Data Scientist: Jan 2024 – Nov 2025
  - Associate Data Scientist: Jul 2023 – Dec 2023
  - Data Analyst: Sep 2022 – Jun 2023

5. Added “Selected Work (Industry)” above GitHub projects
- Added three cards to highlight non-open-source work that may not map cleanly to GitHub repos:
  - Fast Diagnostic Service (Jan 2025)
  - Cleaning Optimization Engine (2024)
  - formatify-py (May 2025 – Present, with GitHub link)

Files changed
- index.html
  - Replaced Journey section with tabbed UI and updated content.
  - Added Selected Work block above the existing GitHub repo grid.
- assets/css/main.css
  - Removed old Journey progress bar styles.
  - Added minimal styles for tabbed Journey + Selected Work cards.
- assets/js/main.js
  - Replaced the Journey progress controller with an accessible JourneyTabsController.
  - Kept smooth anchor scrolling as a site-wide helper.

Notes / future improvements
- If we later want to avoid editing HTML content directly, we can move Journey + Selected Work content into a Jekyll data file (e.g. _data/journey.yml) and render it via Liquid. This will make resume-driven updates easier and less error-prone.
- Consider adding a minimal favicon (favicon.ico) to avoid 404 noise in dev logs.

## 2025-12-15 — Dynamic footer year
Change
Replaced hard-coded "© 2024" footers with a dynamic year using Jekyll’s build time:
- Used {{ 'now' | date: '%Y' }} so the footer stays current in future years.
- Added empty front matter (---) to static HTML pages so Liquid is processed.

Rationale
Static year values become outdated and subtly signal neglect. This keeps the site evergreen with near-zero maintenance.
