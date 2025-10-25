# Project Context

## Purpose

AquaMetrics is an agricultural water usage estimation system based on Taiwan Power Company (Taipower) electricity bills. The system helps farmers and agricultural administrators estimate water pumping consumption by analyzing electricity usage data.

**Core Goals:**
- Provide accurate water usage calculations based on crop type and field area
- Automatically retrieve and apply Taipower pricing data
- Support billing period management with seasonal detection (summer/non-summer rates)
- Maintain historical records with dual timestamps (billing period + creation time)
- Offer data visualization and analytics for usage trends

## Tech Stack

### Frontend
- **Framework**: Vue 3.5+ (Composition API with `<script setup>`)
- **State Management**: Pinia 2.2+
- **Build Tool**: Vite 5.0+
- **Styling**: Tailwind CSS 4.1+ (with @tailwindcss/vite plugin)
- **UI Components**: Vant 4.9+ (with unplugin-vue-components auto-import)
- **Data Visualization**: ECharts 5.5+, vue-echarts 7.0+
- **Utilities**: @vueuse/core 13.9+, uuid 10.0+

### Testing
- **Unit/Component Tests**: Vitest 1.0+ with @vue/test-utils 2.4+
- **E2E Tests**: Playwright 1.40+
- **Coverage**: @vitest/coverage-v8 1.6+
- **Test Environment**: happy-dom 12.10+

### Code Quality
- **Linting**: ESLint 8.56+ with eslint-plugin-vue 9.19+
- **Formatting**: Prettier 3.1+

### Data Storage
- **LocalStorage**: For historical calculation records and user preferences
- **No Backend**: Pure client-side application

### Build & Deployment
- **Target**: ESNext (modern browsers, no transpilation)
- **Minification**: Terser 5.44+ (with console/debugger removal in production)
- **Deployment**: Netlify (configured in netlify.toml)

## Project Conventions

### Code Style

**JavaScript/Vue:**
- Use JavaScript ES6+ (no TypeScript)
- Vue 3 Composition API exclusively (`<script setup>` syntax)
- Prefer `const` over `let`, avoid `var`
- Use arrow functions for callbacks
- Single quotes for strings (enforced by Prettier)
- 2-space indentation (enforced by ESLint)
- Remove all `console.log` in production builds

**File Naming:**
- Vue components: PascalCase (e.g., `CalculatorForm.vue`)
- Utilities/composables: kebab-case (e.g., `use-calculator.js`)
- Test files: Match source file name with `.test.js` or `.spec.js`

**Component Organization:**
- Group by feature under `src/components/`:
  - `calculator/` - Calculation form components
  - `history/` - Historical records components
  - `charts/` - Data visualization components
  - `common/` - Shared/reusable components
  - `dashboard/` - Dashboard-related components

**Import Aliases:**
- Use `@/` for `src/` directory (configured in vite.config.js)
- Example: `import { useCalculator } from '@/composables/useCalculator'`

### Architecture Patterns

**State Management:**
- Use Pinia stores for global state (e.g., calculation history, user preferences)
- Use composables for reusable logic with local state
- Component-level reactive state for UI-only concerns

**Component Structure:**
1. Imports
2. Props/Emits definitions
3. Composables/stores usage
4. Reactive state
5. Computed properties
6. Methods/functions
7. Lifecycle hooks
8. Watch/watchEffect

**Data Flow:**
- Parent → Child: Props
- Child → Parent: Emits
- Global state: Pinia stores
- Shared logic: Composables

**Error Handling:**
- Use ErrorBoundary component for component-level errors
- Validate user inputs with dedicated validator utilities
- Display user-friendly error messages with ErrorMessage component
- Graceful degradation (e.g., offline mode with OfflineNotice)

**Performance:**
- Use `shallowRef`/`shallowReactive` for large objects
- Lazy load chart components (dynamic imports if needed)
- Debounce expensive calculations
- Minimize watchers, prefer computed properties

### Testing Strategy

**Coverage Target:** 90%+ (currently 460/498 tests passing)

**Test Pyramid:**
1. **Unit Tests** (225+ tests):
   - Utility functions (formulas, validators, date utilities)
   - Composables logic
   - Store mutations/actions
   - Located in `tests/unit/`

2. **Component Tests** (120+ tests):
   - Component rendering
   - User interactions (clicks, inputs)
   - Props/emits behavior
   - Conditional rendering
   - Located in `tests/component/`

3. **E2E Tests** (25+ scenarios):
   - Complete user workflows
   - Cross-component integration
   - LocalStorage persistence
   - Located in `tests/e2e/`

