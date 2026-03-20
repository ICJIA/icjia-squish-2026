# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-03-20

### Added

- Sample image loader — "Load Sample Image" button in drop zone fetches a high-resolution Unsplash cityscape to demo compression without needing your own file
- Sample image banner indicating the loaded image is a demo, with prompt to drop your own
- Mouse wheel zoom on comparison slider container
- Window-level mouse tracking so the comparison slider doesn't lose control when the cursor leaves the image box
- Quality warning indicators (green/yellow/red) on compression stats to warn about very low quality settings
- Compression stats next to download button showing original size, compressed size, and savings percentage
- "Scroll to zoom" hint in zoom controls area
- Content Security Policy (CSP) header in Netlify config
- HTTP Strict Transport Security (HSTS) header in Netlify config

### Changed

- "Download this image" renamed to "Download" with inline stats for clarity
- Comparison slider starts at 200% zoom for sample images to make compression artifacts visible
- Sample image compresses at 30% quality by default to clearly demonstrate the tool
- User-dropped images reset quality to 75% and zoom to 100%
- Pan instructions updated from "Click and drag to pan" to "Drag to pan"

### Fixed

- Comparison slider losing mouse control when cursor moves outside the container during fast drags
- `vite-plugin-checker` crash on dev server startup by disabling in-dev type checking (CLI `yarn typecheck` still works)

### Security

- Added CSP header: restricts scripts, styles, images, fonts, and connections to trusted sources
- Added HSTS header: enforces HTTPS with 1-year max-age, includeSubDomains, and preload
- Upgraded `nuxt` 4.3.0 → 4.4.2 (fixes critical simple-git RCE in devtools)
- Upgraded `@nuxtjs/seo` 3.4.0 → 4.0.2 (fixes critical fast-xml-parser entity injection)
- Reduced total dependency vulnerabilities from 69 to 26

## [1.2.0] - 2026-02-12

### Added

- WCAG AA contrast compliance and ARIA accessibility improvements
- Comprehensive test suite with 99 unit tests
- Additional image format support

### Fixed

- Favicon display
- Netlify header configuration
- SEO robots.txt configuration

## [1.1.0] - 2026-02-06

### Added

- Zoom and magnification controls for preview comparison
- Quality slider in comparison view for quick adjustments
- Pan and drag support when zoomed in

## [1.0.0] - 2026-02-04

### Added

- Initial release of Squish image compression app
- Client-side image compression using Canvas API and Web Workers
- Drag-and-drop and file picker for PNG, JPG, and WebP images
- Real-time before/after comparison slider
- Adjustable quality slider (10%–100%)
- Batch compression with individual and bulk download
- Privacy-first architecture — all processing in-browser, no uploads
- Dark theme UI built with Nuxt UI
- Comprehensive SEO with Nuxt SEO module (sitemap, robots.txt, Open Graph, Twitter cards)
- Static site generation for Netlify deployment
- GitHub repository link in navbar
- Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy)
