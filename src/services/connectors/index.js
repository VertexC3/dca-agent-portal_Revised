/**
 * Connector framework — uniform adapter interface for external CRMs/ITSMs
 * (Salesforce, Dynamics 365, ServiceNow, HubSpot). Adapters call out via the
 * AWS backend (which holds OAuth secrets); a reference HubSpot adapter is wired.
 *
 * Adapter interface:
 *   id, label
 *   isConfigured(): boolean
 *   getContact({ email | phone | id }): Promise<contact|null>
 *   createCase({ subject, description, contactId }): Promise<{id}>
 *   logActivity({ contactId, type, payload }): Promise<{id}>
 */
import { createHubspotAdapter } from './hubspotAdapter';

const registry = new Map();

export function registerConnector(adapter) {
  registry.set(adapter.id, adapter);
  return adapter;
}

export function getConnector(id) {
  return registry.get(id);
}

export function listConnectors() {
  return [...registry.values()].map((a) => ({
    id: a.id,
    label: a.label,
    configured: a.isConfigured?.() ?? false,
  }));
}

// Reference adapter wired by default. Salesforce / Dynamics / ServiceNow follow
// the same shape and are added in Phase 5.
registerConnector(createHubspotAdapter());

export default { registerConnector, getConnector, listConnectors };
