# DCA Agent Portal — AWS backend

API Gateway + Lambda layer that fronts all server-side AWS access for the
NeonNow-parity feature set. The Vite frontend calls this via `VITE_API_BASE_URL`
through `src/services/*`; it never talks to an AWS SDK or holds IAM credentials.

## Stack
- **AWS SAM** (`template.yaml`) → HTTP API Gateway + Node.js 20 Lambdas (arm64).
- Phase 1 ships `/health` and the IQ endpoints (`/iq/summarise`, `/iq/suggest`,
  `/iq/risk`) backed by **Amazon Bedrock**.

## Deploy
```bash
cd backend
npm install
sam build
sam deploy --guided     # set BedrockModelId, ConnectInstanceArn, etc.
```
Copy the `ApiBaseUrl` output into the frontend's `VITE_API_BASE_URL`.

## Endpoints (current + planned)
| Path | Phase | AWS service |
|------|-------|-------------|
| `GET /health` | 1 | — |
| `POST /iq/{summarise,suggest,risk}` | 1 | Bedrock |
| `GET /connect/{queues,routing-profiles}` | 2 | Amazon Connect |
| `POST /iq/transcribe`, `GET /iq/contact-lens` | 3 | Transcribe, Contact Lens |
| `POST /intent/detect` | 3 | Lex / Comprehend |
| `GET /reporting/realtime`, `POST /reporting/query` | 4 | Kinesis/S3/Athena |
| `POST /outreach/*` | 5 | Pinpoint |
| `POST /agentic/*` | 5 | Bedrock Agents + Guardrails |
| `POST /connectors/{crm}/*` | 5 | Secrets Manager + CRM APIs |

See [IAM.md](./IAM.md) for the exact permissions and resources to provision per phase.
