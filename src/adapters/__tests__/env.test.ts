import { describe, it, expect } from 'vitest'
import { explainEnv } from '../env'

describe('explainEnv', () => {
  describe('type parsing', () => {
    it('should parse string values', () => {
      const config = explainEnv(
        {
          NAME: { type: 'string', default: 'default' },
        },
        { NAME: 'test' }
      )

      expect(config.value.NAME).toBe('test')
    })

    it('should parse number values', () => {
      const config = explainEnv(
        {
          PORT: { type: 'number', default: 3000 },
        },
        { PORT: '8080' }
      )

      expect(config.value.PORT).toBe(8080)
    })

    it('should parse boolean values', () => {
      const config = explainEnv(
        {
          DEBUG: { type: 'boolean', default: false },
        },
        { DEBUG: 'true' }
      )

      expect(config.value.DEBUG).toBe(true)
    })

    it('should parse JSON values', () => {
      const config = explainEnv(
        {
          CONFIG: { type: 'json', default: {} },
        },
        { CONFIG: '{"key":"value"}' }
      )

      expect(config.value.CONFIG).toEqual({ key: 'value' })
    })
  })

  describe('defaults', () => {
    it('should use default when env var not set', () => {
      const config = explainEnv(
        {
          PORT: { type: 'number', default: 3000 },
        },
        {}
      )

      expect(config.value.PORT).toBe(3000)
      
      const explanations = config.explain('PORT')
      expect(explanations.find(e => e.won)?.source).toBe('default')
    })

    it('should prefer env var over default', () => {
      const config = explainEnv(
        {
          PORT: { type: 'number', default: 3000 },
        },
        { PORT: '8080' }
      )

      expect(config.value.PORT).toBe(8080)
      
      const explanations = config.explain('PORT')
      expect(explanations.find(e => e.won)?.source).toBe('env')
    })
  })

  describe('custom env var names', () => {
    it('should use custom env var name', () => {
      const config = explainEnv(
        {
          port: { type: 'number', default: 3000, envVar: 'CUSTOM_PORT' },
        },
        { CUSTOM_PORT: '8080' }
      )

      expect(config.value.port).toBe(8080)
    })

    it('should default to uppercase key', () => {
      const config = explainEnv(
        {
          port: { type: 'number', default: 3000 },
        },
        { PORT: '8080' }
      )

      expect(config.value.port).toBe(8080)
    })
  })

  describe('error handling', () => {
    it('should handle invalid number', () => {
      const config = explainEnv(
        {
          PORT: { type: 'number', default: 3000 },
        },
        { PORT: 'not-a-number' }
      )

      // Should fall back to default
      expect(config.value.PORT).toBe(3000)
    })

    it('should handle invalid boolean', () => {
      const config = explainEnv(
        {
          DEBUG: { type: 'boolean', default: false },
        },
        { DEBUG: 'maybe' }
      )

      // Should fall back to default
      expect(config.value.DEBUG).toBe(false)
    })

    it('should handle invalid JSON', () => {
      const config = explainEnv(
        {
          CONFIG: { type: 'json', default: {} },
        },
        { CONFIG: 'not-json' }
      )

      // Should fall back to default
      expect(config.value.CONFIG).toEqual({})
    })
  })

  describe('explanations', () => {
    it('should provide detailed explanations', () => {
      const config = explainEnv(
        {
          PORT: { type: 'number', default: 3000 },
        },
        { PORT: '8080' }
      )

      const explanations = config.explain('PORT')
      expect(explanations).toHaveLength(2)
      
      const defaultExp = explanations.find(e => e.source === 'default')
      expect(defaultExp?.value).toBe(3000)
      expect(defaultExp?.won).toBe(false)
      
      const envExp = explanations.find(e => e.source === 'env')
      expect(envExp?.value).toBe(8080)
      expect(envExp?.won).toBe(true)
    })

    it('should format text explanations', () => {
      const config = explainEnv(
        {
          PORT: { type: 'number', default: 3000 },
        },
        { PORT: '8080' }
      )

      const text = config.explainText('PORT')
      expect(text).toContain('PORT = 8080')
      expect(text).toContain('✓ env')
      expect(text).toContain('✗ default')
    })
  })

  describe('boolean parsing variations', () => {
    it('should parse various true values', () => {
      const trueValues = ['true', 'TRUE', '1', 'yes', 'YES']
      
      for (const value of trueValues) {
        const config = explainEnv(
          { DEBUG: { type: 'boolean', default: false } },
          { DEBUG: value }
        )
        expect(config.value.DEBUG).toBe(true)
      }
    })

    it('should parse various false values', () => {
      const falseValues = ['false', 'FALSE', '0', 'no', 'NO', '']
      
      for (const value of falseValues) {
        const config = explainEnv(
          { DEBUG: { type: 'boolean', default: true } },
          { DEBUG: value }
        )
        expect(config.value.DEBUG).toBe(false)
      }
    })
  })

  describe('edge cases', () => {
    it('should handle empty schema', () => {
      const config = explainEnv({}, { PORT: '3000' })
      expect(config.value).toEqual({})
    })

    it('should handle empty env', () => {
      const config = explainEnv(
        {
          PORT: { type: 'number', default: 3000 },
        },
        {}
      )
      expect(config.value.PORT).toBe(3000)
    })

    it('should handle missing defaults', () => {
      const config = explainEnv(
        {
          PORT: { type: 'number' },
        },
        {}
      )
      expect(config.value.PORT).toBeUndefined()
    })
  })
})

