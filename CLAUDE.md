# CLAUDE.md - Project Context for AI Assistants

## Project Overview

Personal portfolio website for Aalekh Roy (Founding ML Engineer at Mendria), deployed via GitHub Pages at `https://royaalekh.github.io`.

**"Piecewise"** - The site's name reflects a philosophy: complex problems become manageable when broken into pieces.

## Technology Stack

- **Static Site Generator**: Jekyll 4.3.0 (Ruby)
- **Styling**: Tailwind CSS 2.2.19 (CDN), custom CSS in `assets/css/main.css`
- **JavaScript**: Vanilla JS, D3.js (network viz), tsparticles (hero animation)
- **Math Rendering**: MathJax 2.7.7
- **Icons**: Font Awesome 6.0.0, DevIcons
- **Fonts**: Inter (Google Fonts)
- **CI/CD**: GitHub Actions (`.github/workflows/static.yml`)

## Directory Structure

```
├── _config.yml          # Jekyll configuration
├── _layouts/            # HTML templates (default, post)
├── assets/
│   ├── css/main.css     # Custom styles
│   ├── js/              # JavaScript files
│   │   ├── main.js      # Core interactions
│   │   ├── artist-network.js  # Network visualization
│   │   └── particles.js
│   ├── data/            # Static datasets (CSV)
│   └── images/          # Image assets
├── index.html           # Homepage
└── networks.html        # Networks Lab (interactive visualizations)
```

## Build & Run Commands

```bash
# Install dependencies
bundle install

# Build static site
bundle exec jekyll build

# Serve locally with live reload (http://localhost:4000)
bundle exec jekyll serve
```

## Key Sections

- **Hero**: "Piecewise" title with tagline, bio, CTAs
- **Journey**: Tabbed education + career (Mendria, SmartHelio)
- **How I Work**: Philosophy cards
- **Interests**: Technology, Academic, Research
- **Projects**: Selected Work (Industry) + Networks Lab callout + GitHub repos
- **Contact**: Email, GitHub, LinkedIn, Resume download

## Design Principles

- Domain-level positioning, not tool-level
- Let work speak - no skills matrices or coursework lists
- Canvas-based rendering for complex visualizations (performance over SVG)
- ARIA-compliant interactive components with keyboard navigation
