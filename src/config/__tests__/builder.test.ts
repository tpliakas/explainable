import { describe, it, expect } from 'vitest'
import { explainable } from '../builder'

describe('ConfigBuilder', () => {
  describe('fluent API', () => {
    it('should build config with defaults', () => {
      const config = explainable<{ port: number }>()
        .defaults({ port: 8080 })
        .build()

      expect(config.value.port).toBe(8080)
    })

    it('should chain multiple sources', () => {
      const config = explainable<{ port: number; host: string }>()
        .defaults({ port: 8080, host: 'localhost' })
        .env({ port: 3000 })
        .build()

      expect(config.value.port).toBe(3000)
      expect(config.value.host).toBe('localhost')
    })

    it('should respect precedence order', () => {
      const config = explainable<{ value: string }>()
        .defaults({ value: 'defaults' })
        .file({ value: 'file' })
        .env({ value: 'env' })
        .cli({ value: 'cli' })
        .build()

      expect(config.value.value).toBe('cli')
    })
  })

  describe('source methods', () => {
    it('should add defaults with correct precedence', () => {
      const builder = explainable<{ port: number }>()
        .defaults({ port: 8080 })

      expect(builder.sourceCount).toBe(1)
    })

    it('should add env with correct precedence', () => {
      const config = explainable<{ port: number }>()
        .defaults({ port: 8080 })
        .env({ port: 3000 })
        .build()

      const explanations = config.explain('port')
      const envExp = explanations.find(e => e.source === 'env')
      expect(envExp?.precedence).toBeGreaterThan(0)
    })

    it('should add file with correct precedence', () => {
      const config = explainable<{ port: number }>()
        .defaults({ port: 8080 })
        .file({ port: 5000 }, 'config.json')
        .build()

      const explanations = config.explain('port')
      const fileExp = explanations.find(e => e.source === 'file')
      expect(fileExp?.location).toBe('config.json')
    })

    it('should add cli with highest precedence', () => {
      const config = explainable<{ port: number }>()
        .defaults({ port: 8080 })
        .env({ port: 3000 })
        .cli({ port: 9000 })
        .build()

      expect(config.value.port).toBe(9000)
    })
  })

  describe('custom sources', () => {
    it('should add custom source with from()', () => {
      const config = explainable<{ value: string }>()
        .from(
          { value: 'custom' },
          { name: 'custom', precedence: 15 }
        )
        .build()

      expect(config.value.value).toBe('custom')
    })

    it('should add source with add() helper', () => {
      const config = explainable<{ value: string }>()
        .add({ value: 'first' }, 'first')
        .add({ value: 'second' }, 'second')
        .build()

      // Second should win due to auto-increment precedence
      expect(config.value.value).toBe('second')
    })
  })

  describe('builder state', () => {
    it('should track source count', () => {
      const builder = explainable<{ port: number }>()
        .defaults({ port: 8080 })
        .env({ port: 3000 })

      expect(builder.sourceCount).toBe(2)
    })

    it('should clear sources', () => {
      const builder = explainable<{ port: number }>()
        .defaults({ port: 8080 })
        .env({ port: 3000 })
        .clear()

      expect(builder.sourceCount).toBe(0)
    })

    it('should allow rebuilding after clear', () => {
      const builder = explainable<{ port: number }>()
        .defaults({ port: 8080 })
        .clear()
        .defaults({ port: 3000 })

      const config = builder.build()
      expect(config.value.port).toBe(3000)
    })
  })

  describe('complex scenarios', () => {
    it('should handle partial configs', () => {
      interface Config {
        port: number
        host: string
        debug: boolean
      }

      const config = explainable<Config>()
        .defaults({ port: 8080, host: 'localhost', debug: false })
        .env({ port: 3000 })
        .cli({ debug: true })
        .build()

      expect(config.value.port).toBe(3000)
      expect(config.value.host).toBe('localhost')
      expect(config.value.debug).toBe(true)
    })

    it('should provide explanations for all fields', () => {
      const config = explainable<{ a: number; b: number }>()
        .defaults({ a: 1, b: 2 })
        .env({ a: 10 })
        .build()

      const aExplanations = config.explain('a')
      const bExplanations = config.explain('b')

      expect(aExplanations.length).toBeGreaterThan(0)
      expect(bExplanations.length).toBeGreaterThan(0)
    })
  })
})

