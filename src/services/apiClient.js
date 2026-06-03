/**
 * Thin fetch wrapper for the AWS backend (API Gateway + Lambda).
 * All server-side AWS access (Bedrock, Lex, Transcribe, Contact Lens, Pinpoint,
 * Kinesis/Athena, Bedrock Agents) is reached through here so the UI never holds
 * IAM credentials or talks to an AWS SDK directly.
 */
import { config } from './config';

let authTokenProvider = () => undefined;

/** Allow the app (e.g. AuthContext) to supply a bearer token for API Gateway. */
export function setAuthTokenProvider(fn) {
  if (typeof fn === 'function') authTokenProvider = fn;
}

export class ApiError extends Error {
  constructor(message, { status, body } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch(path, { method = 'GET', body, signal, headers = {} } = {}) {
  if (!config.apiBaseUrl) {
    throw new ApiError('Backend not configured (VITE_API_BASE_URL missing)', { status: 0 });
  }
  const token = authTokenProvider();
  const res = await fetch(`${config.apiBaseUrl.replace(/\/$/, '')}${path}`, {
    method,
    signal,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : undefined;
  } catch {
    parsed = text;
  }

  if (!res.ok) {
    throw new ApiError(`API ${method} ${path} failed (${res.status})`, {
      status: res.status,
      body: parsed,
    });
  }
  return parsed;
}

export default apiFetch;
