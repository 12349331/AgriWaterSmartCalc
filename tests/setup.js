import { config } from "@vue/test-utils";

// Mock global properties
config.global.mocks = {
  $t: (key) => key, // Mock i18n if needed
};

// Stub ECharts globally for non-chart component tests
config.global.stubs = {
  "v-chart": true,
};
