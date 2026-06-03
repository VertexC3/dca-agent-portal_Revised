/**
 * IQ handler — Amazon Bedrock (Claude) for agent assist, summarisation, and
 * risk detection. Routed from API Gateway: POST /iq/summarise | /iq/suggest | /iq/risk.
 * Mirrors the frontend IQ service interface so adapters are drop-in interchangeable.
 */
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({});
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-5-sonnet-20240620-v1:0';

const transcriptToText = (t = []) =>
  t.map((x) => `${(x.speaker || x.role || 'speaker').toUpperCase()}: ${x.text || x.content || ''}`).join('\n');

const PROMPTS = {
  '/iq/summarise': (b) =>
    `Summarise this contact-centre conversation for after-call work. Return JSON {summary, disposition, followUps[]}.\n\nContext: ${JSON.stringify(b.context || {})}\n\n${transcriptToText(b.transcript)}`,
  '/iq/suggest': (b) =>
    `You are an agent-assist co-pilot. Return JSON {suggestions:[{text,category}], nextBestAction}. Categories: reply|kb|empathy|escalate|action.\n\nContext: ${JSON.stringify(b.context || {})}\n\n${transcriptToText(b.transcript)}`,
  '/iq/risk': (b) =>
    `Detect escalation/risk cues. Return JSON {level, reason}. level: none|low|medium|high.\n\n${transcriptToText(b.transcript)}`,
};

export const handler = async (event) => {
  try {
    const path = event.rawPath || event.requestContext?.http?.path || '/iq/summarise';
    const body = event.body ? JSON.parse(event.body) : {};
    const buildPrompt = PROMPTS[path] || PROMPTS['/iq/summarise'];

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 1024,
        messages: [{ role: 'user', content: buildPrompt(body) }],
      }),
    });

    const res = await client.send(command);
    const decoded = JSON.parse(new TextDecoder().decode(res.body));
    const text = decoded?.content?.[0]?.text ?? '';

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { summary: text };
    }

    return json(200, parsed);
  } catch (err) {
    return json(500, { error: err.message });
  }
};

const json = (statusCode, payload) => ({
  statusCode,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(payload),
});