**Testing Best Practices:**
- Write tests before implementing features (TDD approach)
- Test behavior, not implementation
- Use descriptive test names (e.g., `should calculate water usage for rice crop`)
- Mock external dependencies (e.g., Taipower API)
- Test edge cases and error conditions
- Avoid snapshot tests (prefer explicit assertions)

**Running Tests:**
```bash
npm test                    # All unit/component tests
npm run test:e2e           # E2E tests with Playwright
npm run test:coverage      # Coverage report
npm run test:ui            # Interactive test UI
```

### Git Workflow

**Branching Strategy:**
- `main` - Production-ready code, protected branch
- `feature/xxx` - New features (e.g., `feature/add-2fa`)
- `fix/xxx` - Bug fixes (e.g., `fix/date-validation`)
- `refactor/xxx` - Code refactoring
- `docs/xxx` - Documentation updates

**Commit Conventions:**
- Follow [Conventional Commits](https://www.conventionalcommits.org/)
- Format: `<type>(<scope>): <subject>`
- Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`
- Examples:
  - `feat(calculator): add billing period selection`
  - `fix(validators): correct timezone handling for dates`
  - `refactor(history): extract table sorting logic to composable`
  - `test(e2e): add scenario for date range filtering`

**Pull Request Process:**
1. Create feature branch from `main`
2. Implement feature with tests (TDD)
3. Ensure all tests pass: `npm test`
4. Run linter: `npm run lint`
5. Update documentation if needed
6. Create PR with descriptive title and body
7. Address review feedback
8. Merge to `main` after approval

**Pre-commit Checks:**
- ESLint must pass (auto-fix with `--fix`)
- All tests must pass
- No `console.log` statements in production code

## Domain Context

**Agricultural Water Usage Estimation:**
- Taiwan's agriculture uses significant electricity for water pumping
- Taipower (Taiwan Power Company) provides electricity pricing data via open API
- Different crops have different water consumption rates (crop coefficients)
- Seasonal variations affect pricing (summer vs. non-summer months)

**Key Domain Concepts:**
1. **Crop Types**: Rice, vegetables, fruits, tea, etc. (each with specific water needs)
2. **Billing Period**: The date range on a Taipower electricity bill
3. **Summer/Non-Summer Months**:
   - Summer: June 1 - September 30
   - Non-Summer: October 1 - May 31
   - Affects electricity pricing tiers
4. **Dual Timestamps**:
   - **Billing Period**: Actual date range from electricity bill
   - **Creation Time**: When the record was created in the system
5. **Taiwan Timezone**: All dates must use GMT+8 (Asia/Taipei)

**Data Migration:**
- Old records (before Feature 003) have single timestamp
- Auto-migration on app startup converts old format to new format
- Backward compatible (no data loss)

## Important Constraints

### Technical Constraints
- **No Backend**: Pure client-side application, all data in LocalStorage
- **Modern Browsers Only**: Target ESNext, no IE11 support
- **Taiwan-specific**: Timezone hardcoded to GMT+8, pricing from Taipower
- **LocalStorage Limits**: ~5MB per domain, must handle quota exceeded errors
- **No User Authentication**: Single-user application per browser
- **Date Range Limits**: Valid records from 2020-01-01 to today + 1 year

### Business Constraints
- **Taipower Pricing**: Must fetch latest pricing data from official API
- **Seasonal Accuracy**: Correct summer/non-summer detection is critical for pricing
- **Data Integrity**: No loss of historical records during migrations
- **User Privacy**: No data sent to external servers (except Taipower API)

### Regulatory Constraints
- **Open Data License**: Taipower data usage must comply with Taiwan Open Data terms
- **Privacy**: GDPR-like considerations (though data stays local)

## External Dependencies

### APIs
1. **Taipower Open Data API**
   - Endpoint: `https://service.taipower.com.tw/data/opendata/apply/file/d007008/001.json`
   - Proxied via Vite dev server: `/api/taipower`
   - Purpose: Retrieve electricity pricing tiers
   - Format: JSON
   - Rate limits: Unknown (public open data)
   - Error handling: Fallback to cached/default values

### CDNs / External Services
- **Netlify**: Hosting and deployment
- **No Analytics**: No third-party tracking scripts
- **No External Fonts**: All assets bundled

### Third-party Libraries (Critical)
- **ECharts**: Chart rendering (large dependency, code-split in build)
- **Vant**: Mobile-friendly UI components (auto-imported)
- **@vueuse/core**: Vue composition utilities
- **uuid**: Unique ID generation for records
