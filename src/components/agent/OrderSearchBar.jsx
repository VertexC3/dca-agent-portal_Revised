import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockPatients } from '../../pages/AgentPortal';
import { format } from 'date-fns';

function buildOrderIndex() {
  const results = [];
  for (const patient of mockPatients) {
    for (const order of patient.orders) {
      results.push({ patient, order });
    }
  }
  return results;
}

const ALL_ORDERS = buildOrderIndex();

export default function OrderSearchBar({ onSelectPatient }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const q = query.trim().toLowerCase();
  const matches = q.length < 2 ? [] : ALL_ORDERS.filter(({ patient, order }) =>
    order.id.toLowerCase().includes(q) ||
    order.tracking.toLowerCase().includes(q) ||
    order.receipt.toLowerCase().includes(q) ||
    patient.name.toLowerCase().includes(q) ||
    order.medication.toLowerCase().includes(q)
  );

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = ({ patient }) => {
    onSelectPatient(patient);
    setQuery('');
    setOpen(false);
  };

  const statusColor = (s) => {
    if (s === 'Delivered') return 'bg-green-100 text-green-800';
    if (s === 'In Transit' || s === 'In Progress') return 'bg-blue-100 text-blue-800';
    if (s === 'Processing') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div ref={containerRef} className="relative w-96">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search orders by tracking #, order ID, or patient name..."
          className="w-full h-9 pl-9 pr-8 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1F1F]/30 focus:border-[#8B1F1F] transition-colors"
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && q.length >= 2 && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl w-[480px] overflow-hidden">
          {matches.length === 0 ? (
            <div className="px-4 py-5 text-center text-xs text-gray-400">
              <Package className="w-6 h-6 mx-auto mb-1.5 opacity-30" />
              No orders found for <strong>"{query}"</strong>
            </div>
          ) : (
            <>
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Order Results</p>
                <span className="text-xs text-gray-400">{matches.length} found</span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {matches.map(({ patient, order }) => (
                  <button
                    key={order.id}
                    onClick={() => handleSelect({ patient, order })}
                    className="w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors flex items-start gap-3"
                  >
                    {/* Patient avatar */}
                    <div className="flex-shrink-0 mt-0.5">
                      {patient.profile_picture ? (
                        <img src={patient.profile_picture} alt={patient.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#8B1F1F] flex items-center justify-center text-white text-xs font-bold">
                          {patient.name.charAt(0)}
                        </div>
                      )}
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
            </>
          )}
        </div>
      )}
    </div>
  );
}