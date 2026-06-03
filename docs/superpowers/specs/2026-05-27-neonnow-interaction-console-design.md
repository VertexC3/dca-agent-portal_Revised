# NeonNow-style Interaction Console for the DCA Patient Portal

**Date:** 2026-05-27
**Status:** Design approved, ready for implementation plan
**Scope:** v1, mock + scripted demo only

## Summary

Add a contact-center-rep "live interaction" layer to the existing patient-selected view of `AgentPortal.jsx`. When an interaction is active (inbound voice, outbound voice, chat/SMS, or scheduled task), the UI grows two new columns — a **Task Queue rail** on the left and an **Interaction Console** in the center — and adds an **AI Co-pilot region** at the top of the existing right panel. The existing `AgentWorkspaceTabs` and the rest of `AgentRightPanel` stay accessible to the rep on the right, compressed but functional, so they can pull up prescriptions / orders / communications mid-call.

The feature is implemented as a mock-only, scripted-demo layer. A central `InteractionContext` holds all live state and is driven by a `demoRunner` that plays back scenario scripts. No real telephony, STT, or LLM in v1; the architecture is shaped so those can be plugged in later by swapping the runner and the setters.

## Goals

- Demonstrate a NeonNow-equivalent agent experience on top of the existing DCA agent portal.
- Cover four interaction types: inbound voice, outbound voice, chat/SMS, scheduled task.
- Keep all existing DCA workflows (refill, shipment, payment) reachable mid-interaction.
- Match DCA brand: deep crimson `#8B1F1F` (from the DCA Pharmacy logo) as the AI accent.
- Be entirely demo-driven via scripted scenarios; ship five.

## Non-goals (v1)

- Real telephony integration (Twilio, Vonage, etc.).
- Real speech-to-text.
- Real LLM-generated suggestions.
- Backend persistence (wrap-up appends to in-memory mock data only).
- Multi-rep / supervisor views.

## Architecture

### File layout

```
src/components/agent/interaction/
  InteractionContext.jsx          // <InteractionProvider/>, useInteraction()
  demoRunner.js                   // timer engine, step helpers
  scenarios/
    refill-inbound.js
    payment-followup-outbound.js
    chat-side-effect.js
    distress-call.js
    callback-task.js
  TaskQueueRail.jsx
  InteractionConsole.jsx          // header + transcript + auto-notes
  ConsoleHeader.jsx               // timer, recording, wrap-up, controls
  TranscriptStream.jsx            // polymorphic: voice transcript or chat thread
  AutoNotesPanel.jsx
  AICopilotPanel.jsx              // intent tags + sentiment + suggestion cards
  SuggestionCard.jsx
  FloatingAIWindow.jsx            // wraps existing DraggablePanel
  WrapUpModal.jsx
  SimulateInteractionMenu.jsx     // dev-only trigger in top bar
```

### Wiring in `src/pages/AgentPortal.jsx`

- Wrap the patient-selected branch (currently `AgentPortal.jsx:152+`) in `<InteractionProvider patient={selectedPatient}>`.
- Add a `SimulateInteractionMenu` button to the top bar next to "Hide Messages", visible only when `import.meta.env.DEV`.
- When `interaction.isActive`, change the layout to three regions:
  ```
  [ TaskQueueRail (220px fixed)
  | InteractionConsole (resizable, default 560px, range 480–700)
  | <existing>: WorkspaceTabs + ResizeDivider + RightPanel (with AICopilotPanel prepended)
  ]
  ```
- The existing `middleW` and `panelSwapped` state controls the cluster on the right; a new `consoleW` controls the InteractionConsole width.
- An active DCA workflow (refill / shipment / payment) replaces `InteractionConsole` in the center exactly the way it currently replaces `WorkspaceTabs` (`AgentPortal.jsx:156`).

## Data model

`useInteraction()` returns:

