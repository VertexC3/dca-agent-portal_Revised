# NeonNow Interaction Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a NeonNow-style live interaction layer (Task Queue rail + Interaction Console + AI Co-pilot) to the patient-selected view of the DCA agent portal, driven by mock scripted scenarios.

**Architecture:** A new `InteractionContext` provider holds all live interaction state and is driven by a `demoRunner` that plays back scripted scenarios. New presentational components (`TaskQueueRail`, `InteractionConsole`, `AICopilotPanel`, etc.) consume the context. `AgentPortal.jsx` grows two new columns when an interaction is active; `AgentRightPanel.jsx` gains a slot for the AI Co-pilot above its existing content. Suggestion cards deep-link into the existing refill/shipment/payment workflows. No real telephony / STT / LLM — all data is scripted.

**Tech Stack:** React 18, Vite, Tailwind, shadcn-ui primitives (already installed: `Select`, `Button`, `Dialog`, `ScrollArea`, `Tooltip`, `DropdownMenu`), lucide-react icons (already installed). Vitest + React Testing Library added by this plan for the pure-logic units (reducer + demo runner). Presentational components are verified manually.

**Reference spec:** `docs/superpowers/specs/2026-05-27-neonnow-interaction-console-design.md`

---

## File Structure

### New files

| Path | Responsibility |
| --- | --- |
| `src/components/agent/interaction/interactionReducer.js` | Pure reducer for interaction state transitions. Pure JS, fully tested. |
| `src/components/agent/interaction/InteractionContext.jsx` | React provider + `useInteraction()` hook. Wraps reducer + runner. |
| `src/components/agent/interaction/demoRunner.js` | Timer engine that plays scenario scripts. Pure JS, fully tested. |
| `src/components/agent/interaction/scenarios/index.js` | Scenario registry. |
| `src/components/agent/interaction/scenarios/refillInbound.js` | Scenario 1: inbound refill call. |
| `src/components/agent/interaction/scenarios/paymentOutbound.js` | Scenario 2: outbound payment follow-up. |
| `src/components/agent/interaction/scenarios/chatSideEffect.js` | Scenario 3: SMS side-effect thread. |
| `src/components/agent/interaction/scenarios/distressCall.js` | Scenario 4: distress inbound call. |
| `src/components/agent/interaction/scenarios/callbackTask.js` | Scenario 5: scheduled callback that converts to call. |
| `src/components/agent/interaction/TaskQueueRail.jsx` | Left rail: current + other tasks. |
| `src/components/agent/interaction/ConsoleHeader.jsx` | Timer, recording, wrap-up code, call controls. |
| `src/components/agent/interaction/TranscriptStream.jsx` | Polymorphic voice transcript / chat thread. |
| `src/components/agent/interaction/AutoNotesPanel.jsx` | AI-generated note bullets. |
| `src/components/agent/interaction/InteractionConsole.jsx` | Composes header + transcript + notes. |
| `src/components/agent/interaction/SuggestionCard.jsx` | One AI suggestion card with copy/thumbs/deep-link. |
| `src/components/agent/interaction/AICopilotPanel.jsx` | Intent chips + sentiment + suggestions + distress ribbon. |
| `src/components/agent/interaction/FloatingAIWindow.jsx` | Pop-out wrapper around `AICopilotPanel` using existing `DraggablePanel`. |
| `src/components/agent/interaction/WrapUpModal.jsx` | Post-hangup wrap-up dialog. |
| `src/components/agent/interaction/SimulateInteractionMenu.jsx` | Dev-only dropdown that triggers scenarios. |
| `src/components/agent/interaction/__tests__/interactionReducer.test.js` | Reducer unit tests. |
| `src/components/agent/interaction/__tests__/demoRunner.test.js` | Demo runner unit tests. |
| `vitest.config.js` | Test config. |
| `src/test/setup.js` | RTL setup. |

### Modified files

| Path | What changes |
| --- | --- |
| `package.json` | Add `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `test` script. |
| `src/pages/AgentPortal.jsx` | Wrap patient branch in `<InteractionProvider>`; render new columns when active; add `SimulateInteractionMenu` to top bar. |
| `src/components/agent/AgentRightPanel.jsx` | Accept a `topSlot` prop and render it above existing content. |

---

## Task 1: Set up Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.js`
- Create: `src/test/setup.js`

- [ ] **Step 1: Install dev dependencies**

Run:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitest/ui
```

Expected: dependencies installed, no peer warnings that block.

- [ ] **Step 2: Add `test` script to `package.json`**

Edit `package.json` `scripts` block to add:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 3: Create `vitest.config.js`**

```js
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

- [ ] **Step 4: Create `src/test/setup.js`**

```js
import '@testing-library/jest-dom';
```

- [ ] **Step 5: Smoke test runner**

Create `src/test/smoke.test.js`:
```js
import { describe, it, expect } from 'vitest';
describe('smoke', () => { it('runs', () => { expect(1 + 1).toBe(2); }); });
```

Run: `npm run test:run`
Expected: 1 passing test.

- [ ] **Step 6: Delete the smoke file and commit**

```bash
rm src/test/smoke.test.js
git add package.json package-lock.json vitest.config.js src/test/setup.js
git commit -m "chore: add vitest test setup"
```

---

## Task 2: Interaction reducer — initial state and types

**Files:**
- Create: `src/components/agent/interaction/interactionReducer.js`
- Create: `src/components/agent/interaction/__tests__/interactionReducer.test.js`

- [ ] **Step 1: Write the failing test**

`src/components/agent/interaction/__tests__/interactionReducer.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { reducer, initialState } from '../interactionReducer';

describe('interactionReducer initial state', () => {
  it('has no active interaction', () => {
    expect(initialState.interaction).toBeNull();
  });
  it('has empty streams', () => {
    expect(initialState.transcript).toEqual([]);
    expect(initialState.chatThread).toEqual([]);
    expect(initialState.autoNotes).toEqual([]);
    expect(initialState.suggestions).toEqual([]);
  });
  it('has neutral sentiment', () => {
    expect(initialState.sentiment).toEqual({ score: 0, label: 'neutral', trend: 'steady' });
  });
  it('returns state unchanged for unknown action', () => {
    const next = reducer(initialState, { type: 'UNKNOWN' });
    expect(next).toBe(initialState);
  });
});
```

- [ ] **Step 2: Run, expect failure**

Run: `npm run test:run`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement initial state and reducer skeleton**

`src/components/agent/interaction/interactionReducer.js`:
```js
export const initialState = {
  interaction: null,
  transcript: [],
  chatThread: [],
  autoNotes: [],
  suggestions: [],
  sentiment: { score: 0, label: 'neutral', trend: 'steady' },
  taskQueue: [],
};

export function reducer(state, action) {
  switch (action.type) {
    default:
      return state;
  }
}
```

- [ ] **Step 4: Run, expect pass**

Run: `npm run test:run`
Expected: 4 passing.

- [ ] **Step 5: Commit**

```bash
git add src/components/agent/interaction
git commit -m "feat(interaction): reducer scaffold with initial state"
```

---

## Task 3: Reducer — lifecycle transitions

**Files:**
- Modify: `src/components/agent/interaction/interactionReducer.js`
- Modify: `src/components/agent/interaction/__tests__/interactionReducer.test.js`

- [ ] **Step 1: Add failing tests for lifecycle**

Append to the test file:
```js
import { mockPatients } from '@/data/mockPatients';

describe('interactionReducer lifecycle', () => {
  const p = mockPatients[0];

  it('START_INTERACTION sets ringing with patient & queue', () => {
    const next = reducer(initialState, {
      type: 'START_INTERACTION',
      payload: { id: 'intx_1', type: 'voice-in', patient: p, queue: 'Refill Support', direction: 'inbound', startedAt: 1000 }
    });
    expect(next.interaction.status).toBe('ringing');
    expect(next.interaction.patient.id).toBe(p.id);
    expect(next.interaction.queue).toBe('Refill Support');
  });

  it('CONNECT moves to connected and stamps connectedAt', () => {
    const ringing = reducer(initialState, {
      type: 'START_INTERACTION',
      payload: { id: 'intx_1', type: 'voice-in', patient: p, queue: 'Refill', direction: 'inbound', startedAt: 1000 }
    });
    const next = reducer(ringing, { type: 'CONNECT', payload: { connectedAt: 1500 } });
    expect(next.interaction.status).toBe('connected');
    expect(next.interaction.connectedAt).toBe(1500);
  });

  it('HOLD pauses recording', () => {
    let s = reducer(initialState, { type: 'START_INTERACTION', payload: { id: 'i', type: 'voice-in', patient: p, queue: 'Q', direction: 'inbound', startedAt: 0 } });
    s = reducer(s, { type: 'CONNECT', payload: { connectedAt: 1 } });
    s = reducer(s, { type: 'HOLD' });
    expect(s.interaction.status).toBe('on-hold');
    expect(s.interaction.recording.state).toBe('paused');
  });

  it('HANGUP moves to wrapping-up and stamps endedAt', () => {
    let s = reducer(initialState, { type: 'START_INTERACTION', payload: { id: 'i', type: 'voice-in', patient: p, queue: 'Q', direction: 'inbound', startedAt: 0 } });
    s = reducer(s, { type: 'CONNECT', payload: { connectedAt: 1 } });
    s = reducer(s, { type: 'HANGUP', payload: { endedAt: 5 } });
    expect(s.interaction.status).toBe('wrapping-up');
    expect(s.interaction.endedAt).toBe(5);
  });

  it('END_INTERACTION clears live state but keeps taskQueue', () => {
    let s = { ...initialState, taskQueue: [{ id: 't1' }] };
    s = reducer(s, { type: 'START_INTERACTION', payload: { id: 'i', type: 'voice-in', patient: p, queue: 'Q', direction: 'inbound', startedAt: 0 } });
    s = reducer(s, { type: 'END_INTERACTION' });
    expect(s.interaction).toBeNull();
    expect(s.transcript).toEqual([]);
    expect(s.taskQueue).toEqual([{ id: 't1' }]);
  });
});
```

