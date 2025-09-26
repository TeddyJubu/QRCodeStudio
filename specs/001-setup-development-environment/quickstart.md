# Quickstart Guide: Development Environment Setup

## Prerequisites

Before setting up the development environment, ensure you have:

- **Node.js**: Version 18.0 or higher
- **Git**: Latest version for version control
- **GitHub Account**: For repository access and CI/CD
- **Code Editor**: VS Code recommended with extensions

## Initial Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-org/QRCodeStudio.git
cd QRCodeStudio

# Install dependencies
npm install
```

### 2. Verify Development Environment

```bash
# Check TypeScript compilation
npm run check

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

## Testing Setup

### 3. Run Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

### 4. Verify Test Coverage

```bash
# View coverage report
open coverage/index.html

# Ensure coverage meets requirements (80%+)
npm run test:coverage
```

## Code Quality Setup

### 5. Code Quality Checks

```bash
# Run linting
npm run lint

# Run type checking
npm run check

# Format code
npm run format

# Run all quality checks
npm run quality
```

### 6. Pre-commit Hooks

```bash
# Install pre-commit hooks
npm run hooks:install

# Test pre-commit hooks
git add .
git commit -m "test: verify pre-commit hooks"
```

## CI/CD Setup

### 7. Local CI Simulation

```bash
# Run full CI pipeline locally
npm run ci:local

# Build production artifacts
npm run build

# Test production build
npm run test:build
```

### 8. GitHub Actions

```bash
# Push to trigger CI workflows
git add .
git commit -m "feat: setup development environment"
git push origin main

# Monitor CI workflows at:
# https://github.com/your-org/QRCodeStudio/actions
```

## Development Workflow

### 9. Daily Development

```bash
# Start development server
npm run dev

# In another terminal, run tests in watch mode
npm run test:watch

# Make changes and see hot reload in browser
# Tests run automatically on file changes
```

### 10. Feature Development

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Implement feature with tests
# Run quality checks frequently
npm run quality

# Commit with conventional commits
git commit -m "feat: add new qr code feature"

# Push and create PR
git push origin feature/your-feature-name
```

## Performance Monitoring

### 11. Performance Testing

```bash
# Run performance audit
npm run audit:performance

# Run accessibility audit
npm run audit:accessibility

# Run full audit suite
npm run audit:all
```

### 12. Bundle Analysis

```bash
# Analyze bundle size
npm run analyze:bundle

# View bundle report
open stats.html
```

## Troubleshooting

### Common Issues

**Node.js Version Issues**:
```bash
# Check Node.js version
node --version

# Use correct version with nvm
nvm use 18
```

**Dependency Issues**:
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Test Failures**:
```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- QRCodeControls.test.tsx
```

**Linting Errors**:
```bash
# Auto-fix linting issues
npm run lint:fix

# Check specific file
npx eslint src/components/QRCodeControls.tsx
```

## Validation Checklist

### Environment Setup Validation

- [ ] Development server starts successfully
- [ ] All tests pass (unit, integration, e2e)
- [ ] Test coverage meets 80% requirement
- [ ] Code quality checks pass
- [ ] Pre-commit hooks are working
- [ ] CI/CD pipelines run successfully
- [ ] Performance metrics are within targets
- [ ] Bundle size is under 1MB limit

### Development Workflow Validation

- [ ] Hot reload works during development
- [ ] Tests run in watch mode
- [ ] Linting catches code quality issues
- [ ] Type checking prevents TypeScript errors
- [ ] Conventional commits are enforced
- [ ] CI workflows run on push/PR
- [ ] Performance audits pass
- [ ] Accessibility checks pass

## Next Steps

After completing this setup:

1. **Explore the Codebase**: Review existing components and patterns
2. **Run the Application**: Start development server and test features
3. **Write Tests**: Add tests for new features you develop
4. **Monitor Performance**: Keep an eye on performance metrics
5. **Contribute**: Follow the established patterns for contributions

## Support

For issues or questions:

- **Documentation**: Check `/docs` directory
- **Issues**: Create GitHub issue with detailed description
- **Discussions**: Use GitHub Discussions for questions
- **Slack**: Join development channel for real-time help

---

**Remember**: This setup ensures code quality, testing standards, user experience consistency, and performance requirements as defined in the project constitution.