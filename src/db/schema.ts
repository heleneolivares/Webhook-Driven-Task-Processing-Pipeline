import { 
    pgTable,
    uuid,
    text,
    jsonb,
    boolean,
    timestamp,
    integer,
} from 'drizzle-orm/pg-core'

import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
    
export const pipelines = pgTable('pipelines', {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceKey: text('source_key').notNull().unique(),
    actionType: text('action_type').notNull(),
    actionConfig:jsonb('action_config').$type<Record<string, unknown>>().notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    name: text('name').notNull(),
})

export const subscribers = pgTable('subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  targetUrl: text('target_url').notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})

export const pipelineSubscribers = pgTable('pipeline_subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  pipelineId: uuid('pipeline_id').notNull().references(() => pipelines.id),
  subscriberId: uuid('subscriber_id').notNull().references(() => subscribers.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const webhookEvents = pgTable('webhook_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  pipelineId: uuid('pipeline_id').notNull().references(() => pipelines.id),
  bucketId: uuid('bucket_id').references(() => aggregationBuckets.id),
  payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
  receivedAt: timestamp('received_at', { withTimezone: true }).defaultNow().notNull(),
})

export const aggregationBuckets = pgTable('aggregation_buckets', {
  id: uuid('id').primaryKey().defaultRandom(),
  pipelineId: uuid('pipeline_id').notNull().references(() => pipelines.id),
  status: text('status').notNull().default('open'),
  eventsCount: integer('events_count').notNull().default(0),
  windowStart: timestamp('window_start', { withTimezone: true }).defaultNow().notNull(),
  windowEnd: timestamp('window_end', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  pipelineId: uuid('pipeline_id').notNull().references(() => pipelines.id),
  eventId: uuid('event_id').notNull().references(() => webhookEvents.id),
  status: text('status').notNull().default('pending'),
  lastError: text('last_error'),
  nextRetryAt: timestamp('next_retry_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
})

export const deliveryAttempts = pgTable('delivery_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobs.id),
  subscriberId: uuid('subscriber_id').notNull().references(() => subscribers.id),
  attemptNumber: integer('attempt_number').notNull(),
  status: text('status').notNull(),
  responseStatusCode: integer('response_status_code'),
  errorMessage: text('error_message'),
  attemptedAt: timestamp('attempted_at', { withTimezone: true }).defaultNow().notNull(),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  nextRetryAt: timestamp('next_retry_at', { withTimezone: true }),
})

export type Pipeline = InferSelectModel<typeof pipelines>
export type NewPipeline = InferInsertModel<typeof pipelines>
export type Subscriber = InferSelectModel<typeof subscribers>
export type NewSubscriber = InferInsertModel<typeof subscribers>
export type PipelineSubscriber = InferSelectModel<typeof pipelineSubscribers>
export type NewPipelineSubscriber = InferInsertModel<typeof pipelineSubscribers>
export type WebhookEvent = InferSelectModel<typeof webhookEvents>
export type NewWebhookEvent = InferInsertModel<typeof webhookEvents>
export type AggregationBucket = InferSelectModel<typeof aggregationBuckets>
export type NewAggregationBucket = InferInsertModel<typeof aggregationBuckets>
export type Job = InferSelectModel<typeof jobs>
export type NewJob = InferInsertModel<typeof jobs>
export type DeliveryAttempt = InferSelectModel<typeof deliveryAttempts>
export type NewDeliveryAttempt = InferInsertModel<typeof deliveryAttempts>