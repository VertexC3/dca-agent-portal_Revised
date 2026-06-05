import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePatients } from '@/hooks/usePatients';
import { format } from 'date-fns';

function buildOrderIndex(patients) {
  const results = [];
  for (const patient of patients) {
    for (const order of patient.orders) {
      results.push({ patient, order });
    }
  }
  return results;
}

function PatientAvatar({ patient }) {
  if (patient.profile_picture) {
    return (
      <img
        src={patient.profile_picture}
        alt={patient.name}
        className="w-8 h-8 rounded-full object-cover border border-gray-200"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-[#8B1F1F] flex items-center justify-center text-white text-xs font-bold">
      {patient.name.charAt(0)}
    </div>
  );
}

export default function OrderSearchBar({ onSelectPatient }) {
  const { patients } = usePatients();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const orderIndex = useMemo(() => buildOrderIndex(patients), [patients]);

  const q = query.trim().toLowerCase();
  const patientMatches = useMemo(() => {
    if (q.length < 2) return [];
    return patients.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.phone.includes(q)
    );
  }, [patients, q]);

  const orderMatches = useMemo(() => {
    if (q.length < 2) return [];
    return orderIndex.filter(({ order }) =>
      order.id.toLowerCase().includes(q) ||
      order.tracking.toLowerCase().includes(q) ||
      order.receipt.toLowerCase().includes(q) ||
      order.medication.toLowerCase().includes(q)
    );
  }, [orderIndex, q]);

  const hasResults = patientMatches.length > 0 || orderMatches.length > 0;

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelectPatient = (patient) => {
    onSelectPatient(patient);
    setQuery('');
    setOpen(false);
  };

  const handleSelectOrder = ({ patient }) => {
    handleSelectPatient(patient);
  };

  const statusColor = (s) => {
    if (s === 'Delivered') return 'bg-green-100 text-green-800';
    if (s === 'In Transit' || s === 'In Progress') return 'bg-blue-100 text-blue-800';
    if (s === 'Processing') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div ref={containerRef} className="relative w-full min-w-0 flex-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search by patient name, tracking #, or order ID..."
          className="w-full h-9 pl-9 pr-8 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1F1F]/30 focus:border-[#8B1F1F] transition-colors"
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && q.length >= 2 && (
        <div className="absolute left-0 right-0 lg:right-auto top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl w-full lg:w-[480px] overflow-hidden">
          {!hasResults ? (
            <div className="px-4 py-5 text-center text-xs text-gray-400">
              <Search className="w-6 h-6 mx-auto mb-1.5 opacity-30" />
              No results for <strong>"{query}"</strong>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {patientMatches.length > 0 && (
                <div>
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between sticky top-0">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Patients</p>
                    <span className="text-xs text-gray-400">{patientMatches.length} found</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {patientMatches.map(patient => (
                      <button
                        key={patient.id}
                        onClick={() => handleSelectPatient(patient)}
                        className="w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-3"
                      >
                        <PatientAvatar patient={patient} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900">{patient.name}</p>
                          <p className="text-xs text-gray-500 truncate">{patient.email} · {patient.phone}</p>
                        </div>
                        <Badge className="bg-gray-100 text-gray-600 text-xs flex-shrink-0">
                          {patient.orders.length} order{patient.orders.length !== 1 ? 's' : ''}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {orderMatches.length > 0 && (
                <div>
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between sticky top-0">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Orders</p>
                    <span className="text-xs text-gray-400">{orderMatches.length} found</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {orderMatches.map(({ patient, order }) => (
                      <button
                        key={order.id}
                        onClick={() => handleSelectOrder({ patient, order })}
                        className="w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors flex items-start gap-3"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <PatientAvatar patient={patient} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-bold text-gray-900">{patient.name}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-[#8B1F1F] font-semibold">{order.id}</span>
                            <Badge className={`text-xs ml-auto flex-shrink-0 ${statusColor(order.status)}`}>{order.status}</Badge>
                          </div>
                          <p className="text-xs font-medium text-gray-700 truncate">{order.medication}</p>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                            <span>Tracking: <span className="font-mono text-gray-600">{order.tracking}</span></span>
                            <span>Receipt #{order.receipt}</span>
                            <span>{format(new Date(order.date), 'MM/dd/yyyy')}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}