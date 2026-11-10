# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Latest Audit Results

> These summaries are updated each time a full audit is run.

### Security Audit (Red/Blue Team) — 2026-11-10

| Severity | Found | Fixed | Mitigated or accepted | Details |
|----------|-------|-------|-----------------------|---------|
| Critical | 0 | — | 0 | — |
| High | 0 | — | 0 | — |
| Medium | 2 | 1 | 1 | Sample image moved from Unsplash to the site itself, so the CSP names no third-party host (fixed); 305 dependency advisories reduced to 10, none critical or high, all development-only or unused (mitigated) |
| Low | 5 | 5 | 0 | 100-megapixel limit; 60-second worker timeout; unsupported files refused before being listed; stale recompression results discarded; COOP, CORP and `upgrade-insecure-requests` added |
| Informational | 3 | — | 3 | `'unsafe-inline'` in `script-src` and `style-src` (required by Nuxt static hydration); 10 remaining advisories; review of the new service worker and ZIP writer |

**Blue Team Assessment:** No server-side code, accounts, cookies or analytics. Input validated by type, byte size and pixel count. No `v-html`, `eval` or dynamic script loading. Every asset, including the worker, the service worker and the sample image, is same-origin, and `connect-src 'self'` means the page cannot contact any other host. A browser test now fails the build if any request leaves the site.

### Accessibility Audit (axe-core 4.14) — 2026-11-10

| Page and state | Violations |
|----------------|------------|
| Tool, empty | 0 |
| Tool, with an image loaded | 0 (was 2 rules, 3 elements) |
| Technical details, desktop | 0 |
| Technical details, mobile | 0 |

Standards tested: WCAG 2.0 A and AA, WCAG 2.1 A and AA, best practices. The comparison divider, which axe cannot assess, is now keyboard-operable.

---

## [1.5.0] - 2026-11-10

Adds a plain-language technical details page, format conversion, resizing, offline use, ZIP download, paste, more input formats and browser tests in CI, and applies the fixes from a red/blue team security audit and an accessibility audit of the tool with an image loaded.

### Added

- **Technical details page** at `/technical-details`, written for non-technical readers and linked from the tool's header and footer. It is interactive throughout:
  - A live demo that draws a picture in the browser and compresses it through the same code path as the tool (`useImageCompression`, including the Web Worker), with a quality slider, real byte counts and an 8× magnifier.
  - A load-time calculator: number of pictures, size, saving and connection speed.
  - A diagram comparing where a picture travels with Squish and with a typical upload site.
  - A five-step walkthrough of the pipeline, each step in plain words with an "Under the hood" note.
  - A rounding demo that shows why lossy compression shrinks a file.
  - A parts list that switches between plain words and technical terms, and a list of known limits.
- **Save as JPG or WebP.** A "Save as" menu converts any picture; the default keeps the original format. Saving as JPG paints a white background first, because JPG has no transparency.
- **A note when PNG output makes the quality slider ineffective**, pointing to "Save as".
- **Resizing.** A "Longest side" menu (2,560, 1,920, 1,600, 1,280 or 800 px) scales larger pictures down and never scales a smaller one up.
- **AVIF and HEIC input.** AVIF opens in all current browsers. HEIC is accepted where the browser can decode it (Safari); elsewhere it is refused with a message that says why. Both are saved as JPG unless WebP is chosen. A HEIC file that reports no type is recognised by its extension.
- **Paste from the clipboard.** A copied picture or screenshot is added as if it had been dropped.
- **Download all as one ZIP**, built in the browser by a dependency-free writer (`app/utils/zip.ts`). Entries are stored, not deflated, since the pictures are already compressed. Repeated names are numbered.
- **Keyboard control of the comparison divider.** It is now a `role="slider"`: arrow keys move it 2%, Shift or Page Up/Down 10%, Home and End jump to the ends.
- **Offline use and installation** through `@vite-pwa/nuxt`. A service worker precaches about 600 KB (both pages, scripts, styles, the compression worker and icons), so after one visit the tool works with no connection. The sample image is cached only when first used.
- **Browser tests.** 25 Playwright tests run against the generated `dist/`, served with the security headers from `netlify.toml` by the new `scripts/serve-dist.mjs` (`yarn serve:dist`). `yarn test:e2e` builds and runs them.
- **CI.** `.github/workflows/ci.yml` runs lint, type check, unit tests, the build and the browser tests on pull requests and pushes to `main`.
- `public/sample-cityscape.jpg`: the sample image, now served from the site.
- Unit tests: 146, up from 106.

### Changed

- **One worker, reused.** The page now keeps a single compression worker instead of starting one per picture per change. The worker caches decoded pictures, up to 80 megapixels in total and least recently used first out, so moving the quality slider re-encodes without decoding the file again.
- Dropped files that are not pictures now get an "unsupported type" message instead of being ignored silently.
- README rewritten for accuracy: current versions and test counts, new screenshots, a known-limits section, the real contents of `documentation/`, and this audit. Removed the stale "min height: 700px" claim (removed in 1.4.1) and the "99 tests" count.
- `documentation/screenshot.jpg` replaced, and five more screenshots added.
- Dependencies: Nuxt 4.4.2 → 4.6.4, Vue 3.5.27 → 3.5.45, Vitest 3 → 4.1.12, happy-dom 20 → 21.0.4, sharp 0.34 → 0.35.5, @nuxt/icon → 1.15.0; added `@vite-pwa/nuxt` 1.1.1 and `@playwright/test` 1.65.0.

### Security

