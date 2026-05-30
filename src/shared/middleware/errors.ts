export const ERRORS = {
  // Pipelines
  PIPELINE_NOT_FOUND: 'Pipeline not found',
  PIPELINE_ALREADY_DELETED: 'Pipeline already deleted',
  PIPELINE_INVALID_ACTION_TYPE: 'Invalid action type. Must be one of: filter, ai_analysis, aggregate',
  PIPELINE_NOT_ACTIVE: 'Pipeline is not active',

  // Subscribers
  SUBSCRIBER_NOT_FOUND: 'Subscriber not found',
  SUBSCRIBER_ALREADY_DELETED: 'Subscriber already deleted',
  SUBSCRIBER_INVALID_URL: 'targetUrl must be a valid URL starting with http:// or https://',

  // Webhooks
  WEBHOOK_PAYLOAD_REQUIRED: 'Payload is required',
  WEBHOOK_PIPELINE_NOT_FOUND: 'Pipeline not found for this source key',

  // Jobs
  JOB_NOT_FOUND: 'Job not found',

  // General
  INTERNAL_SERVER_ERROR: 'Internal server error',
} as const