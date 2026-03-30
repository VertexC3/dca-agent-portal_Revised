import React, { useState } from 'react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import AgentRightPanel from '../components/agent/AgentRightPanel';

export const mockPatients = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    dob: '1985-03-15',
    patient_since: '2024-06-15',
    address: '123 Main St, Franklin, TN 37064',
    physician: 'Dr. Sarah Johnson',
    physician_npi: '1245319599',
    physician_phone: '(615) 555-0101',
    insurance: 'Blue Cross Blue Shield',
    allergies: 'Penicillin, Sulfa',
    profile_picture: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695285fc94e8ef46bde70e16/3816584ae_John.jpg',
    prescriptions: [
      { id: 'RX-001', name: 'Semaglutide 2.4mg', dosage: '2.4mg', frequency: 'Weekly injection', refills: 3, last_filled: '2026-01-15', status: 'active', prescriber: 'Dr. Sarah Johnson', rx_number: '924314' },
      { id: 'RX-002', name: 'Metformin 500mg', dosage: '500mg', frequency: 'Twice daily', refills: 5, last_filled: '2026-01-10', status: 'active', prescriber: 'Dr. Sarah Johnson', rx_number: '924315' },
    ],
    orders: [
      { id: 'ORD-1001', receipt: '883659', date: '2026-01-15', medication: 'Semaglutide 2.4mg', amount: 250.00, status: 'Delivered', tracking: '144RCQ7IMNAA1' },
      { id: 'ORD-1002', receipt: '883660', date: '2026-01-10', medication: 'Metformin 500mg', amount: 45.00, status: 'Delivered', tracking: '144RCQ7IMNAA2' },
      { id: 'ORD-1003', receipt: '883661', date: '2025-12-20', medication: 'Semaglutide 2.4mg', amount: 250.00, status: 'Delivered', tracking: '144RCQ7IMNAA3' },
    ],
    communications: [
      { id: 'COM-001', date: '2026-01-20', type: 'phone', subject: 'Refill inquiry', summary: 'Patient called about refill for Semaglutide. Approved and processed.', agent: 'Sarah K.', duration: '4m 32s' },
      { id: 'COM-002', date: '2026-01-10', type: 'email', subject: 'Delivery question', summary: 'Patient emailed asking about expected delivery timeline for recent order.', agent: 'Mike T.' },
    ],
    invoices: [
      { id: 'INV-001', number: 'INV-2026-001', date: '2026-01-31', amount: 295.00, paid: 295.00, status: 'paid' },
      { id: 'INV-002', number: 'INV-2025-012', date: '2025-12-31', amount: 250.00, paid: 250.00, status: 'paid' },
    ],
    cards: [{ id: 'CARD-001', last4: '4242', brand: 'Visa', expiry: '12/27', is_default: true }]
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '(555) 234-5678',
    dob: '1978-11-22',
    patient_since: '2024-08-20',
    address: '456 Oak Ave, Nashville, TN 37203',
    physician: 'Dr. Michael Chen',
    physician_npi: '1356824791',
    physician_phone: '(615) 555-0202',
    insurance: 'Aetna',
    allergies: 'None known',
    profile_picture: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695285fc94e8ef46bde70e16/2137e6a9f_Jane.jpg',
    prescriptions: [
      { id: 'RX-003', name: 'Tirzepatide 5mg', dosage: '5mg', frequency: 'Weekly injection', refills: 2, last_filled: '2026-01-20', status: 'active', prescriber: 'Dr. Michael Chen', rx_number: '924316' },
    ],
    orders: [
      { id: 'ORD-2001', receipt: '883662', date: '2026-01-20', medication: 'Tirzepatide 5mg', amount: 350.00, status: 'In Transit', tracking: '144RCQ7IMNAA4' },
      { id: 'ORD-2002', receipt: '883663', date: '2025-12-15', medication: 'Tirzepatide 5mg', amount: 350.00, status: 'Delivered', tracking: '144RCQ7IMNAA5' },
    ],
    communications: [
      { id: 'COM-003', date: '2026-01-18', type: 'text', subject: 'Side effects question', summary: 'Patient texted about nausea side effects from Tirzepatide. Advised to eat small meals before injection.', agent: 'AI Agent' },
    ],
    invoices: [
      { id: 'INV-003', number: 'INV-2026-002', date: '2026-01-31', amount: 350.00, paid: 0, status: 'open' },
    ],
    cards: [{ id: 'CARD-002', last4: '1234', brand: 'Mastercard', expiry: '08/26', is_default: true }]
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    phone: '(555) 345-6789',
    dob: '1992-07-08',
    patient_since: '2025-02-10',
    address: '789 Pine Rd, Brentwood, TN 37027',
    physician: 'Dr. Emily Rodriguez',
    physician_npi: '1467935802',
    physician_phone: '(615) 555-0303',
    insurance: 'United Healthcare',
    allergies: 'Aspirin',
    profile_picture: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695285fc94e8ef46bde70e16/f2d7127a8_Bob.jpg',
    prescriptions: [
      { id: 'RX-004', name: 'Semaglutide 1mg', dosage: '1mg', frequency: 'Weekly injection', refills: 4, last_filled: '2026-01-18', status: 'active', prescriber: 'Dr. Emily Rodriguez', rx_number: '924317' },
      { id: 'RX-005', name: 'Atorvastatin 20mg', dosage: '20mg', frequency: 'Once daily', refills: 6, last_filled: '2026-01-12', status: 'active', prescriber: 'Dr. Emily Rodriguez', rx_number: '924318' },
      { id: 'RX-006', name: 'Lisinopril 10mg', dosage: '10mg', frequency: 'Once daily', refills: 0, last_filled: '2026-01-08', status: 'active', prescriber: 'Dr. Emily Rodriguez', rx_number: '924319' },
    ],
    orders: [
      { id: 'ORD-3001', receipt: '883664', date: '2026-01-18', medication: 'Semaglutide 1mg', amount: 200.00, status: 'Processing', tracking: 'Pending' },
      { id: 'ORD-3002', receipt: '883665', date: '2026-01-12', medication: 'Atorvastatin 20mg', amount: 35.00, status: 'Delivered', tracking: '144RCQ7IMNAA6' },
      { id: 'ORD-3003', receipt: '883666', date: '2025-12-10', medication: 'Lisinopril 10mg', amount: 25.00, status: 'Delivered', tracking: '144RCQ7IMNAA7' },
    ],
    communications: [
      { id: 'COM-004', date: '2026-01-15', type: 'phone', subject: 'Billing dispute', summary: 'Patient called about unexpected charge on invoice. Reviewed and confirmed correct amount. Patient satisfied.', agent: 'Sarah K.', duration: '8m 15s' },
      { id: 'COM-005', date: '2025-12-20', type: 'email', subject: 'Lisinopril dosage question', summary: 'Patient emailed asking about Lisinopril dosage instructions. Advised to take in the morning with water.', agent: 'AI Agent' },
    ],
    invoices: [
      { id: 'INV-004', number: 'INV-2026-003', date: '2026-01-31', amount: 260.00, paid: 0, status: 'open' },
    ],
    cards: []
  }
];

export default function AgentPortal() {
  const [selectedPatient, setSelectedPatient] = useState(null);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top Bar: Patient Selection */}
      <div className="px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Select Patient:</label>
          <Select value={selectedPatient?.id || ''} onValueChange={(id) => {
            const patient = mockPatients.find(p => p.id === id);
            setSelectedPatient(patient || null);
          }}>
            <SelectTrigger className="w-80">
              <SelectValue placeholder="Choose a patient..." />
            </SelectTrigger>
            <SelectContent>
              {mockPatients.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  <span className="font-semibold">{p.name}</span> • {p.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content - Right Panel Only */}
      <div className="flex-1 overflow-hidden">
        <AgentRightPanel patient={selectedPatient} />
      </div>
    </div>
  );
}