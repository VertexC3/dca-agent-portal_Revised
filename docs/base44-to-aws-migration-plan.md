# Base44 → AWS Migration Plan

Goal: remove **all** Base44 dependency and run the app entirely on AWS, reusing
the `src/services/*` service layer and the `/backend` (API Gateway + Lambda)
introduced for NeonNow parity. **This is a plan only — execute on approval.**

## Audited Base44 surface (what actually couples us)
| Coupling point | File(s) | Role |
|---|---|---|
| SDK client | `src/api/base44Client.js` | `createClient` from `@base44/sdk` |
| Auth | `src/lib/AuthContext.jsx` | `createAxiosClient` from `@base44/sdk`; login/session — used in **9 files** via `useAuth` |
| Data | `src/api/entities.js` | `base44.entities.Query`, `base44.auth` (User) |
| Integrations | `src/api/integrations.js` | `InvokeLLM`, `SendEmail` (×11 refs), `SendSMS`, `UploadFile`, `GenerateImage`, `ExtractDataFromUploadedFile` |
| App params | `src/lib/app-params.js` | `app_id` / `access_token` plumbing |
| Build | `vite.config.js`, `package.json` | `@base44/vite-plugin`, `@base44/sdk` dep, legacy `@/integrations` & `@/entities` aliases |

## Target mapping (Base44 → AWS)
| Base44 capability | AWS replacement |
|---|---|
| `base44.auth` / AuthContext | **Amazon Cognito** User Pool + app client (token provider already stubbed in `apiClient.setAuthTokenProvider`) |
| `base44.entities.*` (data) | **DynamoDB** (or Aurora Serverless v2 Postgres) behind `/data/*` Lambdas |
| `InvokeLLM` | **Amazon Bedrock** (already live via `IQService` + `/iq/*`) |
| `SendEmail` | **Amazon SES** (`/integrations/email`) |
| `SendSMS` | **Amazon SNS** / Pinpoint (`/integrations/sms`) |
| `UploadFile` | **S3** presigned upload (`/integrations/upload`) |
| `GenerateImage` | **Bedrock** image model (`/integrations/image`) |
| `ExtractDataFromUploadedFile` | **Amazon Textract** / Bedrock (`/integrations/extract`) |

## Phased execution (ordered to keep the app runnable as long as possible)

### M0 — Safety net (0.5 day)
- Add regression tests around auth gate, a representative data read/write, and
  each integration call. Snapshot current behaviour before cutover.

### M1 — Data layer (3–5 days) — 🟢 STARTED
- ✅ Backend: DynamoDB table (`AppDataTable`, PK `collection` / SK `id`) +
  generic `/data/{collection}[/{id}]` CRUD Lambda (`dataCrud.mjs`) in SAM, with
  `DynamoDBCrudPolicy`.
- ✅ Frontend `src/services/data`: `DataService` seam — `apiAdapter` (DynamoDB
  via backend) + `mockAdapter` (seeded from existing app data) behind
  `isConfigured.data()`. Interface: `list/get/create/update/remove`.
- ✅ Consumer cutover: ALL shared `mockPatients` consumers now read via the
  `usePatients()` hook / `DataService` — `AgentDashboard`, `AgentPortal`,
  `OrderSearchBar`, `InteractionContext`. The only remaining direct imports are
  the mock adapter's seed and one unit test (both intentional).
- ✅ Tests: `src/services/__tests__/data.test.js` (5 cases); full suite 42 pass.
- ⏳ Remaining: deploy backend + seed-load DynamoDB from `mockPatients`; model
  nested collections (prescriptions/orders/invoices) as their own
  collections instead of nested arrays; add the API-adapter integration test
  against a live/local DynamoDB. (`FacilityPatients` uses its own inline
  dataset, not the shared one — migrate when that page is reworked.)
- IAM: `dynamodb:GetItem,PutItem,Query,UpdateItem,DeleteItem,Scan` on the table
  ARN (covered by `DynamoDBCrudPolicy`).

### M2 — Integrations cutover (2–3 days)
- Backend Lambdas: SES email, SNS SMS, S3 presigned upload, Bedrock image,
  Textract extract. Route through `src/services` (IQ/Bedrock already done).
- Replace `@/api/integrations` usages with the new services.
- IAM: `ses:SendEmail`, `sns:Publish`, `s3:PutObject/GetObject`,
  `bedrock:InvokeModel`, `textract:AnalyzeDocument`.

### M3 — Auth cutover (3–4 days) — highest risk
- Provision **Cognito** User Pool + app client (+ hosted UI or custom screens).
- Rewrite `AuthContext.jsx` against Cognito (Amplify Auth or
  `amazon-cognito-identity-js`); keep the `useAuth()` contract identical so the
  9 consuming files are unchanged.
- Wire Cognito access token into `apiClient.setAuthTokenProvider`; add a Lambda
  authorizer on API Gateway. Map Cognito groups → roles → **Connect security
  profiles** (converges with CX governance, Phase 2).

### M4 — Decommission Base44 (1 day)
- Remove `@base44/sdk` + `@base44/vite-plugin` from `package.json`; drop the
  plugin and legacy aliases from `vite.config.js`.
- Delete `base44Client.js`, `entities.js`, `integrations.js`; strip Base44 bits
  from `app-params.js` and `.env.example`. Update Vercel env vars.
- Grep gate in CI: fail build if `base44` reappears.

### M5 — Data migration & verification (2–3 days)
- Export existing Base44 entity data; transform + bulk-load into DynamoDB.
- Full regression (auth, data, integrations, NeonNow features). Parallel-run
  before flipping `VITE_API_BASE_URL` to production.

## Risk & rollback
- **M3 (auth)** is the breaking step — do it behind a feature flag / on a branch;
  keep Base44 auth importable until Cognito is verified, then remove in M4.
- Every phase ships behind the service layer with a mock fallback, so `main`
  stays deployable until M4. Rollback = revert the phase commit + restore env var.
- **Rough effort: ~12–18 working days.** Sequencing assumes AWS resources are
  provisioned per `backend/IAM.md` plus Cognito (M3) and DynamoDB/SES/SNS/S3/
  Textract (M1–M2).

## Provisioning checklist (new vs `backend/IAM.md`)
- Cognito User Pool + App Client + (optional) Hosted UI domain.
- DynamoDB table(s) (or Aurora Serverless v2).
- SES (verified domain/identity, out of sandbox for prod), SNS SMS spend limit.
- S3 bucket for uploads (CORS + presign), Textract enabled in region.
- API Gateway **Lambda authorizer** bound to the Cognito pool.
