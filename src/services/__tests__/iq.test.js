import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Base44 integrations module so no network call happens.
vi.mock('@/api/integrations', () => ({
  InvokeLLM: vi.fn(async () => ({
    suggestions: [{ text: 'I can help with that refill.', category: 'reply' }],
    nextBestAction: 'Open refill workflow',
  })),
  SendSMS: vi.fn(async () => ({ ok: true })),
  SendEmail: vi.fn(async () => ({ ok: true })),
}));

import { createIqService } from '../iq';
import { InvokeLLM } from '@/api/integrations';

describe('IQService (Base44 adapter)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses the Base44 adapter when no AWS backend is configured', () => {
    const svc = createIqService();
    expect(svc.kind).toBe('base44');
  });

  it('returns normalised suggestions from InvokeLLM', async () => {
    const svc = createIqService({ forceBase44: true });
    const res = await svc.suggestReplies({
      transcript: [{ speaker: 'patient', text: 'I need a refill' }],
      context: { patientId: '1' },
    });
    expect(InvokeLLM).toHaveBeenCalledOnce();
    expect(res.suggestions[0].category).toBe('reply');
    expect(res.nextBestAction).toMatch(/refill/i);
  });

  it('summarise falls back gracefully on a plain-string LLM response', async () => {
    InvokeLLM.mockResolvedValueOnce('Patient requested a refill; resolved.');
    const svc = createIqService({ forceBase44: true });
    const res = await svc.summarise({ transcript: [] });
    expect(res.summary).toMatch(/refill/i);
    expect(res.followUps).toEqual([]);
  });
});
