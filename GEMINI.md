# GEMINI.md

## Project Overview

This project is a Vue.js application called "AquaMetrics". It appears to be a calculator for water and power consumption, possibly for agricultural or industrial use. The application is built with Vite, uses Pinia for state management, and ECharts for data visualization. It features a fallback mechanism for an external API from Taipower, which is used to calculate electricity costs. The application is styled with Tailwind CSS.

## Building and Running

### Development

To run the application in development mode, use the following command:

```bash
npm run dev
```

This will start a development server on `http://localhost:3000`.

### Building for Production

To build the application for production, use the following command:

```bash
npm run build
```

The production-ready files will be located in the `dist` directory.

### Testing

The project includes unit, component, and end-to-end tests.

*   **Run all tests:**
    ```bash
    npm run test
    ```

*   **Run unit tests:**
    ```bash
    npm run test:unit
    ```

*   **Run component tests:**
    ```bash
    npm run test:component
    ```

*   **Run end-to-end tests:**
    ```bash
    npm run test:e2e
    ```

## Development Conventions

### Linting and Formatting

The project uses ESLint for linting and Prettier for code formatting.

*   **Lint files:**
    ```bash
    npm run lint
    ```

*   **Format files:**
    ```bash
    npm run format
    ```

### State Management

The project uses Pinia for state management. The stores are located in the `src/stores` directory.

### API Interaction

The application interacts with a Taipower API to fetch electricity pricing data. A fallback mechanism is implemented to handle API failures, using local data as a substitute.
