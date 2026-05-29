type AggregateConfig = {
  windowMinutes: number
  maxEvents?: number
}

type AggregateResult = {
  totalEvents: number
  windowStart: string
  windowEnd: string
  events: Record<string, unknown>[]
  summary: Record<string, unknown>
}

export function applyAggregate(
  events: Record<string, unknown>[],
  config: AggregateConfig
): AggregateResult {
  const now = new Date()
  const windowStart = new Date(now.getTime() - config.windowMinutes * 60 * 1000)

  const numericFields: Record<string, number[]> = {}
  for (const event of events) {
    for (const [key, value] of Object.entries(event)) {
      if (typeof value === 'number') {
        if (!numericFields[key]) numericFields[key] = []
        numericFields[key].push(value)
      }
    }
  }

  const summary: Record<string, unknown> = {
    totalEvents: events.length,
  }

  for (const [field, values] of Object.entries(numericFields)) {
    summary[`${field}_min`] = Math.min(...values)
    summary[`${field}_max`] = Math.max(...values)
    summary[`${field}_avg`] = values.reduce((a, b) => a + b, 0) / values.length
  }

  return {
    totalEvents: events.length,
    windowStart: windowStart.toISOString(),
    windowEnd: now.toISOString(),
    events,
    summary
  }
}