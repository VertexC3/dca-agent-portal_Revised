/**
 * Reference connector adapter: HubSpot. Demonstrates the connector contract.
 * All calls proxy through the AWS backend (/connectors/hubspot/*) so OAuth
 * tokens never reach the browser.
 */
import { apiFetch } from '../apiClient';
import { hasBackend } from '../config';

export function createHubspotAdapter() {
  return {
    id: 'hubspot',
    label: 'HubSpot',
    isConfigured: () => hasBackend(),
    async getContact(query) {
      return apiFetch('/connectors/hubspot/contact', { method: 'POST', body: query });
    },
    async createCase({ subject, description, contactId }) {
      return apiFetch('/connectors/hubspot/ticket', {
        method: 'POST',
        body: { subject, description, contactId },
      });
    },
    async logActivity({ contactId, type, payload }) {
      return apiFetch('/connectors/hubspot/activity', {
        method: 'POST',
        body: { contactId, type, payload },
      });
    },
  };
}

export default createHubspotAdapter;
