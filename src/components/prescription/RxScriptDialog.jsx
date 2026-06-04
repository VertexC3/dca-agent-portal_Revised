import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

/**
 * RxScriptDialog — simulates a doctor's prescription ("script") as a popup,
 * including a handwritten-style prescriber signature. Read-only; for demo use.
 *
 * Works with both the patient-side prescription shape (name, dosage, id,
 * lastFilled, dateWritten) and the agent-side shape (name, dosage, rx_number,
 * last_filled, frequency). Pass the optional `patient` for richer prescriber
 * details (physician NPI / phone / address).
 */
export default function RxScriptDialog({ open, onClose, prescription, patient }) {
  if (!prescription) return null;

  const rx = {
    name: prescription.name,
    dosage: prescription.dosage,
    frequency: prescription.frequency,
    rxNumber: prescription.rx_number || prescription.id || '—',
    prescriber: prescription.prescriber || patient?.physician || 'Prescribing Physician',
    refills: prescription.refills ?? 0,
    dateWritten: prescription.date_written || prescription.dateWritten || prescription.last_filled || prescription.lastFilled,
  };

  const sig = [
    rx.dosage ? `Take/Inject ${rx.dosage}` : 'Take as directed',
    rx.frequency ? rx.frequency.toLowerCase() : '',
  ]
    .filter(Boolean)
    .join(' — ');

  const writtenDate = rx.dateWritten ? safeFormat(rx.dateWritten) : safeFormat(new Date().toISOString());
  const npi = patient?.physician_npi || '1234567890';
  const phone = patient?.physician_phone || '(615) 555-0100';
  const patientName = patient?.name || patient?.full_name || 'Patient';
  const patientAddress = patient?.address || patient?.orders?.[0]?.delivered_to || '—';

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose?.()}>
      <DialogContent className="max-w-lg bg-white p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-gray-100">
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <span className="font-serif text-2xl text-[#8B1F1F] leading-none">℞</span>
            Prescription
          </DialogTitle>
        </DialogHeader>

        {/* The script pad */}
        <div className="px-6 py-5">
          <div className="rounded-lg border-2 border-gray-300 bg-[#fffdf7] p-5 font-serif text-gray-900 shadow-inner">
            {/* Clinic header */}
            <div className="flex items-start justify-between border-b border-gray-300 pb-3">
              <div>
                <p className="text-base font-bold tracking-tight">{rx.prescriber}, MD</p>
                <p className="text-xs text-gray-600">Internal Medicine</p>
                <p className="text-xs text-gray-600">NPI: {npi} &middot; {phone}</p>
              </div>
              <div className="text-right text-xs text-gray-600">
                <p className="font-semibold text-gray-800">DCA Medical Group</p>
                <p>123 Clinic Way</p>
                <p>Franklin, TN 37064</p>
              </div>
            </div>

            {/* Patient + date */}
            <div className="flex items-end justify-between gap-4 mt-3 text-sm">
              <p className="flex-1">
                <span className="text-gray-500 text-xs">Patient:&nbsp;</span>
                <span className="border-b border-gray-300 inline-block min-w-[140px]">{patientName}</span>
              </p>
              <p>
                <span className="text-gray-500 text-xs">Date:&nbsp;</span>
                <span className="border-b border-gray-300 inline-block min-w-[90px]">{writtenDate}</span>
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-1">{patientAddress}</p>

            {/* Rx body */}
            <div className="flex gap-3 mt-5">
              <span className="font-serif text-4xl text-[#8B1F1F] leading-none">℞</span>
              <div className="flex-1">
                <p className="text-lg font-semibold">{rx.name}</p>
                <p className="text-sm text-gray-700 mt-1"><span className="text-gray-500">Sig:</span> {sig}</p>
                <p className="text-sm text-gray-700 mt-0.5">
                  <span className="text-gray-500">Refills:</span> {rx.refills}
                  <span className="text-gray-400"> &middot; </span>
                  <span className="text-gray-500">Rx #:</span> {rx.rxNumber}
                </p>
                <p className="text-xs text-gray-500 mt-2">Dispense as written. Substitution permitted unless indicated.</p>
              </div>
            </div>

            {/* Signature */}
            <div className="mt-6 flex items-end justify-between">
              <div className="text-xs text-gray-500">
                <p>DEA# AD{(npi || '').slice(-7) || '1234567'}</p>
              </div>
              <div className="text-right">
                <Signature name={rx.prescriber} />
                <div className="border-t border-gray-400 w-52 mt-0.5 ml-auto" />
                <p className="text-xs text-gray-500 mt-1">Prescriber Signature</p>
              </div>
            </div>
          </div>

          {/* Verified strip */}
          <div className="mt-3 flex items-center gap-1.5 text-xs text-green-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            Electronically signed &amp; verified &middot; {writtenDate}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 pb-5">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button className="bg-[#8B1F1F] hover:bg-[#721919] text-white" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Handwritten-style signature rendered from the prescriber's name. */
function Signature({ name }) {
  return (
    <span
      className="inline-block text-3xl text-blue-900 leading-none pr-2 -mb-1 select-none"
      style={{ fontFamily: '"Snell Roundhand","Brush Script MT","Segoe Script",cursive', fontStyle: 'italic', transform: 'rotate(-3deg)' }}
    >
      {name}
    </span>
  );
}

function safeFormat(value) {
  try {
    return format(new Date(value), 'MMM d, yyyy');
  } catch {
    return String(value);
  }
}
