import { ref, onMounted } from 'vue';

interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
}

export function usePerformanceMonitor() {
  const metrics = ref<PerformanceMetrics>({});
  const isSupported = ref(false);

  const reportMetric = (metricName: keyof PerformanceMetrics, value: number) => {
    metrics.value[metricName] = value;

    // Optional: Send to analytics
    console.log(`Performance Metric - ${metricName}:`, value);

    // You can integrate with your analytics service here
    // analytics.track('performance_metric', { metric: metricName, value });
  };

  const observeLCP = () => {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      reportMetric('lcp', lastEntry.startTime);
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Fallback for browsers that don't support LCP
    }
  };

  const observeFID = () => {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const fidEntry = entry as FirstInputEntry;
        reportMetric('fid', fidEntry.processingStart - fidEntry.startTime);
      });
    });

    try {
      observer.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // Fallback for browsers that don't support FID
    }
  };

  const observeCLS = () => {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const layoutShiftEntry = entry as LayoutShiftEntry;
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value;
          reportMetric('cls', clsValue);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // Fallback for browsers that don't support CLS
    }
  };

  const measureNavigationTiming = () => {
    if (!('performance' in window)) return;

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      if (navigation) {
        // First Contentful Paint
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          reportMetric('fcp', fcpEntry.startTime);
        }

        // Time to First Byte
        reportMetric('ttfb', navigation.responseStart - navigation.requestStart);
      }
    });
  };

  const initializeMonitoring = () => {
    if (!('PerformanceObserver' in window) || !('performance' in window)) {
      console.warn('Performance monitoring not supported in this browser');
      return;
    }

    isSupported.value = true;

    observeLCP();
    observeFID();
    observeCLS();
    measureNavigationTiming();
  };

  onMounted(() => {
    initializeMonitoring();
  });

  return {
    metrics,
    isSupported,
  };
}
