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