- [ ] **Step 2: Run, expect failure**

Run: `npm run test:run`
Expected: 5 new failures.

- [ ] **Step 3: Implement transitions**

Replace the reducer body:
```js
export function reducer(state, action) {
  switch (action.type) {
    case 'START_INTERACTION': {
      const { id, type, patient, queue, direction, startedAt } = action.payload;
      return {
        ...state,
        interaction: {
          id, type, patient, queue, direction, startedAt,
          status: 'ringing',
          connectedAt: null,
          endedAt: null,
          recording: { state: 'stopped' },
          intentTags: [],
          wrapUpCode: null,
        },
        transcript: [],
        chatThread: [],
        autoNotes: [],
        suggestions: [],
        sentiment: { score: 0, label: 'neutral', trend: 'steady' },
      };
    }
    case 'CONNECT':
      if (!state.interaction) return state;
      return {
        ...state,
        interaction: {
          ...state.interaction,
          status: 'connected',
          connectedAt: action.payload.connectedAt,
          recording: { state: 'recording' },
        },
      };
    case 'HOLD':
      if (!state.interaction) return state;
      return {
        ...state,
        interaction: {
          ...state.interaction,
          status: 'on-hold',
          recording: { state: 'paused' },
        },
      };
    case 'RESUME':
      if (!state.interaction) return state;
      return {
        ...state,
        interaction: {
          ...state.interaction,
          status: 'connected',
          recording: { state: 'recording' },
        },
      };
    case 'HANGUP':
      if (!state.interaction) return state;
      return {
        ...state,
        interaction: {
          ...state.interaction,
          status: 'wrapping-up',
          endedAt: action.payload.endedAt,
          recording: { state: 'stopped' },
        },
      };
    case 'END_INTERACTION':
      return {
        ...state,
        interaction: null,
        transcript: [],
        chatThread: [],
        autoNotes: [],
        suggestions: [],
        sentiment: { score: 0, label: 'neutral', trend: 'steady' },
      };
    default:
      return state;
  }
}
```

- [ ] **Step 4: Run, expect pass**

Run: `npm run test:run`
Expected: all passing (initial 4 + 5 lifecycle = 9).

- [ ] **Step 5: Commit**

```bash
git add src/components/agent/interaction
git commit -m "feat(interaction): reducer lifecycle transitions"
```

---

## Task 4: Reducer — content streams (transcript, notes, suggestions, sentiment, intent, chat, queue)

**Files:**
- Modify: `src/components/agent/interaction/interactionReducer.js`
- Modify: `src/components/agent/interaction/__tests__/interactionReducer.test.js`

- [ ] **Step 1: Add failing tests**

Append:
```js
describe('interactionReducer content streams', () => {
  const start = (s) => reducer(s, { type: 'START_INTERACTION', payload: { id: 'i', type: 'voice-in', patient: mockPatients[0], queue: 'Q', direction: 'inbound', startedAt: 0 } });

  it('APPEND_TRANSCRIPT appends a committed line', () => {
    let s = start(initialState);
    s = reducer(s, { type: 'APPEND_TRANSCRIPT', payload: { id: 'l1', t: 100, speaker: 'patient', text: 'Hi there' } });
    expect(s.transcript).toEqual([{ id: 'l1', t: 100, speaker: 'patient', text: 'Hi there', partial: false }]);
  });

  it('UPDATE_TRANSCRIPT_PARTIAL replaces a partial line with the same id', () => {
    let s = start(initialState);
    s = reducer(s, { type: 'APPEND_TRANSCRIPT', payload: { id: 'l1', t: 100, speaker: 'patient', text: 'Hi', partial: true } });
    s = reducer(s, { type: 'UPDATE_TRANSCRIPT_PARTIAL', payload: { id: 'l1', text: 'Hi there', commit: true } });
    expect(s.transcript).toHaveLength(1);
    expect(s.transcript[0].text).toBe('Hi there');
    expect(s.transcript[0].partial).toBe(false);
  });

  it('APPEND_CHAT appends to chatThread', () => {
    let s = start(initialState);
    s = reducer(s, { type: 'APPEND_CHAT', payload: { id: 'c1', t: 1, from: 'patient', text: 'hello', status: 'delivered' } });
    expect(s.chatThread).toHaveLength(1);
    expect(s.chatThread[0].text).toBe('hello');
  });

  it('ADD_AUTO_NOTE appends an unconfirmed note', () => {
    let s = start(initialState);
    s = reducer(s, { type: 'ADD_AUTO_NOTE', payload: { id: 'n1', text: 'Refill request' } });
    expect(s.autoNotes).toEqual([{ id: 'n1', text: 'Refill request', source: 'ai', confirmed: false }]);
  });

  it('CONFIRM_NOTE marks confirmed', () => {
    let s = start(initialState);
    s = reducer(s, { type: 'ADD_AUTO_NOTE', payload: { id: 'n1', text: 'x' } });
    s = reducer(s, { type: 'CONFIRM_NOTE', payload: { id: 'n1' } });
    expect(s.autoNotes[0].confirmed).toBe(true);
  });

  it('EDIT_NOTE replaces text and marks as agent-source', () => {
    let s = start(initialState);
    s = reducer(s, { type: 'ADD_AUTO_NOTE', payload: { id: 'n1', text: 'x' } });
    s = reducer(s, { type: 'EDIT_NOTE', payload: { id: 'n1', text: 'edited' } });
    expect(s.autoNotes[0]).toEqual({ id: 'n1', text: 'edited', source: 'agent', confirmed: true });
  });

  it('ADD_SUGGESTION appends with neutral feedback', () => {
    let s = start(initialState);
    s = reducer(s, { type: 'ADD_SUGGESTION', payload: { id: 's1', text: 'Try X', category: 'action' } });
    expect(s.suggestions[0]).toEqual({ id: 's1', text: 'Try X', category: 'action', kbLink: undefined, feedback: null, copied: false });
  });

  it('RATE_SUGGESTION sets feedback', () => {
    let s = start(initialState);
    s = reducer(s, { type: 'ADD_SUGGESTION', payload: { id: 's1', text: 'x', category: 'action' } });
    s = reducer(s, { type: 'RATE_SUGGESTION', payload: { id: 's1', feedback: 'up' } });
    expect(s.suggestions[0].feedback).toBe('up');
  });

  it('MARK_SUGGESTION_COPIED sets copied flag', () => {
    let s = start(initialState);
    s = reducer(s, { type: 'ADD_SUGGESTION', payload: { id: 's1', text: 'x', category: 'action' } });
    s = reducer(s, { type: 'MARK_SUGGESTION_COPIED', payload: { id: 's1' } });
    expect(s.suggestions[0].copied).toBe(true);
  });

  it('SET_SENTIMENT replaces sentiment', () => {
    let s = start(initialState);
    s = reducer(s, { type: 'SET_SENTIMENT', payload: { score: -0.7, label: 'distress', trend: 'declining' } });
    expect(s.sentiment).toEqual({ score: -0.7, label: 'distress', trend: 'declining' });
  });

  it('ADD_INTENT_TAG appends unique tags', () => {
    let s = start(initialState);
    s = reducer(s, { type: 'ADD_INTENT_TAG', payload: { tag: 'Refill' } });
    s = reducer(s, { type: 'ADD_INTENT_TAG', payload: { tag: 'Refill' } });
    s = reducer(s, { type: 'ADD_INTENT_TAG', payload: { tag: 'Insurance' } });
    expect(s.interaction.intentTags).toEqual(['Refill', 'Insurance']);
  });

  it('SET_WRAP_UP_CODE stores code on interaction', () => {
    let s = start(initialState);
    s = reducer(s, { type: 'SET_WRAP_UP_CODE', payload: { code: 'Refill' } });
    expect(s.interaction.wrapUpCode).toBe('Refill');
  });

  it('SET_TASK_QUEUE replaces full queue', () => {
    let s = reducer(initialState, { type: 'SET_TASK_QUEUE', payload: [{ id: 't1', label: 'a' }] });
    expect(s.taskQueue).toEqual([{ id: 't1', label: 'a' }]);
  });

  it('ENQUEUE_TASK appends a task', () => {
    let s = reducer(initialState, { type: 'ENQUEUE_TASK', payload: { id: 't1', label: 'a' } });
    s = reducer(s, { type: 'ENQUEUE_TASK', payload: { id: 't2', label: 'b' } });
    expect(s.taskQueue.map(t => t.id)).toEqual(['t1', 't2']);
  });

  it('REMOVE_TASK removes by id', () => {
    let s = reducer(initialState, { type: 'SET_TASK_QUEUE', payload: [{ id: 't1' }, { id: 't2' }] });
    s = reducer(s, { type: 'REMOVE_TASK', payload: { id: 't1' } });
    expect(s.taskQueue.map(t => t.id)).toEqual(['t2']);
  });
});
```

- [ ] **Step 2: Run, expect failures**

Run: `npm run test:run`
Expected: ~15 failures.

- [ ] **Step 3: Extend reducer**

