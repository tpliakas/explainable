import { describe, it, expect } from 'vitest'
import { Explained } from '../explained'

describe('Explained', () => {
  describe('basic functionality', () => {
    it('should wrap a value', () => {
      const explained = new Explained(42)
      expect(explained.value).toBe(42)
    })

    it('should create from a source', () => {
      const explained = Explained.from(
        { port: 3000 },
        'defaults',
        'Default config',
        0
      )
      
      expect(explained.value).toEqual({ port: 3000 })
      
      const explanations = explained.explain()
      expect(explanations).toHaveLength(1)
      expect(explanations[0].source).toBe('defaults')
      expect(explanations[0].won).toBe(true)
    })
  })

  describe('explain()', () => {
    it('should return explanations for a specific path', () => {
      const explained = new Explained({ port: 3000 })
      explained._addExplanation('port', {
        source: 'defaults',
        value: 8080,
        reason: 'Default value',
        precedence: 0,
        won: false,
        timestamp: Date.now(),
      })
      explained._addExplanation('port', {
        source: 'env',
        value: 3000,
        reason: 'PORT env var',
        precedence: 10,
        won: true,
        timestamp: Date.now(),
      })

      const explanations = explained.explain('port')
      expect(explanations).toHaveLength(2)
      expect(explanations[0].source).toBe('defaults')
      expect(explanations[1].source).toBe('env')
      expect(explanations[1].won).toBe(true)
    })

    it('should filter to only winners when requested', () => {
      const explained = new Explained({ port: 3000 })
      explained._addExplanation('port', {
        source: 'defaults',
        value: 8080,
        reason: 'Default value',
        precedence: 0,
        won: false,
        timestamp: Date.now(),
      })
      explained._addExplanation('port', {
        source: 'env',
        value: 3000,
        reason: 'PORT env var',
        precedence: 10,
        won: true,
        timestamp: Date.now(),
      })

      const winners = explained.explain('port', { onlyWinners: true })
      expect(winners).toHaveLength(1)
      expect(winners[0].source).toBe('env')
      expect(winners[0].won).toBe(true)
    })
  })

  describe('explainText()', () => {
    it('should format explanations as text', () => {
      const explained = new Explained({ port: 3000 })
      explained._addExplanation('port', {
        source: 'defaults',
        value: 8080,
        reason: 'Default value',
        precedence: 0,
        won: false,
        timestamp: Date.now(),
      })
      explained._addExplanation('port', {
        source: 'env',
        value: 3000,
        reason: 'PORT env var',
        precedence: 10,
        won: true,
        timestamp: Date.now(),
      })

      const text = explained.explainText('port')
      expect(text).toContain('port = 3000')
      expect(text).toContain('✓ env → 3000')
      expect(text).toContain('✗ defaults → 8080')
    })

    it('should handle missing explanations', () => {
      const explained = new Explained({ port: 3000 })
      const text = explained.explainText('nonexistent')
      expect(text).toContain('No explanations found')
    })
  })

  describe('merge()', () => {
    it('should merge multiple Explained instances', () => {
      const defaults = Explained.from(
        { port: 8080, host: 'localhost' },
        'defaults',
        'Default config',
        0
      )
      
      const env = Explained.from(
        { port: 3000 },
        'env',
        'Environment variables',
        10
      )

      const merged = Explained.merge(defaults, env)
      
      expect(merged.value.port).toBe(3000)
      expect(merged.value.host).toBe('localhost')
      
      const portExplanations = merged.explain('port')
      expect(portExplanations).toHaveLength(2)
      expect(portExplanations.find(e => e.won)?.source).toBe('env')
    })

    it('should respect precedence', () => {
      const low = Explained.from({ value: 1 }, 'low', 'Low precedence', 0)
      const high = Explained.from({ value: 2 }, 'high', 'High precedence', 10)

      const merged = Explained.merge(low, high)
      expect(merged.value.value).toBe(2)

      const explanations = merged.explain('value')
      expect(explanations.find(e => e.won)?.source).toBe('high')
    })

    it('should handle timestamp tiebreaking', () => {
      const first = Explained.from({ value: 1 }, 'first', 'First', 5)
      
      // Wait a tiny bit to ensure different timestamp
      const second = Explained.from({ value: 2 }, 'second', 'Second', 5)

      const merged = Explained.merge(first, second)
      
      // First one should win due to earlier timestamp
      expect(merged.value.value).toBe(1)
    })
  })

  describe('toJSON()', () => {
    it('should serialize to JSON format', () => {
      const explained = Explained.from(
        { port: 3000 },
        'defaults',
        'Default config',
        0
      )

      const json = explained.toJSON()
      
      expect(json.value).toEqual({ port: 3000 })
      expect(json.explanations).toBeDefined()
      expect(json.metadata).toBeDefined()
      expect(json.metadata?.sourcesCount).toBeGreaterThan(0)
    })
  })

  describe('explainAll()', () => {
    it('should return all field explanations', () => {
      const explained = new Explained({ port: 3000, host: 'localhost' })
      
      explained._addExplanation('port', {
        source: 'defaults',
        value: 3000,
        reason: 'Default',
        precedence: 0,
        won: true,
        timestamp: Date.now(),
      })
      
      explained._addExplanation('host', {
        source: 'defaults',
        value: 'localhost',
        reason: 'Default',
        precedence: 0,
        won: true,
        timestamp: Date.now(),
      })

      const all = explained.explainAll()
      expect(Object.keys(all)).toContain('port')
      expect(Object.keys(all)).toContain('host')
    })
  })
})

