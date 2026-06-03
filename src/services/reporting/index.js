/**
 * ReportingService — real-time + historical contact-centre metrics.
 * Live data comes from the analytics pipeline (Connect CTR -> Kinesis -> S3 ->
 * Athena) via the AWS backend. Without a backend, callers should use existing
 * mock dashboards (Analytics.jsx) — `isLive()` tells the UI which to show.
 */
import { apiFetch } from '../apiClient';
import { isConfigured } from '../config';

export function createReportingService() {
  const live = isConfigured.reporting();
  return {
    kind: live ? 'athena' : 'mock',
    isLive: () => live,
    async getRealtime() {
      if (!live) throw new Error('Reporting pipeline not configured');
      return apiFetch('/reporting/realtime');
    },
    async query({ metric, from, to, dimensions } = {}) {
      if (!live) throw new Error('Reporting pipeline not configured');
      return apiFetch('/reporting/query', { method: 'POST', body: { metric, from, to, dimensions } });
    },
  };
}

export default createReportingService;
