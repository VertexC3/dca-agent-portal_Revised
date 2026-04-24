import React, { useState } from 'react';
import { X, Mail, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const COLLEAGUE_LIST = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah.johnson@dcapharm.com', role: 'Senior Agent' },
  { id: 2, name: 'Marcus Chen', email: 'marcus.chen@dcapharm.com', role: 'Support Agent' },
  { id: 3, name: 'Emily Rodriguez', email: 'emily.rodriguez@dcapharm.com', role: 'Billing Specialist' },
];

export default function ShareColleagueModal({ onClose, onShare }) {
  const [selectedColleagues, setSelectedColleagues] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [shared, setShared] = useState(false);

  const toggleColleague = (id) => {
    setSelectedColleagues(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleAddEmail = () => {
    if (newEmail.trim() && newEmail.includes('@')) {
      setSelectedColleagues(prev => [...prev, newEmail]);
      setNewEmail('');
      setShowEmailForm(false);
    }
  };

  const handleShare = () => {
    setShared(true);
    if (onShare) onShare(selectedColleagues);
    setTimeout(() => {
      setShared(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-[#8B1F1F] to-[#a52525] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-white" />
            <h2 className="font-bold text-white text-sm">Share with Colleague</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {shared ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 text-xl">✓</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">Shared successfully!</p>
              <p className="text-xs text-gray-500 mt-1">Message sent to {selectedColleagues.length} colleague{selectedColleagues.length !== 1 ? 's' : ''}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-gray-600 font-semibold">Select colleagues to share this message:</p>

              {/* Colleague List */}
              <div className="space-y-2">
                {COLLEAGUE_LIST.map(colleague => (
                  <button
                    key={colleague.id}
                    onClick={() => toggleColleague(colleague.id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      selectedColleagues.includes(colleague.id)
                        ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedColleagues.includes(colleague.id)}
                        onChange={() => {}}
                        className="mt-0.5 accent-[#8B1F1F] cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900">{colleague.name}</p>
                        <p className="text-xs text-gray-500 truncate">{colleague.email}</p>
                        <Badge className="mt-1 text-xs bg-gray-100 text-gray-700">{colleague.role}</Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Add Custom Email */}
              <div className="pt-2 border-t border-gray-200">
                {!showEmailForm ? (
                  <button
                    onClick={() => setShowEmailForm(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-[#8B1F1F] hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Custom Email
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      className="text-xs h-8"
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAddEmail();
                        if (e.key === 'Escape') { setShowEmailForm(false); setNewEmail(''); }
                      }}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-[#8B1F1F] hover:bg-[#721919] flex-1"
                        onClick={handleAddEmail}
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs flex-1"
                        onClick={() => { setShowEmailForm(false); setNewEmail(''); }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Custom Emails */}
              {selectedColleagues.some(s => typeof s === 'string') && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Custom Recipients</p>
                  {selectedColleagues.filter(s => typeof s === 'string').map((email, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-xs">
                      <span className="text-gray-700">{email}</span>
                      <button
                        onClick={() => setSelectedColleagues(prev => prev.filter(x => x !== email))}
                        className="text-gray-400 hover:text-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!shared && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-8 text-xs"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-8 text-xs bg-[#8B1F1F] hover:bg-[#721919]"
              onClick={handleShare}
              disabled={selectedColleagues.length === 0}
            >
              Share ({selectedColleagues.length})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}