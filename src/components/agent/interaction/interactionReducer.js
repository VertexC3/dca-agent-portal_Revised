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
    default:
      return state;
  }
}
