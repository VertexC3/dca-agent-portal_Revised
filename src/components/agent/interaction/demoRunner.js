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
  let remaining = [];
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
