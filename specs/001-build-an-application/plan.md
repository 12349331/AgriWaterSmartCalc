# Implementation Plan: Agricultural Water Usage Estimator (Smart Water Management Platform)

**Branch**: `001-build-an-application` | **Date**: 2025-10-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-build-an-application/spec.md`

**Note**: This plan has been updated to use **Vue 3 + Vite + ECharts** technology stack.

## Summary

Build a professional web application for Taiwanese farmers to estimate agricultural water usage by analyzing electricity bill data ("electricity-to-water" estimation). The core innovation is reverse-calculating electricity consumption (kWh) from Taiwan Power Company (Taipower) bill amounts using their progressive pricing structure, then computing water flow rates (Q) and monthly volumes (V) based on pump specifications, crop types, and field areas. The application features an interactive dashboard with seasonal analysis charts using ECharts, historical record management with persistent browser storage, and Taiwan-localized UI in Traditional Chinese. Built with Vue 3 + Vite for optimal development experience and deployed as a static site on Netlify.com.

## Technical Context

**Language/Version**: JavaScript ES6+ / Vue 3.5+

**Primary Dependencies**:
- **Vue.js 3.5+** - Progressive JavaScript framework for building reactive UIs
- **Vite 5.0+** - Next-generation build tool with instant HMR and optimized bundling
- **Apache ECharts 5.5+** - Professional data visualization library with rich chart types
- **Tailwind CSS 3.4+** - Utility-first CSS framework for responsive design
- **Pinia 2.2+** - Official Vue state management library (Vuex successor)

**Storage**:
- **LocalStorage** - For persistent estimation records (primary)
- **Pinia Store** - In-memory reactive state management for app state

**Testing**: Vitest + Vue Test Utils + Playwright
- **Vitest** - Vite-native unit testing framework
- **@vue/test-utils** - Official Vue component testing library
- **Playwright** - End-to-end testing across browsers

**Target Platform**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+) on desktop and mobile devices

**Project Type**: Single-page application (SPA) with Vue 3 Composition API

**Performance Goals**:
- Initial page load: <2s (Vite code-splitting optimization)
- Calculation results: <100ms response time (reactive computed properties)
- Chart rendering: <3s for up to 100 estimation records (ECharts lazy loading)
- Interactive UI updates: <16ms (60fps reactivity via Vue 3)
- Build time: <10s for production bundle

**Constraints**:
- **No backend server** - All logic client-side (static site requirement for Netlify)
- **Online-only** - Requires internet for Taipower API access (per FR-017)
- **Single-device persistence** - No cross-device sync (per clarification)
- **Traditional Chinese UI** - All text must be Taiwan-localized (per FR-014, FR-017)
- **API dependency** - Must fetch Taipower pricing data from https://service.taipower.com.tw/data/opendata/apply/file/d007008/001.json
- **Bundle size** - Target <500KB gzipped (Vite tree-shaking + lazy loading)

**Scale/Scope**:
- Target users: Individual farmers (medium-sized farms, 0.5-50 hectares per FR-006)
- Historical records: Support 50-100+ estimations without performance degradation (per FR-SC-007)
- Crop types: 5-8 categories (per clarifications)
- Geographic regions: 3 zones (North, Central, South Taiwan) with preset configurations
  - **North Taiwan**: Default pump 5HP, efficiency 75%, well depth 80m, typical crops: Rice, Leafy Greens
  - **Central Taiwan**: Default pump 5HP, efficiency 75%, well depth 60m, typical crops: Rice, Root Vegetables, Citrus
  - **South Taiwan**: Default pump 5HP, efficiency 75%, well depth 50m, typical crops: Mango, Rice, Root Vegetables
- Component count: ~15-20 Vue components
- Store modules: 3-4 Pinia stores (calculation, history, config, ui)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Code Quality First ✅ PASS

**Alignment Status**: Compliant with constitution requirements

- **Readability**: Vue 3 Composition API with `<script setup>` provides clear, declarative component logic; Composables pattern encourages reusable functions
- **Maintainability**: Component-based architecture + Pinia stores enforce separation of concerns; Config-driven design eliminates hardcoding
- **Type Safety**: JavaScript with JSDoc annotations (or optional TypeScript migration path); Vue 3 has excellent TypeScript support
- **Error Handling**: Explicit validation via VeeValidate or custom composables; Error boundaries for component failures; Traditional Chinese error messages
- **Code Review**: Standard pull request process applies

**Action Required**: None. Vue 3 architecture naturally supports quality standards.

---

### II. Testing Standards (NON-NEGOTIABLE) ✅ PASS (with research required)

**Alignment Status**: Testing framework selected (Vitest), implementation details need research

**Testing Coverage Plan**:
- **Unit Tests**: All composables (useWaterCalculation, usePowerCalculation, useStorage), utility functions, Pinia store actions
- **Component Tests**: Vue Test Utils for form inputs, chart components, table rendering
- **Integration Tests**: Taipower API fetch + caching logic, LocalStorage persistence, ECharts integration
- **End-to-End Tests**: Complete user flows (P1-P3 user stories), input validation edge cases

**Advantages of Vitest + Vue Ecosystem**:
- Native Vite integration (same config, instant HMR in tests)
- Vue Test Utils official support (component mounting, $emit testing)
- Jest-compatible API (familiar for developers)
- Fast execution with native ES modules

**Action Required**: Phase 0 research must define:
- Vitest configuration for Vue SFC (Single File Components)
- Component testing best practices (shallow vs mount)
- ECharts mocking strategies for chart tests

---

### III. User Experience Consistency ✅ PASS

**Alignment Status**: Compliant with constitution requirements

- **Design System Compliance**: Tailwind CSS + custom Vue component library ensures consistent UI patterns
- **Responsive Design**: Tailwind's mobile-first approach + Vue's conditional rendering for device-specific layouts
- **Accessibility (a11y)**:
  - Keyboard navigation via Vue directives (v-focus, @keydown)
  - Semantic HTML in Vue templates (form, table, nav elements)
  - ARIA labels in components (dynamic aria-live for calculations)
  - ECharts accessibility features (keyboard navigation, screen reader support)
  - Color contrast compliance (Tailwind default palette meets WCAG 2.1 AA)
- **Error States**: Vue reactive error messages in Traditional Chinese; VeeValidate for real-time validation feedback
- **Loading States**: Vue Suspense for async components; ECharts built-in loading animation
- **Interaction Feedback**: Vue transitions for visual feedback; Computed properties ensure instant reactivity

**Action Required**: None. Requirements explicitly address UX consistency.

---

### IV. Performance Requirements ✅ PASS (with justified deviations)

**Alignment Status**: Mostly compliant, with one constraint exception

**Performance Targets**:
- ✅ **API endpoints**: N/A (no backend) - **COMPLIANT**
- ⚠️ **Page loads**: <2s initial (constitution requires <2s, spec allows up to 3s for dashboard with 100 records)
  - **Mitigation**: Vite code-splitting, lazy loading ECharts, route-based chunking
- ✅ **UI interactions**: <16ms (60fps Vue reactivity) - **EXCEEDS REQUIREMENT** (constitution: <100ms)

**Resource Efficiency**:
- ✅ **Client bundle size**: Vite tree-shaking + lazy loading targets <500KB gzipped - **COMPLIANT**
  - Vue 3 runtime: ~30KB gzipped
  - ECharts (with tree-shaking): ~200KB gzipped
  - Tailwind (purged): ~10KB gzipped
  - App code: ~100KB gzipped
  - **Total estimated**: ~340KB gzipped
- ✅ **Memory usage**: Vue 3 Proxy-based reactivity is more efficient than Vue 2; ECharts handles large datasets well
- ✅ **Database queries**: N/A (no database) - **COMPLIANT**

**Scalability**:
- ✅ Horizontal scaling N/A (static site on CDN) - **COMPLIANT**
- ✅ Designed for 50-100+ records (ECharts can handle 10,000+ data points efficiently) - **COMPLIANT**

**Monitoring**:
- ✅ Web Vitals + Vite plugin for performance insights
- ✅ ECharts has built-in performance tracking (render time)

**Performance Testing**:
- ✅ Lighthouse CI + custom Vitest benchmarks for chart rendering

**Justification for Deviations**:
- Dashboard 3s load time for 100 records: Spec explicitly defines this as acceptable (FR-SC-005). Constitution's 2s target is for navigation; this is a data-heavy initial render with ECharts. **JUSTIFIED**.

**Action Required**: None. Performance strategy is sound.

---

### Summary

**Overall Gate Status**: ✅ **CONDITIONAL PASS** - May proceed to Phase 0 with minor research required

**Blocker Issues**: None (all critical requirements aligned)

**Clarifications Required for Phase 0**:
1. Vitest configuration for Vue SFC testing
2. ECharts integration best practices (lazy loading, tree-shaking)
3. Pinia store testing strategies
4. CI/CD pipeline for Vite build (GitHub Actions)

**Post-Phase 1 Re-check Required**: Yes (after data model and component architecture are defined)

## Project Structure

### Documentation (this feature)

```
specs/001-build-an-application/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (Vue 3 + Vite ecosystem research)
├── data-model.md        # Phase 1 output (Pinia stores + data entities)
├── quickstart.md        # Phase 1 output (Vite setup, npm scripts)
├── contracts/           # Phase 1 output (Component props/emits, Composables)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```
/                           # Repository root (Vite project)
├── index.html              # Vite entry point
├── package.json            # npm dependencies (Vue, Vite, ECharts, etc.)
├── vite.config.js          # Vite configuration (plugins, build options)
├── tailwind.config.js      # Tailwind CSS configuration
├── .env                    # Environment variables (Taipower API URL)
│
├── public/                 # Static assets (served as-is)
│   └── logo.svg
│
├── src/                    # Application source code
│   ├── main.js                 # Vue app initialization
│   ├── App.vue                 # Root component
│   │
│   ├── components/             # Vue components
│   │   ├── calculator/
│   │   │   ├── CalculatorForm.vue       # Main input form
│   │   │   ├── ResultCard.vue           # Q & V display
│   │   │   └── AdvancedParams.vue       # Collapsible advanced inputs
│   │   ├── dashboard/
│   │   │   ├── DashboardTabs.vue        # Tab navigation
│   │   │   ├── SeasonalChart.vue        # ECharts seasonal analysis
│   │   │   ├── CropComparisonChart.vue  # ECharts crop comparison
│   │   │   └── AnnualTrendChart.vue     # ECharts annual trend
│   │   ├── history/
│   │   │   ├── HistoryTable.vue         # Historical records table
│   │   │   └── ClearHistoryButton.vue   # Confirmation dialog
│   │   └── common/
│   │       ├── LoadingSpinner.vue
│   │       ├── ErrorMessage.vue
│   │       └── OfflineNotice.vue
│   │
│   ├── composables/            # Reusable Composition API logic
│   │   ├── usePowerCalculator.js    # Taipower API + bill-to-kWh
│   │   ├── useWaterCalculator.js    # Q & V formulas
│   │   ├── useStorage.js            # LocalStorage operations
│   │   └── useValidation.js         # Form validation rules
│   │
│   ├── stores/                 # Pinia state management
│   │   ├── calculation.js          # Current calculation state
│   │   ├── history.js              # Historical records
│   │   ├── config.js               # Crop types, regional presets
│   │   └── ui.js                   # UI state (loading, errors)
│   │
│   ├── utils/                  # Pure utility functions
│   │   ├── formulas.js             # Water calculation formulas
│   │   ├── validators.js           # Input validation functions
│   │   └── formatters.js           # Number/date formatters (i18n)
│   │
│   ├── config/                 # Static configuration
│   │   ├── crops.js                # Crop types with seasonal factors (5-8 Taiwan crops from spec.md §Seasonal Adjustment Factors table)
│   │   ├── regions.js              # Regional presets: North (80m well), Central (60m), South (50m) with default pump params (5HP, 75% efficiency)
│   │   ├── constants.js            # Calculation constants (gravityConstant: 0.222, safetyFactor: 1.2, etc.)
│   │   └── taipower-pricing.js     # Fallback Taipower pricing tiers (Summer/Non-Summer rates from spec.md §Taipower Progressive Pricing Structure)
│   │
│   ├── assets/                 # Styles and images
│   │   └── styles/
│   │       └── main.css            # Global styles (Tailwind imports)
│   │
│   └── types/                  # JSDoc type definitions (optional)
│       └── index.js
│
├── tests/                      # Test suite
│   ├── unit/
│   │   ├── composables/
│   │   │   ├── usePowerCalculator.test.js
│   │   │   └── useWaterCalculator.test.js
│   │   ├── stores/
│   │   │   ├── calculation.test.js
│   │   │   └── history.test.js
│   │   └── utils/
│   │       └── formulas.test.js
│   ├── component/
│   │   ├── CalculatorForm.test.js
│   │   └── SeasonalChart.test.js
│   └── e2e/
│       ├── user-story-p1.spec.js    # Calculate water usage
│       ├── user-story-p2.spec.js    # Historical records
│       └── user-story-p3.spec.js    # Visualization
│
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions (Vitest + Playwright + build)
│
├── netlify.toml                    # Netlify deployment config
├── vitest.config.js                # Vitest test configuration
└── playwright.config.js            # Playwright E2E configuration
```

**Structure Decision**: **Vue 3 Single-Page Application (SPA) with Vite**

This structure is selected for the following reasons:

1. **Vue 3 Best Practices**: Component-based architecture with clear separation (components/, composables/, stores/)
2. **Vite Optimization**: Fast dev server, optimized production build with code-splitting
3. **Composition API**: Reusable logic via composables (better than mixins/filters)
4. **Pinia Stores**: Modular state management (cleaner than Vuex, official Vue recommendation)
5. **Testing Isolation**: Separate unit/component/e2e tests; Vitest config matches Vite config
6. **Netlify Compliance**: Vite builds to `/dist/` directory with optimized static assets

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**No violations identified.** All constitution principles are satisfied by the Vue 3 + Vite approach:

- **Code Quality**: Vue 3 Composition API + Pinia stores enforce clean architecture
- **Testing Standards**: Vitest + Vue Test Utils provide comprehensive testing (unit/component/e2e)
- **UX Consistency**: Tailwind CSS + Vue component library ensure design consistency
- **Performance**: Vite build optimization + Vue 3 reactivity meet all targets; minor deviation (3s dashboard) is spec-approved

**Trade-offs Considered**:

| Decision | Pro | Con | Justification |
|----------|-----|-----|---------------|
| **Vue 3 vs Vanilla JS** | Component reusability, reactivity, better DX | Larger bundle size (~30KB runtime) | Improved maintainability and developer productivity outweigh 30KB overhead |
| **ECharts vs Chart.js** | More professional charts, better performance with large datasets | Larger bundle (~200KB) | Required for professional agricultural dashboard; spec emphasizes data visualization quality |
| **Pinia vs Vuex** | Simpler API, better TypeScript support, official recommendation | Newer (less community content) | Pinia is Vue 3's official state management; simpler API reduces learning curve |
| **Vite vs Webpack** | Faster dev server (instant HMR), simpler config | Newer ecosystem | Vite is Vue's official build tool; speed improvements are significant (10x faster HMR) |

---

## Next Steps

1. **Phase 0**: Generate `research.md` with Vue 3 + Vite ecosystem best practices
2. **Phase 1**: Generate `data-model.md` (Pinia store schemas), `contracts/` (component props/emits), `quickstart.md` (Vite setup)
3. **Phase 1**: Update agent context with Vue 3 technology stack
4. **Phase 2**: Generate `tasks.md` via `/speckit.tasks` command

All architectural decisions are documented and ready for implementation.
