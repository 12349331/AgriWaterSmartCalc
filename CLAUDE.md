<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# AquaMetrics Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-09

## Active Technologies
- JavaScript ES6+ (Vue 3.5+ Composition API) + Vue 3.5+, Pinia 2.2+, ECharts 5.x, Tailwind CSS 3.4+ (004-refactor-parameters-charts)
- LocalStorage (for historical records and user preferences) (004-refactor-parameters-charts)
- JavaScript ES6+ / Node.js (via Vite 5.0, no transpilation for modern browsers) + Vue 3.5+ (Composition API with `<script setup>`), Pinia 2.2+ (state management), ECharts 5.5+ (data visualization), Tailwind CSS 4.1+ (styling), vue-echarts 7.0+ (Vue wrapper for ECharts) (005-update-ui-form-fields)
- LocalStorage (for historical calculation records and user preferences) (005-update-ui-form-fields)

- JavaScript ES6+ (Modern browser-compatible, no transpilation required for deployment) (001-build-an-application)
- JavaScript ES6+ / Vue 3.5+ (001-build-an-application)

## Project Structure

```
backend/
frontend/
tests/
```

## Commands

npm test [ONLY COMMANDS FOR ACTIVE TECHNOLOGIES][ONLY COMMANDS FOR ACTIVE TECHNOLOGIES] npm run lint

## Code Style

JavaScript ES6+ (Modern browser-compatible, no transpilation required for deployment): Follow standard conventions

## Recent Changes
- 005-update-ui-form-fields: Added JavaScript ES6+ / Node.js (via Vite 5.0, no transpilation for modern browsers) + Vue 3.5+ (Composition API with `<script setup>`), Pinia 2.2+ (state management), ECharts 5.5+ (data visualization), Tailwind CSS 4.1+ (styling), vue-echarts 7.0+ (Vue wrapper for ECharts)
- 004-refactor-parameters-charts: Added JavaScript ES6+ (Vue 3.5+ Composition API) + Vue 3.5+, Pinia 2.2+, ECharts 5.x, Tailwind CSS 3.4+

- 001-build-an-application: Added JavaScript ES6+ / Vue 3.5+

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

<!-- MANUAL ADDITIONS START -->

## Language preference / 語言偏好

- Instruction (中文): 與我對話時請使用台灣繁體中文；在撰寫文件或程式碼時請使用英文。

- Example English prompt for documents or code (use this when you want the assistant to produce docs/code in English):

  "Write a clear, professional README.md for the AquaMetrics project that includes: a short project overview, installation steps, usage examples, a development workflow section, and a troubleshooting section. Use Markdown headings, code blocks with JavaScript examples, and concise, actionable instructions."

<!-- MANUAL ADDITIONS END -->
