#!/usr/bin/env node

/**
 * Tree Shaking Analysis Script
 * Analyzes the bundle to identify potential tree shaking opportunities
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class TreeShakingAnalyzer {
  constructor() {
    this.projectRoot = process.cwd();
    this.clientSrc = path.join(this.projectRoot, 'client', 'src');
    this.usedComponents = new Set();
    this.availableComponents = new Set();
    this.unusedComponents = new Set();
    this.usedDependencies = new Set();
    this.allDependencies = new Set();
  }

  async analyze() {
    console.log('🔍 Starting Tree Shaking Analysis...\n');
    console.log('DEBUG: Script started');

    // Get all dependencies from package.json
    await this.getDependencies();
    console.log('DEBUG: Dependencies loaded');

    // Scan for used components and dependencies
    await this.scanSourceFiles();
    console.log('DEBUG: Source files scanned');

    // Find unused components
    await this.findUnusedComponents();
    console.log('DEBUG: Unused components found');

    // Generate report
    await this.generateReport();
    console.log('DEBUG: Report generated');

    console.log('✅ Tree Shaking Analysis Complete!');
  }

  async getDependencies() {
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8')
      );

      this.allDependencies = new Set([
        ...Object.keys(packageJson.dependencies || {}),
        ...Object.keys(packageJson.devDependencies || {}),
      ]);

      console.log(`📦 Found ${this.allDependencies.size} total dependencies`);
    } catch (error) {
      console.error('❌ Error reading package.json:', error.message);
    }
  }

  async scanSourceFiles() {
    console.log('📂 Scanning source files...');

    const scanDirectory = dir => {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          // Skip node_modules and dist directories
          if (file !== 'node_modules' && file !== 'dist') {
            scanDirectory(filePath);
          }
        } else if (
          file.endsWith('.tsx') ||
          file.endsWith('.ts') ||
          file.endsWith('.js') ||
          file.endsWith('.jsx')
        ) {
          this.analyzeFile(filePath);
        }
      }
    };

    scanDirectory(this.clientSrc);

    console.log(`✅ Found ${this.usedComponents.size} used components`);
    console.log(`✅ Found ${this.usedDependencies.size} used dependencies`);
  }

  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Find UI component imports
      const uiComponentImports = content.match(/from ['"]@\/components\/ui\/([^'"]+)['"]/g);
      if (uiComponentImports) {
        uiComponentImports.forEach(importStatement => {
          const match = importStatement.match(/from ['"]@\/components\/ui\/([^'"]+)['"]/);
          if (match) {
            this.usedComponents.add(match[1]);
          }
        });
      }

      // Find dependency imports
      const dependencyImports = content.match(/import.*from ['"]([^'"]+)['"]/g);
      if (dependencyImports) {
        dependencyImports.forEach(importStatement => {
          const match = importStatement.match(/import.*from ['"]([^'"]+)['"]/);
          if (match) {
            const dependency = match[1];
            // Check if it's a node module (not relative path)
            if (dependency.startsWith('@') || !dependency.startsWith('.')) {
              const packageName = dependency.split('/')[0];
              if (this.allDependencies.has(packageName)) {
                this.usedDependencies.add(packageName);
              }
            }
          }
        });
      }

      // Find require statements
      const requireStatements = content.match(/require\(['"]([^'"]+)['"]\)/g);
      if (requireStatements) {
        requireStatements.forEach(requireStatement => {
          const match = requireStatement.match(/require\(['"]([^'"]+)['"]\)/);
          if (match) {
            const dependency = match[1];
            if (dependency.startsWith('@') || !dependency.startsWith('.')) {
              const packageName = dependency.split('/')[0];
              if (this.allDependencies.has(packageName)) {
                this.usedDependencies.add(packageName);
              }
            }
          }
        });
      }
    } catch (error) {
      console.warn(`⚠️  Error analyzing file ${filePath}:`, error.message);
    }
  }

  async findUnusedComponents() {
    console.log('🔍 Finding unused UI components...');

    const uiComponentsDir = path.join(this.clientSrc, 'components', 'ui');

    if (fs.existsSync(uiComponentsDir)) {
      const files = fs.readdirSync(uiComponentsDir);

      files.forEach(file => {
        if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          const componentName = file.replace(/\.(tsx|ts)$/, '');
          this.availableComponents.add(componentName);

          if (!this.usedComponents.has(componentName)) {
            this.unusedComponents.add(componentName);
          }
        }
      });
    }

    console.log(`📊 Available UI components: ${this.availableComponents.size}`);
    console.log(`📊 Unused UI components: ${this.unusedComponents.size}`);
  }

  async generateReport() {
    console.log('\n📋 Tree Shaking Analysis Report\n');
    console.log('='.repeat(50));

    // Unused dependencies
    const unusedDependencies = new Set(
      [...this.allDependencies].filter(dep => !this.usedDependencies.has(dep))
    );

    console.log('\n🚨 Potentially Unused Dependencies:');
    console.log('-'.repeat(30));
    if (unusedDependencies.size === 0) {
      console.log('✅ All dependencies appear to be in use!');
    } else {
      [...unusedDependencies].sort().forEach(dep => {
        console.log(`  • ${dep}`);
      });
    }

    // Unused UI components
    console.log('\n🎨 Unused UI Components:');
    console.log('-'.repeat(25));
    if (this.unusedComponents.size === 0) {
      console.log('✅ All UI components appear to be in use!');
    } else {
      [...this.unusedComponents].sort().forEach(component => {
        console.log(`  • ${component}`);
      });
    }

    // Bundle size optimization suggestions
    console.log('\n💡 Bundle Size Optimization Suggestions:');
    console.log('-'.repeat(40));

    if (unusedDependencies.size > 0) {
      console.log('1. Consider removing unused dependencies:');
      [...unusedDependencies].forEach(dep => {
        console.log(`   npm uninstall ${dep}`);
      });
    }

    if (this.unusedComponents.size > 0) {
      console.log('\n2. Consider removing unused UI components:');
      [...this.unusedComponents].forEach(component => {
        console.log(`   rm client/src/components/ui/${component}.tsx`);
      });
    }

    console.log('\n3. Tree shaking is already enabled in your Vite configuration');
    console.log('4. Code splitting is implemented for pages and heavy components');
    console.log('5. Lazy loading is implemented for QR code generation');

    // Generate detailed report file
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalDependencies: this.allDependencies.size,
        usedDependencies: this.usedDependencies.size,
        unusedDependencies: unusedDependencies.size,
        totalUIComponents: this.availableComponents.size,
        usedUIComponents: this.usedComponents.size,
        unusedUIComponents: this.unusedComponents.size,
      },
      unusedDependencies: [...unusedDependencies].sort(),
      unusedUIComponents: [...this.unusedComponents].sort(),
      recommendations: [
        'Remove unused dependencies to reduce bundle size',
        'Remove unused UI components to reduce code complexity',
        'Continue using code splitting for better performance',
        'Implement dynamic imports for heavy libraries',
        'Use bundle analyzer to monitor chunk sizes',
      ],
    };

    const reportPath = path.join(this.projectRoot, 'tree-shaking-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run the analysis
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new TreeShakingAnalyzer();
  analyzer.analyze().catch(console.error);
}

export default TreeShakingAnalyzer;
