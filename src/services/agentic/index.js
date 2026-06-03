/**
 * AgenticService — no-code agent builder. A user describes an agent in natural
 * language; the backend compiles it to a Bedrock Agent + Lambda tool definitions,
 * attaches Bedrock Guardrails, and configures human-in-the-loop escalation.
 * All compilation/deployment happens server-side (Bedrock Agents APIs).
 *
 * Interface: compile(spec); deploy(agentId); listAgents(); invoke(agentId, input)
 */
import { apiFetch } from '../apiClient';
import { isConfigured } from '../config';

export function createAgenticService() {
  const live = isConfigured.agentic();
  return {
    kind: live ? 'bedrock-agents' : 'unconfigured',
    isLive: () => live,
    async compile(spec) {
      // spec: { description, tools[], knowledgeBases[], guardrail, hitl }
      return apiFetch('/agentic/compile', { method: 'POST', body: spec });
    },
    async deploy(agentId) {
      return apiFetch(`/agentic/agents/${agentId}/deploy`, { method: 'POST' });
    },
    async listAgents() {
      return apiFetch('/agentic/agents');
    },
    async invoke(agentId, input) {
      return apiFetch(`/agentic/agents/${agentId}/invoke`, { method: 'POST', body: input });
    },
  };
}

export default createAgenticService;
