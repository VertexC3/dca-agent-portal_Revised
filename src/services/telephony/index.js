/**
 * TelephonyService — uniform interface over the embedded softphone.
 * Picks the live Amazon Connect CCP adapter when configured, otherwise the
 * mock adapter (existing simulated SoftPhone). UI talks only to this surface.
 *
 * Interface: init(container?) -> {ready,mode}; onContact(cb)->unsub;
 *            dial(number); accept(); hangup(); getCurrentContact()
 */
import { isConfigured } from '../config';
import { createMockTelephonyAdapter } from './mockAdapter';
import { createConnectCcpAdapter } from './connectCcpAdapter';

export function createTelephonyService({ forceMock = false } = {}) {
  const useLive = !forceMock && isConfigured.telephony();
  const adapter = useLive ? createConnectCcpAdapter() : createMockTelephonyAdapter();
  return adapter;
}

export default createTelephonyService;
