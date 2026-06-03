# AWS resources & IAM to provision

The frontend cannot hold AWS credentials. Every service below runs in the
`/backend` Lambda layer behind API Gateway, except Amazon Connect Streams (CCP),
which runs client-side. Provision these per phase.

## Phase 1 (this increment) — IQ via Bedrock
**Resources**
- Enable **Amazon Bedrock** model access for your chosen model (default
  `anthropic.claude-3-5-sonnet-20240620-v1:0`) in the target region.
- Deploy `/backend` (AWS SAM): `cd backend && sam build && sam deploy --guided`.

**Lambda IAM (already in template.yaml, scope `Resource` to the model ARN in prod):**
```
bedrock:InvokeModel
```

## Phase 2 — Amazon Connect telephony + CCP
- An **Amazon Connect instance** (claim phone numbers, create queues, routing
  profiles, security profiles). Add the app origin to the instance's
  **Approved origins**.
- Frontend env: `VITE_CONNECT_INSTANCE_ARN`, `VITE_CONNECT_CCP_URL`.
- Agents authenticate to Connect directly (CCP); no extra Lambda IAM needed for
  basic CCP. For server-side admin reads:
```
connect:DescribeInstance, connect:ListQueues, connect:ListRoutingProfiles,
connect:ListSecurityProfiles, connect:DescribeContact
```

## Phase 3 — Transcription, Contact Lens, Intent
```
transcribe:StartStreamTranscription
connect:ListRealtimeContactAnalysisSegments        # Contact Lens
lex:RecognizeText, lex:RecognizeUtterance          # Lex intent
comprehend:DetectSentiment, comprehend:DetectEntities
```
- A **Lex V2 bot** (+ alias); set `VITE_LEX_BOT_ID`, `VITE_LEX_BOT_ALIAS_ID`.
- Enable **Contact Lens** on the relevant Contact Flows.

## Phase 4 — Reporting pipeline
```
kinesis:PutRecord, kinesis:PutRecords
s3:PutObject, s3:GetObject, s3:ListBucket
athena:StartQueryExecution, athena:GetQueryExecution, athena:GetQueryResults
glue:GetTable, glue:GetDatabase, glue:GetPartitions
```
- A **Kinesis Data Stream** + **Firehose** to an **S3** bucket, a **Glue**
  catalog table over the CTR data, and **Athena** workgroup. Configure Connect
  **Data streaming** (CTR + agent events) to the Kinesis stream.

## Phase 5 — Outreach, Agentic, Connectors
```
mobiletargeting:* (Pinpoint: SendMessages, CreateCampaign, CreateSegment, GetCampaignActivities)
bedrock:InvokeAgent, bedrock:CreateAgent, bedrock:CreateAgentActionGroup
bedrock:ApplyGuardrail, bedrock:CreateGuardrail
lambda:InvokeFunction                               # agent tools
secretsmanager:GetSecretValue                       # CRM OAuth tokens
```
- A **Pinpoint project** (`VITE_PINPOINT_PROJECT_ID`); verify SMS/email channels.
- **Bedrock Agents** + **Guardrails**.
- Store CRM (Salesforce/Dynamics/ServiceNow/HubSpot) OAuth creds in
  **Secrets Manager**; the connector Lambdas read them.
