<!--
Sync Impact Report (Constitution Update)
════════════════════════════════════════════════════════════════════════════════
Version Change: Template → 1.0.0
Change Type: MINOR (Initial constitution establishment)

Modified Principles:
- ✅ Created: I. User-Centric Design & Accessibility
- ✅ Created: II. Test-Driven Development (NON-NEGOTIABLE)
- ✅ Created: III. Component Modularity & Reusability
- ✅ Created: IV. Data Integrity & Migration Safety
- ✅ Created: V. Progressive Enhancement

Added Sections:
- ✅ Technology Standards
- ✅ Quality Assurance
- ✅ Governance

Templates Status:
- ✅ spec-template.md: Aligned (user stories match accessibility principle)
- ✅ plan-template.md: Aligned (constitution check gate present)
- ✅ tasks-template.md: Aligned (test-first workflow enforced)
- ✅ CLAUDE.md: Aligned (Vue 3.5+, testing commands documented)

Follow-up TODOs:
- None - all placeholders filled

Rationale for Version 1.0.0:
- First formal constitution for AquaMetrics project
- Establishes governance framework for agricultural water estimation system
- Based on project characteristics: Vue 3.5+, TDD, 90%+ test coverage, GOV.UK accessibility
════════════════════════════════════════════════════════════════════════════════
-->

# AquaMetrics Constitution

## Core Principles

### I. User-Centric Design & Accessibility

Every feature MUST prioritize elderly farmer users and accessibility:
- Font sizes MUST be at least 19px (GOV.UK body standard)
- Touch targets MUST be minimum 44×44px (WCAG 2.1 AA)
- Color contrast MUST meet WCAG 2.1 AA (≥4.5:1 for normal text)
- Forms MUST have clear labels, hints, and error messages
- All interactive elements MUST support keyboard navigation with visible focus indicators
- ARIA attributes MUST be correctly implemented for screen reader support

**Rationale**: The target users (elderly farmers) require larger fonts, clear visual hierarchy, and assistive technology support. This is a legal and ethical requirement, not an optional enhancement.

### II. Test-Driven Development (NON-NEGOTIABLE)

TDD is MANDATORY for all feature development:
- Tests MUST be written BEFORE implementation
- Tests MUST fail initially, then pass after implementation (Red-Green-Refactor)
- Test coverage MUST remain ≥90% for the entire codebase
- Each user story MUST have independent acceptance tests
- All commits to main MUST pass the full test suite

**Test Categories Required**:
- Unit tests for utilities and composables
- Component tests for Vue components
- Integration tests for stores and data flow
- E2E tests for critical user journeys

**Rationale**: With 90%+ test coverage already achieved, regression prevention is critical. The agricultural calculation accuracy directly impacts farmer decisions—untested code is unacceptable.

### III. Component Modularity & Reusability

All UI components MUST follow Vue 3.5+ Composition API patterns:
- Components MUST be self-contained with clear props/emits contracts
- Shared logic MUST be extracted to composables (e.g., `useValidation`, `useBillingPeriod`)
- Components MUST be independently testable without parent dependencies
- State management MUST use Pinia stores for cross-component state
- No component SHALL exceed 400 lines; split complex components into sub-components

**Rationale**: Modularity enables parallel development, easier testing, and feature reusability across the growing application.

### IV. Data Integrity & Migration Safety

All data operations MUST preserve user information:
- Schema changes MUST include automatic migration logic
- Migrations MUST be backward compatible and non-destructive
- Fallback strategies MUST handle migration errors gracefully
- Historical records MUST maintain temporal accuracy (billing period vs. creation time)
- All timestamps MUST enforce Taiwan timezone (GMT+8)

**Critical Entities**:
- Calculation history records (with dual timestamps)
- User input validation state
- Taipower pricing data cache

**Rationale**: Farmers rely on historical data for planning. Data loss or corruption undermines trust and violates the core value proposition.

### V. Progressive Enhancement & Performance

Features MUST work in degraded conditions:
- Core calculation MUST work offline with fallback pricing data
- Application MUST function on low-end mobile devices
- JavaScript bundle size MUST remain <250KB (gzipped)
- Time to Interactive (TTI) MUST be <3 seconds on 3G networks
- Lazy loading MUST be used for non-critical components (charts, history table)

**Rationale**: Rural farmers may have poor network connectivity and older devices. The tool must be universally accessible regardless of infrastructure limitations.

## Technology Standards

### Primary Stack (LOCKED)
- **Frontend Framework**: Vue 3.5+ (Composition API only)
- **State Management**: Pinia 2.2+
- **Build Tool**: Vite 5.0+
- **Styling**: Tailwind CSS 3.4+ with GOV.UK Design System principles
- **Testing**: Vitest (unit/component) + Playwright (E2E)
- **Language**: JavaScript ES6+ (no TypeScript for simplicity)

### Design System
- GOV.UK Design System principles MUST guide all UI decisions
- Color palette MUST use GOV.UK colors (#1d70b8 primary, #0b0c0c text)
- Typography MUST follow GOV.UK scale (19px body, 24px/36px/48px headings)
- Spacing MUST use GOV.UK increments (15px, 20px, 25px, 30px, 40px, 50px)

**Rationale**: Locked to prevent scope creep and maintain focus on agricultural domain features.

## Quality Assurance

### Definition of Done
A feature is COMPLETE only when:
1. ✅ All user stories have passing acceptance tests
2. ✅ Test coverage ≥90% for new code
3. ✅ ESLint passes with zero warnings
4. ✅ All E2E tests pass in CI
5. ✅ Accessibility audit passes (contrast, ARIA, keyboard nav)
6. ✅ Works offline with fallback data
7. ✅ Mobile responsive (tested on 320px and 768px viewports)
8. ✅ Documentation updated (if applicable)

### Code Review Requirements
All PRs MUST:
- Include test evidence (screenshots of passing tests)
- Demonstrate accessibility compliance
- Show mobile responsive behavior
- Document any migration logic or data model changes
- Pass automated CI checks before review request

## Governance

### Amendment Process
Constitution amendments require:
1. Proposal documenting the change and rationale
2. Review of impact on existing features
3. Update of dependent templates (spec, plan, tasks)
4. Version bump following semantic versioning:
   - **MAJOR**: Breaking principle removals or redefinitions
   - **MINOR**: New principles or substantial expansions
   - **PATCH**: Clarifications, wording fixes

### Versioning Policy
- Constitution version MUST follow semantic versioning (MAJOR.MINOR.PATCH)
- All specs MUST reference constitution version used
- Breaking changes MUST include migration guide

### Compliance Verification
- All feature specs MUST pass constitution check gate (in plan.md)
- Quarterly compliance audits MUST be conducted
- Violations MUST be documented in complexity tracking table with justification

### Runtime Guidance
For AI-assisted development, refer to `CLAUDE.md` for:
- Active technology commands
- Project-specific code style
- Language preferences (Traditional Chinese for docs, English for code)

**Version**: 1.0.0 | **Ratified**: 2025-01-16 | **Last Amended**: 2025-01-16
