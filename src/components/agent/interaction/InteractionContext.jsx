import React, { createContext, useContext, useReducer, useMemo, useRef, useCallback, useEffect } from 'react';
import { reducer, initialState } from './interactionReducer';
import { createRunner } from './demoRunner';
import { scenarios } from './scenarios';
import { usePatients } from '@/hooks/usePatients';

const InteractionContext = createContext(null);

let intxIdCounter = 0;
const newIntxId = () => `intx_${++intxIdCounter}_${Date.now()}`;

export function InteractionProvider({ patient, onCommunicationsAppended, children }) {
  const { patients } = usePatients();
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
    const p = overridePatient || patients.find(mp => mp.id === scenario.patientId) || patient;
    const id = newIntxId();
    const startedAt = Date.now();
    dispatch({ type: 'START_INTERACTION', payload: {
      id, type: scenario.type, patient: p, queue: scenario.queue || 'Support',
      direction: scenario.direction || (scenario.type === 'voice-in' ? 'inbound' : 'outbound'),
      startedAt,
    }});
    runnerRef.current.start(scenario);
  }, [patient, patients]);

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
      mute: () => {},
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
          try { navigator.clipboard?.copyText(s.text); } catch {}
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
