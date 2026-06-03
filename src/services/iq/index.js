/**
 * IQService — agent assist, summarisation, wrap-up notes, and risk detection.
 * Uses Amazon Bedrock (via the AWS backend) when configured; otherwise a local
 * dependency-free mock adapter for dev/tests.
 */
import { isConfigured } from '../config';
import { createMockIqAdapter } from './mockAdapter';
import { createApiIqAdapter } from './apiAdapter';

export function createIqService({ forceMock = false } = {}) {
  return !forceMock && isConfigured.iq() ? createApiIqAdapter() : createMockIqAdapter();
}

export default createIqService;
