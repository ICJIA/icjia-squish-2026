# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Latest Audit Results

> These summaries are updated each time a full audit is run.

### Security Audit (Red/Blue Team) — 2026-03-27

| Severity | Found | Fixed | Remaining | Details |
|----------|-------|-------|-----------|---------|
| Critical | 0 | — | 0 | — |
| High | 0 | — | 0 | — |
| Medium | 2 | 2 | 0 | Removed `blob:` from CSP `script-src` and `worker-src` (moved Web Worker to static file); removed redundant inline dark-mode script to reduce `unsafe-inline` surface (Nuxt SSG hydration still requires `unsafe-inline` — architectural constraint, no practical exploit path for a static site with no user-generated content) |
| Low | 8 | 8 | 0 | Removed inline dark-mode script (redundant with `htmlAttrs`); added content-type validation on Unsplash sample fetch; bundled icons at build time (removed Iconify CDN runtime dependency from CSP); removed unnecessary `crossOrigin='anonymous'` on canvas image element; deleted coverage directory from repo; disabled devtools in production; replaced deprecated `X-XSS-Protection`; hardened CSP with `object-src`/`base-uri`/`form-action` directives |

**Blue Team Assessment:** All findings resolved. Strong security posture for a static client-side tool. No server-side attack surface (SSG with `netlify-static`). No user data storage or transmission. Proper input validation (file type allowlist, 50 MB size cap). No `v-html` usage. External links use `rel="noopener noreferrer"`. Security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy, Referrer-Policy) all properly configured. No runtime CDN dependencies — icons bundled at build time. Web Worker loaded from same-origin static file.

### Accessibility Audit (axe-core 4.10.2) — 2026-03-27

| Metric | Result |
|--------|--------|
| Rules passed | 39/39 |
| Violations | 0 |
| Incomplete | 0 |
| Standards tested | WCAG 2.0 A, WCAG 2.0 AA, WCAG 2.1 A, WCAG 2.1 AA, Best Practices |

---

## [1.4.1] - 2026-09-16

Fixes the two defects that the September 16, 2026 health check and accessibility check of squish.icjia.app found once an image is added: seven icons that never appeared in production, and a page too wide for most screens.

### Fixed

- Seven icons never appeared in production: the zoom buttons, the comparison handle's arrows, each image's Download and Remove, Download all, and the error message's warning sign. The 1.4.0 build-time icon bundle packaged nothing, because no icon collection was installed, so these icons were requested from `api.iconify.design` at runtime and refused by the CSP (`connect-src`). `yarn dev` sends no CSP, which is why they worked locally.
  - Added `@iconify-json/lucide` and listed all nine icons the app uses in `icon.clientBundle.icons` (`scan` stays on), so a listed icon missing from the collection fails `yarn generate`.
  - Set `icon.provider: 'none'` and `fallbackToApi: false`, so an icon missing from the bundle renders blank and logs `[Icon] failed to load icon` instead of reaching for the network. `fallbackToApi: false` alone is not enough: under `nuxt generate` the provider resolves to `iconify`, which still requested a missing icon from `api.iconify.design`.
  - The error message's icon uses Lucide's current name, `circle-alert` (`alert-circle` is now only an alias). The GitHub icon is a retired Lucide brand icon that the collection still ships, hidden; it is kept and listed.
  - The CSP is unchanged. Iconify was not added back to `connect-src`.
- The page scrolled sideways once an image was added. The comparison box's `min-height: 700px` at 3:2 forced it to be at least 1,050 px wide, pushing the quality percentage and Summary savings off a 1,366 px laptop screen. The box now fills its column at 3:2, capped at 80% of the viewport height or 900 px and centred when the cap applies. The preview's zoom and quality rows and the Preview Comparison heading row wrap on narrow screens, and the preview's quality slider takes its own line rather than shrinking below 10rem.

### Verified

In Chromium (Playwright 1.63) against the generated `dist/`, served with the exact headers in `netlify.toml` including the CSP, and compared with a 1.4.0 build tested the same way:

- Every icon draws in every state: the empty page, the drop zone, one image with the zoom controls, three images with per-image Download and Remove, and the error for a rejected GIF. The footer has no icons.
- Zero requests to `api.iconify.design`, `api.unisvg.com` or `api.simplesvg.com`, and zero CSP violations, across the session. The same session on 1.4.0 logged three refused Iconify requests.
- No sideways scroll at 320, 375, 768, 1,280, 1,366, 1,440 or 1,920 px, with one image and with three. On 1.4.0 the page was 1,074 px wide at 320–768 px and 1,490 px wide at 1,280–1,440 px. The box measured 3:2 (1.500) at every width: 886 × 591 at 1,366 × 768, and 1,296 × 864 at 1,920 × 1,080.
- Dragging the divider (including out of the box and back), zoom in, out and reset across 100–800%, wheel zoom and panning passed the same 14 checks as 1.4.0 at 1,366 and 1,920 px, and now also pass at 375 px.
- Compression output is byte-identical to 1.4.0: a 2,400 × 1,600 test JPEG at quality 75 downloads as 757,645 bytes from both, and a WebP and a PNG match too.
- A temporary build with a deliberately missing icon left it blank and logged the warning, with no network request even with the CSP removed.
- `yarn test` (106 tests), `yarn typecheck` and `yarn generate` pass. `yarn lint` reports only the 24 errors already in `test/`.

## [1.4.0] - 2026-03-27

### Fixed

- Touch panning on comparison slider (undefined `startPan`, `handlePanMove`, `stopPan` functions caused runtime errors on touch devices)
- Devtools exposed in production builds (now only enabled in development)
- Removed unnecessary `crossOrigin='anonymous'` on canvas image element (images are always same-origin blob URLs)

### Security

- Moved Web Worker to static file (`public/compression-worker.js`), removing `blob:` from CSP `script-src` and `worker-src`
- Removed redundant inline dark-mode script (already handled by `htmlAttrs: { class: 'dark' }`)
- Bundled icons at build time via `@nuxt/icon` `clientBundle`, eliminating runtime CDN dependency on `api.iconify.design`
- Added content-type validation on sample image fetch response
- Replaced deprecated `X-XSS-Protection: 1; mode=block` with `X-XSS-Protection: 0` per current best practices
- Hardened CSP with `object-src 'none'`, `base-uri 'self'`, and `form-action 'self'` directives
- Removed coverage directory from repository
- Full red/blue team security audit: 10 findings, 10 fixed, 0 remaining
- Full axe-core accessibility audit passed (39/39 checks, 0 violations)

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
