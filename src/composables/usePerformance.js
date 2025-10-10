/**
 * Performance monitoring composable
 * Tracks and logs performance metrics
 */

export function usePerformance() {
  function measurePageLoad() {
    if (!window.performance) return;

    window.addEventListener("load", () => {
      setTimeout(() => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        const connectTime = perfData.responseEnd - perfData.requestStart;
        const renderTime = perfData.domComplete - perfData.domLoading;

        console.log("[Performance] Page Load Metrics:", {
          totalLoadTime: `${pageLoadTime}ms`,
          networkTime: `${connectTime}ms`,
          renderTime: `${renderTime}ms`,
        });

        // Send to analytics if enabled
        if (import.meta.env.VITE_ENABLE_ANALYTICS === "true") {
          // Example: gtag('event', 'timing_complete', {...})
        }
      }, 0);
    });
  }

  function measureComponentRender(componentName, startTime) {
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    if (renderTime > 16) {
      // Log if render takes longer than one frame (16ms at 60fps)
      console.warn(
        `[Performance] Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`
      );
    }

    return renderTime;
  }

  function checkLargestContentfulPaint() {
    if (!window.PerformanceObserver) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      console.log(
        "[Performance] LCP:",
        lastEntry.renderTime || lastEntry.loadTime
      );
    });

    observer.observe({ entryTypes: ["largest-contentful-paint"] });
  }

  function init() {
    if (import.meta.env.PROD) {
      measurePageLoad();
      checkLargestContentfulPaint();
    }
  }

  return {
    measurePageLoad,
    measureComponentRender,
    checkLargestContentfulPaint,
    init,
  };
}
