import { describe, expect, it } from 'vitest'
import semverCompare from 'semver/functions/compare-loose'

describe('semverCompare', () => {
  it('compares loose semantic versions', () => {
    expect(semverCompare('1.2.3', '1.10.0')).toBeLessThan(0)
    expect(semverCompare('1.10.0', '1.2.3')).toBeGreaterThan(0)
    expect(semverCompare('2.0.0', '2.0.0')).toBe(0)
  })
})
