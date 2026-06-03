/**
 * Centralised, environment-based configuration for all AWS-backed contact-centre
 * services (NeonNow parity). UI code must NEVER read these directly to call an
 * SDK — it goes through the service layer in `src/services/*`, which routes
 * AWS calls to the backend (API Gateway + Lambda) defined in `/backend`.
 *
 * Only Amazon Connect Streams (CCP) runs client-side; everything else
 * (Bedrock, Lex, Transcribe, Contact Lens, Pinpoint, Kinesis/Athena, Bedrock
 * Agents) is invoked server-side and reached here via `apiBaseUrl`.
 */

const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};

const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

export const config = {
  // Backend (AWS Lambda + API Gateway) that fronts all server-side AWS calls.
  apiBaseUrl: str(env.VITE_API_BASE_URL),

  aws: {
    region: str(env.VITE_AWS_REGION) || 'us-east-1',
  },

  // Amazon Connect (telephony + CCP embedded softphone).
  connect: {
    instanceArn: str(env.VITE_CONNECT_INSTANCE_ARN),
    // Hosted CCP URL, e.g. https://<instance-alias>.my.connect.aws/ccp-v2/
    ccpUrl: str(env.VITE_CONNECT_CCP_URL),
  },

  // Amazon Lex (intent detection feeding routing).
  lex: {
    botId: str(env.VITE_LEX_BOT_ID),
    botAliasId: str(env.VITE_LEX_BOT_ALIAS_ID),
    localeId: str(env.VITE_LEX_LOCALE_ID) || 'en_US',
  },

  // Amazon Bedrock (agent assist, summarisation, agentic builder).
  bedrock: {
    modelId: str(env.VITE_BEDROCK_MODEL_ID) || 'anthropic.claude-3-5-sonnet-20240620-v1:0',
    guardrailId: str(env.VITE_BEDROCK_GUARDRAIL_ID),
  },

  // Amazon Pinpoint (Outreach campaigns).
  pinpoint: {
    projectId: str(env.VITE_PINPOINT_PROJECT_ID),
  },
};

/** Is the server-side backend reachable? Gates all live AWS adapters. */
export const hasBackend = () => Boolean(config.apiBaseUrl);

/** Per-service readiness checks — used to pick live vs mock/Base44 adapters. */
export const isConfigured = {
  // CCP can run client-side without our backend, so only needs the CCP URL.
  telephony: () => Boolean(config.connect.ccpUrl),
  iq: () => hasBackend() && Boolean(config.bedrock.modelId),
  intent: () => hasBackend() && Boolean(config.lex.botId && config.lex.botAliasId),
  outreach: () => hasBackend() && Boolean(config.pinpoint.projectId),
  reporting: () => hasBackend(),
  agentic: () => hasBackend() && Boolean(config.bedrock.modelId),
};

export default config;
