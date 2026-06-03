/**
 * OutreachService — bulk SMS/email campaigns via Amazon Pinpoint (through the
 * AWS backend). Requires Pinpoint + backend; until then calls surface a clear
 * "not configured" error rather than silently succeeding.
 *
 * Interface: createCampaign(def); scheduleCampaign(id, when); getReport(id);
 *            sendOne({channel, to, body, subject})
 */
import { apiFetch } from '../apiClient';
import { isConfigured } from '../config';

const notConfigured = () => {
  throw new Error('Outreach requires Amazon Pinpoint (configure VITE_PINPOINT_PROJECT_ID + backend)');
};

export function createOutreachService() {
  if (!isConfigured.outreach()) {
    return {
      kind: 'unconfigured',
      createCampaign: notConfigured,
      scheduleCampaign: notConfigured,
      getReport: notConfigured,
      sendOne: notConfigured,
    };
  }

  return {
    kind: 'pinpoint',
    createCampaign: (def) => apiFetch('/outreach/campaigns', { method: 'POST', body: def }),
    scheduleCampaign: (id, when) =>
      apiFetch(`/outreach/campaigns/${id}/schedule`, { method: 'POST', body: { when } }),
    getReport: (id) => apiFetch(`/outreach/campaigns/${id}/report`),
    sendOne: (msg) => apiFetch('/outreach/send', { method: 'POST', body: msg }),
  };
}

export default createOutreachService;
