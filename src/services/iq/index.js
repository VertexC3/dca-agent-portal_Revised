/**
 * IQService — agent assist, summarisation, wrap-up notes, and risk detection.
 * Uses Amazon Bedrock (via backend) when configured; otherwise Base44 InvokeLLM,
 * which works today with no AWS provisioning.
 */
import { isConfigured } from '../config';
import { createBase44IqAdapter } from './base44Adapter';
import { createApiIqAdapter } from './apiAdapter';

export function createIqService({ forceBase44 = false } = {}) {
  return !forceBase44 && isConfigured.iq() ? createApiIqAdapter() : createBase44IqAdapter();
}

export default createIqService;
