# NeonNow Parity — Gap Report

_Living document. Updated per increment._

## Architecture baseline (as audited)
- **Base44 low-code React/Vite SPA.** No backend, no AWS SDK, no IaC in-repo.
- Integrations are Base44 Core: `InvokeLLM`, `SendEmail`, `SendSMS`, `UploadFile`.
- Existing contact-centre features are **UI simulations**: `SoftPhone.jsx`
  (fake timer), `interaction/` console driven by scripted `scenarios/*` +
  `demoRunner`, keyword-matched `KBSuggestions`, scripted sentiment/transcript
  in `interactionReducer`.
- **Decision:** AWS features run in a new **API Gateway + Lambda** backend
  (`/backend`, AWS SAM). Only Amazon Connect Streams (CCP) runs client-side.

## Status legend: ✅ done · 🟢 wired this phase · 🟡 partial · ❌ missing

| Area | Feature | Status | Notes |
|------|---------|--------|-------|
| CX | Connect telephony / numbers / queues / routing | ❌ | `SoftPhone` is a mock; CCP adapter seam added (P1), live in P2 |
| CX | Contact Flows / IVR editable config | ❌ | P2/P3 |
| CX | Smart routing (intent+skills+rules+priority, Lex) | ❌ | P3 |
| CX | Embedded omnichannel workspace (CCP) | 🟡 | strong UI exists; `TelephonyService` seam added (P1); CCP wiring P2 |
| CX | Governance RBAC → Connect security profiles | 🟡 | Base44 auth + `ProtectedRoute`; mapping P2 |
| IQ | Agent assist (suggested replies / NBA) | 🟢 | `IQService` live today via Base44 `InvokeLLM`; Bedrock via backend |
| IQ | Summarisation / wrap-up notes | 🟢 | `IQService.summarise` (P1); UI wiring P2 |
| IQ | Escalation / risk cues | 🟢 | `IQService.detectRisk` (P1); supervisor surface P3 |
| IQ | Real-time transcription (Transcribe) | ❌ | P3 |
| IQ | Contact Lens sentiment/categories | 🟡 | simulated UI; live P3 |
| IQ | Intent detection (Lex/Comprehend) | ❌ | P3 |
| Outreach | Bulk SMS/email (Pinpoint) | ❌ | `OutreachService` seam + single-send Base44 fallback (P1); Pinpoint P5 |
| Outreach | Segmentation/scheduling/consent/reporting | ❌ | P5 |
| Agentic | NL→Bedrock Agent builder | ❌ | `AgenticService` seam (P1); builder P5 |
| Agentic | Connectors / Guardrails / HITL | ❌ | P5 |
| Reporting | CTR→Kinesis→S3→Athena dashboards | 🟡 | mock dashboards in `Analytics.jsx`; `ReportingService` seam (P1); pipeline P4 |
| Integrations | SF/Dynamics/ServiceNow/HubSpot framework | 🟡 | connector framework + HubSpot reference adapter (P1); others P5 |

## Phase 1 delivered (this increment)
- `src/services/` service layer (the seam UI uses; never calls AWS directly):
  `config`, `apiClient`, `telephony` (mock + Connect CCP adapters), `iq`
  (Base44 + Bedrock-via-API adapters), `outreach`, `reporting`, `agentic`,
  `connectors` (framework + HubSpot reference adapter), `index` registry.
- Env-based config (`.env.example`) for Connect ARN, CCP URL, Lex IDs, Bedrock
  model, Pinpoint project, API base URL.
- `/backend` AWS SAM skeleton: HTTP API + `/health` + IQ endpoints backed by
  **Amazon Bedrock**, with per-phase IAM in `backend/IAM.md`.
- Tests: `src/services/__tests__/{config,telephony,iq}.test.js`.
- **Working today with zero AWS:** IQ assist/summarise/risk via Base44; mock
  telephony preserves existing softphone behaviour. Live AWS adapters activate
  automatically once the corresponding env vars + backend are present.

## Provisioning still required
See `backend/IAM.md` — per phase: Bedrock model access (P1), Connect instance
(P2), Transcribe/Contact Lens/Lex (P3), Kinesis/S3/Athena/Glue (P4),
Pinpoint/Bedrock Agents/Secrets Manager (P5).
