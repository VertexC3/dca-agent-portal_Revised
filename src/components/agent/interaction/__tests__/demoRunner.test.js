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
    vi.advanceTimersByTime(0);
    vi.advanceTimersByTime(500);
    runner.pause();
    vi.advanceTimersByTime(5000);
    expect(dispatched.map(a => a.type)).toEqual(['A']);
    runner.resume();
    vi.advanceTimersByTime(499);
    expect(dispatched.map(a => a.type)).toEqual(['A']);
    vi.advanceTimersByTime(1);
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
