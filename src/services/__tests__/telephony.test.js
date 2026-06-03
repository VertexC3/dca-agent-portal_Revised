import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTelephonyService } from '../telephony';

describe('TelephonyService (mock adapter)', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') vi.restoreAllMocks();
  });

  it('falls back to the mock adapter without Connect config', () => {
    const svc = createTelephonyService();
    expect(svc.kind).toBe('mock');
  });

  it('emits contact lifecycle events through onContact', async () => {
    const svc = createTelephonyService({ forceMock: true });
    const events = [];
    svc.onContact((e) => events.push(e.type));
    await svc.init();
    await svc.dial('+15551234567');
    await svc.accept();
    await svc.hangup();
    expect(events).toEqual(['connecting', 'connected', 'ended']);
    expect(svc.getCurrentContact()).toBeNull();
  });

  it('dispatches the legacy softphone:dial event for existing UI', async () => {
    const svc = createTelephonyService({ forceMock: true });
    const spy = vi.fn();
    window.addEventListener('softphone:dial', spy);
    await svc.dial('+15550000000');
    expect(spy).toHaveBeenCalled();
    window.removeEventListener('softphone:dial', spy);
  });
});