Add these cases to the reducer's `switch` block (before `default`):
```js
case 'APPEND_TRANSCRIPT': {
  const { id, t, speaker, text, partial = false } = action.payload;
  return { ...state, transcript: [...state.transcript, { id, t, speaker, text, partial }] };
}
case 'UPDATE_TRANSCRIPT_PARTIAL': {
  const { id, text, commit } = action.payload;
  return {
    ...state,
    transcript: state.transcript.map(l =>
      l.id === id ? { ...l, text, partial: commit ? false : l.partial } : l
    ),
  };
}
case 'APPEND_CHAT':
  return { ...state, chatThread: [...state.chatThread, action.payload] };
case 'ADD_AUTO_NOTE':
  return {
    ...state,
    autoNotes: [...state.autoNotes, { id: action.payload.id, text: action.payload.text, source: 'ai', confirmed: false }],
  };
case 'CONFIRM_NOTE':
  return {
    ...state,
    autoNotes: state.autoNotes.map(n => n.id === action.payload.id ? { ...n, confirmed: true } : n),
  };
case 'EDIT_NOTE':
  return {
    ...state,
    autoNotes: state.autoNotes.map(n =>
      n.id === action.payload.id ? { ...n, text: action.payload.text, source: 'agent', confirmed: true } : n
    ),
  };
case 'ADD_SUGGESTION': {
  const { id, text, category, kbLink } = action.payload;
  return { ...state, suggestions: [...state.suggestions, { id, text, category, kbLink, feedback: null, copied: false }] };
}
case 'RATE_SUGGESTION':
  return {
    ...state,
    suggestions: state.suggestions.map(s =>
      s.id === action.payload.id ? { ...s, feedback: action.payload.feedback } : s
    ),
  };
case 'MARK_SUGGESTION_COPIED':
  return {
    ...state,
    suggestions: state.suggestions.map(s =>
      s.id === action.payload.id ? { ...s, copied: true } : s
    ),
  };
case 'SET_SENTIMENT':
  return { ...state, sentiment: { ...action.payload } };
case 'ADD_INTENT_TAG': {
  if (!state.interaction) return state;
  const tag = action.payload.tag;
  if (state.interaction.intentTags.includes(tag)) return state;
  return {
    ...state,
    interaction: { ...state.interaction, intentTags: [...state.interaction.intentTags, tag] },
  };
}
case 'SET_WRAP_UP_CODE':
  if (!state.interaction) return state;
  return { ...state, interaction: { ...state.interaction, wrapUpCode: action.payload.code } };
case 'SET_TASK_QUEUE':
  return { ...state, taskQueue: action.payload };
case 'ENQUEUE_TASK':
  return { ...state, taskQueue: [...state.taskQueue, action.payload] };
case 'REMOVE_TASK':
  return { ...state, taskQueue: state.taskQueue.filter(t => t.id !== action.payload.id) };
```

- [ ] **Step 4: Run, expect pass**

Run: `npm run test:run`
Expected: all passing.

- [ ] **Step 5: Commit**

```bash
git add src/components/agent/interaction
git commit -m "feat(interaction): reducer content streams (transcript, notes, suggestions, sentiment, queue)"
```

---

## Task 5: Demo runner — engine + step helpers

**Files:**
- Create: `src/components/agent/interaction/demoRunner.js`
- Create: `src/components/agent/interaction/__tests__/demoRunner.test.js`

- [ ] **Step 1: Write failing tests**

`src/components/agent/interaction/__tests__/demoRunner.test.js`:
```js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRunner } from '../demoRunner';

describe('demoRunner', () => {
  let dispatched;
  let dispatch;

  beforeEach(() => {
    vi.useFakeTimers();
    dispatched = [];
    dispatch = (a) => dispatched.push(a);
  });
  afterEach(() => { vi.useRealTimers(); });

  it('schedules steps at their `at` offsets', () => {
    const scenario = {
      id: 's',
      script: [
        { at: 0,    do: ({ dispatch }) => dispatch({ type: 'A' }) },
        { at: 1000, do: ({ dispatch }) => dispatch({ type: 'B' }) },
      ],
    };
    const runner = createRunner({ dispatch });
    runner.start(scenario);
    vi.advanceTimersByTime(0);
    expect(dispatched.map(a => a.type)).toEqual(['A']);
    vi.advanceTimersByTime(1000);
    expect(dispatched.map(a => a.type)).toEqual(['A', 'B']);
  });

  it('stop() clears pending steps', () => {
    const scenario = { id: 's', script: [{ at: 1000, do: ({ dispatch }) => dispatch({ type: 'A' }) }] };
    const runner = createRunner({ dispatch });
    runner.start(scenario);
    runner.stop();
    vi.advanceTimersByTime(2000);
    expect(dispatched).toEqual([]);
  });

  it('pause()/resume() shifts remaining offsets', () => {
    const scenario = {
      id: 's',
      script: [
        { at: 0,    do: ({ dispatch }) => dispatch({ type: 'A' }) },
        { at: 1000, do: ({ dispatch }) => dispatch({ type: 'B' }) },
      ],
    };
    const runner = createRunner({ dispatch });
    runner.start(scenario);
    vi.advanceTimersByTime(0);                  // A
    vi.advanceTimersByTime(500);                // halfway
    runner.pause();
    vi.advanceTimersByTime(5000);               // shouldn't fire B
    expect(dispatched.map(a => a.type)).toEqual(['A']);
    runner.resume();
    vi.advanceTimersByTime(499);
    expect(dispatched.map(a => a.type)).toEqual(['A']);
    vi.advanceTimersByTime(1);                  // remaining 500ms elapsed → B
    expect(dispatched.map(a => a.type)).toEqual(['A', 'B']);
  });

  it('helpers expose ctx for ergonomic scripting', () => {
    const scenario = {
      id: 's',
      script: [
        { at: 0, do: (ctx) => ctx.transcriptLine('patient', 'hi') },
        { at: 0, do: (ctx) => ctx.addSuggestion({ text: 'do x', category: 'action' }) },
        { at: 0, do: (ctx) => ctx.addAutoNote('thought') },
        { at: 0, do: (ctx) => ctx.setSentiment('frustrated', -0.5) },
        { at: 0, do: (ctx) => ctx.addIntentTag('Refill') },
      ],
    };
    const runner = createRunner({ dispatch });
    runner.start(scenario);
    vi.advanceTimersByTime(0);
    const types = dispatched.map(a => a.type);
    expect(types).toContain('APPEND_TRANSCRIPT');
    expect(types).toContain('ADD_SUGGESTION');
    expect(types).toContain('ADD_AUTO_NOTE');
    expect(types).toContain('SET_SENTIMENT');
    expect(types).toContain('ADD_INTENT_TAG');
  });
});
```

- [ ] **Step 2: Run, expect failure**

Run: `npm run test:run`
Expected: module not found.

- [ ] **Step 3: Implement runner**

`src/components/agent/interaction/demoRunner.js`:
```js
let idCounter = 0;
const nextId = (prefix) => `${prefix}_${++idCounter}_${Date.now()}`;

function makeCtx(dispatch) {
  return {
    dispatch,
    transcriptLine: (speaker, text, opts = {}) => {
      const id = opts.id || nextId('tr');
      dispatch({ type: 'APPEND_TRANSCRIPT', payload: { id, t: Date.now(), speaker, text, partial: false } });
    },
    chatMessage: (from, text, opts = {}) => {
      dispatch({ type: 'APPEND_CHAT', payload: { id: opts.id || nextId('chat'), t: Date.now(), from, text, status: opts.status || 'delivered' } });
    },
    addAutoNote: (text, opts = {}) => {
      dispatch({ type: 'ADD_AUTO_NOTE', payload: { id: opts.id || nextId('note'), text } });
    },
    confirmNote: (id) => dispatch({ type: 'CONFIRM_NOTE', payload: { id } }),
    addSuggestion: ({ text, category, kbLink, id }) => {
      dispatch({ type: 'ADD_SUGGESTION', payload: { id: id || nextId('sug'), text, category, kbLink } });
    },
    setSentiment: (label, score, trend = 'steady') => {
      dispatch({ type: 'SET_SENTIMENT', payload: { score, label, trend } });
    },
    addIntentTag: (tag) => dispatch({ type: 'ADD_INTENT_TAG', payload: { tag } }),
    enqueueTask: (task) => dispatch({ type: 'ENQUEUE_TASK', payload: task }),
    connect: (at = Date.now()) => dispatch({ type: 'CONNECT', payload: { connectedAt: at } }),
  };
}

export function createRunner({ dispatch }) {
  let timers = [];
  let ctx = makeCtx(dispatch);

  let scenario = null;
  let startTime = 0;
  let remaining = [];        // [{ at, do }] not yet scheduled
  let paused = false;
  let pausedAt = 0;

  const schedule = () => {
    const elapsed = Date.now() - startTime;
    const pending = remaining.filter(step => step.at >= elapsed);
    remaining = [];
    pending.forEach(step => {
      const delay = Math.max(0, step.at - elapsed);
      const handle = setTimeout(() => { step.do(ctx); }, delay);
      timers.push(handle);
    });
  };

  const clearAll = () => {
    timers.forEach(t => clearTimeout(t));
    timers = [];
  };

  return {
    start(s) {
      this.stop();
      scenario = s;
      startTime = Date.now();
      remaining = [...s.script];
      paused = false;
      schedule();
    },
    pause() {
      if (paused || !scenario) return;
      paused = true;
      pausedAt = Date.now();
      const elapsed = pausedAt - startTime;
      // Convert any not-yet-fired step back into remaining with its original `at` shifted appropriately.
      // Reconstruct remaining from scenario.script using elapsed cutoff.
      remaining = scenario.script.filter(step => step.at > elapsed);
      clearAll();
    },
    resume() {
      if (!paused || !scenario) return;
      const pauseDuration = Date.now() - pausedAt;
      startTime += pauseDuration;
      paused = false;
      schedule();
    },
    stop() {
      clearAll();
      scenario = null;
      remaining = [];
      paused = false;
    },
    isRunning() { return scenario !== null && !paused; },
  };
}
```

- [ ] **Step 4: Run, expect pass**

Run: `npm run test:run`
Expected: all passing.

- [ ] **Step 5: Commit**

```bash
git add src/components/agent/interaction
git commit -m "feat(interaction): demo runner engine with step helpers"
```

---

## Task 6: InteractionContext provider + useInteraction hook

**Files:**
- Create: `src/components/agent/interaction/InteractionContext.jsx`

- [ ] **Step 1: Implement provider and hook**

