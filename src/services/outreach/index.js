/**
 * OutreachService — bulk SMS/email campaigns via Amazon Pinpoint (through the
 * AWS backend). Until Pinpoint is provisioned, single-send falls back to Base44
 * SendSMS/SendEmail so basic messaging works today.
 *
 * Interface: createCampaign(def); scheduleCampaign(id, when); getReport(id);
 *            sendOne({channel, to, body, subject})
 */
import { apiFetch } from '../apiClient';
import { isConfigured } from '../config';
import { SendSMS, SendEmail } from '@/api/integrations';

export function createOutreachService({ forceFallback = false } = {}) {
  const live = !forceFallback && isConfigured.outreach();

  if (live) {
    return {
      kind: 'pinpoint',
      createCampaign: (def) => apiFetch('/outreach/campaigns', { method: 'POST', body: def }),
      scheduleCampaign: (id, when) =>
        apiFetch(`/outreach/campaigns/${id}/schedule`, { method: 'POST', body: { when } }),
      getReport: (id) => apiFetch(`/outreach/campaigns/${id}/report`),
      sendOne: (msg) => apiFetch('/outreach/send', { method: 'POST', body: msg }),
    };
  }

  return {
    kind: 'base44-fallback',
    async createCampaign() {
      throw new Error('Bulk campaigns require Amazon Pinpoint (configure VITE_PINPOINT_PROJECT_ID + backend)');
    },
    async scheduleCampaign() {
      throw new Error('Bulk campaigns require Amazon Pinpoint');
    },
    async getReport() {
      throw new Error('Campaign reporting requires Amazon Pinpoint');
    },
    async sendOne({ channel, to, body, subject }) {
      if (channel === 'sms') return SendSMS({ to, body });
      if (channel === 'email') return SendEmail({ to, subject, body });
      throw new Error(`Unsupported channel: ${channel}`);
    },
  };
}

export default createOutreachService;
