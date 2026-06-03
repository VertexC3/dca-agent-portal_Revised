/**
 * Amazon Connect Streams (CCP) adapter — the one AWS integration that legitimately
 * runs in the browser. It embeds the hosted Contact Control Panel into a container
 * element and surfaces contact lifecycle events through a uniform interface.
 *
 * Requires the `amazon-connect-streams` package and a configured CCP URL.
 * Install when wiring Phase 2:  npm i amazon-connect-streams
 */
import { config } from '../config';

export function createConnectCcpAdapter() {
  const listeners = new Set();
  let connect = null;
  let agent = null;
  let current = null;

  const emit = (event) => listeners.forEach((fn) => fn(event));

  return {
    kind: 'connect-ccp',

    /**
     * @param {HTMLElement} container element to render the CCP iframe into.
     */
    async init(container) {
      if (!config.connect.ccpUrl) {
        throw new Error('Connect CCP not configured (VITE_CONNECT_CCP_URL missing)');
      }
      if (!container) {
        throw new Error('connectCcpAdapter.init requires a container element');
      }
      // Lazy import so the dependency is only loaded when CCP is actually used.
      // The variable specifier + @vite-ignore keeps it optional until the
      // `amazon-connect-streams` package is installed in Phase 2.
      const pkg = 'amazon-connect-streams';
      const mod = await import(/* @vite-ignore */ pkg);
      connect = mod.default || mod.connect || window.connect;

      connect.core.initCCP(container, {
        ccpUrl: config.connect.ccpUrl,
        region: config.aws.region,
        loginPopup: true,
        loginPopupAutoClose: true,
        softphone: { allowFramedSoftphone: true },
      });

      connect.agent((a) => {
        agent = a;
      });

      connect.contact((contact) => {
        const wrap = mapContact(contact);
        current = wrap;
        emit({ type: 'connecting', contact: wrap });

        contact.onConnected(() => {
          current = mapContact(contact);
          emit({ type: 'connected', contact: current });
        });
        contact.onEnded(() => {
          emit({ type: 'ended', contact: mapContact(contact) });
          current = null;
        });
      });

      return { ready: true, mode: 'connect-ccp' };
    },

    onContact(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },

    async dial(number) {
      if (!agent) throw new Error('Connect agent not initialised');
      const endpoint = connect.Endpoint.byPhoneNumber(number);
      return new Promise((resolve, reject) => {
        agent.connect(endpoint, { success: () => resolve(current), failure: reject });
      });
    },

    async accept() {
      if (current?._raw) current._raw.accept();
      return current;
    },

    async hangup() {
      const conns = current?._raw?.getActiveInitialConnection?.();
      if (conns) conns.destroy();
    },

    getCurrentContact() {
      return current;
    },
  };
}

function mapContact(contact) {
  return {
    id: contact.getContactId(),
    channel: contact.getType(), // voice | chat | task
    state: contact.getStatus()?.type,
    queue: contact.getQueue?.()?.name,
    _raw: contact,
  };
}

export default createConnectCcpAdapter;