```js
{
  interaction: null | {
    id, type: "voice-in"|"voice-out"|"chat"|"task",
    status: "ringing"|"connected"|"on-hold"|"wrapping-up"|"ended",
    startedAt, connectedAt, endedAt,
    patient,                       // a mockPatients entry
    queue, direction,
    recording: { state: "recording"|"paused"|"stopped" },
    intentTags: string[],
    wrapUpCode: null | string,
  },
  transcript: Array<{ id, t, speaker: "patient"|"agent", text, partial? }>,
  chatThread: Array<{ id, t, from, text, status }>,
  autoNotes: Array<{ id, text, source: "ai"|"agent", confirmed: boolean }>,
  suggestions: Array<{ id, text, category: "action"|"empathy"|"escalate"|"kb",
                       kbLink?, feedback: null|"up"|"down", copied: boolean }>,
  sentiment: { score: -1..1, label: "calm"|"neutral"|"frustrated"|"distress",
               trend: "improving"|"steady"|"declining" },
  taskQueue: Array<{ id, type, label, subLabel, eta?, ageSeconds, patientId? }>,
  actions: {
    startInteraction(scenarioId, patientId?),
    answer(), hold(), resume(), mute(), unmute(),
    transferTo(target), addParticipant(target),
    hangup(),
    setWrapUpCode(code), saveWrapUp(notes),
    confirmNote(noteId), editNote(noteId, text),
    sendSuggestion(suggestionId),
    rateSuggestion(suggestionId, "up"|"down"),
    sendChat(text),
    pickTask(taskId), pinTask(taskId),
  }
}
```

### Persistence

On `saveWrapUp`, append a synthetic entry to `selectedPatient.communications` matching the shape of existing entries (type, summary, timestamp, agent, disposition). This makes the interaction appear immediately in the Communications tab of `AgentWorkspaceTabs` and in the Recent Activity table of `AgentRightPanel`. All state lives in memory; no backend.

## UX flow

### Idle (no interaction)
AgentPortal looks exactly like today. Top bar gains a "📞 Simulate" dropdown (dev only) listing the five scenarios + "Stop all".

### Ringing (~1–2 s on inbound demo)
- Top of `TaskQueueRail` shows the incoming task pulsing red: "Incoming · Refill Support · 0:02".
- `InteractionConsole` slides in next to it showing a centered "Answer / Decline" card with patient name, queue, intent guess.
- Existing right cluster compresses but stays visible.

### Connected
Three regions render side by side:

```
┌─────────────┬────────────────────────────┬──────────────────────────────┐
│ TaskQueue   │ InteractionConsole         │  AICopilotPanel (top)        │
│ Rail        │  ConsoleHeader             │  intent chips · sentiment    │
│             │   timer · rec · ctrls      │  suggestion cards            │
│ Current     │   wrap-up code ▾           │  ── divider ──               │
│ Other Tasks │  TranscriptStream          │  Existing WorkspaceTabs +    │
│             │   (voice or chat)          │  ResizeDivider + RightPanel  │
│             │  AutoNotesPanel            │  (compressed, scrollable)    │
└─────────────┴────────────────────────────┴──────────────────────────────┘
   220px        resizable 480–700px         flex remainder
```

Key placement decisions:
- **AI Co-pilot is not a separate column.** It docks at the top of the existing right cluster so the rep keeps quick access to Prescriptions / Orders / Communications.
- **AttachedData strip** (phone, intent chips, sentiment bar) sits above the AI Co-pilot cards inside the same docked region.
- **FloatingAIWindow** is opt-in via a "Pop out" button in the AI Co-pilot header; uses the existing `DraggablePanel`.

### Sentiment escalation
When `sentiment.label === "distress"`, `AICopilotPanel` grows a red ribbon at top: "⚠ Customer distress detected" with a one-tap "Escalate to supervisor" action. Same condition causes the scenario to append an "Escalate / offer emergency support" suggestion card.

