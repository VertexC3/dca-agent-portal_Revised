/**
 * Local mock IQ adapter — deterministic, dependency-free placeholder used when
 * the AWS backend (Amazon Bedrock) is not configured, e.g. local dev and tests.
 * No external service calls. Replaced transparently by the Bedrock-backed
 * `apiAdapter` once VITE_API_BASE_URL + a model are configured.
 */
const lastCustomerLine = (transcript = []) => {
  const lines = transcript.filter((t) => (t.speaker || t.role) !== 'agent');
  return (lines[lines.length - 1]?.text || lines[lines.length - 1]?.content || '').toLowerCase();
};

const RISK_TERMS = [
  { term: 'suicid', level: 'high' },
  { term: 'harm', level: 'high' },
  { term: "can't afford", level: 'medium' },
  { term: 'cancel', level: 'medium' },
  { term: 'angry', level: 'medium' },
  { term: 'frustrat', level: 'low' },
];

export function createMockIqAdapter() {
  return {
    kind: 'mock',

    async suggestReplies({ transcript = [] } = {}) {
      const text = lastCustomerLine(transcript);
      const suggestions = [];
      if (/refill|prescription|medication/.test(text)) {
        suggestions.push({ text: 'Open the prescription refill workflow.', category: 'action' });
      }
      if (/afford|copay|cost|price/.test(text)) {
        suggestions.push({ text: 'Check manufacturer copay-assistance options.', category: 'kb' });
      }
      suggestions.push({ text: 'I understand — let me help you with that right away.', category: 'empathy' });
      return {
        suggestions: suggestions.slice(0, 3),
        nextBestAction: suggestions[0]?.text || 'Acknowledge and gather more detail.',
      };
    },

    async summarise({ transcript = [] } = {}) {
      const turns = transcript.length;
      return {
        summary: turns
          ? `Conversation with ${turns} turn(s); see transcript for detail.`
          : 'No conversation captured.',
        disposition: 'unresolved',
        followUps: [],
      };
    },

    async detectRisk({ transcript = [] } = {}) {
      const text = lastCustomerLine(transcript);
      const hit = RISK_TERMS.find((r) => text.includes(r.term));
      return hit
        ? { level: hit.level, reason: `Detected cue: "${hit.term}"` }
        : { level: 'none', reason: '' };
    },
  };
}

export default createMockIqAdapter;
