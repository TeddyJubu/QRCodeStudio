#!/usr/bin/env node

/**
 * Secret Detection Script
 * Scans staged files for potential secrets and sensitive information
 */

/* eslint-disable no-undef */
import fs from 'fs';
import { execSync } from 'child_process';

// Common secret patterns
const SECRET_PATTERNS = [
  // API Keys
  { pattern: /api[_-]?key\s*[:=]\s*['"]?[a-zA-Z0-9]{16,}['"]?/i, description: 'API Key' },
  { pattern: /apikey\s*[:=]\s*['"]?[a-zA-Z0-9]{16,}['"]?/i, description: 'API Key' },

  // AWS Access Keys
  { pattern: /AKIA[0-9A-Z]{16}/, description: 'AWS Access Key ID' },

  // GitHub Personal Access Tokens
  { pattern: /ghp_[a-zA-Z0-9]{36}/, description: 'GitHub Personal Access Token' },
  { pattern: /gho_[a-zA-Z0-9]{36}/, description: 'GitHub OAuth Access Token' },
  { pattern: /ghu_[a-zA-Z0-9]{36}/, description: 'GitHub User Access Token' },
  { pattern: /ghs_[a-zA-Z0-9]{36}/, description: 'GitHub Server Access Token' },
  { pattern: /ghr_[a-zA-Z0-9]{36}/, description: 'GitHub Refresh Token' },

  // Generic tokens
  { pattern: /token\s*[:=]\s*['"]?[a-zA-Z0-9]{32,}['"]?/i, description: 'Generic Token' },
  { pattern: /bearer\s+[a-zA-Z0-9]{32,}/i, description: 'Bearer Token' },

  // Database URLs
  { pattern: /postgresql:\/\/[^:]+:[^@]+@/, description: 'PostgreSQL URL with password' },
  { pattern: /mysql:\/\/[^:]+:[^@]+@/, description: 'MySQL URL with password' },
  { pattern: /mongodb:\/\/[^:]+:[^@]+@/, description: 'MongoDB URL with password' },

  // Private keys
  { pattern: /-----BEGIN.*PRIVATE KEY-----/, description: 'Private Key' },
  { pattern: /-----BEGIN.*RSA PRIVATE KEY-----/, description: 'RSA Private Key' },

  // Webhook URLs
  { pattern: /webhook.*url.*['"]?https?:\/\/[^'"\s]+['"]?/i, description: 'Webhook URL' },

  // Environment variables with secrets
  {
    pattern: /process\.env\.[A-Z_]+.*['"][^'"]{8,}['"]/i,
    description: 'Environment Variable with Secret',
  },
];

// Files to ignore
const IGNORED_PATTERNS = [
  'node_modules/',
  'dist/',
  'build/',
  '.git/',
  'coverage/',
  '*.lock',
  '*.log',
  '*.tar.gz',
  '*.tgz',
  'secret-detection.js',
];

function shouldIgnoreFile(filePath) {
  return IGNORED_PATTERNS.some(pattern => {
    if (pattern.includes('/')) {
      return filePath.includes(pattern);
    }
    return filePath.endsWith(pattern);
  });
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    SECRET_PATTERNS.forEach(({ pattern, description }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Get line number
          const lines = content.split('\n');
          const lineNumber = lines.findIndex(line => line.includes(match)) + 1;

          issues.push({
            file: filePath,
            line: lineNumber,
            match: match.substring(0, 100) + (match.length > 100 ? '...' : ''),
            description: description,
          });
        });
      }
    });

    return issues;
  } catch {
    // Ignore binary files or files that can't be read as text
    return [];
  }
}

function main() {
  // Get staged files
  let stagedFiles;
  try {
    const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    stagedFiles = output.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error('❌ Error getting staged files:', error.message);
    process.exit(1);
  }

  if (!stagedFiles.length) {
    console.log('✅ No staged files to check');
    return;
  }

  console.log('🔍 Scanning staged files for secrets...');

  const allIssues = [];

  stagedFiles.forEach(filePath => {
    if (shouldIgnoreFile(filePath)) {
      return;
    }

    if (fs.existsSync(filePath)) {
      const issues = scanFile(filePath);
      allIssues.push(...issues);
    }
  });

  if (allIssues.length > 0) {
    console.error('\n❌ Potential secrets detected in staged files:');
    console.error('='.repeat(80));

    allIssues.forEach((issue, index) => {
      console.error(`\n${index + 1}. ${issue.description}`);
      console.error(`   File: ${issue.file}:${issue.line}`);
      console.error(`   Match: ${issue.match}`);
    });

    console.error('\n' + '='.repeat(80));
    console.error('\n🚨 Commit blocked due to potential secrets!');
    console.error('💡 Please review and remove the sensitive information before committing.');
    console.error('📝 If these are false positives, you can bypass with:');
    console.error('   git commit --no-verify');

    process.exit(1);
  } else {
    console.log('✅ No secrets detected in staged files');
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { scanFile, shouldIgnoreFile, SECRET_PATTERNS, main };
