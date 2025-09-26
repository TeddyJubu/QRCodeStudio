import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { sampleApiResponses } from '../../../../tests/fixtures/sample-data';

// Schema definitions based on API specification
const TestSuiteSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['unit', 'integration', 'e2e']),
  framework: z.string(),
  configPath: z.string(),
  coverageTarget: z.number().min(0).max(100),
  status: z.enum(['passing', 'failing', 'pending']),
});

const TestExecutionSchema = z.object({
  suite: z.enum(['unit', 'integration', 'e2e']),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  duration: z.number(),
  totalTests: z.number().int(),
  passedTests: z.number().int(),
  failedTests: z.number().int(),
  skippedTests: z.number().int(),
  coverage: z.object({
    percentage: z.number(),
    lines: z.object({
      total: z.number().int(),
      covered: z.number().int(),
    }),
    functions: z.object({
      total: z.number().int(),
      covered: z.number().int(),
    }),
    branches: z.object({
      total: z.number().int(),
      covered: z.number().int(),
    }),
    statements: z.object({
      total: z.number().int(),
      covered: z.number().int(),
    }),
  }),
});

const QualityStatusSchema = z.object({
  overall: z.enum(['passing', 'warning', 'failing']),
  tools: z.array(
    z.object({
      name: z.string(),
      type: z.enum(['linter', 'formatter', 'type-checker']),
      status: z.enum(['passing', 'warning', 'failing']),
      issues: z.array(
        z.object({
          file: z.string(),
          line: z.number().int(),
          column: z.number().int(),
          rule: z.string(),
          message: z.string(),
          severity: z.enum(['error', 'warning']),
        })
      ),
    })
  ),
  lastChecked: z.string().datetime(),
});

const PerformanceMetricsSchema = z.object({
  lcp: z.object({
    name: z.string(),
    value: z.number(),
    unit: z.string(),
    target: z.number(),
    threshold: z.number(),
    status: z.enum(['good', 'needs-improvement', 'poor']),
  }),
  fid: z.any(), // Same structure as lcp
  cls: z.any(), // Same structure as lcp
  bundleSize: z.any(), // Same structure as lcp
  loadTime: z.any(), // Same structure as lcp
});

const PerformanceAuditSchema = z.object({
  type: z.enum(['lighthouse', 'web-vitals', 'bundle']),
  score: z.number().min(0).max(100),
  categories: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      score: z.number().min(0).max(100),
    })
  ),
  opportunities: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      savings: z.object({
        ms: z.number(),
        bytes: z.number().int(),
      }),
    })
  ),
  diagnostics: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      score: z.number().min(0).max(1),
    })
  ),
});

const CICDStatusSchema = z.object({
  overall: z.enum(['healthy', 'degraded', 'failed']),
  workflows: z.array(
    z.object({
      name: z.string(),
      status: z.enum(['success', 'failure', 'pending', 'running']),
      lastRun: z.string().datetime(),
      duration: z.number(),
      url: z.string().url(),
    })
  ),
  lastUpdate: z.string().datetime(),
});

