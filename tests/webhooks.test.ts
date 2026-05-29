import { describe, it, expect, vi } from 'vitest'
import { ingestWebhook } from '../src/modules/webhooks/service'

vi.mock('../src/modules/pipelines/queries', () => ({
  getPipelineBySourceKey: vi.fn().mockResolvedValue({
    id: 'pipeline-123',
    sourceKey: 'test-key',
    actionType: 'filter',
    actionConfig: { field: 'price', operator: 'gt', value: 100 },
    isActive: true,
    deletedAt: null
  })
}))

vi.mock('../src/modules/webhooks/queries', () => ({
  createWebhookEvent: vi.fn().mockResolvedValue({
    id: 'event-123',
    pipelineId: 'pipeline-123',
    payload: { price: 200 },
    receivedAt: new Date()
  }),
  createJob: vi.fn().mockResolvedValue({
    id: 'job-123',
    pipelineId: 'pipeline-123',
    eventId: 'event-123',
    status: 'pending'
  })
}))

describe('ingestWebhook', () => {
  it('should create event and job when pipeline exists', async () => {
    const result = await ingestWebhook('test-key', { price: 200 })

    expect(result.eventId).toBe('event-123')
    expect(result.jobId).toBe('job-123')
    expect(result.status).toBe('pending')
  })

  it('should throw when pipeline not found', async () => {
    const { getPipelineBySourceKey } = await import('../src/modules/pipelines/queries')
    vi.mocked(getPipelineBySourceKey).mockResolvedValueOnce(null as any)

    await expect(ingestWebhook('invalid-key', { price: 200 }))
      .rejects.toThrow('Pipeline not found')
  })
})