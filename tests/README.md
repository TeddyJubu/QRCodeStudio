# Test Structure

This directory contains all tests for the QRCodeStudio application.

## Directory Structure

```
tests/
├── README.md                    # This file
├── setup.ts                     # Global test setup
├── helpers/                     # Test utilities and helpers
│   ├── test-utils.ts           # React testing utilities
│   └── server-mocks.ts         # Server-side mock utilities
├── fixtures/                   # Sample test data
│   └── sample-data.ts          # Sample data for tests
├── unit/                       # Unit tests
│   ├── client/                 # Client-side unit tests
│   │   ├── components/         # Component tests
│   │   ├── contexts/          # Context tests
│   │   ├── hooks/             # Hook tests
│   │   └── lib/               # Library function tests
│   ├── server/                 # Server-side unit tests
│   │   ├── routes/             # Route handler tests
│   │   ├── storage/            # Storage function tests
│   │   └── middleware/        # Middleware tests
│   └── shared/                 # Shared unit tests
│       └── schema/             # Schema validation tests
├── integration/                # Integration tests
│   ├── client/                 # Client-side integration tests
│   ├── server/                 # Server-side integration tests
│   └── shared/                 # Shared integration tests
├── e2e/                        # End-to-end tests
│   ├── setup.ts                # E2E test setup
│   ├── client/                 # Client-side E2E tests
│   ├── server/                 # Server-side E2E tests
│   └── shared/                 # Shared E2E tests
└── contract/                   # Contract tests
    ├── client/                 # Client contract tests
    ├── server/                 # Server contract tests
    └── shared/                 # Shared contract tests
```

## Test Types

### Unit Tests

- Test individual functions, components, and modules in isolation
- Fast execution
- Mock all external dependencies
- Located in `tests/unit/`

### Integration Tests

- Test multiple components/modules working together
- Medium execution speed
- Mock some external dependencies
- Located in `tests/integration/`

### E2E Tests

- Test complete user journeys
- Slow execution
- No mocking (real browser and server)
- Located in `tests/e2e/`

### Contract Tests

- Test API contracts and data validation
- Medium execution speed
- Mock external services
- Located in `tests/contract/`

## Running Tests

### All Tests

```bash
npm test
```

### Unit Tests

```bash
npm run test:unit
```

### Integration Tests

```bash
npm run test:integration
```

### E2E Tests

```bash
npm run test:e2e
```

### Contract Tests

```bash
npm run test:contract
```

### Test Coverage

```bash
npm run test:coverage
```

### Watch Mode

```bash
npm run test:watch
```

## Test Configuration

### Vitest Configuration

- Located in `vitest.config.ts`
- Configured for React, TypeScript, and coverage
- Includes path aliases and environment setup

### Playwright Configuration

- Located in `playwright.config.ts`
- Configured for multiple browsers
- Includes dev server integration

### ESLint Configuration

- Located in `eslint.config.js`
- Includes test-specific rules
- Configured for TypeScript and React

## Writing Tests

### Unit Test Example

```typescript
import { render, screen } from '@/tests/helpers/test-utils';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
```

### Integration Test Example

```typescript
import { render, screen, fireEvent } from '@/tests/helpers/test-utils';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { QRCodePreview } from '@/components/QRCodePreview';

describe('QR Code Flow', () => {
  it('generates QR code when data is entered', () => {
    render(
      <div>
        <QRCodeGenerator />
        <QRCodePreview />
      </div>
    );

    fireEvent.change(screen.getByTestId('qr-data'), {
      target: { value: 'https://example.com' },
    });

    fireEvent.click(screen.getByText('Generate'));

    expect(screen.getByTestId('qr-preview')).toBeInTheDocument();
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@/tests/e2e/setup';
import { utils } from '@/tests/e2e/setup';

test('user can generate QR code', async ({ page }) => {
  await utils.navigateTo(page, '/');
  await utils.generateQRCode(page, 'https://example.com');
  await utils.expectQRCodeGenerated(page);
});
```

## Test Data

### Sample Data

- Located in `tests/fixtures/sample-data.ts`
- Includes sample QR codes, templates, users, and API responses
- Use `createMock*` functions from `test-utils.ts` for test-specific data

### Mock Functions

- Located in `tests/helpers/server-mocks.ts`
- Includes mock database and storage functions
- Use `createMockRequest` and `createMockResponse` for server tests

## Best Practices

1. **Test Naming**: Use descriptive test names that explain what is being tested
2. **Test Structure**: Group related tests in `describe` blocks
3. **Mocking**: Mock external dependencies to ensure test isolation
4. **Assertions**: Use specific assertions that test the expected behavior
5. **Cleanup**: Clean up after tests to avoid side effects
6. **Coverage**: Aim for high test coverage but focus on critical paths
7. **Performance**: Keep tests fast and reliable

## Debugging Tests

### Debug Mode

```bash
npm run test:unit -- --inspect-brk
```

### Playwright Debug Mode

```bash
npm run test:e2e -- --debug
```

### Playwright UI Mode

```bash
npm run test:e2e -- --ui
```

## Continuous Integration

Tests are automatically run on:

- Every push to the repository
- Every pull request
- Scheduled runs

The CI pipeline includes:

- Unit tests
- Integration tests
- E2E tests (on specific branches)
- Code quality checks
- Coverage reports
