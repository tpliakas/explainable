import { describe, it, expect } from 'vitest'
import { ConfigResolver } from '../resolver'

describe('ConfigResolver', () => {
  describe('basic resolution', () => {
    it('should resolve a single source', () => {
      const resolver = new ConfigResolver()
      resolver.addSource(
        { port: 3000 },
        { name: 'defaults', precedence: 0 }
      )

      const result = resolver.resolve()
      expect(result.value.port).toBe(3000)
    })

    it('should merge multiple sources', () => {
      const resolver = new ConfigResolver()
      
      resolver.addSource(
        { port: 8080, host: 'localhost' },
        { name: 'defaults', precedence: 0 }
      )
      
      resolver.addSource(
        { port: 3000 },
        { name: 'env', precedence: 10 }
      )

      const result = resolver.resolve()
      expect(result.value.port).toBe(3000)
      expect(result.value.host).toBe('localhost')
    })
  })

  describe('precedence', () => {
    it('should respect precedence order', () => {
      const resolver = new ConfigResolver()
      
      resolver.addSource(
        { value: 'low' },
        { name: 'low', precedence: 0 }
      )
      
      resolver.addSource(
        { value: 'high' },
        { name: 'high', precedence: 10 }
      )

      const result = resolver.resolve()
      expect(result.value.value).toBe('high')
      
      const explanations = result.explain('value')
      expect(explanations.find(e => e.won)?.source).toBe('high')
    })

    it('should handle multiple precedence levels', () => {
      const resolver = new ConfigResolver()
      
      resolver.addSource(
        { value: 'defaults' },
        { name: 'defaults', precedence: 0 }
      )
      
      resolver.addSource(
        { value: 'file' },
        { name: 'file', precedence: 5 }
      )
      
      resolver.addSource(
        { value: 'env' },
        { name: 'env', precedence: 10 }
      )
      
      resolver.addSource(
        { value: 'cli' },
        { name: 'cli', precedence: 20 }
      )

      const result = resolver.resolve()
      expect(result.value.value).toBe('cli')
    })
  })

  describe('static methods', () => {
    it('should create resolver from sources', () => {
      const resolver = ConfigResolver.from([
        {
          data: { port: 8080 },
          source: { name: 'defaults', precedence: 0 },
        },
        {
          data: { port: 3000 },
          source: { name: 'env', precedence: 10 },
        },
      ])

      const result = resolver.resolve()
      expect(result.value.port).toBe(3000)
    })

    it('should quick resolve', () => {
      const result = ConfigResolver.resolve([
        {
          data: { port: 8080 },
          source: { name: 'defaults', precedence: 0 },
        },
        {
          data: { port: 3000 },
          source: { name: 'env', precedence: 10 },
        },
      ])

      expect(result.value.port).toBe(3000)
    })
  })

  describe('edge cases', () => {
    it('should handle empty sources', () => {
      const resolver = new ConfigResolver()
      const result = resolver.resolve()
      expect(result.value).toEqual({})
    })

    it('should handle undefined values', () => {
      const resolver = new ConfigResolver()
      
      resolver.addSource(
        { port: undefined, host: 'localhost' },
        { name: 'defaults', precedence: 0 }
      )

      const result = resolver.resolve()
      expect(result.value.host).toBe('localhost')
    })

    it('should handle null values', () => {
      const resolver = new ConfigResolver()
      
      resolver.addSource(
        { value: null },
        { name: 'defaults', precedence: 0 }
      )

      const result = resolver.resolve()
      expect(result.value.value).toBeNull()
    })
  })
})