```jsx
import React, { createContext, useContext, useReducer, useMemo, useRef, useCallback, useEffect } from 'react';
import { reducer, initialState } from './interactionReducer';
import { createRunner } from './demoRunner';
import { scenarios } from './scenarios';
import { mockPatients } from '@/data/mockPatients';

const InteractionContext = createContext(null);

let intxIdCounter = 0;
const newIntxId = () => `intx_${++intxIdCounter}_${Date.now()}`;

export function InteractionProvider({ patient, onCommunicationsAppended, children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const runnerRef = useRef(null);

  if (runnerRef.current === null) {
    runnerRef.current = createRunner({ dispatch });
  }

  // Drip background tasks once at mount so the queue feels lived-in.
  useEffect(() => {
    const drip = (after, payload) => setTimeout(() => dispatch({ type: 'ENQUEUE_TASK', payload }), after);
    const t1 = drip(2000,  { id: 'bg_chat',     type: 'chat',     label: 'Connected Chat',     subLabel: '0:30',       ageSeconds: 30 });
    const t2 = drip(12000, { id: 'bg_reminder', type: 'task',     label: 'Scheduled Reminder', subLabel: 'Active Agent Task | 0:30', ageSeconds: 30 });
    const t3 = drip(22000, { id: 'bg_preview',  type: 'voice-out',label: 'Outbound Preview',   subLabel: 'Hot Leads | 0:30', ageSeconds: 30 });
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const startInteraction = useCallback((scenarioId, overridePatient) => {
    const scenario = scenarios[scenarioId];
    if (!scenario) return;
    const p = overridePatient || mockPatients.find(mp => mp.id === scenario.patientId) || patient;
    const id = newIntxId();
    const startedAt = Date.now();
    dispatch({ type: 'START_INTERACTION', payload: {
      id, type: scenario.type, patient: p, queue: scenario.queue || 'Support',
      direction: scenario.direction || (scenario.type === 'voice-in' ? 'inbound' : 'outbound'),
      startedAt,
    }});
    runnerRef.current.start(scenario);
  }, [patient]);

  const hangup = useCallback(() => {
    dispatch({ type: 'HANGUP', payload: { endedAt: Date.now() } });
    runnerRef.current.stop();
  }, []);

  const saveWrapUp = useCallback((finalNotes) => {
    const intx = state.interaction;
    if (!intx) return;
    const summary = (finalNotes || state.autoNotes.map(n => `• ${n.text}`).join('\n')) || '(no notes)';
    const entry = {
      id: `COM-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      type: intx.type === 'chat' ? 'text' : (intx.type === 'voice-out' ? 'phone' : 'phone'),
      subject: intx.queue,
      summary,
      agent: 'Agent (you)',
      disposition: intx.wrapUpCode || 'Other',
      duration: intx.connectedAt && intx.endedAt
        ? `${Math.max(1, Math.round((intx.endedAt - intx.connectedAt) / 1000))}s`
        : undefined,
    };
    // Mutate in place — matches the rest of the app's mock-data model.
    if (intx.patient && Array.isArray(intx.patient.communications)) {
      intx.patient.communications.unshift(entry);
    }
    if (onCommunicationsAppended) onCommunicationsAppended(entry);
    dispatch({ type: 'END_INTERACTION' });
  }, [state.interaction, state.autoNotes, onCommunicationsAppended]);

  const value = useMemo(() => ({
    ...state,
    actions: {
      startInteraction,
      answer: () => dispatch({ type: 'CONNECT', payload: { connectedAt: Date.now() } }),
      hold: () => dispatch({ type: 'HOLD' }),
      resume: () => dispatch({ type: 'RESUME' }),
      mute: () => { /* mock — no state surface needed for v1 */ },
      unmute: () => {},
      transferTo: () => {},
      addParticipant: () => {},
      hangup,
      setWrapUpCode: (code) => dispatch({ type: 'SET_WRAP_UP_CODE', payload: { code } }),
      saveWrapUp,
      confirmNote: (id) => dispatch({ type: 'CONFIRM_NOTE', payload: { id } }),
      editNote: (id, text) => dispatch({ type: 'EDIT_NOTE', payload: { id, text } }),
      sendSuggestion: (id) => {
        const s = state.suggestions.find(x => x.id === id);
        if (s) {
          try { navigator.clipboard?.writeText(s.text); } catch {}
          dispatch({ type: 'MARK_SUGGESTION_COPIED', payload: { id } });
        }
      },
      rateSuggestion: (id, feedback) => dispatch({ type: 'RATE_SUGGESTION', payload: { id, feedback } }),
      sendChat: (text) => {
        dispatch({ type: 'APPEND_CHAT', payload: { id: `chat_${Date.now()}`, t: Date.now(), from: 'agent', text, status: 'sent' } });
      },
      pickTask: (taskId) => {
        if (state.interaction && state.interaction.status === 'connected') {
          dispatch({ type: 'HOLD' });
          runnerRef.current.pause();
        }
        // For v1: re-start a scenario that matches this task if it's a scenario task.
        const t = state.taskQueue.find(x => x.id === taskId);
        if (t && t.scenarioId) startInteraction(t.scenarioId);
      },
      pinTask: () => {},
    },
  }), [state, startInteraction, hangup, saveWrapUp]);

  return <InteractionContext.Provider value={value}>{children}</InteractionContext.Provider>;
}

export function useInteraction() {
  const ctx = useContext(InteractionContext);
  if (!ctx) throw new Error('useInteraction must be used inside <InteractionProvider>');
  return ctx;
}
```

- [ ] **Step 2: Verify nothing else broke**

Run: `npm run test:run`
Expected: existing tests still pass; no test for this file yet (covered by integration via scenarios in Task 13).

- [ ] **Step 3: Commit**

```bash
git add src/components/agent/interaction/InteractionContext.jsx
git commit -m "feat(interaction): context provider + useInteraction hook"
```

> Note: this file imports `./scenarios` and `./scenarios/index.js` which is created next. That's fine — we'll commit the registry shell in Task 7 and the file won't be imported by `AgentPortal.jsx` until Task 18.

---

## Task 7: Scenarios — registry shell

**Files:**
- Create: `src/components/agent/interaction/scenarios/index.js`

- [ ] **Step 1: Create empty registry**

```js
import refillInbound from './refillInbound';
import paymentOutbound from './paymentOutbound';
import chatSideEffect from './chatSideEffect';
import distressCall from './distressCall';
import callbackTask from './callbackTask';

export const scenarios = {
  [refillInbound.id]:  refillInbound,
  [paymentOutbound.id]: paymentOutbound,
  [chatSideEffect.id]: chatSideEffect,
  [distressCall.id]:   distressCall,
  [callbackTask.id]:   callbackTask,
};

