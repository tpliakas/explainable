import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { writeFileSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'
import { explainTSConfig, explainCompilerOption } from '../tsconfig'

const TEST_DIR = join(process.cwd(), '.test-tsconfig')

describe('explainTSConfig', () => {
  beforeEach(() => {
    // Create test directory
    try {
      mkdirSync(TEST_DIR, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }
  })

  afterEach(() => {
    // Clean up test directory
    try {
      rmSync(TEST_DIR, { recursive: true, force: true })
    } catch (error) {
      // Ignore cleanup errors
    }
  })

  describe('basic functionality', () => {
    it('should load a simple tsconfig', () => {
      const configPath = join(TEST_DIR, 'tsconfig.json')
      writeFileSync(configPath, JSON.stringify({
        compilerOptions: {
          strict: true,
          target: 'ES2020'
        }
      }))

      const config = explainTSConfig(configPath)
      
      expect(config.value.compilerOptions?.strict).toBe(true)
      expect(config.value.compilerOptions?.target).toBe('ES2020')
    })

    it('should handle comments in tsconfig', () => {
      const configPath = join(TEST_DIR, 'tsconfig.json')
      writeFileSync(configPath, `{
        // This is a comment
        "compilerOptions": {
          "strict": true, // inline comment
          /* block comment */
          "target": "ES2020"
        }
      }`)

      const config = explainTSConfig(configPath)
      
      expect(config.value.compilerOptions?.strict).toBe(true)
    })
  })

  describe('extends resolution', () => {
    it('should resolve single extends', () => {
      const basePath = join(TEST_DIR, 'tsconfig.base.json')
      const configPath = join(TEST_DIR, 'tsconfig.json')
      
      writeFileSync(basePath, JSON.stringify({
        compilerOptions: {
          strict: false,
          target: 'ES2018'
        }
      }))
      
      writeFileSync(configPath, JSON.stringify({
        extends: './tsconfig.base.json',
        compilerOptions: {
          strict: true
        }
      }))

      const config = explainTSConfig(configPath)
      
      expect(config.value.compilerOptions?.strict).toBe(true)
      expect(config.value.compilerOptions?.target).toBe('ES2018')
      
      const explanations = config.explain('compilerOptions.strict')
      expect(explanations).toHaveLength(2)
      expect(explanations.find(e => e.won)?.value).toBe(true)
    })

    it('should handle multiple extends (array)', () => {
      const base1Path = join(TEST_DIR, 'base1.json')
      const base2Path = join(TEST_DIR, 'base2.json')
      const configPath = join(TEST_DIR, 'tsconfig.json')
      
      writeFileSync(base1Path, JSON.stringify({
        compilerOptions: { target: 'ES2015' }
      }))
      
      writeFileSync(base2Path, JSON.stringify({
        compilerOptions: { strict: true }
      }))
      
      writeFileSync(configPath, JSON.stringify({
        extends: ['./base1.json', './base2.json'],
        compilerOptions: { module: 'ESNext' }
      }))

      const config = explainTSConfig(configPath)
      
      expect(config.value.compilerOptions?.target).toBe('ES2015')
      expect(config.value.compilerOptions?.strict).toBe(true)
      expect(config.value.compilerOptions?.module).toBe('ESNext')
    })

    it('should handle nested extends', () => {
      const base1Path = join(TEST_DIR, 'base1.json')
      const base2Path = join(TEST_DIR, 'base2.json')
      const configPath = join(TEST_DIR, 'tsconfig.json')
      
      writeFileSync(base1Path, JSON.stringify({
        compilerOptions: { target: 'ES2015', strict: false }
      }))
      
      writeFileSync(base2Path, JSON.stringify({
        extends: './base1.json',
        compilerOptions: { strict: true }
      }))
      
      writeFileSync(configPath, JSON.stringify({
        extends: './base2.json',
        compilerOptions: { module: 'ESNext' }
      }))

      const config = explainTSConfig(configPath)
      
      expect(config.value.compilerOptions?.target).toBe('ES2015')
      expect(config.value.compilerOptions?.strict).toBe(true)
      expect(config.value.compilerOptions?.module).toBe('ESNext')
    })
  })

  describe('explanations', () => {
    it('should provide detailed explanations', () => {
      const basePath = join(TEST_DIR, 'tsconfig.base.json')
      const configPath = join(TEST_DIR, 'tsconfig.json')
      
      writeFileSync(basePath, JSON.stringify({
        compilerOptions: { strict: false }
      }))
      
      writeFileSync(configPath, JSON.stringify({
        extends: './tsconfig.base.json',
        compilerOptions: { strict: true }
      }))

      const config = explainTSConfig(configPath)
      const text = config.explainText('compilerOptions.strict')
      
      expect(text).toContain('strict = true')
      expect(text).toContain('✓')
      expect(text).toContain('✗')
    })

    it('should show precedence order', () => {
      const basePath = join(TEST_DIR, 'tsconfig.base.json')
      const configPath = join(TEST_DIR, 'tsconfig.json')
      
      writeFileSync(basePath, JSON.stringify({
        compilerOptions: { target: 'ES2015' }
      }))
      
      writeFileSync(configPath, JSON.stringify({
        extends: './tsconfig.base.json',
        compilerOptions: { target: 'ES2020' }
      }))

      const config = explainTSConfig(configPath)
      const explanations = config.explain('compilerOptions.target')
      
      const baseExp = explanations.find(e => e.value === 'ES2015')
      const localExp = explanations.find(e => e.value === 'ES2020')
      
      expect(baseExp?.won).toBe(false)
      expect(localExp?.won).toBe(true)
      expect(localExp!.precedence).toBeGreaterThan(baseExp!.precedence)
    })
  })

  describe('helper functions', () => {
    it('should explain specific compiler option', () => {
      const configPath = join(TEST_DIR, 'tsconfig.json')
      writeFileSync(configPath, JSON.stringify({
        compilerOptions: { strict: true }
      }))

      const explanation = explainCompilerOption(configPath, 'strict')
      
      expect(explanation).toContain('strict')
      expect(explanation).toContain('true')
    })
  })

  describe('options', () => {
    it('should respect followExtends option', () => {
      const basePath = join(TEST_DIR, 'tsconfig.base.json')
      const configPath = join(TEST_DIR, 'tsconfig.json')
      
      writeFileSync(basePath, JSON.stringify({
        compilerOptions: { target: 'ES2015' }
      }))
      
      writeFileSync(configPath, JSON.stringify({
        extends: './tsconfig.base.json',
        compilerOptions: { strict: true }
      }))

      const config = explainTSConfig(configPath, { followExtends: false })
      
      expect(config.value.compilerOptions?.strict).toBe(true)
      expect(config.value.compilerOptions?.target).toBeUndefined()
    })
  })

  describe('error handling', () => {
    it('should handle missing config file', () => {
      expect(() => {
        explainTSConfig(join(TEST_DIR, 'nonexistent.json'))
      }).toThrow()
    })

    it('should handle invalid JSON', () => {
      const configPath = join(TEST_DIR, 'invalid.json')
      writeFileSync(configPath, '{ invalid json }')

      expect(() => {
        explainTSConfig(configPath)
      }).toThrow()
    })

    it('should handle missing extends file', () => {
      const configPath = join(TEST_DIR, 'tsconfig.json')
      writeFileSync(configPath, JSON.stringify({
        extends: './nonexistent.json'
      }))

      expect(() => {
        explainTSConfig(configPath)
      }).toThrow()
    })
  })

  describe('all tsconfig fields', () => {
    it('should handle include/exclude/files', () => {
      const configPath = join(TEST_DIR, 'tsconfig.json')
      writeFileSync(configPath, JSON.stringify({
        include: ['src/**/*'],
        exclude: ['node_modules'],
        files: ['index.ts']
      }))

      const config = explainTSConfig(configPath)
      
      expect(config.value.include).toEqual(['src/**/*'])
      expect(config.value.exclude).toEqual(['node_modules'])
      expect(config.value.files).toEqual(['index.ts'])
    })
  })
})

