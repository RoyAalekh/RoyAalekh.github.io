# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is Aalekh Roy's personal portfolio website and blog, built as a Jekyll-based GitHub Pages site. The project combines a custom HTML/CSS/JavaScript frontend with Jekyll's static site generation, featuring a unique hybrid blogging system that supports both Markdown and Typst.

## Technology Stack

- **Frontend**: Custom HTML with Tailwind CSS, Font Awesome icons, and vanilla JavaScript
- **Backend**: Jekyll static site generator (Ruby-based)
- **Blogging**: Jekyll + Liquid templating with dual format support (Markdown + Typst)
- **Animations**: Particles.js for interactive background effects
- **Fonts**: Inter font family with liga/calt features
- **Build Tools**: PowerShell scripts for automation, Python for PDF processing
- **Deployment**: GitHub Pages (automatic deployment from main branch)

## Project Structure

```
├── index.html                 # Main portfolio homepage (custom HTML, not Jekyll)
├── blog.html                  # Jekyll-based blog listing page
├── art.html                   # Art corner page
├── game-of-life.html         # Interactive game page
├── resume.md                 # Auto-generated resume from PDF
├── _config.yml               # Jekyll configuration
├── Gemfile                   # Ruby dependencies
├── _layouts/                 # Jekyll templates
│   ├── default.html          # Base layout with navigation
│   ├── post.html             # Individual blog post layout
│   └── blog.html             # Blog listing layout
├── _posts/                   # Jekyll blog posts (Markdown)
├── _drafts/                  # Draft blog posts
├── _typst/                   # Typst source files for blog posts
├── _includes/                # Jekyll partial templates
├── assets/
│   ├── css/main.css          # Custom styles
│   ├── js/
│   │   ├── main.js           # GitHub API integration, animations
│   │   └── particles.js      # Particle background effects
│   └── Aalekh_Roy_Resume.pdf # Resume file
└── scripts/                  # Build automation scripts
    ├── build-typst.ps1       # Typst to PDF/Markdown converter
    ├── new-blog.ps1          # Blog post generator
    ├── convert_resume.py     # PDF to Markdown converter
    └── generate_plots.py     # Data visualization scripts
```

## Common Development Commands

### Local Development
```powershell
# Install Jekyll dependencies
bundle install

# Start local development server
bundle exec jekyll serve

# Start with drafts included
bundle exec jekyll serve --drafts

# Build site for production
bundle exec jekyll build
```

### Blog Management
```powershell
# Create new blog post (Markdown)
.\scripts\new-blog.ps1 -Title "Your Post Title" -Tags @("tag1", "tag2")

# Create new blog post (Typst)
.\scripts\new-blog.ps1 -Title "Your Post Title" -Typst -Tags @("math", "research")

# Create draft post
.\scripts\new-blog.ps1 -Title "Draft Post" -Draft

# Build Typst post to PDF and Markdown
.\scripts\build-typst.ps1 -File _typst\2025-01-12-my-post.typ

# Build all Typst files
.\scripts\build-typst.ps1 -All

# Watch Typst file for changes (auto-rebuild)
.\scripts\build-typst.ps1 -File _typst\2025-01-12-my-post.typ -Watch
```

### Resume Management
```python
# Convert resume PDF to Markdown
python scripts\convert_resume.py
```

## Architecture Details

### Hybrid Website Architecture
The site uses a unique dual architecture:
1. **Main Homepage (`index.html`)**: Custom HTML with inline JavaScript and CSS, not processed by Jekyll
2. **Blog System**: Jekyll-powered with Liquid templating for dynamic content generation
3. **Shared Navigation**: Consistent navigation across both systems via shared CSS classes

### Typst Integration Workflow
The site supports academic-style blog writing using Typst:
1. Write posts in `_typst/` directory using Typst markup
2. Run `build-typst.ps1` to generate both PDF and Markdown versions
3. Markdown version gets YAML frontmatter and lands in `_posts/`
4. Jekyll processes the Markdown for web display
5. PDF remains available for download/sharing

### Dynamic Content Loading
- **Project Cards**: Fetched via GitHub API in `main.js`
- **Contribution Graph**: Embedded via ghchart.rshah.org
- **Repository Filtering**: Curated list of repositories to display

### Performance Optimizations
- **Jekyll Configuration**: Incremental builds, compressed Sass, excluded development files
- **Asset Loading**: CDN-hosted libraries (Tailwind, Font Awesome)
- **Animation Performance**: Intersection Observer API for scroll-based animations
- **Build Exclusions**: Scripts, Typst files, and development artifacts excluded from production

## Content Management

### Blog Post Workflow
1. **Planning**: Use `new-blog.ps1` to create structured post template
2. **Writing**: Choose between Markdown (direct) or Typst (academic/math-heavy)
3. **Preview**: Use `jekyll serve` to preview locally
4. **Publishing**: Commit to main branch for automatic GitHub Pages deployment

### Project Showcase Management
Edit the `reposToShow` array in `assets/js/main.js` to control which GitHub repositories appear on the homepage. Add descriptions in the `projectDetails` object and Streamlit links in `streamlitLinks` for deployed demos.

### Theme and Styling
- **Color Scheme**: Gray/blue palette with hover states
- **Typography**: Inter font with OpenType features
- **Responsive Design**: Tailwind CSS grid system
- **Animations**: CSS transitions with JavaScript triggers

## Dependencies

### Ruby (Jekyll)
- jekyll ~> 4.3.0
- jekyll-theme-minimal ~> 0.2.0
- webrick ~> 1.8 (Ruby 3+ compatibility)
- wdm >= 0.1.0 (Windows file watching)

### PowerShell Scripts
- Requires PowerShell 5.1+
- Typst CLI tool for document compilation
- Pandoc (optional, for advanced Markdown conversion)

### Python Scripts
- pypdf for PDF text extraction
- Standard library modules

## Development Notes

### Local Testing
Always test both the main homepage and blog pages when making changes, as they use different rendering systems. The homepage is pure HTML/JS while blog pages go through Jekyll processing.

### Content Updates
- **Projects**: Update GitHub repository list in `main.js`
- **Resume**: Replace PDF in assets/ and run convert script
- **Skills**: Modify HTML directly in `index.html`
- **Blog**: Use provided scripts for consistency

### Performance Considerations
The site loads external resources (GitHub API, fonts, CDNs) so internet connectivity affects local development experience. GitHub API has rate limits; use personal access token if needed for development.

### Deployment
The site auto-deploys to GitHub Pages from the main branch. Jekyll configuration excludes development files, so scripts and Typst sources won't appear in production.
