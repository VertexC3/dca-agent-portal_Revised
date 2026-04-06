import React from 'react';
import { X, Stethoscope, Pill, ShoppingCart, AlertTriangle, Phone, FileText, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function PhysicianContextPopup({ patient, onClose }) {
  if (!patient) return null;

  const { physician, physician_npi, physician_phone, prescriptions, orders, allergies, known_conditions } = patient;

  // Prescriptions from this physician
  const physicianRx = prescriptions.filter(rx =>
    rx.prescriber?.toLowerCase().includes(physician?.split(' ').pop()?.toLowerCase() || '')
  );
  const allRx = physicianRx.length > 0 ? physicianRx : prescriptions;

  const lowRefills = allRx.filter(rx => rx.refills <= 1);
  const activeRx = allRx.filter(rx => rx.refills > 0);
  const recentOrders = orders.slice(0, 3);

  // Build a narrative summary
  const totalSpend = orders.reduce((sum, o) => sum + o.amount, 0);
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-end sm:justify-end p-4 sm:pr-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">{physician}</p>
              <p className="text-white/60 text-xs">NPI: {physician_npi}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Calling badge */}
        <div className="bg-green-50 border-b border-green-100 px-4 py-2 flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-green-600 animate-pulse" />
          <span className="text-xs font-semibold text-green-700">Calling {physician_phone}</span>
          <Badge className="ml-auto bg-green-100 text-green-800 text-xs">Outbound</Badge>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">

          {/* Patient snapshot */}
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Patient: {patient.name}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div><span className="text-gray-500">DOB:</span> <span className="font-semibold text-gray-800">{format(new Date(patient.dob), 'MM/dd/yyyy')}</span></div>
              <div><span className="text-gray-500">ID:</span> <span className="font-semibold text-gray-800">{patient.id}</span></div>
              <div><span className="text-gray-500">Insurance:</span> <span className="font-semibold text-gray-800">{patient.insurance}</span></div>
              <div><span className="text-gray-500">Phone:</span> <span className="font-semibold text-gray-800">{patient.phone}</span></div>
            </div>
            {(allergies && allergies !== 'NKDA') && (
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
                <span className="text-red-700 font-semibold">Allergies: {allergies}</span>
              </div>
            )}
            {known_conditions && (
              <div className="mt-1 text-xs text-gray-600">
                <span className="font-semibold text-gray-700">Conditions:</span> {known_conditions}
              </div>
            )}
          </div>

          {/* Prescriptions context */}
          <div>
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-[#8B1F1F]" /> Prescriptions Under This Physician
            </p>
            {allRx.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No prescriptions on file</p>
            ) : (
              <div className="space-y-1.5">
                {allRx.map(rx => (
                  <div key={rx.id} className={`p-2 rounded-lg border text-xs ${
                    rx.refills === 0 ? 'bg-red-50 border-red-200' :
                    rx.refills <= 1 ? 'bg-yellow-50 border-yellow-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{rx.name}</span>
                      <Badge className={`text-xs ${
                        rx.refills === 0 ? 'bg-red-100 text-red-800' :
                        rx.refills <= 1 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>{rx.refills} refill{rx.refills !== 1 ? 's' : ''}</Badge>
                    </div>
                    <p className="text-gray-500 mt-0.5">{rx.dosage} · {rx.frequency}</p>
                    <p className="text-gray-400 text-xs">Last filled: {format(new Date(rx.last_filled), 'MMM d, yyyy')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order history summary */}
          <div>
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5 text-[#8B1F1F]" /> Recent Orders
            </p>
            <div className="space-y-1.5">
              {recentOrders.map(o => (
                <div key={o.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800">{o.medication}</p>
                    <p className="text-gray-400">{format(new Date(o.date), 'MMM d, yyyy')} · #{o.receipt}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${o.amount.toFixed(2)}</p>
                    <Badge className={`text-xs ${
                      o.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>{o.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm font-bold text-gray-900">{allRx.length}</p>
              <p className="text-xs text-gray-500">Active Rx</p>
            </div>
            <div className="text-center p-2 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm font-bold text-gray-900">{deliveredCount}</p>
              <p className="text-xs text-gray-500">Delivered</p>
            </div>
            <div className={`text-center p-2 rounded-lg border ${lowRefills.length > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-sm font-bold ${lowRefills.length > 0 ? 'text-yellow-700' : 'text-gray-900'}`}>{lowRefills.length}</p>
              <p className="text-xs text-gray-500">Low Refills</p>
            </div>
          </div>

          {/* Call talking points */}
          {lowRefills.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs font-bold text-amber-800 mb-1.5 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Suggested Talking Points
              </p>
              <ul className="space-y-1 text-xs text-amber-900">
                {lowRefills.map(rx => (
                  <li key={rx.id} className="flex items-start gap-1.5">
                    <span className="font-bold flex-shrink-0">•</span>
                    <span>
                      {rx.refills === 0
                        ? <><strong>{rx.name}</strong> has <strong>no refills remaining</strong> — request renewal</>
                        : <><strong>{rx.name}</strong> has only <strong>{rx.refills} refill left</strong> — confirm renewal</>
                      }
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}