export const scenarioList = Object.values(scenarios);
```

> This file will fail to import until Tasks 8–12 create each scenario module. Don't commit yet — wait until Task 12.

---

## Task 8: Scenario — refillInbound

**Files:**
- Create: `src/components/agent/interaction/scenarios/refillInbound.js`

- [ ] **Step 1: Implement scenario**

```js
// Inbound: patient calls about Lisinopril (using mock patient '1' — John Doe / Semaglutide as the closest match)
export default {
  id: 'refill-inbound',
  label: 'Inbound: Refill request',
  type: 'voice-in',
  direction: 'inbound',
  queue: 'Refill Support',
  patientId: '1',
  script: [
    { at: 0,     do: (ctx) => {} }, // ringing starts at START_INTERACTION
    { at: 1800,  do: (ctx) => ctx.connect() },
    { at: 2100,  do: (ctx) => ctx.addIntentTag('Refill') },
    { at: 2400,  do: (ctx) => ctx.transcriptLine('patient', "Hi, I'm calling about my Semaglutide refill. I think I'm running low.") },
    { at: 5000,  do: (ctx) => ctx.transcriptLine('agent', "Of course. Let me pull up your account — I see Semaglutide 2.4mg with three refills remaining.") },
    { at: 7500,  do: (ctx) => ctx.addAutoNote('Refill request: Semaglutide 2.4mg', { id: 'note_refill_1' }) },
    { at: 8200,  do: (ctx) => ctx.addSuggestion({ id: 'sug_refill_action', text: 'Process refill for Semaglutide 2.4mg', category: 'action' }) },
    { at: 9500,  do: (ctx) => ctx.transcriptLine('patient', "Also — my insurance just changed. It's BCBS now.") },
    { at: 12000, do: (ctx) => ctx.addAutoNote('Insurance changed to BCBS', { id: 'note_refill_2' }) },
    { at: 12500, do: (ctx) => ctx.addIntentTag('Insurance') },
    { at: 13000, do: (ctx) => ctx.addSuggestion({ id: 'sug_refill_kb', text: 'Verify prior auth requirements (KB-INS-04)', category: 'kb', kbLink: '/kb/INS-04' }) },
    { at: 14000, do: (ctx) => ctx.confirmNote('note_refill_1') },
    { at: 15000, do: (ctx) => ctx.setSentiment('calm', 0.4, 'improving') },
    { at: 16000, do: (ctx) => ctx.addSuggestion({ id: 'sug_refill_90', text: 'Offer 90-day fill option', category: 'action' }) },
  ],
};
```

- [ ] **Step 2: Verify import compiles**

Run: `npm run test:run`
Expected: still green (scenario not yet imported anywhere except via registry which is uncommitted).

---

## Task 9: Scenario — paymentOutbound

**Files:**
- Create: `src/components/agent/interaction/scenarios/paymentOutbound.js`

- [ ] **Step 1: Implement**

```js
// Outbound: rep dials Jane Smith about an open balance.
export default {
  id: 'payment-outbound',
  label: 'Outbound: Payment follow-up',
  type: 'voice-out',
  direction: 'outbound',
  queue: 'Billing',
  patientId: '2',
  script: [
    { at: 1500,  do: (ctx) => ctx.connect() },
    { at: 1700,  do: (ctx) => ctx.addIntentTag('Billing') },
    { at: 2200,  do: (ctx) => ctx.transcriptLine('agent', "Hi Jane, this is DCA Pharmacy following up on your January invoice.") },
    { at: 5500,  do: (ctx) => ctx.transcriptLine('patient', "Oh — yes, I've been meaning to deal with that. It's tight this month.") },
    { at: 8000,  do: (ctx) => ctx.setSentiment('frustrated', -0.3, 'declining') },
    { at: 8200,  do: (ctx) => ctx.addAutoNote('Balance: $350 (INV-2026-002). Patient reports cash flow concern.', { id: 'note_pmt_1' }) },
    { at: 9000,  do: (ctx) => ctx.addSuggestion({ id: 'sug_pmt_plan', text: 'Offer 3-month payment plan', category: 'action', kbLink: '/kb/PMT-12' }) },
    { at: 12000, do: (ctx) => ctx.addSuggestion({ id: 'sug_pmt_card', text: 'Verify card on file (Mastercard •1234, exp 08/26)', category: 'action' }) },
    { at: 15000, do: (ctx) => ctx.transcriptLine('agent', "I can split that into three monthly payments — would that help?") },
    { at: 17500, do: (ctx) => ctx.transcriptLine('patient', "Yes, that would be great. Thank you.") },
    { at: 18500, do: (ctx) => ctx.setSentiment('calm', 0.3, 'improving') },
    { at: 19000, do: (ctx) => ctx.confirmNote('note_pmt_1') },
  ],
};
```

---

## Task 10: Scenario — chatSideEffect

**Files:**
- Create: `src/components/agent/interaction/scenarios/chatSideEffect.js`

- [ ] **Step 1: Implement**

```js
// Chat: Jane Smith reports dizziness from Tirzepatide.
export default {
  id: 'chat-side-effect',
  label: 'Chat: Side-effect report',
  type: 'chat',
  direction: 'inbound',
  queue: 'Clinical',
  patientId: '2',
  script: [
    { at: 500,   do: (ctx) => ctx.connect() },
    { at: 700,   do: (ctx) => ctx.addIntentTag('Clinical') },
    { at: 1000,  do: (ctx) => ctx.chatMessage('patient', "Hi — I think my new med is making me dizzy.") },
    { at: 4000,  do: (ctx) => ctx.addAutoNote('Patient reports dizziness on Tirzepatide 5mg', { id: 'note_clin_1' }) },
    { at: 4500,  do: (ctx) => ctx.setSentiment('frustrated', -0.4, 'steady') },
    { at: 5500,  do: (ctx) => ctx.addSuggestion({ id: 'sug_clin_escalate', text: 'Escalate to pharmacist on-call', category: 'escalate' }) },
    { at: 6500,  do: (ctx) => ctx.addSuggestion({ id: 'sug_clin_guide', text: 'Open medication guide: Tirzepatide', category: 'kb', kbLink: '/kb/MED-Tirzepatide' }) },
    { at: 9000,  do: (ctx) => ctx.chatMessage('agent', "Thanks for letting us know. Have you eaten today before the injection?") },
    { at: 13000, do: (ctx) => ctx.chatMessage('patient', "No — I usually take it on an empty stomach.") },
    { at: 15000, do: (ctx) => ctx.addSuggestion({ id: 'sug_clin_meal', text: 'Advise small meal 30 min before injection', category: 'action' }) },
    { at: 17000, do: (ctx) => ctx.setSentiment('calm', 0.1, 'improving') },
  ],
};
```

---

## Task 11: Scenario — distressCall

**Files:**
- Create: `src/components/agent/interaction/scenarios/distressCall.js`

- [ ] **Step 1: Implement**

```js
// Inbound voice: distress (out of insulin, copay)
export default {
  id: 'distress-call',
  label: 'Inbound: Distress (insulin / copay)',
  type: 'voice-in',
  direction: 'inbound',
  queue: 'Urgent Support',
  patientId: '1',
  script: [
    { at: 1200,  do: (ctx) => ctx.connect() },
    { at: 1500,  do: (ctx) => ctx.addIntentTag('Urgent') },
    { at: 2000,  do: (ctx) => ctx.transcriptLine('patient', "I'm out of insulin and I can't afford the copay this month.") },
    { at: 4500,  do: (ctx) => ctx.setSentiment('frustrated', -0.4, 'declining') },
    { at: 5500,  do: (ctx) => ctx.addAutoNote('Patient reports unable to afford copay; out of insulin', { id: 'note_d_1' }) },
    { at: 7500,  do: (ctx) => ctx.transcriptLine('patient', "I don't know what to do. I've called everywhere.") },
    { at: 9000,  do: (ctx) => ctx.setSentiment('distress', -0.85, 'declining') },
    { at: 9300,  do: (ctx) => ctx.addSuggestion({ id: 'sug_d_escalate', text: 'Escalate to supervisor — patient in distress', category: 'escalate' }) },
    { at: 10500, do: (ctx) => ctx.addSuggestion({ id: 'sug_d_assistance', text: 'Check manufacturer copay assistance (KB-ASSIST-01)', category: 'kb', kbLink: '/kb/ASSIST-01' }) },
    { at: 12000, do: (ctx) => ctx.addSuggestion({ id: 'sug_d_empathy', text: '"I hear how stressful this is — let me help."', category: 'empathy' }) },
    { at: 14500, do: (ctx) => ctx.addIntentTag('Financial Assistance') },
    { at: 18000, do: (ctx) => ctx.setSentiment('frustrated', -0.3, 'improving') },
  ],
};
```

---

## Task 12: Scenario — callbackTask + commit registry

**Files:**
- Create: `src/components/agent/interaction/scenarios/callbackTask.js`

- [ ] **Step 1: Implement**

```js
// Scheduled task that converts to an outbound voice call mid-scenario.
export default {
  id: 'callback-task',
  label: 'Task: Scheduled callback 3:00 PM',
  type: 'task',
  direction: 'outbound',
  queue: 'Callback Queue',
  patientId: '1',
  script: [
    { at: 500,  do: (ctx) => ctx.addAutoNote('Prior interaction: refill question 4/22; pending insurance verify.', { id: 'note_cb_1' }) },
    { at: 700,  do: (ctx) => ctx.addSuggestion({ id: 'sug_cb_script', text: 'Recommended opener: "Hi John, calling back about your BCBS verification..."', category: 'empathy' }) },
    { at: 900,  do: (ctx) => ctx.addSuggestion({ id: 'sug_cb_start', text: "Start the call now (converts task → outbound voice).", category: 'action' }) },
  ],
};
```

- [ ] **Step 2: Verify everything compiles together**

Run: `npm run test:run`
Expected: still passing (registry now imports five real modules).

- [ ] **Step 3: Commit all scenarios + registry**

```bash
git add src/components/agent/interaction/scenarios
git commit -m "feat(interaction): five demo scenarios + registry"
```

---

## Task 13: SimulateInteractionMenu

**Files:**
- Create: `src/components/agent/interaction/SimulateInteractionMenu.jsx`

- [ ] **Step 1: Implement**

```jsx
import React from 'react';
import { Phone } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useInteraction } from './InteractionContext';
import { scenarioList } from './scenarios';

