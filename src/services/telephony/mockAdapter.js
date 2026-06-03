/**
 * Mock telephony adapter — preserves the existing simulated SoftPhone behaviour
 * (window 'softphone:dial' events, scenario-driven contacts) so the app works
 * with zero AWS configuration and in tests.
 */
export function createMockTelephonyAdapter() {
  const listeners = new Set();
  let current = null;

  const emit = (event) => listeners.forEach((fn) => fn(event));

  return {
    kind: 'mock',
    async init() {
      return { ready: true, mode: 'mock' };
    },
    onContact(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    async dial(number) {
      current = { id: `mock_${number}`, number, channel: 'voice', state: 'connecting' };
      emit({ type: 'connecting', contact: current });
      // UI components also listen to this legacy event.
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('softphone:dial', { detail: { number } }));
      }
      return current;
    },
    async accept() {
      if (current) {
        current = { ...current, state: 'connected' };
        emit({ type: 'connected', contact: current });
      }
      return current;
    },
    async hangup() {
      if (current) {
        emit({ type: 'ended', contact: { ...current, state: 'ended' } });
        current = null;
      }
    },
    getCurrentContact() {
      return current;
    },
  };
}

export default createMockTelephonyAdapter;