Red team findings and what the blue team did about each:

- **M1, Medium, fixed.** The sample image was fetched from `images.unsplash.com`. Each use disclosed the visitor's IP address and user agent to a third party, and the CSP had to allow that host in `img-src` and `connect-src`, which also gave any injected script a host it was permitted to contact. The sample (2,000 × 1,230, 823 KB) is now bundled and both CSP entries are removed. No directive names a third-party host.
- **M2, Medium, mitigated.** `yarn audit` reported 305 advisories: 6 critical, 163 high, 111 moderate, 25 low, all in build and test tooling. A refresh within the declared ranges brought this to 22, and moving Vitest, happy-dom and sharp to their current major versions brought it to 10: 9 moderate, 1 low, none critical or high. See I2.
- **L1, Low, fixed.** Nothing limited pixel dimensions, so a small file describing an enormous picture (a decompression bomb) could exhaust memory. `MAX_PIXELS` (100 megapixels) is enforced in the worker and in the main-thread fallback, with a `DimensionsTooLargeError` shown to the user. The worker's cache of decoded pictures is capped separately at 80 megapixels.
- **L2, Low, fixed.** A worker that never answered was never terminated. A job unanswered after `WORKER_TIMEOUT_MS` (60 seconds) now stops the worker, fails its pending jobs, and lets the next job start a fresh one.
- **L3, Low, fixed.** A dropped file of an unsupported type was added to the list before validation and stayed as a broken thumbnail. Files are validated before they are added, and a picture that fails to compress is removed.
- **L4, Low, fixed.** Rapid quality changes could let an older recompression overwrite a newer one, and the previous result's object URL was revoked while still on screen. Runs are numbered, stale results are discarded, and the old URL is released only once its replacement exists.
- **L5, Low, fixed.** Added `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin` and CSP `upgrade-insecure-requests`; `Permissions-Policy` now also denies `payment`, `usb` and `interest-cohort`.
- **I1, Informational, accepted.** `script-src` and `style-src` keep `'unsafe-inline'`, which Nuxt's statically generated pages need for their inline hydration script. Mitigations: no user-supplied HTML is rendered, no `v-html`, and `connect-src 'self'`, `form-action 'self'` and `img-src 'self' blob: data:` leave an injected script no third-party destination.
- **I2, Informational, accepted for now.** The 10 remaining advisories are glob and minimatch inside vue-tsc, Vue Test Utils, the Nuxt ESLint module and Workbox's build tool; deepmerge inside Workbox's build tool; and a Nuxt UI form component (`UAuthForm`) this project does not use. Nuxt UI 4, which clears the last, was tried and reverted: it ships `@nuxt/icon` 2, which conflicts with this project's `@nuxt/icon` 1.x and fails the build. The two need upgrading together.
- **I3, Informational, reviewed.** New surface in this release. The service worker is same-origin, caches only the site's own files, and required no CSP change. `safeEntryName()` removes folders, control characters and leading dots from names written into a ZIP, so an entry cannot be extracted outside its folder. Pasted and dropped files pass through the same validation as picked ones.

### Fixed

- Accessibility, found by auditing the tool with an image loaded (the March audit covered only the empty page):
  - White text on the green accent measured about 1.8:1. `--color-primary-foreground` is now dark, which corrects the "Compressed" label, the saving badge on each thumbnail, and "Download all".
  - Each thumbnail was a `role="button"` containing the Download and Remove buttons. Selecting a picture is now its own button beside them, with `aria-pressed`.
  - Download and Remove on a thumbnail appeared only on mouse hover. They now also appear on keyboard focus, and their labels name the file.
  - Error messages are announced to screen readers (`role="alert"`).
- The 22 auto-fixable ESLint errors in `test/` and one unused parameter. `yarn lint` now reports 0 errors (21 `no-console` warnings remain in `test/helpers/summary.ts`).
- The test helper that replaces `Image` used an arrow function, which Vitest 4 no longer allows as a constructor.
- `.nvmrc` pinned Node 22.14.0, which Nuxt 4.6 refuses to install on (it needs 22.22.3 or later). The first CI run and the first production build of this release both failed for that reason; the live site stayed on 1.4.1 throughout. `.nvmrc` and `netlify.toml` now pin 22.23.4.

### Verified

Against the generated `dist/`, served locally with the exact headers in `netlify.toml` including the CSP, in Chromium:

- `yarn lint` (0 errors), `yarn typecheck` (0 errors), `yarn test` (146 tests), `yarn generate` (2 pages, link checker 0 errors) and the 25 browser tests pass. `yarn typecheck` prints a non-fatal warning that vue-tsc 2.2 could not load vue-router's Volar plugin.
- Browser tests confirm: the sample loads with no request to another host and no console or CSP errors; every icon draws; a JPG saved as WebP downloads as a real WebP file; "Longest side 800" turns a 1,600 × 1,200 picture into 800 × 600; two pictures download as a ZIP with two entries; a GIF is refused with no thumbnail left behind; paste works; the divider and the thumbnail buttons work from the keyboard; neither page scrolls sideways from 320 px up.
- Offline: after one visit, with the network switched off, the tool reloads, compresses a picture (which requires the worker and the lazily loaded comparison slider to come from the cache) and opens the technical details page.
- axe-core reports 0 violations on the tool (empty and with an image loaded) and on the technical details page (desktop and mobile).
- Not verified: behaviour on Netlify itself; any browser other than Chromium; HEIC decoding in Safari (only the refusal path was exercised); the GitHub Actions workflow, which has not yet run.

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
