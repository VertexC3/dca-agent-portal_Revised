/**
 * IQ adapter backed by Amazon Bedrock via the AWS backend (API Gateway + Lambda).
 * Same interface as the Base44 adapter so callers are unaffected by the switch.
 * Backend handlers live in /backend/src/handlers/iq*.mjs.
 */
import { apiFetch } from '../apiClient';

export function createApiIqAdapter() {
  return {
    kind: 'bedrock',
    async suggestReplies(payload) {
      return apiFetch('/iq/suggest', { method: 'POST', body: payload });
    },
    async summarise(payload) {
      return apiFetch('/iq/summarise', { method: 'POST', body: payload });
    },
    async detectRisk(payload) {
      return apiFetch('/iq/risk', { method: 'POST', body: payload });
    },
  };
}

export default createApiIqAdapter;
