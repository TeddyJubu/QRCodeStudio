import { describe, it, expect, beforeEach, vi } from 'vitest';
import { performanceMonitor, usePerformanceMonitoring } from '@/lib/performance';

// Mock web-vitals
vi.mock('web-vitals', () => ({
  onCLS: vi.fn(),
  onINP: vi.fn(),
  onFCP: vi.fn(),
  onLCP: vi.fn(),
  onTTFB: vi.fn(),
}));

// Mock performance API
const mockPerformance = {
  getEntriesByType: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  now: vi.fn(() => Date.now()),
  getEntriesByName: vi.fn(),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
  mark: vi.fn(),
  measure: vi.fn(),
};

const mockNavigator = {
  userAgent: 'Mozilla/5.0 (test)',
  hardwareConcurrency: 8,
  connection: {
    effectiveType: '4g',
  },
  deviceMemory: 8,
};

describe('Performance Monitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup global mocks
    Object.defineProperty(window, 'performance', {
      value: mockPerformance,
      writable: true,
    });

    Object.defineProperty(window, 'navigator', {
      value: mockNavigator,
      writable: true,
    });

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Reset performance monitor
    (performanceMonitor as any).metrics = {};
    (performanceMonitor as any).reports = [];
  });

  describe('PerformanceMonitor', () => {
    it('should initialize with empty metrics and reports', () => {
      expect((performanceMonitor as any).metrics).toEqual({});
      expect((performanceMonitor as any).reports).toEqual([]);
    });

    it('should handle metric collection', () => {
      const mockMetric = {
        name: 'LCP',
        value: 1200,
        id: 'test-id',
        delta: 100,
        entries: [],
        navigationType: 'navigate',
      };

      // Simulate metric handler
      (performanceMonitor as any).handleMetric(mockMetric);

      expect((performanceMonitor as any).metrics.lcp).toBe(1200);
    });

    it('should generate performance report when all metrics are collected', () => {
      const metrics = [
        { name: 'CLS', value: 0.05 },
        { name: 'INP', value: 80 },
        { name: 'FCP', value: 1000 },
        { name: 'LCP', value: 1500 },
        { name: 'TTFB', value: 300 },
      ];

      metrics.forEach(metric => {
        (performanceMonitor as any).handleMetric(metric);
      });

      expect((performanceMonitor as any).reports.length).toBe(1);

      const report = (performanceMonitor as any).reports[0];
      expect(report.metrics.cls).toBe(0.05);
      expect(report.metrics.inp).toBe(80);
      expect(report.metrics.fcp).toBe(1000);
      expect(report.metrics.lcp).toBe(1500);
      expect(report.metrics.ttfb).toBe(300);
    });

    it('should calculate performance score correctly', () => {
      const mockReport = {
        metrics: {
          cls: 0.05,
          inp: 80,
          fcp: 1000,
          lcp: 1500,
          ttfb: 300,
        },
      };

      (performanceMonitor as any).reports = [mockReport];

      const score = performanceMonitor.getPerformanceScore();
      expect(score).toBe(100); // All metrics are in "good" range
    });

    it('should calculate reduced performance score for poor metrics', () => {
      const mockReport = {
        metrics: {
          cls: 0.3, // Poor
          inp: 400, // Poor
          fcp: 3500, // Poor
          lcp: 5000, // Poor
          ttfb: 2000, // Poor
        },
      };

      (performanceMonitor as any).reports = [mockReport];

      const score = performanceMonitor.getPerformanceScore();
      expect(score).toBeLessThan(50);
    });

    it('should store reports in localStorage', () => {
      const metrics = [
        { name: 'CLS', value: 0.05 },
        { name: 'INP', value: 80 },
        { name: 'FCP', value: 1000 },
        { name: 'LCP', value: 1500 },
        { name: 'TTFB', value: 300 },
      ];

      metrics.forEach(metric => {
        (performanceMonitor as any).handleMetric(metric);
      });

      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'performance-reports',
        expect.any(String)
      );
    });

    it('should limit number of stored reports', () => {
      const metrics = [
        { name: 'CLS', value: 0.05 },
        { name: 'INP', value: 80 },
        { name: 'FCP', value: 1000 },
        { name: 'LCP', value: 1500 },
        { name: 'TTFB', value: 300 },
      ];

      // Generate more reports than the limit
      for (let i = 0; i < 110; i++) {
        (performanceMonitor as any).metrics = {};
        metrics.forEach(metric => {
          (performanceMonitor as any).handleMetric(metric);
        });
      }

      expect((performanceMonitor as any).reports.length).toBe(100);
    });

    it('should clear reports', () => {
      const mockReport = {
        metrics: {
          cls: 0.05,
          inp: 80,
          fcp: 1000,
          lcp: 1500,
          ttfb: 300,
        },
      };

      (performanceMonitor as any).reports = [mockReport];

      performanceMonitor.clearReports();

      expect((performanceMonitor as any).reports).toEqual([]);
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('performance-reports');
    });
  });

  describe('usePerformanceMonitoring hook', () => {
    it('should provide performance monitoring functions', () => {
      const hook = usePerformanceMonitoring();

      expect(hook).toHaveProperty('getLatestReport');
      expect(hook).toHaveProperty('getPerformanceScore');
      expect(hook).toHaveProperty('getAllReports');
      expect(hook).toHaveProperty('clearReports');

      expect(typeof hook.getLatestReport).toBe('function');
      expect(typeof hook.getPerformanceScore).toBe('function');
      expect(typeof hook.getAllReports).toBe('function');
      expect(typeof hook.clearReports).toBe('function');
    });

    it('should return latest report', () => {
      const mockReport = {
        url: 'https://example.com',
        timestamp: Date.now(),
        metrics: {
          cls: 0.05,
          inp: 80,
          fcp: 1000,
          lcp: 1500,
          ttfb: 300,
        },
        userAgent: 'test-agent',
      };

      (performanceMonitor as any).reports = [mockReport];

      const hook = usePerformanceMonitoring();
      const latest = hook.getLatestReport();

      expect(latest).toEqual(mockReport);
    });

    it('should return null when no reports exist', () => {
      (performanceMonitor as any).reports = [];

      const hook = usePerformanceMonitoring();
      const latest = hook.getLatestReport();

      expect(latest).toBeNull();
    });
  });
});
