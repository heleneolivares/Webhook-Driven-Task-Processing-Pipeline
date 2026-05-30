export type ActionType = 'filter' | 'ai_analysis' | 'aggregate'

export type JobStatus = 'pending' | 'processing' | 'completed' | 'skipped' | 'failed'

export type DeliveryStatus = 'success' | 'failed'

export type FilterOperator = 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'neq'

export type FilterConfig = {
  field: string
  operator: FilterOperator
  value: unknown
}

export type AiAnalysisConfig = {
  prompt?: string
}

export type AggregateConfig = {
  windowMinutes: number
  maxEvents?: number
  filter?: FilterConfig
  prompt?: string
}