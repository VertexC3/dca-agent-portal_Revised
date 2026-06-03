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
