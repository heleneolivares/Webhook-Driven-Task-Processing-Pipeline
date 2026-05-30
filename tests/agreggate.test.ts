import { describe, it, expect } from 'vitest'
import { applyAggregate } from '../src/processing/actions/aggregate'

describe('applyAggregate', () => {
  it('should aggregate multiple events and calculate stats', () => {
    const events = [
      { product: 'TV Samsung', discount_percent: 24, new_price: 380 },
      { product: 'MacBook Pro', discount_percent: 30, new_price: 1200 },
    ]

    const result = applyAggregate(events, { windowMinutes: 60 })

    expect(result.totalEvents).toBe(2)
    expect(result.events).toHaveLength(2)
    expect(result.summary.discount_percent_min).toBe(24)
    expect(result.summary.discount_percent_max).toBe(30)
    expect(result.summary.discount_percent_avg).toBe(27)
  })

  it('should return empty summary for events with no numeric fields', () => {
    const events = [
      { product: 'TV Samsung' },
      { product: 'MacBook Pro' },
    ]

    const result = applyAggregate(events, { windowMinutes: 60 })

    expect(result.totalEvents).toBe(2)
    expect(result.summary.totalEvents).toBe(2)
  })

  it('should include window start and end', () => {
    const events = [{ price: 100 }]
    const result = applyAggregate(events, { windowMinutes: 60 })

    expect(result.windowStart).toBeDefined()
    expect(result.windowEnd).toBeDefined()
  })
})