# Testing Suite Design for Squish

**Date:** February 12, 2026
**Status:** Approved
**Coverage Target:** 90%+
**Testing Approach:** Comprehensive unit tests with mocked Canvas API

## Overview

This design establishes a comprehensive unit testing suite for the Squish image compression application. The testing strategy focuses on achieving 90%+ code coverage through fast, reliable unit tests with mocked browser APIs.

## Design Decisions

### Testing Framework: Vitest

**Rationale:**
- Native ESM support, perfect for Nuxt 4
- Fast execution with intelligent watch mode
- Compatible with Vue Test Utils for component testing
- Built-in coverage via c8/istanbul
- TypeScript support out of the box

**Key Dependencies:**
```json
{
  "@vitejs/plugin-vue": "^5.0.0",
  "@vue/test-utils": "^2.4.0",
  "vitest": "^2.0.0",
  "@vitest/ui": "^2.0.0",
  "@vitest/coverage-v8": "^2.0.0",
  "vitest-canvas-mock": "^0.3.0",
  "happy-dom": "^12.0.0",
  "chalk": "^5.3.0"
}
```

### Test Environment

- **DOM Simulation:** happy-dom (faster than jsdom)
- **Canvas API:** vitest-canvas-mock for lightweight Canvas API mocking
- **TypeScript:** Native support, no additional configuration needed

### Canvas API Mocking Strategy

**Approach:** Mock Canvas API with happy-path behavior

**Rationale:**
- Fast, reliable tests without browser overhead
- Focus on testing logic flow, not actual image rendering
- Sufficient for unit testing the compression pipeline
- Separate integration tests can validate actual output if needed later

**Implementation:**
- Global canvas mock via `vitest-canvas-mock`
- Custom helpers for blob creation simulation
- Mock Image constructor to trigger onload immediately
- Test logic paths and error scenarios, not pixel manipulation

## Directory Structure

```
/test
├── unit/
│   ├── components/
│   │   ├── ImageCompressor.test.ts
│   │   ├── ComparisonSlider.test.ts
│   │   └── QualityIndicator.test.ts
│   └── composables/
│       └── useImageCompression.test.ts
├── fixtures/
│   ├── test-image.png (small test image ~1KB)
│   ├── test-image.jpg
│   └── mock-files.ts (File object helpers)
├── helpers/
│   ├── canvas-mock.ts (custom canvas utilities)
│   ├── component-utils.ts (common test helpers)
│   └── summary.ts (custom test summary formatter)
└── setup.ts (global test setup)
```

## Test Scripts

**package.json scripts:**
```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage",
  "test:components": "vitest run test/unit/components",
  "test:composables": "vitest run test/unit/composables"
}
```

**Script Descriptions:**
- `test`: Run all tests once (CI mode)
- `test:watch`: Run tests in watch mode during development
- `test:ui`: Open Vitest UI in browser for visual test exploration
- `test:coverage`: Generate and display coverage report
- `test:components`: Run only component tests
- `test:composables`: Run only composable tests

## Testing Strategy by File

### 1. useImageCompression.test.ts (Priority: Critical)

**Target Coverage:** 95%+

**Test Cases:**
- `compressImage()`
  - Format detection (PNG/JPEG/WebP preservation)
  - Quality parameter application
  - Blob and URL generation
  - Error handling for corrupt files
  - Canvas context acquisition failures
  - Image load errors
- `formatSize()`
  - All units (B, KB, MB, GB)
  - Edge cases (0 bytes, very large files)
  - Decimal precision
  - Bounds checking
- `getSavings()`
  - Percentage calculation accuracy
  - Zero and negative cases
  - Rounding behavior
- `getFileExtension()`
  - All format mappings
  - Fallback to jpg

**Rationale:** This composable contains core business logic for image compression. High coverage ensures reliability of the compression pipeline.

### 2. QualityIndicator.test.ts (Priority: High)

**Target Coverage:** 100%

**Test Cases:**
- Computed assessment logic for all quality ranges:
  - Excellent (85+)
  - Recommended (70-84)
  - Good (50-69)
  - Aggressive (<50)
- Correct label, description, color, and style for each tier
- Savings display logic (show only when >0)
- Props reactivity when quality/savings change

**Rationale:** Simple component with critical UX impact. 100% coverage is achievable and ensures quality recommendations are always accurate.

### 3. ComparisonSlider.test.ts (Priority: High)

**Target Coverage:** 90%+

**Test Cases:**
- Zoom controls
  - Zoom in (bounds checking to 800%)
  - Zoom out (bounds checking to 100%)
  - Reset zoom (resets pan as well)
- Pan state management
  - Only active when zoomed >100%
  - Position tracking during drag
  - Reset when zoom returns to 100%
- Slider position updates
  - Mouse drag events
  - Touch events
  - Bounds clamping (0-100%)
- Quality synchronization
  - Local quality syncs with parent prop
  - Emits quality changes to parent
- Image transform style calculations
  - Scale based on zoom level
  - Translate based on pan position
- Accessibility
  - ARIA labels on slider thumbs
  - Keyboard navigation support

**Rationale:** Complex component with multiple interaction modes. 90% coverage ensures all major user flows work correctly while allowing some tolerance for edge cases.

### 4. ImageCompressor.test.ts (Priority: Critical)

**Target Coverage:** 90%+

**Test Cases:**
- File upload
  - Drag and drop handling
  - Click to browse
  - File type validation
  - Multiple file handling
- Image processing pipeline
  - Compression on upload
  - Recompression on quality change
  - Debouncing quality changes
- State management
  - Selected image tracking
  - Images array management
  - Loading states