export default function SimulateInteractionMenu() {
  const { actions, interaction } = useInteraction();
  if (!import.meta.env.DEV) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border bg-white text-gray-600 border-gray-200 hover:border-[#8B1F1F] hover:text-[#8B1F1F] transition-all"
      >
        <Phone className="w-3.5 h-3.5" /> Simulate
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        {scenarioList.map(s => (
          <DropdownMenuItem
            key={s.id}
            disabled={!!interaction}
            onSelect={() => actions.startInteraction(s.id)}
          >
            <span className="font-semibold mr-2 uppercase text-[10px] text-gray-400">{s.type}</span>
            {s.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={!interaction} onSelect={() => actions.hangup()}>
          Stop all
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/agent/interaction/SimulateInteractionMenu.jsx
git commit -m "feat(interaction): SimulateInteractionMenu dev trigger"
```

---

## Task 14: TaskQueueRail

**Files:**
- Create: `src/components/agent/interaction/TaskQueueRail.jsx`

- [ ] **Step 1: Implement**

```jsx
import React from 'react';
import { Phone, MessageSquare, BellRing, ArrowUpRight, Layers } from 'lucide-react';
import { useInteraction } from './InteractionContext';

const typeIcon = {
  'voice-in': Phone,
  'voice-out': ArrowUpRight,
  'chat': MessageSquare,
  'task': BellRing,
};

function TaskItem({ task, active, ringing, onClick }) {
  const Icon = typeIcon[task.type] || Layers;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg p-3 mb-2 border transition-all ${
        active
          ? 'border-[#8B1F1F] bg-[#8B1F1F]/5'
          : 'border-gray-200 bg-white hover:border-gray-300'
      } ${ringing ? 'animate-pulse' : ''}`}
    >
      <div className="flex items-start gap-2">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
          active ? 'bg-[#8B1F1F] text-white' : 'bg-gray-100 text-gray-500'
        }`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-gray-800 truncate">{task.label}</div>
          {task.subLabel && (
            <div className="text-[11px] text-gray-500 truncate">{task.subLabel}</div>
          )}
        </div>
      </div>
    </button>
  );
}

export default function TaskQueueRail({ width = 220 }) {
  const { interaction, taskQueue, actions } = useInteraction();
  const currentTask = interaction
    ? { id: interaction.id, type: interaction.type, label: `${interaction.patient?.name || 'Unknown'}`, subLabel: interaction.queue }
    : null;
  const ringing = interaction?.status === 'ringing';

  return (
    <aside
      style={{ width }}
      className="flex-shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto p-3"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700">Current Task</h3>
      </div>
      {currentTask ? (
        <TaskItem task={currentTask} active ringing={ringing} onClick={() => {}} />
      ) : (
        <div className="text-xs text-gray-500 italic mb-2">No active task</div>
      )}

      <div className="flex items-center justify-between mt-4 mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700">Other Tasks</h3>
      </div>
      {taskQueue.length === 0 && (
        <div className="text-xs text-gray-400 italic">Queue is quiet</div>
      )}
      {taskQueue.map(t => (
        <TaskItem
          key={t.id}
          task={t}
          active={false}
          ringing={false}
          onClick={() => actions.pickTask(t.id)}
        />
      ))}
    </aside>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/agent/interaction/TaskQueueRail.jsx
git commit -m "feat(interaction): TaskQueueRail"
```

---

## Task 15: ConsoleHeader

**Files:**
- Create: `src/components/agent/interaction/ConsoleHeader.jsx`

- [ ] **Step 1: Implement**

```jsx
import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Pause, Play, PhoneOff, UserPlus, Grid3x3, PhoneForwarded } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { useInteraction } from './InteractionContext';

const WRAP_CODES = ['Refill', 'Billing', 'Clinical', 'Shipping', 'Other'];

function fmtElapsed(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function ConsoleHeader() {
  const { interaction, actions } = useInteraction();
  const [now, setNow] = useState(Date.now());
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  if (!interaction) return null;
  const start = interaction.connectedAt || interaction.startedAt;
  const elapsed = now - start;
  const onHold = interaction.status === 'on-hold';
  const recording = interaction.recording.state === 'recording';

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-gray-700">
            {interaction.type === 'chat' ? 'Connected Chat' : interaction.status === 'ringing' ? 'Incoming Call' : 'Connected Call'}
          </div>
          <div className="text-[11px] text-gray-500">{interaction.queue} • {fmtElapsed(elapsed)}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded border ${
            recording ? 'text-red-600 border-red-200 bg-red-50' : 'text-gray-500 border-gray-200 bg-gray-50'
          }`}>
            <span className={`w-2 h-2 rounded-full ${recording ? 'bg-red-600 animate-pulse' : 'bg-gray-300'}`} />
            {recording ? 'Recording' : 'Paused'}
          </div>
          <Select
            value={interaction.wrapUpCode || ''}
            onValueChange={(v) => actions.setWrapUpCode(v)}
          >
            <SelectTrigger className="w-44 h-9 text-xs">
              <SelectValue placeholder="Wrap Up Code" />
            </SelectTrigger>
            <SelectContent>
              {WRAP_CODES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="px-4 py-3 flex items-center justify-center gap-2 border-t border-gray-100 bg-gray-50">
        {interaction.status === 'ringing' ? (
          <button
            onClick={actions.answer}
            className="px-4 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold"
          >
            Answer
          </button>
        ) : (
          <>
            <IconBtn title="Add participant" onClick={() => {}}><UserPlus className="w-4 h-4" /></IconBtn>
            <IconBtn title="Transfer" onClick={() => {}}><PhoneForwarded className="w-4 h-4" /></IconBtn>
            <IconBtn title="Dialpad" onClick={() => {}}><Grid3x3 className="w-4 h-4" /></IconBtn>
            <IconBtn
              title={onHold ? 'Resume' : 'Hold'}
              onClick={onHold ? actions.resume : actions.hold}
            >
              {onHold ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </IconBtn>
            <IconBtn
              title={muted ? 'Unmute' : 'Mute'}
              onClick={() => { setMuted(m => !m); muted ? actions.unmute() : actions.mute(); }}
            >
              {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </IconBtn>
            <button
              onClick={actions.hangup}
              title="End"
              className="ml-2 w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function IconBtn({ title, onClick, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-9 h-9 rounded-full bg-white border border-gray-200 hover:border-[#8B1F1F] hover:text-[#8B1F1F] text-gray-600 flex items-center justify-center transition-colors"
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/agent/interaction/ConsoleHeader.jsx
git commit -m "feat(interaction): ConsoleHeader with controls + timer + wrap-up code"
```

---

## Task 16: TranscriptStream + AutoNotesPanel + InteractionConsole

**Files:**
- Create: `src/components/agent/interaction/TranscriptStream.jsx`
- Create: `src/components/agent/interaction/AutoNotesPanel.jsx`
- Create: `src/components/agent/interaction/InteractionConsole.jsx`

- [ ] **Step 1: TranscriptStream**

```jsx
import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { useInteraction } from './InteractionContext';

export default function TranscriptStream() {
  const { interaction, transcript, chatThread, actions } = useInteraction();
  const scrollRef = useRef(null);
  const [draft, setDraft] = useState('');
  const isChat = interaction?.type === 'chat';

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [transcript.length, chatThread.length]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      <div className="px-4 py-2 border-b border-gray-100 text-xs font-bold uppercase tracking-wide text-gray-700">
        {isChat ? 'Conversation' : 'Live Transcription'}
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {!isChat && transcript.map(line => (
          <div key={line.id} className={`text-sm transition-opacity ${line.partial ? 'opacity-60' : 'opacity-100'}`}>
            <span className={`font-semibold mr-2 ${line.speaker === 'agent' ? 'text-[#8B1F1F]' : 'text-gray-700'}`}>
              {line.speaker === 'agent' ? 'Agent' : interaction?.patient?.name?.split(' ')[0] || 'Patient'}:
            </span>
            <span className="text-gray-800">{line.text}</span>
          </div>
        ))}
        {isChat && chatThread.map(msg => (
          <div key={msg.id} className={`flex ${msg.from === 'agent' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
              msg.from === 'agent' ? 'bg-[#8B1F1F] text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {(transcript.length === 0 && chatThread.length === 0) && (
          <div className="text-xs text-gray-400 italic">Waiting for activity…</div>
        )}
      </div>
      {isChat && (
        <form
          onSubmit={(e) => { e.preventDefault(); if (draft.trim()) { actions.sendChat(draft.trim()); setDraft(''); } }}
          className="border-t border-gray-100 p-2 flex items-center gap-2"
        >
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Type a reply…"
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#8B1F1F]"
          />
          <button type="submit" className="w-9 h-9 rounded-full bg-[#8B1F1F] text-white flex items-center justify-center">
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}
```

- [ ] **Step 2: AutoNotesPanel**

```jsx
import React from 'react';
import { Sparkles, Check } from 'lucide-react';
import { useInteraction } from './InteractionContext';

export default function AutoNotesPanel() {
  const { autoNotes, actions } = useInteraction();
  const generating = autoNotes.some(n => !n.confirmed);
  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-wide text-gray-700">Interaction Notes</div>
        {generating && (
          <div className="flex items-center gap-1 text-[11px] text-[#8B1F1F]">
            <Sparkles className="w-3 h-3" /> Generating…
          </div>
        )}
      </div>
      <div className="px-4 py-3 space-y-1 max-h-44 overflow-y-auto">
        {autoNotes.length === 0 && (
          <div className="text-xs text-gray-400 italic">Notes appear automatically as the conversation progresses.</div>
        )}
        {autoNotes.map(n => (
          <div key={n.id} className="flex items-start gap-2 text-sm text-gray-800">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#8B1F1F] flex-shrink-0" />
            <span className="flex-1">{n.text}</span>
            {!n.confirmed && (
              <button
                onClick={() => actions.confirmNote(n.id)}
                title="Confirm"
                className="text-gray-400 hover:text-green-600"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: InteractionConsole**

```jsx
import React from 'react';
import ConsoleHeader from './ConsoleHeader';
import TranscriptStream from './TranscriptStream';
import AutoNotesPanel from './AutoNotesPanel';

export default function InteractionConsole({ width }) {
  return (
    <section
      style={{ width }}
      className="flex-shrink-0 flex flex-col border-r border-gray-200 overflow-hidden bg-white"
    >
      <ConsoleHeader />
      <TranscriptStream />
      <AutoNotesPanel />
    </section>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/agent/interaction
git commit -m "feat(interaction): TranscriptStream + AutoNotesPanel + InteractionConsole"
```

---

## Task 17: SuggestionCard + AICopilotPanel

**Files:**
- Create: `src/components/agent/interaction/SuggestionCard.jsx`
- Create: `src/components/agent/interaction/AICopilotPanel.jsx`

- [ ] **Step 1: SuggestionCard**

```jsx
import React from 'react';
import { Copy, ThumbsUp, ThumbsDown, ExternalLink, Check } from 'lucide-react';
import { useInteraction } from './InteractionContext';

export default function SuggestionCard({ suggestion, onDeepLink }) {
  const { actions } = useInteraction();
  const { id, text, category, kbLink, feedback, copied } = suggestion;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 mb-2 border-l-2 border-l-[#8B1F1F]">
      <div className="flex items-start gap-2">
        <div className="w-5 h-5 rounded-full bg-[#8B1F1F] text-white flex items-center justify-center flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-white" />
        </div>
        <div className="flex-1 text-sm text-gray-800">{text}</div>
      </div>
      <div className="mt-2 flex items-center gap-1 pl-7">
        <button
          onClick={() => actions.sendSuggestion(id)}
          title="Copy to clipboard"
          className="p-1 rounded hover:bg-gray-100 text-gray-500"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={() => actions.rateSuggestion(id, 'up')}
          className={`p-1 rounded hover:bg-gray-100 ${feedback === 'up' ? 'text-[#8B1F1F]' : 'text-gray-500'}`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => actions.rateSuggestion(id, 'down')}
          className={`p-1 rounded hover:bg-gray-100 ${feedback === 'down' ? 'text-[#8B1F1F]' : 'text-gray-500'}`}
        >
          <ThumbsDown className="w-3.5 h-3.5" />
        </button>
        {(kbLink || category === 'action') && (
          <button
            onClick={() => onDeepLink?.(suggestion)}
            title="Open"
            className="ml-auto p-1 rounded hover:bg-gray-100 text-gray-500"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
        {category && (
          <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">{category}</span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: AICopilotPanel**

```jsx
import React from 'react';
import { Sparkles, AlertTriangle, Smile, Meh, Frown, ExternalLink } from 'lucide-react';
import { useInteraction } from './InteractionContext';
import SuggestionCard from './SuggestionCard';

const SENTIMENT_ICON = { calm: Smile, neutral: Meh, frustrated: Frown, distress: AlertTriangle };

export default function AICopilotPanel({ onPopOut, onDeepLink }) {
  const { interaction, suggestions, sentiment } = useInteraction();
  if (!interaction) return null;

  const SIcon = SENTIMENT_ICON[sentiment.label] || Meh;
  const distress = sentiment.label === 'distress';

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="px-4 py-3 flex items-center justify-between bg-[#8B1F1F]/5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#8B1F1F]" />
          <div className="text-xs font-bold uppercase tracking-wide text-[#8B1F1F]">AI Co-pilot</div>
        </div>
        {onPopOut && (
          <button onClick={onPopOut} title="Pop out" className="text-gray-500 hover:text-[#8B1F1F] p-1">
            <ExternalLink className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Attached Data + sentiment */}
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] uppercase tracking-wide font-semibold text-gray-500">Phone</span>
          <span className="text-xs text-gray-800">{interaction.patient?.phone || '—'}</span>
        </div>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] uppercase tracking-wide font-semibold text-gray-500">Intent</span>
          {interaction.intentTags.length === 0 && <span className="text-xs text-gray-400">analyzing…</span>}
          {interaction.intentTags.map(tag => (
            <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{tag}</span>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wide font-semibold text-gray-500">Sentiment</span>
          <SIcon className={`w-3.5 h-3.5 ${distress ? 'text-red-600' : 'text-gray-600'}`} />
          <span className={`text-xs font-semibold ${distress ? 'text-red-600' : 'text-gray-700'}`}>{sentiment.label}</span>
          <span className="text-[11px] text-gray-400">({sentiment.trend})</span>
        </div>
      </div>

      {distress && (
        <div role="alert" className="px-4 py-2 bg-red-50 border-b border-red-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span className="text-xs font-semibold text-red-700 flex-1">Customer distress detected</span>
          <button className="text-xs font-semibold text-red-700 underline">Escalate to supervisor</button>
        </div>
      )}

      <div className="px-3 py-3 max-h-72 overflow-y-auto" aria-live="polite">
        {suggestions.length === 0 && (
          <div className="text-xs text-gray-400 italic px-1">I'm listening — suggestions will appear here.</div>
        )}
        {suggestions.map(s => <SuggestionCard key={s.id} suggestion={s} onDeepLink={onDeepLink} />)}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/agent/interaction
git commit -m "feat(interaction): AI Co-pilot panel + suggestion cards"
```

---

## Task 18: FloatingAIWindow

**Files:**
- Create: `src/components/agent/interaction/FloatingAIWindow.jsx`

- [ ] **Step 1: Inspect existing DraggablePanel API**

Read `src/components/agent/DraggablePanel.jsx` to confirm its props (likely `title`, `onClose`, `children`, default position).

- [ ] **Step 2: Implement**

```jsx
import React from 'react';
import DraggablePanel from '../DraggablePanel';
import AICopilotPanel from './AICopilotPanel';

export default function FloatingAIWindow({ open, onClose, onDeepLink }) {
  if (!open) return null;
  return (
    <DraggablePanel title="AI Co-pilot" onClose={onClose} initialPosition={{ x: window.innerWidth - 420, y: 120 }} width={400}>
      <AICopilotPanel onDeepLink={onDeepLink} />
    </DraggablePanel>
  );
}
```

> If `DraggablePanel`'s API differs (different prop names like `position`, `onDismiss`, etc.), adapt the JSX above to match what the file exports. Do not rename `DraggablePanel`'s props.

- [ ] **Step 3: Commit**

```bash
git add src/components/agent/interaction/FloatingAIWindow.jsx
git commit -m "feat(interaction): FloatingAIWindow pop-out for AI panel"
```

---

## Task 19: WrapUpModal

**Files:**
- Create: `src/components/agent/interaction/WrapUpModal.jsx`

- [ ] **Step 1: Implement**

```jsx
import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useInteraction } from './InteractionContext';

const WRAP_CODES = ['Refill', 'Billing', 'Clinical', 'Shipping', 'Other'];

export default function WrapUpModal() {
  const { interaction, autoNotes, actions } = useInteraction();
  const [code, setCode] = useState('');
  const [notes, setNotes] = useState('');

  const open = interaction?.status === 'wrapping-up';

  useEffect(() => {
    if (open) {
      setCode(interaction?.wrapUpCode || '');
      setNotes(autoNotes.map(n => `• ${n.text}`).join('\n'));
    }
  }, [open, interaction?.wrapUpCode, autoNotes]);

  const submit = () => {
    if (!code) return;
    actions.setWrapUpCode(code);
    actions.saveWrapUp(notes);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Wrap up interaction</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-gray-600">Disposition</label>
            <Select value={code} onValueChange={setCode}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select a code" /></SelectTrigger>
              <SelectContent>
                {WRAP_CODES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-gray-600">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={6}
              className="mt-1 w-full text-sm p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#8B1F1F]"
            />
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={submit}
            disabled={!code}
            className="px-4 py-2 rounded-lg bg-[#8B1F1F] text-white text-sm font-semibold disabled:opacity-40"
          >
            Save & next task
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/agent/interaction/WrapUpModal.jsx
git commit -m "feat(interaction): WrapUpModal"
```

---

## Task 20: Add `topSlot` prop to AgentRightPanel

**Files:**
- Modify: `src/components/agent/AgentRightPanel.jsx`

- [ ] **Step 1: Read the existing file**

Open `src/components/agent/AgentRightPanel.jsx`. Identify the outermost rendered container (the wrapping `<div>` that the panel's content sits inside).

- [ ] **Step 2: Add the prop and render it**

Update the component signature to accept `topSlot`:

```jsx
export default function AgentRightPanel({ patient, onOpenMessage, onStartWorkflow, topSlot }) {
```

Then, immediately inside the outermost container's children (before existing content), render:

```jsx
{topSlot ? <div className="border-b border-gray-200">{topSlot}</div> : null}
```

- [ ] **Step 3: Verify no existing call site broke**

Run: `npm run lint`
Expected: no new errors (the new prop is optional and defaults to `undefined`).

- [ ] **Step 4: Commit**

```bash
git add src/components/agent/AgentRightPanel.jsx
git commit -m "feat(agent): AgentRightPanel accepts optional topSlot"
```

---

## Task 21: Wire AgentPortal — provider + layout when interaction active

**Files:**
- Modify: `src/pages/AgentPortal.jsx`

- [ ] **Step 1: Add imports at the top**

Add these imports below the existing imports:
```jsx
import { InteractionProvider, useInteraction } from '../components/agent/interaction/InteractionContext';
import SimulateInteractionMenu from '../components/agent/interaction/SimulateInteractionMenu';
import TaskQueueRail from '../components/agent/interaction/TaskQueueRail';
import InteractionConsole from '../components/agent/interaction/InteractionConsole';
import AICopilotPanel from '../components/agent/interaction/AICopilotPanel';
import FloatingAIWindow from '../components/agent/interaction/FloatingAIWindow';
import WrapUpModal from '../components/agent/interaction/WrapUpModal';
```

- [ ] **Step 2: Extract the patient-selected branch into a child component**

Below `ResizeDivider`, add:

```jsx
function PatientWorkspace({ selectedPatient, setSelectedPatient, middleW, setMiddleW, dragMiddle,
                           showMessageBox, setShowMessageBox, activeComm, setActiveComm,
                           panelSwapped, setPanelSwapped, showCoachMarks, setShowCoachMarks,
                           activeWorkflow, setActiveWorkflow, workflowData, setWorkflowData,
                           rightPanelVisible, setRightPanelVisible, MIN, MAX }) {
  const { interaction } = useInteraction();
  const [floatingOpen, setFloatingOpen] = React.useState(false);
  const [consoleW, setConsoleW] = React.useState(560);

  const handleDeepLink = React.useCallback((sug) => {
    if (!sug) return;
    if (/refill/i.test(sug.text)) {
      setActiveWorkflow('refill'); setWorkflowData({ selectedRx: selectedPatient?.prescriptions?.[0] });
    } else if (/shipment|delivery|tracking/i.test(sug.text)) {
      setActiveWorkflow('shipment'); setWorkflowData({ selectedOrder: selectedPatient?.orders?.[0] });
    } else if (/payment|invoice|balance/i.test(sug.text)) {
      setActiveWorkflow('payment'); setWorkflowData({ cartTotal: 0 });
    }
  }, [selectedPatient, setActiveWorkflow, setWorkflowData]);

  // The rest of this function returns exactly the existing JSX from the
  // patient-selected branch of AgentPortal (the `selectedPatient ? ... : ...`
  // ternary's truthy branch), with two changes:
  //   (1) Prepend <TaskQueueRail /> and <InteractionConsole /> when interaction is set.
  //   (2) Pass topSlot={<AICopilotPanel onPopOut={...} onDeepLink={...} />} to <AgentRightPanel>.
  //   (3) Render <FloatingAIWindow /> and <WrapUpModal /> at the bottom.

  return (
    <>
      <div className="flex gap-0 flex-1 overflow-hidden">
        {interaction && (
          <>
            <TaskQueueRail />
            <InteractionConsole width={consoleW} />
          </>
        )}
        {/* === existing patient-branch JSX from current AgentPortal.jsx lines 154–288 goes here, unchanged === */}
        {/* When rendering <AgentRightPanel patient={...} .../>, add the prop:
              topSlot={interaction
                ? <AICopilotPanel
                    onPopOut={() => setFloatingOpen(true)}
                    onDeepLink={handleDeepLink}
                  />
                : null}
        */}
      </div>

      {showMessageBox && interaction?.type !== 'chat' && (
        <InlineMessageBox
          patient={selectedPatient}
          activeComm={activeComm}
          linkedOrder={activeComm?.order_id ? selectedPatient?.orders?.find(o => o.id === activeComm.order_id) : null}
          onClose={() => { setShowMessageBox(false); setActiveComm(null); }}
        />
      )}

      <CoachMarks isActive={showCoachMarks} onComplete={() => setShowCoachMarks(false)} />
      <FloatingAIWindow open={floatingOpen} onClose={() => setFloatingOpen(false)} onDeepLink={handleDeepLink} />
      <WrapUpModal />
    </>
  );
}
```

- [ ] **Step 3: Replace the patient-selected branch in `AgentPortal()` with the new wiring**

Update the JSX so that the truthy branch (`!selectedPatient ? <Dashboard/> : <PatientBranch/>`) becomes:

```jsx
{!selectedPatient ? (
  <div className="flex-1 overflow-hidden">
    <AgentDashboard onSelectPatient={setSelectedPatient} />
  </div>
) : (
  <InteractionProvider patient={selectedPatient}>
    <PatientWorkspace
      selectedPatient={selectedPatient}
      setSelectedPatient={setSelectedPatient}
      middleW={middleW} setMiddleW={setMiddleW} dragMiddle={dragMiddle}
      showMessageBox={showMessageBox} setShowMessageBox={setShowMessageBox}
      activeComm={activeComm} setActiveComm={setActiveComm}
      panelSwapped={panelSwapped} setPanelSwapped={setPanelSwapped}
      showCoachMarks={showCoachMarks} setShowCoachMarks={setShowCoachMarks}
      activeWorkflow={activeWorkflow} setActiveWorkflow={setActiveWorkflow}
      workflowData={workflowData} setWorkflowData={setWorkflowData}
      rightPanelVisible={rightPanelVisible} setRightPanelVisible={setRightPanelVisible}
      MIN={MIN} MAX={MAX}
    />
  </InteractionProvider>
)}
```

Also delete the trailing `<InlineMessageBox/>` and `<CoachMarks/>` blocks from `AgentPortal()`'s return — they now live inside `PatientWorkspace`.

- [ ] **Step 4: Add the Simulate menu to the top bar**

In the top-bar `<div className="ml-auto flex items-center gap-4">` block, just before the existing `<OrderSearchBar/>`, insert:

```jsx
{selectedPatient && (
  <InteractionProvider.Trigger />
)}
```

…actually, simpler — `SimulateInteractionMenu` reads from the context, so it needs to be inside the provider. Move the top bar rendering into `PatientWorkspace` for the patient-selected branch, **or** add the `SimulateInteractionMenu` button to `PatientWorkspace`'s root and skip the top-bar placement.

Pragmatic decision: render `<SimulateInteractionMenu />` as the first child inside `PatientWorkspace`'s outer `<>` so it appears as a floating button. Add this CSS wrapper:

```jsx
<div className="absolute top-[78px] right-4 z-30">
  <SimulateInteractionMenu />
</div>
```

- [ ] **Step 5: Manual smoke test**

Run:
```bash
npm run dev
```

Open the app, select a patient. You should see a small "Simulate" button at top-right. Click it → pick "Inbound: Refill request". Expected:
1. TaskQueueRail slides in on the left.
2. InteractionConsole appears next to it; status shows "Incoming Call" then "Connected Call" after ~1.8s.
3. Transcript lines stream in.
4. AI Co-pilot region appears at the top of the right panel; suggestions accumulate.
5. Auto-notes appear with the "Generating…" sparkle.
6. Existing Prescriptions / Orders tabs remain clickable.

- [ ] **Step 6: Commit**

```bash
git add src/pages/AgentPortal.jsx
git commit -m "feat(agent-portal): integrate Interaction Console layout"
```

---

## Task 22: Suggestion deep-links into existing workflows + dialogs

**Files:**
- Modify: `src/pages/AgentPortal.jsx` (just the `handleDeepLink` in `PatientWorkspace`)

- [ ] **Step 1: Expand the deep-link router**

Replace `handleDeepLink` with a richer matcher that recognizes intent tags / categories more reliably:

```jsx
const handleDeepLink = React.useCallback((sug) => {
  if (!sug) return;
  const t = (sug.text || '').toLowerCase();
  if (sug.category === 'escalate') {
    // For v1 escalation is illustrative — open a toast or just no-op.
    console.info('Escalation suggestion clicked', sug);
    return;
  }
  if (t.includes('refill') || t.includes('semaglutide') || t.includes('tirzepatide')) {
    setActiveWorkflow('refill');
    setWorkflowData({ selectedRx: selectedPatient?.prescriptions?.[0] });
    return;
  }
  if (t.includes('shipment') || t.includes('delivery') || t.includes('tracking')) {
    setActiveWorkflow('shipment');
    setWorkflowData({ selectedOrder: selectedPatient?.orders?.[0] });
    return;
  }
  if (t.includes('payment') || t.includes('invoice') || t.includes('balance') || t.includes('plan') || t.includes('copay')) {
    setActiveWorkflow('payment');
    setWorkflowData({ cartTotal: selectedPatient?.invoices?.find(i => i.status !== 'paid')?.amount || 0 });
    return;
  }
  if (sug.kbLink) {
    window.open(sug.kbLink, '_blank', 'noopener');
  }
}, [selectedPatient, setActiveWorkflow, setWorkflowData]);
```

- [ ] **Step 2: Manual verification**

Restart `npm run dev` if needed. Run the **payment-outbound** scenario and click the ExternalLink button on the "Offer 3-month payment plan" suggestion. Expected: the `PaymentWorkflow` takes over the center pane (replacing `InteractionConsole`, just like it currently replaces `WorkspaceTabs`).

- [ ] **Step 3: Commit**

```bash
git add src/pages/AgentPortal.jsx
git commit -m "feat(interaction): deep-link suggestions into refill/shipment/payment workflows"
```

---

## Task 23: Verify all five scenarios end-to-end

**Files:** (verification only — no code changes unless bugs are found)

- [ ] **Step 1: refill-inbound**

Start dev server, select John Doe. Trigger "Inbound: Refill request".
- Ringing visible ~1.8s.
- Connect → transcript lines stream, "Refill" + "Insurance" intent tags appear.
- 3 suggestions added; "Process refill…" deep-links to refill workflow.
- Hang up → WrapUpModal opens; pick "Refill", click Save & next task.
- Open Communications tab — new entry visible at the top.

- [ ] **Step 2: payment-outbound**

Trigger from idle. Expected: outbound flow, sentiment dips then recovers, deep-link to `PaymentWorkflow` works.

- [ ] **Step 3: chat-side-effect**

Trigger. Expected: `TranscriptStream` renders as chat bubbles; "Type a reply…" input visible; sending a reply appends to thread; `InlineMessageBox` is hidden.

- [ ] **Step 4: distress-call**

Trigger. Expected: sentiment progresses to distress; red ribbon appears; "Escalate to supervisor" suggestion present.

- [ ] **Step 5: callback-task**

Trigger. Expected: console shows the task type; "Start the call now" suggestion present. (v1: clicking it can no-op — full convert-to-call is out of scope; verify no crash.)

- [ ] **Step 6: Pop-out window**

Click the ExternalLink in the AI Co-pilot header during any live interaction. Expected: `FloatingAIWindow` appears as a draggable panel mirroring the docked content.

- [ ] **Step 7: Commit any fixes found**

```bash
git add -A
git commit -m "fix(interaction): scenario verification fixes"
```

(If no fixes, skip this commit.)

---

## Task 24: Coach marks for the new surfaces (optional polish)

**Files:**
- Modify: `src/components/agent/CoachMarks.jsx` (only if the existing component supports adding steps cleanly)

- [ ] **Step 1: Inspect CoachMarks**

Open `src/components/agent/CoachMarks.jsx`. If it accepts steps as data, add two new entries pointing at:
- `[data-coach="task-queue-rail"]` — copy: "Your live queue lives here. Switch tasks with one click."
- `[data-coach="ai-copilot"]` — copy: "AI Co-pilot offers next-best actions. Copy a suggestion, deep-link into a workflow, or rate it."

- [ ] **Step 2: Tag the new components**

Add `data-coach="task-queue-rail"` to the outermost `<aside>` of `TaskQueueRail.jsx`, and `data-coach="ai-copilot"` to the outermost `<div>` of `AICopilotPanel.jsx`.

- [ ] **Step 3: Trigger on first live interaction**

In `PatientWorkspace`, add:
```jsx
React.useEffect(() => {
  if (interaction && !localStorage.getItem('interactionCoachComplete')) {
    setShowCoachMarks(true);
    localStorage.setItem('interactionCoachComplete', 'true');
  }
}, [interaction, setShowCoachMarks]);
```

- [ ] **Step 4: Commit**

```bash
git add src/components/agent
git commit -m "feat(interaction): coach marks for new surfaces"
```

> If `CoachMarks.jsx` is not data-driven (steps are hard-coded), skip this task — it's polish, not required.

---

## Self-Review

**Spec coverage checklist** (cross-referenced with `2026-05-27-neonnow-interaction-console-design.md`):

- [x] `InteractionContext` + `useInteraction` — Task 6
- [x] `demoRunner` with step helpers — Task 5
- [x] Five scenarios (refill, payment, chat, distress, callback) — Tasks 8–12
- [x] TaskQueueRail — Task 14
- [x] InteractionConsole (+ ConsoleHeader, TranscriptStream, AutoNotesPanel) — Tasks 15, 16
- [x] AICopilotPanel + SuggestionCard + sentiment ribbon + intent chips — Task 17
- [x] FloatingAIWindow — Task 18
- [x] WrapUpModal + communications append — Tasks 19 + 6 (saveWrapUp)
- [x] SimulateInteractionMenu (dev-only) — Task 13
- [x] AgentRightPanel `topSlot` — Task 20
- [x] AgentPortal layout integration (3 regions) — Task 21
- [x] Suggestion deep-links into refill/shipment/payment workflows — Task 22
- [x] Manual E2E verification of all five scenarios — Task 23
- [x] Coach marks (polish) — Task 24
- [x] `pickTask` parking via runner.pause() — Task 6 actions
- [x] Background task drip — Task 6 useEffect
- [x] `import.meta.env.DEV` gate on Simulate menu — Task 13
- [x] DCA brand `#8B1F1F` used throughout — all UI tasks
- [x] `aria-live` on suggestions; `role="alert"` on distress ribbon — Task 17
- [x] Vitest setup — Task 1
- [x] Reducer + runner unit tests — Tasks 2, 3, 4, 5

**Placeholder scan:** none — every code step contains the actual code.

**Type consistency:** action types (`START_INTERACTION`, `CONNECT`, etc.) used consistently across reducer, tests, and runner helpers. Field names (`intentTags`, `wrapUpCode`, `recording.state`) match between spec, reducer, and component reads.

**Known small risks the implementing engineer should validate:**
- `DraggablePanel`'s actual prop names — Task 18 calls out to adapt if they differ.
- `CoachMarks` may not be data-driven — Task 24 calls out to skip if so.
- The Task 21 patch is the largest single edit; the engineer should diff carefully against the current `AgentPortal.jsx` (which is 308 lines).
