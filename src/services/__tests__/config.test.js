import { describe, it, expect } from 'vitest';
import { config, isConfigured, hasBackend } from '../config';

describe('services/config', () => {
  it('provides safe defaults without env', () => {
    expect(config.aws.region).toBeTruthy();
    expect(config.bedrock.modelId).toContain('anthropic');
    expect(config.lex.localeId).toBe('en_US');
  });

  it('gates live adapters on configuration', () => {
    // In the test env none of the AWS vars are set.
    expect(hasBackend()).toBe(false);
    expect(isConfigured.iq()).toBe(false);
    expect(isConfigured.outreach()).toBe(false);
    expect(isConfigured.reporting()).toBe(false);
    // Telephony (CCP) only needs a CCP URL, also unset here.
    expect(isConfigured.telephony()).toBe(false);
  });
});
