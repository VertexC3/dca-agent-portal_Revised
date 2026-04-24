import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Search, Check, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock colleagues data
const MOCK_COLLEAGUES = [
  { id: 1, name: 'Sarah Mitchell', email: 'sarah.mitchell@dcapharmacy.com', role: 'Senior Agent', avatar: 'S' },
  { id: 2, name: 'James Chen', email: 'james.chen@dcapharmacy.com', role: 'Billing Specialist', avatar: 'J' },
  { id: 3, name: 'Maria Garcia', email: 'maria.garcia@dcapharmacy.com', role: 'Pharmacy Tech', avatar: 'M' },
  { id: 4, name: 'David Johnson', email: 'david.johnson@dcapharmacy.com', role: 'Team Lead', avatar: 'D' },
  { id: 5, name: 'Lisa Wong', email: 'lisa.wong@dcapharmacy.com', role: 'Customer Service', avatar: 'L' },
];

export default function ColleaguePicker({ onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const filtered = search
    ? MOCK_COLLEAGUES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.role.toLowerCase().includes(search.toLowerCase())
      )
    : MOCK_COLLEAGUES;

  const handleSelect = () => {
    const selected = MOCK_COLLEAGUES.find(c => c.id === selectedId);
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">Forward to Colleague</h2>
            <p className="text-xs text-gray-500 mt-0.5">Select a team member to share this message</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name or role..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 text-xs h-9 bg-white"
            />
          </div>
        </div>

        {/* Colleague list */}
        <div className="flex-1 overflow-y-auto max-h-[400px]">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-400">
              No colleagues found
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filtered.map(colleague => (
                <button
                  key={colleague.id}
                  onClick={() => setSelectedId(colleague.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 ${
                    selectedId === colleague.id
                      ? 'bg-red-50 border-[#8B1F1F] ring-1 ring-[#8B1F1F]/30'
                      : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                    selectedId === colleague.id ? 'bg-[#8B1F1F]' : 'bg-gray-400'
                  }`}>
                    {colleague.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">{colleague.name}</p>
                    <p className="text-xs text-gray-500">{colleague.role}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{colleague.email}</p>
                  </div>
                  {selectedId === colleague.id && (
                    <Check className="w-5 h-5 text-[#8B1F1F] flex-shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-9 text-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSelect}
            disabled={!selectedId}
            className="flex-1 h-9 text-sm bg-[#8B1F1F] hover:bg-[#721919] text-white disabled:opacity-50"
          >
            <Mail className="w-4 h-4 mr-1.5" />
            Forward
          </Button>
        </div>
      </div>
    </div>
  );
}