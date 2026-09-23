import { describe, expect, it } from 'vitest'
import { sessionListQuerySchema } from './session'

describe('sessionListQuerySchema', () => {
  it('parses empty query with default values', () => {
    const result = sessionListQuerySchema.parse({})
    expect(result).toEqual({ page: 1, limit: 9 })
  })

  it('parses string number parameters', () => {
    const result = sessionListQuerySchema.parse({ page: '2', limit: '24' })
    expect(result).toEqual({ page: 2, limit: 24 })
  })

  it('handles array query parameter by taking first item', () => {
    const result = sessionListQuerySchema.parse({ page: ['3', '4'], limit: '10' })
    expect(result).toEqual({ page: 3, limit: 10 })
  })

  it('rejects zero or negative page', () => {
    expect(() => sessionListQuerySchema.parse({ page: '0' })).toThrow()
    expect(() => sessionListQuerySchema.parse({ page: '-1' })).toThrow()
  })

  it('rejects non-integer strings like floats or alphabets', () => {
    expect(() => sessionListQuerySchema.parse({ page: '1.5' })).toThrow()
    expect(() => sessionListQuerySchema.parse({ page: 'abc' })).toThrow()
    expect(() => sessionListQuerySchema.parse({ limit: 'NaN' })).toThrow()
  })

  it('caps max limit at 50', () => {
    expect(() => sessionListQuerySchema.parse({ limit: '51' })).toThrow()
  })

  it('caps max page at 10000', () => {
    expect(() => sessionListQuerySchema.parse({ page: '10001' })).toThrow()
  })
})
