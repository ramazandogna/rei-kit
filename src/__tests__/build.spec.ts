import { describe, expect, it } from 'vitest'

import { VERSION } from '../index'

/**
 * A placeholder with a job: it proves the test runner, the path aliases and the
 * library entry all resolve before anything real depends on them.
 */
describe('package entry', () => {
  it('exports a version', () => {
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/)
  })
})
