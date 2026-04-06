import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Check } from 'lucide-react';

const SAMPLE_PHYSICIANS = [
  { name: 'Dr. Sarah Johnson', npi: '1245319599', specialty: 'Endocrinology', phone: '(615) 555-0101', location: 'Nashville, TN' },
  { name: 'Dr. Michael Chen', npi: '1356824791', specialty: 'Internal Medicine', phone: '(615) 555-0202', location: 'Nashville, TN' },
  { name: 'Dr. Emily Rodriguez', npi: '1467935802', specialty: 'Family Medicine', phone: '(615) 555-0303', location: 'Brentwood, TN' },
  { name: 'Dr. James Whitfield', npi: '1578046913', specialty: 'Obesity Medicine', phone: '(615) 555-0404', location: 'Franklin, TN' },
  { name: 'Dr. Priya Patel', npi: '1689157024', specialty: 'Endocrinology', phone: '(615) 555-0505', location: 'Murfreesboro, TN' },
  { name: 'Dr. Robert Keller', npi: '1790268135', specialty: 'Internal Medicine', phone: '(615) 555-0606', location: 'Nashville, TN' },
  { name: 'Dr. Angela Morris', npi: '1801379246', specialty: 'Family Medicine', phone: '(615) 555-0707', location: 'Hendersonville, TN' },
  { name: 'Dr. David Park', npi: '1912480357', specialty: 'Cardiology', phone: '(615) 555-0808', location: 'Brentwood, TN' },
  { name: 'Dr. Lisa Nguyen', npi: '1023591468', specialty: 'Obesity Medicine', phone: '(615) 555-0909', location: 'Franklin, TN' },
  { name: 'Dr. Thomas Greene', npi: '1134602579', specialty: 'Endocrinology', phone: '(615) 555-1010', location: 'Nashville, TN' },
];

export default function PhysicianPickerModal({ currentPhysician, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = SAMPLE_PHYSICIANS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.specialty.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = () => {
    if (selected) onSelect(selected);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div>
            <h3 className="font-bold text-sm text-gray-900">Select Physician</h3>
            <p className="text-xs text-gray-500 mt-0.5">Current: {currentPhysician}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-lg leading-none">✕</button>
        </div>

        {/* Search */}
        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, specialty, or location..."
              className="pl-8 text-xs h-8"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto max-h-[380px] px-4 pb-2 space-y-1.5">
          {filtered.map(p => {
            const isSelected = selected?.npi === p.npi;
            const isCurrent = p.name === currentPhysician;
            return (
              <button
                key={p.npi}
                onClick={() => setSelected(p)}
                className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                  isSelected
                    ? 'bg-[#8B1F1F]/5 border-[#8B1F1F] ring-1 ring-[#8B1F1F]/20'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold ${isSelected ? 'text-[#8B1F1F]' : 'text-gray-900'}`}>{p.name}</span>
                      {isCurrent && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0 rounded-full font-semibold">Current</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-gray-500">
                      <span>{p.specialty}</span>
                      <span>•</span>
                      <span>{p.location}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-gray-400">
                      <span>NPI: {p.npi}</span>
                      <span>•</span>
                      <span>{p.phone}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#8B1F1F] flex-shrink-0 mt-0.5" />}
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-6">No physicians found</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-end gap-2 bg-gray-50">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            className="h-8 text-xs bg-[#8B1F1F] hover:bg-[#721919]"
            disabled={!selected}
            onClick={handleConfirm}
          >
            Add to Profile
          </Button>
        </div>
      </div>
    </div>
  );
}