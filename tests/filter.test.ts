import { describe, it, expect } from 'vitest'
import { applyFilter } from '../src/processing/actions/filter'

describe('applyFilter', () => {
  it('should pass when condition is met (gt)', () => {
    const result = applyFilter(
      { discount_percent: 24 },
      { field: 'discount_percent', operator: 'gt', value: 20 }
    )
    expect(result.passed).toBe(true)
  })

  it('should skip when condition is not met (gt)', () => {
    const result = applyFilter(
      { discount_percent: 15 },
      { field: 'discount_percent', operator: 'gt', value: 20 }
    )
    expect(result.passed).toBe(false)
  })

  it('should skip when field does not exist', () => {
    const result = applyFilter(
      { price: 100 },
      { field: 'discount_percent', operator: 'gt', value: 20 }
    )
    expect(result.passed).toBe(false)
  })

  it('should pass when condition is met (eq)', () => {
    const result = applyFilter(
      { category: 'electronica' },
      { field: 'category', operator: 'eq', value: 'electronica' }
    )
    expect(result.passed).toBe(true)
  })

  it('should skip when condition is not met (eq)', () => {
    const result = applyFilter(
      { category: 'hogar' },
      { field: 'category', operator: 'eq', value: 'electronica' }
    )
    expect(result.passed).toBe(false)
  })
})