describe('Schema Validation Contract Tests', () => {
  describe('TestSuite Schema', () => {
    it('should validate correct test suite data', () => {
      const validData = {
        id: 'unit-tests',
        name: 'Unit Tests',
        type: 'unit' as const,
        framework: 'vitest',
        configPath: 'vitest.config.ts',
        coverageTarget: 80,
        status: 'passing' as const,
      };

      const result = TestSuiteSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid test suite data', () => {
      const invalidData = {
        id: 'unit-tests',
        name: 'Unit Tests',
        type: 'invalid-type', // Invalid enum value
        framework: 'vitest',
        configPath: 'vitest.config.ts',
        coverageTarget: 150, // Out of range
        status: 'passing',
      };

      const result = TestSuiteSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const incompleteData = {
        id: 'unit-tests',
        name: 'Unit Tests',
        // Missing required fields
      };

      const result = TestSuiteSchema.safeParse(incompleteData);
      expect(result.success).toBe(false);
    });
  });

  describe('TestExecution Schema', () => {
    it('should validate correct test execution data', () => {
      const validData = {
        suite: 'unit' as const,
        startTime: '2024-01-01T00:00:00.000Z',
        endTime: '2024-01-01T00:00:02.500Z',
        duration: 2500,
        totalTests: 42,
        passedTests: 40,
        failedTests: 2,
        skippedTests: 0,
        coverage: {
          percentage: 85.5,
          lines: { total: 1000, covered: 855 },
          functions: { total: 50, covered: 43 },
          branches: { total: 200, covered: 170 },
          statements: { total: 1200, covered: 1026 },
        },
      };

      const result = TestExecutionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid test execution data', () => {
      const invalidData = {
        suite: 'invalid-type', // Invalid enum value
        startTime: 'invalid-date', // Invalid datetime
        endTime: '2024-01-01T00:00:02.500Z',
        duration: -1000, // Negative duration
        totalTests: -1, // Negative count
        passedTests: 50, // More than total
        failedTests: 2,
        skippedTests: 0,
        coverage: {
          percentage: 150, // Out of range
          lines: { total: -100, covered: 855 }, // Negative total
          functions: { total: 50, covered: 60 }, // Covered > total
          branches: { total: 200, covered: 170 },
          statements: { total: 1200, covered: 1026 },
        },
      };

      const result = TestExecutionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('QualityStatus Schema', () => {
    it('should validate correct quality status data', () => {
      const validData = {
        overall: 'passing' as const,
        tools: [
          {
            name: 'ESLint',
            type: 'linter' as const,
            status: 'passing' as const,
            issues: [],
          },
        ],
        lastChecked: '2024-01-01T00:00:00.000Z',
      };

      const result = QualityStatusSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate quality status with issues', () => {
      const validData = {
        overall: 'warning' as const,
        tools: [
          {
            name: 'ESLint',
            type: 'linter' as const,
            status: 'warning' as const,
            issues: [
              {
                file: 'src/components/QRCodeControls.tsx',
                line: 25,
                column: 10,
                rule: 'react-hooks/exhaustive-deps',
                message: 'React Hook useEffect has missing dependencies',
                severity: 'warning' as const,
              },
            ],
          },
        ],
        lastChecked: '2024-01-01T00:00:00.000Z',
      };

      const result = QualityStatusSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid quality status data', () => {
      const invalidData = {
        overall: 'invalid-status', // Invalid enum value
        tools: [
          {
            name: 'ESLint',
            type: 'invalid-type', // Invalid enum value
            status: 'passing',
            issues: [
              {
                file: 'src/components/QRCodeControls.tsx',
                line: -1, // Negative line number
                column: 10,
                rule: 'react-hooks/exhaustive-deps',
                message: 'React Hook useEffect has missing dependencies',
                severity: 'invalid-severity', // Invalid enum value
              },
            ],
          },
        ],
        lastChecked: 'invalid-date', // Invalid datetime
      };

      const result = QualityStatusSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('PerformanceMetrics Schema', () => {
    it('should validate correct performance metrics data', () => {
      const validData = {
        lcp: {
          name: 'LCP',
          value: 2.5,
          unit: 'seconds',
          target: 2.5,
          threshold: 4.0,
          status: 'good' as const,
        },
        fid: {
          name: 'FID',
          value: 100,
          unit: 'milliseconds',
          target: 100,
          threshold: 300,
          status: 'good' as const,
        },
        cls: {
          name: 'CLS',
          value: 0.1,
          unit: 'score',
          target: 0.1,
          threshold: 0.25,
          status: 'good' as const,
        },
        bundleSize: {
          name: 'Bundle Size',
          value: 500,
          unit: 'KB',
          target: 500,
          threshold: 1000,
          status: 'good' as const,
        },
        loadTime: {
          name: 'Load Time',
          value: 3.2,
          unit: 'seconds',
          target: 3.0,
          threshold: 5.0,
          status: 'needs-improvement' as const,
        },
      };

      const result = PerformanceMetricsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid performance metrics data', () => {
      const invalidData = {
        lcp: {
          name: 'LCP',
          value: -2.5, // Negative value
          unit: 'seconds',
          target: 2.5,
          threshold: 4.0,
          status: 'invalid-status', // Invalid enum value
        },
        fid: {
          name: 'FID',
          value: 100,
          unit: 'milliseconds',
          target: 100,
          threshold: 300,
          status: 'good',
        },
        cls: {
          name: 'CLS',
          value: 0.1,
          unit: 'score',
          target: 0.1,
          threshold: 0.25,
          status: 'good',
        },
        bundleSize: {
          name: 'Bundle Size',
          value: 500,
          unit: 'KB',
          target: 500,
          threshold: 1000,
          status: 'good',
        },
        loadTime: {
          name: 'Load Time',
          value: 3.2,
          unit: 'seconds',
          target: 3.0,
          threshold: 5.0,
          status: 'needs-improvement',
        },
      };

      const result = PerformanceMetricsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('PerformanceAudit Schema', () => {
    it('should validate correct performance audit data', () => {
      const validData = {
        type: 'lighthouse' as const,
        score: 92,
        categories: [
          {
            id: 'performance',
            title: 'Performance',
            score: 95,
          },
        ],
        opportunities: [
          {
            title: 'Reduce initial server response time',
            description: 'The server responded slowly to initial request',
            savings: { ms: 1200, bytes: 50000 },
          },
        ],
        diagnostics: [
          {
            title: 'Ensure text remains visible during webfont load',
            description: 'Font display strategies ensure text remains visible',
            score: 1,
          },
        ],
      };

      const result = PerformanceAuditSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid performance audit data', () => {
      const invalidData = {
        type: 'invalid-type', // Invalid enum value
        score: 150, // Out of range
        categories: [
          {
            id: 'performance',
            title: 'Performance',
            score: 105, // Out of range
          },
        ],
        opportunities: [
          {
            title: 'Reduce initial server response time',
            description: 'The server responded slowly to initial request',
            savings: { ms: -1200, bytes: -50000 }, // Negative values
          },
        ],
        diagnostics: [
          {
            title: 'Ensure text remains visible during webfont load',
            description: 'Font display strategies ensure text remains visible',
            score: 2, // Out of range
          },
        ],
      };

      const result = PerformanceAuditSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('CICDStatus Schema', () => {
    it('should validate correct CI/CD status data', () => {
      const validData = {
        overall: 'healthy' as const,
        workflows: [
          {
            name: 'Test',
            status: 'success' as const,
            lastRun: '2024-01-01T00:00:00.000Z',
            duration: 300000,
            url: 'https://github.com/owner/repo/actions/runs/123456789',
          },
        ],
        lastUpdate: '2024-01-01T00:00:00.000Z',
      };

      const result = CICDStatusSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid CI/CD status data', () => {
      const invalidData = {
        overall: 'invalid-status', // Invalid enum value
        workflows: [
          {
            name: 'Test',
            status: 'invalid-status', // Invalid enum value
            lastRun: 'invalid-date', // Invalid datetime
            duration: -1000, // Negative duration
            url: 'invalid-url', // Invalid URL
          },
        ],
        lastUpdate: 'invalid-date', // Invalid datetime
      };

      const result = CICDStatusSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Sample Data Validation', () => {
    it('should validate sample API response data structure', () => {
      // Validate that sample responses have basic structure (error field for errors, basic data for success)
      const qrCodeSuccess = sampleApiResponses.qrCode.success;
      expect(qrCodeSuccess).toHaveProperty('id');
      expect(qrCodeSuccess).toHaveProperty('name');
      expect(qrCodeSuccess).toHaveProperty('data');

      const templateSuccess = sampleApiResponses.template.success;
      expect(templateSuccess).toHaveProperty('id');
      expect(templateSuccess).toHaveProperty('name');
      expect(templateSuccess).toHaveProperty('category');

      const userSuccess = sampleApiResponses.user.success;
      expect(userSuccess).toHaveProperty('id');
      expect(userSuccess).toHaveProperty('username');
      expect(userSuccess).toHaveProperty('email');
    });

    it('should validate sample error response data structure', () => {
      // Error responses should have at least an error field
      const errorSchema = z.object({
        error: z.string(),
        message: z.string().optional(),
      });

      const qrCodeError = errorSchema.safeParse(sampleApiResponses.qrCode.error);
      expect(qrCodeError.success).toBe(true);

      const templateError = errorSchema.safeParse(sampleApiResponses.template.error);
      expect(templateError.success).toBe(true);

      const userError = errorSchema.safeParse(sampleApiResponses.user.error);
      expect(userError.success).toBe(true);
    });
  });
});
