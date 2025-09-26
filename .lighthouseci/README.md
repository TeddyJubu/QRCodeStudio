# Lighthouse CI Configuration

This directory contains Lighthouse CI configuration for automated performance auditing.

## Configuration Files

- `lighthouse.yml` - Main Lighthouse CI configuration
- `budgets.json` - Performance budget definitions

## Usage

Run performance audits:

```bash
# Run Lighthouse CI audit
npm run audit:lighthouse

# Run full performance audit (Lighthouse + bundle analysis)
npm run audit:performance

# Analyze bundle size
npm run analyze
```

## Performance Budgets

The budgets are defined in `budgets.json` and include:

- Resource size limits (JS, CSS, images, total)
- Request count limits
- Timing thresholds aligned with Web Vitals

## Reports

Lighthouse CI generates reports in the `.lighthouseci` directory:

- `lhr-*.json` - Individual Lighthouse results
- `manifest.json` - Combined results manifest
