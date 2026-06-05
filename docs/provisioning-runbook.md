# Provisioning Runbook — stand up the AWS backend

Goal: deploy the backend so the **IQ (Bedrock)** and **data (DynamoDB)** features
run for real instead of mock fallbacks. ~30–45 min. Everything here is the
critical path; later phases are in `backend/IAM.md`.

> After this, the app keeps working exactly as today — but `services.iq.*` and
> `services.data.*` hit real AWS instead of the local mock.

---

## 0. Prerequisites (one-time)
- An **AWS account** + an IAM user/role you can deploy with (admin or the
  permissions in `backend/IAM.md`).
- Install tools:
  ```bash
  brew install aws-sam-cli awscli        # macOS
  aws configure                          # set access key, secret, default region (e.g. us-east-1)
  aws sts get-caller-identity            # verify you're authenticated
  ```
- Pick a region that has Bedrock + your model, e.g. **us-east-1**.

## 1. Enable the Bedrock model (console, 2 min)
1. AWS Console → **Bedrock** → *Model access* → **Manage model access**.
2. Enable **Anthropic Claude 3.5 Sonnet** (matches the default
   `VITE_BEDROCK_MODEL_ID` / `BedrockModelId`). Submit; wait for "Access granted".

## 2. Deploy the backend (SAM, 5–10 min)
```bash
cd backend
npm install
sam build
sam deploy --guided
```
At the guided prompts:
- **Stack name:** `dca-agent-portal-backend`
- **Region:** us-east-1 (same as step 1)
- **BedrockModelId:** accept default (or your enabled model id)
- Leave `ConnectInstanceArn` / `LexBotId` / etc. blank for now
- Allow SAM to create roles: **Y**; save config: **Y**

Copy the two **Outputs** when it finishes:
- `ApiBaseUrl`  → e.g. `https://abc123.execute-api.us-east-1.amazonaws.com`
- `DataTableName` → e.g. `dca-agent-portal-backend-AppDataTable-XXXX`

**Smoke test:**
```bash
curl "$API_BASE_URL/health"            # -> {"status":"ok",...}
```

## 3. Point the frontend at the backend (env vars)
Local dev — create `.env` (copy from `.env.example`) with at least:
```
VITE_API_BASE_URL=<ApiBaseUrl from step 2>
VITE_AWS_REGION=us-east-1
VITE_BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20240620-v1:0
```
Vercel (production) — set the same vars on the project:
```bash
vercel env add VITE_API_BASE_URL production      # paste ApiBaseUrl
vercel env add VITE_AWS_REGION production         # us-east-1
vercel env add VITE_BEDROCK_MODEL_ID production   # model id
vercel --prod                                      # redeploy to pick them up
```
> The service layer auto-detects these: `isConfigured.iq()` and
> `isConfigured.data()` flip to true, so the live adapters take over. No code change.

## 4. Seed the data table (DynamoDB, 5 min)
The mock seed lives in `src/data/mockPatients.js`. Load it into the `patients`
collection so `services.data.list('patients')` returns real rows:

```bash
# one row per patient; collection=partition key, id=sort key
node -e '
  import("./src/data/mockPatients.js").then(async ({ mockPatients }) => {
    const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb");
    const { DynamoDBDocumentClient, PutCommand } = await import("@aws-sdk/lib-dynamodb");
    const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" }));
    const TABLE = process.env.DATA_TABLE;
    for (const p of mockPatients) {
      await doc.send(new PutCommand({ TableName: TABLE, Item: { ...p, collection: "patients", id: String(p.id) } }));
      console.log("seeded", p.id);
    }
  });
' 
# run with:  DATA_TABLE=<DataTableName> AWS_REGION=us-east-1 node -e '...'
```
Or per-row via the API: `curl -X POST "$API_BASE_URL/data/patients" -H 'content-type: application/json' -d '{...patient...}'`.

**Verify:**
```bash
curl "$API_BASE_URL/data/patients" | jq 'length'      # -> patient count
```

## 5. Verify end-to-end
- Reload the app with the env vars set. The Agent Dashboard / patient list should
  populate from DynamoDB (identical data, now server-backed).
- Trigger an IQ call (wrap-up / suggestions). Watch the Lambda logs:
  ```bash
  sam logs --stack-name dca-agent-portal-backend --tail
  ```

---

## Cost & safety notes
- DynamoDB is **pay-per-request**; Lambda + API Gateway are pay-per-use — pennies
  at dev volume. Bedrock is per-token.
- Before prod: tighten `CorsConfiguration.AllowOrigins` in `template.yaml` to your
  app origin, scope the Bedrock IAM `Resource` to the model ARN, and add a Cognito
  authorizer (migration **M3**).
- Tear down: `sam delete --stack-name dca-agent-portal-backend`.

## What this unlocks vs. what's still mock
| Feature | After this runbook |
|---|---|
| IQ assist / summarise / risk | ✅ live (Bedrock) |
| Data layer (patients) | ✅ live (DynamoDB) |
| Telephony, transcription, intent, reporting, outreach, agentic | ⏳ still mock — need their own resources (`backend/IAM.md`, Phases 2–5) |
| Auth | ⏳ still Base44 — migration M3 (Cognito) |
