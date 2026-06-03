import { describe, it, expect } from 'vitest';
import { reducer, initialState } from '../interactionReducer';
import { mockPatients } from '@/data/mockPatients';

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