### Switching tasks
v1: only one interaction can be `connected` at a time. Clicking another task in `TaskQueueRail` **parks** the current one (`status: on-hold`, recording paused, scenario clock paused) and brings up the new one. Returning to the parked task resumes the scenario from where it left off.

### Wrap-up
Hangup → `status: wrapping-up` → `WrapUpModal` opens centered over everything:
- Wrap-up code is required (Refill · Billing · Clinical · Other).
- Editable auto-notes pre-filled; rep confirms/edits.
- "Save & next task" appends to `patient.communications`, pulls next item from `taskQueue`, returns to idle (or ringing if there is one).

## Demo runner

`demoRunner.js` is a single timer loop owned by `InteractionProvider`. Each scenario exports:

```js
export default {
  id: "refill-inbound",
  label: "Inbound: Lisinopril refill",
  type: "voice-in",
  patientId: "p_001",
  script: [
    { at: 0,     do: ctx => ctx.setStatus("ringing") },
    { at: 1800,  do: ctx => ctx.setStatus("connected") },
    { at: 2200,  do: ctx => ctx.transcriptLine("patient", "Hi, I'm calling about my Lisinopril refill...") },
    ...
  ],
};
```

Step helpers (consumed inside `do`): `transcriptLine`, `chatMessage`, `addSuggestion`, `addAutoNote`, `confirmNote`, `setSentiment`, `addIntentTag`, `enqueueTask`. `actions.hangup()` clears pending timers; `pickTask()` to a different task pauses the active scenario clock.

### Scenarios (v1, ship all five)

1. **`refill-inbound`** — Patient calls about Lisinopril refill; insurance changed to BCBS. Suggestions deep-link to `PrescriberProfileDialog` and `PrescriptionRefillWorkflow`. Sentiment: neutral → calm. Happy path.
2. **`payment-followup-outbound`** — Rep dials about $187 balance. Suggestion "Offer 3-month payment plan" deep-links to `PaymentWorkflow`. Sentiment: neutral → frustrated → calm.
3. **`chat-side-effect`** — SMS thread; patient reports dizziness on Metoprolol. `TranscriptStream` renders chat. Suggestions: escalate to pharmacist on-call, open `MedicalGuideDialog`. Sentiment: concerned.
4. **`distress-call`** — Inbound voice; patient out of insulin and can't afford copay. Sentiment progresses calm → frustrated → **distress**, triggering the red ribbon and an "Escalate to supervisor" suggestion.
5. **`callback-task`** — Pure `type: "task"`. Console shows scheduled callback at 3:00 PM with prior interaction summary and recommended script bullets. "Start call" converts to `voice-out` mid-scenario.

### Background ambience
On any scenario start, the runner drips 1–2 background entries into Other Tasks over 30 s (Connected Chat 0:30, Outbound Preview Hot Leads 0:30, Scheduled Reminder 0:30) so the rail feels lived-in.

### Trigger UI
`SimulateInteractionMenu` is a top-bar dropdown listing the five scenarios + "Stop all". Hidden in production via `import.meta.env.DEV`.

## Visual design

### Color
- **AI surfaces:** `bg-[#8B1F1F]/5`, `border-l-2 border-[#8B1F1F]`, crimson sparkle/dot icon. Same crimson as the DCA Pharmacy logo and as the rest of the existing UI.
- **Live / recording:** red-600 pulse (universal, kept distinct from brand crimson).
- **Distress ribbon:** red-600 on red-50, `role="alert"`.
- **Intent chips:** gray-100/gray-700 default; crimson tint for clinical; amber for billing.
- **Task queue active item:** light crimson tint matching existing selection style in `AgentPortal.jsx`.

### Typography & density
Match existing DCA conventions: `text-xs` labels, `text-sm` body, `font-semibold` emphasis, `uppercase tracking-wide` for section headers (see `AgentPortal.jsx:108`). No new fonts.

### Primitives
Use existing shadcn primitives already in `package.json` (`Select`, `Button`, `Dialog`, `ScrollArea`, `Tooltip`, `DropdownMenu`). `FloatingAIWindow` wraps the existing `DraggablePanel` rather than introducing a new drag library.

