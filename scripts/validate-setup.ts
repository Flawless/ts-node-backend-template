#!/usr/bin/env tsx

import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import chalk from 'chalk'

interface ValidationResult {
  name: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  fix?: string
}

class SetupValidator {
  private results: ValidationResult[] = []
  
  async validate(): Promise<void> {
    console.log(chalk.blue.bold('\n🔍 Validating Development Environment...\n'))
    
    // Check Node.js version
    this.checkNodeVersion()
    
    // Check npm version
    this.checkNpmVersion()
    
    // Check required files
    this.checkRequiredFiles()
    
    // Check environment variables
    this.checkEnvironmentVariables()
    
    // Check dependencies
    this.checkDependencies()
    
    // Check TypeScript configuration
    this.checkTypeScriptConfig()
    
    // Check ESLint configuration
    this.checkESLintConfig()
    
    // Check git hooks
    this.checkGitHooks()
    
    // Check port availability
    this.checkPortAvailability()
    
    // Check memory limits
    this.checkMemoryLimits()
    
    // Display results
    this.displayResults()
  }
  
  private checkNodeVersion(): void {
    try {
      const nodeVersion = process.version
      const major = parseInt(nodeVersion.slice(1).split('.')[0]!)
      
      if (major >= 20) {
        this.addResult({
          name: 'Node.js Version',
          status: 'pass',
          message: `Node.js ${nodeVersion} meets requirement (>=20.0.0)`,
        })
      } else {
        this.addResult({
          name: 'Node.js Version',
          status: 'fail',
          message: `Node.js ${nodeVersion} does not meet requirement (>=20.0.0)`,
          fix: 'Install Node.js 20 or higher: https://nodejs.org',
        })
      }
    } catch (error) {
      this.addResult({
        name: 'Node.js Version',
        status: 'fail',
        message: 'Failed to check Node.js version',
      })
    }
  }
  
  private checkNpmVersion(): void {
    try {
      const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim()
      const major = parseInt(npmVersion.split('.')[0]!)
      
      if (major >= 10) {
        this.addResult({
          name: 'npm Version',
          status: 'pass',
          message: `npm ${npmVersion} meets requirement (>=10.0.0)`,
        })
      } else {
        this.addResult({
          name: 'npm Version',
          status: 'fail',
          message: `npm ${npmVersion} does not meet requirement (>=10.0.0)`,
          fix: 'Update npm: npm install -g npm@latest',
        })
      }
    } catch (error) {
      this.addResult({
        name: 'npm Version',
        status: 'fail',
        message: 'Failed to check npm version',
      })
    }
  }
  
  private checkRequiredFiles(): void {
    const requiredFiles = [
      '.env',
      'tsconfig.json',
      'package.json',
      'vitest.config.ts',
      'eslint.config.js',
    ]
    
    for (const file of requiredFiles) {
      const path = resolve(process.cwd(), file)
      
      if (existsSync(path)) {
        this.addResult({
          name: `File: ${file}`,
          status: 'pass',
          message: `Required file exists`,
        })
      } else if (file === '.env') {
        this.addResult({
          name: `File: ${file}`,
          status: 'warning',
          message: `Environment file missing`,
          fix: 'Copy .env.example to .env and configure',
        })
      } else {
        this.addResult({
          name: `File: ${file}`,
          status: 'fail',
          message: `Required file missing`,
        })
      }
    }
  }
  
  private checkEnvironmentVariables(): void {
    const required = [
      'NODE_ENV',
      'PORT',
      'LOG_LEVEL',
    ]
    
    for (const key of required) {
      if (process.env[key]) {
        this.addResult({
          name: `Env: ${key}`,
          status: 'pass',
          message: `Environment variable set`,
        })
      } else {
        this.addResult({
          name: `Env: ${key}`,
          status: 'warning',
          message: `Environment variable not set`,
          fix: `Add ${key} to your .env file`,
        })
      }
    }
  }
  
  private checkDependencies(): void {
    try {
      execSync('npm ls --depth=0', { encoding: 'utf-8', stdio: 'pipe' })
      this.addResult({
        name: 'Dependencies',
        status: 'pass',
        message: 'All dependencies installed',
      })
    } catch (error) {
      this.addResult({
        name: 'Dependencies',
        status: 'fail',
        message: 'Missing or invalid dependencies',
        fix: 'Run: npm install',
      })
    }
  }
  