- Download operations
  - Single image download
  - Batch download
  - Correct filename generation
  - Format-aware extensions
- Remove/clear operations
  - URL cleanup (revokeObjectURL)
  - Selected image reset
  - Array filtering
- Error handling
  - Compression failures
  - Error message display
  - Auto-dismiss after 5s
- Accessibility
  - Slider ARIA labels
  - Keyboard navigation for image selection

**Rationale:** Main orchestrator component. High coverage ensures reliable user experience across all workflows.

## Coverage Configuration

**vitest.config.ts settings:**
```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'html', 'json', 'lcov'],
  exclude: [
    'node_modules/**',
    'test/**',
    '**/*.config.ts',
    'app/app.vue',
    'app/pages/**', // Simple page wrappers
    '.nuxt/**',
    'dist/**'
  ],
  thresholds: {
    lines: 90,
    functions: 90,
    branches: 90,
    statements: 90
  },
  perFile: true,
  thresholdAutoUpdate: false
}
```

**Coverage Reports:**
- **Text:** Terminal output during CI
- **HTML:** Detailed browse-able report at `coverage/index.html`
- **LCOV:** For IDE integrations (VSCode, WebStorm)
- **JSON:** For programmatic analysis

**Monitoring Strategy:**
1. Run `yarn test:coverage` before commits
2. Review HTML report for uncovered branches
3. Focus on critical paths: compression logic, error handling, state management
4. Accept <90% on pure UI interaction code if necessary (e.g., drag-over visual effects)

## CLI Output & Reporting

**Reporter Configuration:**
- Use Vitest's built-in 'default' and 'verbose' reporters
- Real-time test execution updates
- Color-coded output (green for pass, red for fail)

**Custom Test Summary:**
- Clean summary box after test run
- Total tests, passed, failed, skipped counts
- Duration tracking
- Color-coded using Chalk:
  - ✓ Green for passing tests
  - ✗ Red for failing tests
  - ○ Yellow for skipped tests
  - Cyan for totals

**Example Output:**
```
============================================================
  TEST SUMMARY
============================================================

  Total Tests:     45
  ✓ Passed:        45
  Duration:        1234ms

============================================================

  ✓ ALL TESTS PASSED!
```

## Mock Strategy

### Canvas API Mocking

**Global Setup** (test/setup.ts):
```typescript
import 'vitest-canvas-mock'
```

**Custom Helpers** (test/helpers/canvas-mock.ts):
```typescript
// Mock successful blob creation
export function mockCanvasToBlob(blob: Blob)

// Mock blob creation failure
export function mockCanvasToBlobFailure()

// Create mock image that triggers onload
export function createMockImage(width = 100, height = 100)
```

**Mock File Objects** (test/fixtures/mock-files.ts):
```typescript
export function createMockFile(name, type, size)
export const mockPngFile = () => createMockFile('test.png', 'image/png', 2048)
export const mockJpgFile = () => createMockFile('test.jpg', 'image/jpeg', 1536)
export const mockWebPFile = () => createMockFile('test.webp', 'image/webp', 1024)
```

**Testing Pattern:**
1. Mock Image constructor to trigger onload immediately
2. Mock canvas.toBlob with predetermined blob sizes
3. Test logic paths, not actual image manipulation
4. Test error paths by mocking failures

## Implementation Checklist

### Files to Create

**Configuration (2 files):**
- [ ] `vitest.config.ts` - Test runner configuration
- [ ] `test/setup.ts` - Global test setup and canvas mocks

**Test Files (4 files):**
- [ ] `test/unit/composables/useImageCompression.test.ts` (~200-250 lines)
- [ ] `test/unit/components/QualityIndicator.test.ts` (~100-150 lines)
- [ ] `test/unit/components/ComparisonSlider.test.ts` (~250-300 lines)
- [ ] `test/unit/components/ImageCompressor.test.ts` (~300-400 lines)

**Test Helpers (3 files):**
- [ ] `test/helpers/canvas-mock.ts` - Canvas API mocking utilities
- [ ] `test/helpers/component-utils.ts` - Vue component test helpers
- [ ] `test/helpers/summary.ts` - Custom test summary formatter

**Fixtures (2 files):**
- [ ] `test/fixtures/mock-files.ts` - File object factories
- [ ] `test/fixtures/test-image.png` - Small test image (1KB)

**Package Updates:**
- [ ] Update `package.json` with dependencies and scripts
- [ ] Add `coverage/` to `.gitignore`

### Estimated Metrics

**Total:** ~12 new files, 1000-1300 lines of test code

**Expected Coverage:**
- useImageCompression: 95%+
- QualityIndicator: 100%
- ComparisonSlider: 90%+
- ImageCompressor: 90%+
- **Overall Project: 92-95%**

## Benefits

1. **Fast Feedback:** Unit tests run in milliseconds
2. **Developer Confidence:** 90%+ coverage catches regressions
3. **Maintainability:** Clear test structure makes updates easy
4. **CI/CD Ready:** Automated testing gates for pull requests
5. **Documentation:** Tests serve as living documentation of expected behavior
6. **Refactoring Safety:** High coverage enables confident refactoring

## Future Enhancements

If needed later, consider:
- Integration tests with real canvas (jsdom + node-canvas)
- E2E tests with Playwright for critical user flows
- Visual regression testing for UI components
- Performance benchmarks for compression operations
- Accessibility testing with axe-core

## Success Criteria

- [ ] All tests passing
- [ ] 90%+ coverage threshold met
- [ ] CI/CD integration working
- [ ] Test execution time <5 seconds
- [ ] Clear, readable test output
- [ ] No flaky tests (100% reliable)
