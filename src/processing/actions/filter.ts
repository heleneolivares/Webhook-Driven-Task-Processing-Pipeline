type FilterConfig = {
  field: string
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'neq'
  value: unknown
}

type FilterResult = {
  passed: boolean
  reason?: string
  payload: Record<string, unknown>
}

export function applyFilter(
  payload: Record<string, unknown>,
  config: FilterConfig
): FilterResult {
  const { field, operator, value } = config
  const fieldValue = payload[field]

  if (fieldValue === undefined || fieldValue === null) {
    return {
      passed: false,
      reason: `Field "${field}" not found in payload`,
      payload
    }
  }
  const a = fieldValue as number | string
  const b = value as number | string

  let passed = false

  switch (operator) {
    case 'gt':  passed = a > b; break
    case 'lt':  passed = a < b; break
    case 'eq':  passed = a === b; break
    case 'gte': passed = a >= b; break
    case 'lte': passed = a <= b; break
    case 'neq': passed = a !== b; break
    default:
      return { passed: false, reason: `Unknown operator: ${operator}`, payload }
  }

  return {
    passed,
    reason: passed ? undefined : `Filter condition not met: ${field} ${operator} ${value}`,
    payload
  }
}