  private checkTypeScriptConfig(): void {
    try {
      const tsconfig = JSON.parse(
        readFileSync(resolve(process.cwd(), 'tsconfig.json'), 'utf-8')
      )
      
      const strict = tsconfig.compilerOptions?.strict
      const noImplicitAny = tsconfig.compilerOptions?.noImplicitAny
      
      if (strict && noImplicitAny !== false) {
        this.addResult({
          name: 'TypeScript Strict Mode',
          status: 'pass',
          message: 'TypeScript strict mode enabled',
        })
      } else {
        this.addResult({
          name: 'TypeScript Strict Mode',
          status: 'fail',
          message: 'TypeScript strict mode not enabled',
          fix: 'Enable strict mode in tsconfig.json',
        })
      }
    } catch (error) {
      this.addResult({
        name: 'TypeScript Config',
        status: 'fail',
        message: 'Failed to check TypeScript configuration',
      })
    }
  }
  
  private checkESLintConfig(): void {
    if (existsSync(resolve(process.cwd(), 'eslint.config.js'))) {
      this.addResult({
        name: 'ESLint Config',
        status: 'pass',
        message: 'ESLint configuration found',
      })
    } else {
      this.addResult({
        name: 'ESLint Config',
        status: 'fail',
        message: 'ESLint configuration missing',
      })
    }
  }
  
  private checkGitHooks(): void {
    if (existsSync(resolve(process.cwd(), '.husky'))) {
      this.addResult({
        name: 'Git Hooks',
        status: 'pass',
        message: 'Husky git hooks configured',
      })
    } else {
      this.addResult({
        name: 'Git Hooks',
        status: 'warning',
        message: 'Git hooks not configured',
        fix: 'Run: npm run prepare',
      })
    }
  }
  
  private checkPortAvailability(): void {
    const port = process.env.PORT || '3000'
    
    try {
      execSync(`lsof -i :${port}`, { encoding: 'utf-8', stdio: 'pipe' })
      this.addResult({
        name: 'Port Availability',
        status: 'warning',
        message: `Port ${port} is in use`,
        fix: `Stop the process using port ${port} or change PORT in .env`,
      })
    } catch {
      this.addResult({
        name: 'Port Availability',
        status: 'pass',
        message: `Port ${port} is available`,
      })
    }
  }
  
  private checkMemoryLimits(): void {
    const totalMemory = require('os').totalmem()
    const totalMemoryGB = totalMemory / (1024 * 1024 * 1024)
    
    if (totalMemoryGB >= 4) {
      this.addResult({
        name: 'System Memory',
        status: 'pass',
        message: `${totalMemoryGB.toFixed(1)}GB RAM available`,
      })
    } else {
      this.addResult({
        name: 'System Memory',
        status: 'warning',
        message: `Only ${totalMemoryGB.toFixed(1)}GB RAM available`,
        fix: 'Consider increasing system memory for optimal performance',
      })
    }
  }
  
  private addResult(result: ValidationResult): void {
    this.results.push(result)
  }
  
  private displayResults(): void {
    console.log(chalk.white.bold('\n📊 Validation Results:\n'))
    
    const passed = this.results.filter(r => r.status === 'pass')
    const warnings = this.results.filter(r => r.status === 'warning')
    const failed = this.results.filter(r => r.status === 'fail')
    
    // Display passed checks
    if (passed.length > 0) {
      console.log(chalk.green.bold('✅ Passed Checks:'))
      for (const result of passed) {
        console.log(chalk.green(`  ✓ ${result.name}: ${result.message}`))
      }
      console.log()
    }
    
    // Display warnings
    if (warnings.length > 0) {
      console.log(chalk.yellow.bold('⚠️  Warnings:'))
      for (const result of warnings) {
        console.log(chalk.yellow(`  ⚠ ${result.name}: ${result.message}`))
        if (result.fix) {
          console.log(chalk.gray(`    → Fix: ${result.fix}`))
        }
      }
      console.log()
    }
    
    // Display failures
    if (failed.length > 0) {
      console.log(chalk.red.bold('❌ Failed Checks:'))
      for (const result of failed) {
        console.log(chalk.red(`  ✗ ${result.name}: ${result.message}`))
        if (result.fix) {
          console.log(chalk.gray(`    → Fix: ${result.fix}`))
        }
      }
      console.log()
    }
    
    // Summary
    console.log(chalk.white.bold('📈 Summary:'))
    console.log(chalk.green(`  Passed: ${passed.length}`))
    console.log(chalk.yellow(`  Warnings: ${warnings.length}`))
    console.log(chalk.red(`  Failed: ${failed.length}`))
    
    // Exit code
    if (failed.length > 0) {
      console.log(chalk.red.bold('\n❌ Setup validation failed! Please fix the issues above.'))
      process.exit(1)
    } else if (warnings.length > 0) {
      console.log(chalk.yellow.bold('\n⚠️  Setup validation passed with warnings.'))
    } else {
      console.log(chalk.green.bold('\n✅ Setup validation passed! Your environment is ready.'))
    }
  }
}

// Run validator
const validator = new SetupValidator()
validator.validate().catch(console.error)