### Icons (lucide-react, already a dependency)
- Tasks: `Phone`, `MessageSquare`, `BellRing`, `ArrowUpRight`
- Console: `Mic`, `MicOff`, `Pause`, `Play`, `PhoneOff`, `UserPlus`, `Grid3x3`, `PhoneForwarded`
- AI: `Sparkles`, `Copy`, `ThumbsUp`, `ThumbsDown`, `ExternalLink`
- Sentiment: `Smile`, `Meh`, `Frown`, `AlertTriangle`

### Motion
- `animate-pulse` on incoming task.
- Partial transcript line fades to committed line (~150 ms opacity).
- Suggestion cards fade-in on append (~150 ms).
- No layout-shifting animations during the connected state.

### Accessibility
- All controls keyboard reachable.
- `aria-live="polite"` on recording state, sentiment label, new suggestions.
- Distress ribbon uses `role="alert"`.
- Color is never the sole signal — icons + labels accompany every colored state.

### Responsive
- < 1280 px: existing right cluster collapses behind the InteractionConsole; only the AI panel remains.
- < 1024 px: `TaskQueueRail` collapses to a 56 px icon strip.

## Integration with existing DCA features

### Suggestion cards deep-link into existing components
- "Process refill for &lt;Rx&gt;" → `onStartWorkflow('refill', { selectedRx })` → existing `PrescriptionRefillWorkflow` takes over the center pane, exactly the way it replaces `AgentWorkspaceTabs` today (`AgentPortal.jsx:156`).
- "Update shipment ETA" → `onStartWorkflow('shipment', { selectedOrder })`.
- "Offer 3-month payment plan" → `onStartWorkflow('payment', { cartTotal })`.
- "Open prescriber profile" → opens existing `PrescriberProfileDialog`.
- "Show medication guide" → opens existing `MedicalGuideDialog`.
- "View fill history" → opens existing `FillHistoryDialog`.

### Auto-notes write into the communications log
On `saveWrapUp`, append a new entry to `selectedPatient.communications` shaped like existing entries (type, summary, timestamp, agent, disposition = wrap-up code). It appears immediately in the Communications tab and Recent Activity table.

### Family / order context
- If `selectedPatient.familyMembers` exists, surface a suggestion to verify caregiver authorization, deep-linking to `FamilyMemberBar`.
- If transcript mentions an order ID, surface "Open order #X" using the existing `OrderSearchBar` selection flow.

### Coach marks
On first-ever live interaction (localStorage flag `interactionCoachComplete`), add two new steps to the existing `CoachMarks` pointing at `TaskQueueRail` and `AICopilotPanel`. Reuse the trigger pattern at `AgentPortal.jsx:86-92`.

### InlineMessageBox
- Hidden when the active interaction is `type: chat` (the chat surface is now primary).
- Unchanged for voice/task interactions.

## Open questions / future hooks

- Real telephony integration: swap `demoRunner` for a CTI bridge; `actions` become RPCs.
- Real STT: replace scripted `transcriptLine` calls with a transcription stream consumer.
- Real LLM: replace scripted `addSuggestion` with an LLM call seeded by `{ patient, transcript, intentTags }`.
- Backend persistence: `saveWrapUp` writes to a real communications endpoint.
- Supervisor view + barge-in: out of scope for v1.

## Testing approach (for the implementation plan to expand)

- Unit: scenario step helpers, reducer transitions (ringing → connected → wrapping-up → ended), `pickTask` parking logic.
- Component: `SuggestionCard` interactions (copy, rate, deep-link); `WrapUpModal` validation; `TranscriptStream` polymorphism (voice vs chat).
- Integration: kick off each of the five scenarios via `SimulateInteractionMenu`, advance timers with fake timers, assert resulting state and that an entry lands in `patient.communications` on wrap-up.
- Manual: walk through each scenario in dev and screenshot at key states.
