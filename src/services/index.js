/**
 * Service layer entry point. UI imports services from here only — never AWS SDKs.
 *
 *   import { services } from '@/services';
 *   const { suggestions } = await services.iq.suggestReplies({ transcript });
 *
 * Each service auto-selects a live AWS-backed adapter when configured (see
 * `config.js` / `isConfigured`), otherwise a local mock fallback that works
 * with no AWS provisioning. This is the seam the NeonNow parity features build on.
 */
import { config, isConfigured, hasBackend } from './config';
import { setAuthTokenProvider } from './apiClient';
import { createTelephonyService } from './telephony';
import { createDataService } from './data';
import { createIqService } from './iq';
import { createOutreachService } from './outreach';
import { createReportingService } from './reporting';
import { createAgenticService } from './agentic';
import { listConnectors, getConnector } from './connectors';

let _services;

export function getServices() {
  if (!_services) {
    _services = {
      telephony: createTelephonyService(),
      data: createDataService(),
      iq: createIqService(),
      outreach: createOutreachService(),
      reporting: createReportingService(),
      agentic: createAgenticService(),
      connectors: { list: listConnectors, get: getConnector },
    };
  }
  return _services;
}

/** Reset memoised services (useful in tests or after config changes). */
export function resetServices() {
  _services = undefined;
}

export const services = getServices();

export { config, isConfigured, hasBackend, setAuthTokenProvider };
export default services;
