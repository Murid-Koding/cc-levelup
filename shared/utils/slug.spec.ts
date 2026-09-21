import { describe, expect, it } from 'vitest'
import { slugify } from './slug'

describe('slugify', () => {
  it('lowercases and trims', () => {
    expect(slugify('  Membangun API Dengan Nuxt  ')).toBe('membangun-api-dengan-nuxt')
  })

  it('strips diacritics', () => {
    expect(slugify('Pembelajaran Éksplorasi')).toBe('pembelajaran-eksplorasi')
  })

  it('removes symbols and collapses separators', () => {
    expect(slugify('Bisnis   &   Desain')).toBe('bisnis-desain')
  })
})
