import { describe, it, expect } from 'vitest';
import { createIqService } from '../iq';

describe('IQService (mock adapter)', () => {
  it('uses the local mock adapter when no AWS backend is configured', () => {
    const svc = createIqService();
    expect(svc.kind).toBe('mock');
  });

  it('produces context-aware suggestions', async () => {
    const svc = createIqService({ forceMock: true });
    const res = await svc.suggestReplies({
      transcript: [{ speaker: 'patient', text: 'I need a prescription refill' }],
    });
    expect(res.suggestions.length).toBeGreaterThan(0);
    expect(res.suggestions.some((s) => /refill/i.test(s.text))).toBe(true);
    expect(res.nextBestAction).toBeTruthy();
  });

  it('summarise returns a structured shape', async () => {
    const svc = createIqService({ forceMock: true });
    const res = await svc.summarise({ transcript: [{ speaker: 'patient', text: 'hi' }] });
    expect(res).toHaveProperty('summary');
    expect(res).toHaveProperty('disposition');
    expect(Array.isArray(res.followUps)).toBe(true);
  });

  it('detectRisk flags affordability cues', async () => {
    const svc = createIqService({ forceMock: true });
    const res = await svc.detectRisk({
      transcript: [{ speaker: 'patient', text: "I can't afford the copay" }],
    });
    expect(['low', 'medium', 'high']).toContain(res.level);
  });
});
