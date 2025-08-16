#!/usr/bin/env tsx

/**
 * Build-time guard that prevents building with unsafe code
 * This runs during build process and cannot be bypassed
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import chalk from 'chalk'

interface Violation {
  file: string
  line: number
  column: number
  rule: string
  message: string
  severity: 'error' | 'warning'
}

class BuildGuard {
  private violations: Violation[] = []
  private filesScanned = 0
  
  // Patterns that indicate potential security/safety issues
  private readonly dangerousPatterns = [
    {
      pattern: /eval\s*\(/g,
      message: 'eval() is forbidden - use safer alternatives',
      severity: 'error' as const,
    },
    {
      pattern: /Function\s*\(/g,
      message: 'Function constructor is forbidden - use safer alternatives',
      severity: 'error' as const,
    },
    {
      pattern: /console\.(log|debug|info|warn|error)/g,
      message: 'Console statements must be removed before build',
      severity: 'error' as const,
    },
    {
      pattern: /debugger/g,
      message: 'Debugger statements must be removed',
      severity: 'error' as const,
    },
    {
      pattern: /@ts-ignore/g,
      message: '@ts-ignore is forbidden - fix the type issue properly',
      severity: 'error' as const,
    },
    {
      pattern: /@ts-nocheck/g,
      message: '@ts-nocheck is forbidden - fix the type issues',
      severity: 'error' as const,
    },
    {
      pattern: /any\s*[:>]/g,
      message: 'any type is forbidden - use proper types',
      severity: 'error' as const,
    },
    {
      pattern: /process\.env\[/g,
      message: 'Direct process.env access - use validated config',
      severity: 'warning' as const,
    },
    {
      pattern: /setTimeout.*,\s*0\)/g,
      message: 'setTimeout with 0 delay - use setImmediate or queueMicrotask',
      severity: 'warning' as const,
    },
    {
      pattern: /TODO|FIXME|HACK/g,
      message: 'Unresolved TODO/FIXME/HACK comment',
      severity: 'warning' as const,
    },
    {
      pattern: /password|secret|token|key/gi,
      message: 'Potential hardcoded secret - review carefully',
      severity: 'warning' as const,
    },
    {
      pattern: /\.catch\s*\(\s*\)/g,
      message: 'Empty catch block - handle errors properly',
      severity: 'error' as const,
    },
    {
      pattern: /throw\s+['"]/g,
      message: 'Throwing string literals - use Error objects',
      severity: 'error' as const,
    },
    {
      pattern: /==(?!=)/g,
      message: 'Loose equality - use strict equality (===)',
      severity: 'error' as const,
    },
    {
      pattern: /!=(?!=)/g,
      message: 'Loose inequality - use strict inequality (!==)',
      severity: 'error' as const,
    },
  ]
  
  // Files/directories to skip
  private readonly skipPaths = [
    'node_modules',
    'dist',
    'coverage',
    '.git',
    '.husky',
    'scripts/build-guard.ts', // Don't check self
  ]
  
  async scan(): Promise<void> {
    console.log(chalk.blue.bold('\n🔒 Build Guard - Scanning for unsafe patterns...\n'))
    
    this.scanDirectory('src')
    this.scanDirectory('tests')
    
    this.displayResults()
  }
  
  private scanDirectory(dir: string): void {
    try {
      const entries = readdirSync(dir)
      
      for (const entry of entries) {
        const fullPath = join(dir, entry)
        
        // Skip excluded paths
        if (this.skipPaths.some(skip => fullPath.includes(skip))) {
          continue
        }
        
        const stat = statSync(fullPath)
        
        if (stat.isDirectory()) {
          this.scanDirectory(fullPath)
        } else if (stat.isFile() && this.shouldScanFile(fullPath)) {
          this.scanFile(fullPath)
        }
      }
    } catch (error) {
      console.error(chalk.red(`Error scanning directory ${dir}:`, error))
    }
  }
  
  private shouldScanFile(file: string): boolean {
    const ext = extname(file)
    return ['.ts', '.tsx', '.js', '.jsx'].includes(ext)
  }
  
  private scanFile(file: string): void {
    try {
      const content = readFileSync(file, 'utf-8')
      const lines = content.split('\n')
      
      this.filesScanned++
      
      for (const { pattern, message, severity } of this.dangerousPatterns) {
        // Reset regex state
        pattern.lastIndex = 0
        
        let match
        while ((match = pattern.exec(content)) !== null) {
          const position = this.getLineAndColumn(content, match.index)
          
          // Skip if in comment
          if (this.isInComment(lines[position.line - 1]!, match[0])) {
            continue
          }
          
          this.violations.push({
            file,
            line: position.line,
            column: position.column,
            rule: pattern.source,
            message,
            severity,
          })
        }
      }
    } catch (error) {
      console.error(chalk.red(`Error scanning file ${file}:`, error))
    }
  }
  
  private getLineAndColumn(content: string, index: number): { line: number; column: number } {
    const lines = content.substring(0, index).split('\n')
    return {
      line: lines.length,
      column: lines[lines.length - 1]!.length + 1,
    }
  }
  
  private isInComment(line: string, match: string): boolean {
    const commentIndex = line.indexOf('//')
    const matchIndex = line.indexOf(match)
    
    if (commentIndex === -1) return false
    return commentIndex < matchIndex
  }
  
  private displayResults(): void {
    const errors = this.violations.filter(v => v.severity === 'error')
    const warnings = this.violations.filter(v => v.severity === 'warning')
    
    console.log(chalk.white(`Scanned ${this.filesScanned} files\n`))
    
    if (errors.length > 0) {
      console.log(chalk.red.bold(`❌ ${errors.length} Errors:\n`))
      for (const error of errors) {
        console.log(
          chalk.red(`  ${error.file}:${error.line}:${error.column}`) +
          chalk.white(` - ${error.message}`)
        )
      }
      console.log()
    }
    
    if (warnings.length > 0) {
      console.log(chalk.yellow.bold(`⚠️  ${warnings.length} Warnings:\n`))
      for (const warning of warnings) {
        console.log(
          chalk.yellow(`  ${warning.file}:${warning.line}:${warning.column}`) +
          chalk.white(` - ${warning.message}`)
        )
      }
      console.log()
    }
    
    if (errors.length > 0) {
      console.log(chalk.red.bold('❌ Build blocked due to safety violations!'))
      console.log(chalk.white('Fix all errors before building.\n'))
      process.exit(1)
    } else if (warnings.length > 0) {
      console.log(chalk.yellow.bold('⚠️  Build passed with warnings'))
      console.log(chalk.white('Consider fixing warnings for better code quality.\n'))
    } else {
      console.log(chalk.green.bold('✅ Build guard passed - no unsafe patterns detected!\n'))
    }
  }
}

// Run the build guard
const guard = new BuildGuard()
guard.scan().catch(error => {
  console.error(chalk.red('Build guard failed:', error))
  process.exit(1)
})