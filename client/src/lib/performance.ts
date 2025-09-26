import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

export interface PerformanceMetrics {
  cls: number;
  inp: number;
  fcp: number;
  lcp: number;
  ttfb: number;
}

export interface PerformanceReport {
  url: string;
  timestamp: number;
  metrics: PerformanceMetrics;
  userAgent: string;
  connectionType?: string;
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private reports: PerformanceReport[] = [];
  private maxReports = 100;

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    // Core Web Vitals
    onCLS(this.handleMetric.bind(this));
    onINP(this.handleMetric.bind(this));
    onFCP(this.handleMetric.bind(this));
    onLCP(this.handleMetric.bind(this));
    onTTFB(this.handleMetric.bind(this));

    // Additional performance monitoring
    this.observeResourceTiming();
    this.observeNavigationTiming();
    this.observeLongTasks();
  }

  private handleMetric(metric: Metric) {
    this.metrics[metric.name.toLowerCase() as keyof PerformanceMetrics] = metric.value;

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${metric.name}:`, metric.value);
    }

    // Send to analytics service
    this.sendToAnalytics(metric);

    // Check if all metrics are collected
    if (Object.keys(this.metrics).length === 5) {
      this.generateReport();
    }
  }

  private sendToAnalytics(metric: Metric) {
    // Send to your analytics service
    if (import.meta.env.PROD) {
      // Example: Send to Google Analytics, custom endpoint, etc.
      // analytics.track('web_vital', metric);
    }
  }

  private generateReport() {
    const report: PerformanceReport = {
      url: window.location.href,
      timestamp: Date.now(),
      metrics: this.metrics as PerformanceMetrics,
      userAgent: navigator.userAgent,
      connectionType: (navigator as any).connection?.effectiveType,
      deviceMemory: (navigator as any).deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
    };

    this.reports.push(report);

    // Keep only the last N reports
    if (this.reports.length > this.maxReports) {
      this.reports.shift();
    }

    // Store in localStorage for debugging
    try {
      localStorage.setItem('performance-reports', JSON.stringify(this.reports));
    } catch (error) {
      console.warn('Failed to store performance reports:', error);
    }

    // Reset metrics for next collection
    this.metrics = {};
  }

  private observeResourceTiming() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const slowResources = entries.filter(entry => entry.duration > 1000);

        if (slowResources.length > 0) {
          console.warn('[Performance] Slow resources detected:', slowResources);
        }
      });

      observer.observe({ entryTypes: ['resource'] });
    }
  }

  private observeNavigationTiming() {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      if (navigation) {
        const metrics = {
          domContentLoaded:
            navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          pageLoad: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: this.getFirstPaint(),
          firstContentfulPaint: this.getFirstContentfulPaint(),
        };

        if (import.meta.env.DEV) {
          console.log('[Performance] Navigation timing:', metrics);
        }
      }
    }
  }

  private observeLongTasks() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.duration > 50) {
            console.warn('[Performance] Long task detected:', {
              duration: entry.duration,
              name: entry.name,
              startTime: entry.startTime,
            });
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        console.warn('Long task observation not supported:', error);
      }
    }
  }

  private getFirstPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  private getFirstContentfulPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(
      entry => entry.name === 'first-contentful-paint'
    );
    return firstContentfulPaint ? firstContentfulPaint.startTime : null;
  }

  public getLatestReport(): PerformanceReport | null {
    return this.reports[this.reports.length - 1] || null;
  }

  public getAllReports(): PerformanceReport[] {
    return [...this.reports];
  }

  public clearReports() {
    this.reports = [];
    try {
      localStorage.removeItem('performance-reports');
    } catch (error) {
      console.warn('Failed to clear performance reports:', error);
    }
  }

  public getPerformanceScore(): number {
    const latest = this.getLatestReport();
    if (!latest) return 0;

    const { metrics } = latest;

    // Calculate performance score based on Web Vitals thresholds
    let score = 100;

    // LCP (Largest Contentful Paint) - good: <2.5s, needs improvement: <4s
    if (metrics.lcp > 4000) score -= 30;
    else if (metrics.lcp > 2500) score -= 15;

    // INP (Interaction to Next Paint) - good: <100ms, needs improvement: <300ms
    if (metrics.inp > 300) score -= 30;
    else if (metrics.inp > 100) score -= 15;

    // CLS (Cumulative Layout Shift) - good: <0.1, needs improvement: <0.25
    if (metrics.cls > 0.25) score -= 30;
    else if (metrics.cls > 0.1) score -= 15;

    // FCP (First Contentful Paint) - good: <1.8s, needs improvement: <3s
    if (metrics.fcp > 3000) score -= 20;
    else if (metrics.fcp > 1800) score -= 10;

    // TTFB (Time to First Byte) - good: <600ms, needs improvement: <1.3s
    if (metrics.ttfb > 1300) score -= 20;
    else if (metrics.ttfb > 600) score -= 10;

    return Math.max(0, score);
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitoring() {
  const getLatestReport = () => performanceMonitor.getLatestReport();
  const getPerformanceScore = () => performanceMonitor.getPerformanceScore();
  const getAllReports = () => performanceMonitor.getAllReports();
  const clearReports = () => performanceMonitor.clearReports();

  return {
    getLatestReport,
    getPerformanceScore,
    getAllReports,
    clearReports,
  };
}
