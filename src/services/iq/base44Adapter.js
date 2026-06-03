/**
 * IQ adapter backed by Base44's hosted LLM (InvokeLLM). This works TODAY with no
 * AWS provisioning and matches the repo's existing integration stack. When the
 * AWS backend + Bedrock are provisioned, `apiAdapter` takes over transparently.
 */
import { InvokeLLM } from '@/api/integrations';

const transcriptToText = (transcript = []) =>
  transcript
    .map((t) => `${(t.speaker || t.role || 'speaker').toUpperCase()}: ${t.text || t.content || ''}`)
    .join('\n');

export function createBase44IqAdapter() {
  return {
    kind: 'base44',

    /** Suggested replies + next-best-action for the agent. */
    async suggestReplies({ transcript = [], context = {} } = {}) {
      const result = await InvokeLLM({
        prompt:
          'You are an agent-assist co-pilot for a healthcare contact centre. ' +
          'Given the live conversation, return up to 3 concise suggested replies and one next-best-action.\n\n' +
          `Customer context: ${JSON.stringify(context)}\n\nConversation:\n${transcriptToText(transcript)}`,
        response_json_schema: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  text: { type: 'string' },
                  category: { type: 'string', enum: ['reply', 'kb', 'empathy', 'escalate', 'action'] },
                },
              },
            },
            nextBestAction: { type: 'string' },
          },
        },
      });
      return normalise(result, { suggestions: [], nextBestAction: '' });
    },

    /** Conversation summary + structured wrap-up notes (post-contact). */
    async summarise({ transcript = [], context = {} } = {}) {
      const result = await InvokeLLM({
        prompt:
          'Summarise this contact-centre conversation for after-call work. ' +
          'Return a 2-3 sentence summary, key disposition, and follow-up items.\n\n' +
          `Customer context: ${JSON.stringify(context)}\n\nConversation:\n${transcriptToText(transcript)}`,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            disposition: { type: 'string' },
            followUps: { type: 'array', items: { type: 'string' } },
          },
        },
      });
      return normalise(result, { summary: '', disposition: '', followUps: [] });
    },

    /** Lightweight escalation/risk cue detection for supervisors. */
    async detectRisk({ transcript = [] } = {}) {
      const result = await InvokeLLM({
        prompt:
          'Detect escalation/risk cues (distress, churn, compliance, safety) in this conversation. ' +
          'Return a risk level and short reason.\n\n' +
          transcriptToText(transcript),
        response_json_schema: {
          type: 'object',
          properties: {
            level: { type: 'string', enum: ['none', 'low', 'medium', 'high'] },
            reason: { type: 'string' },
          },
        },
      });
      return normalise(result, { level: 'none', reason: '' });
    },
  };
}

function normalise(result, fallback) {
  if (result && typeof result === 'object') return { ...fallback, ...result };
  if (typeof result === 'string') {
    try {
      return { ...fallback, ...JSON.parse(result) };
    } catch {
      return { ...fallback, summary: result };
    }
  }
  return fallback;
}

export default createBase44IqAdapter;
