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
      { id: 'RX-007', name: 'Ozempic 0.5mg', dosage: '0.5mg', frequency: 'Weekly injection', refills: 1, last_filled: '2026-01-05', status: 'active', prescriber: 'Dr. Sarah Johnson', rx_number: '924320' },
      { id: 'RX-008', name: 'Victoza 1.2mg', dosage: '1.2mg', frequency: 'Once daily injection', refills: 0, last_filled: '2025-12-28', status: 'active', prescriber: 'Dr. Sarah Johnson', rx_number: '924321' },
    ],
    orders: [
      { id: 'ORD-1001', receipt: '883659', date: '2026-01-15', medication: 'Semaglutide 2.4mg', amount: 250.00, status: 'Delivered', tracking: '144RCQ7IMNAA1', delivered_at: '2026-01-17 @ 2:14 PM', delivered_to: '123 Main St, Franklin, TN 37064' },
      { id: 'ORD-1002', receipt: '883660', date: '2026-04-05', medication: 'Metformin 500mg', amount: 45.00, status: 'In Progress', tracking: '144RCQ7IMNAA2', est_delivery: '2026-04-08', delivery_window: '10:00 AM – 2:00 PM' },
      { id: 'ORD-1003', receipt: '883661', date: '2025-12-20', medication: 'Semaglutide 2.4mg', amount: 250.00, status: 'Delivered', tracking: '144RCQ7IMNAA3', delivered_at: '2025-12-22 @ 11:47 AM', delivered_to: '123 Main St, Franklin, TN 37064' },
    ],
    communications: [
      { id: 'COM-001', date: '2026-01-20', type: 'phone', subject: 'Refill inquiry', summary: 'Patient called about refill for Semaglutide. Approved and processed.', agent: 'Sarah K.', duration: '4m 32s', order_id: 'ORD-1001' },
      { id: 'COM-002', date: '2026-01-10', type: 'email', subject: 'Delivery question', summary: 'Patient emailed asking about expected delivery timeline for ORD-1001 Semaglutide order.', agent: 'Mike T.', order_id: 'ORD-1001' },
      { id: 'COM-006', date: '2026-04-05', type: 'text', subject: 'Order confirmation', summary: 'Patient texted confirming order for Metformin 500mg. Estimated delivery April 8th.', agent: 'AI Agent', order_id: 'ORD-1002' },
    ],
    invoices: [
      { id: 'INV-001', number: 'INV-2026-001', date: '2026-01-31', amount: 295.00, paid: 295.00, status: 'paid' },
      { id: 'INV-002', number: 'INV-2025-012', date: '2025-12-31', amount: 250.00, paid: 250.00, status: 'paid' },
    ],
    cards: [{ id: 'CARD-001', last4: '4242', brand: 'Visa', expiry: '12/27', is_default: true }],
    family_members: [
      { id: 'FM-1', name: 'Mary Doe', relation: 'Spouse', email: 'mary.doe@example.com', phone: '(555) 123-4568', profile_picture: null },
      { id: 'FM-2', name: 'Tommy Doe', relation: 'Son', email: 'tommy.doe@example.com', phone: '(555) 123-4569', profile_picture: null },
    ]
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
      { id: 'RX-009', name: 'Jardiance 10mg', dosage: '10mg', frequency: 'Once daily', refills: 0, last_filled: '2025-12-10', status: 'active', prescriber: 'Dr. Michael Chen', rx_number: '924322' },
    ],
    orders: [
      { id: 'ORD-2001', receipt: '883662', date: '2026-01-20', medication: 'Tirzepatide 5mg', amount: 350.00, status: 'In Transit', tracking: '144RCQ7IMNAA4' },
      { id: 'ORD-2002', receipt: '883663', date: '2025-12-15', medication: 'Tirzepatide 5mg', amount: 350.00, status: 'Delivered', tracking: '144RCQ7IMNAA5' },
    ],
    communications: [
      { id: 'COM-003', date: '2026-01-18', type: 'text', subject: 'Side effects question', summary: 'Patient texted about nausea side effects from Tirzepatide. Advised to eat small meals before injection.', agent: 'AI Agent', order_id: 'ORD-2001' },
      { id: 'COM-010', date: '2026-01-21', type: 'phone', subject: 'Shipping delay inquiry', summary: 'Patient called to check on delayed Tirzepatide shipment. Confirmed order is in transit, ETA 2–3 business days.', agent: 'Sarah K.', duration: '3m 12s', order_id: 'ORD-2001' },
      { id: 'COM-011', date: '2025-12-16', type: 'email', subject: 'Delivery confirmation', summary: 'Patient emailed to confirm receipt of December Tirzepatide order. Package arrived on time.', agent: 'Mike T.', order_id: 'ORD-2002' },
      { id: 'COM-012', date: '2025-12-17', type: 'ai_agent', subject: 'Post-delivery satisfaction', summary: 'AI Agent followed up after delivery of ORD-2002. Patient confirmed receipt and reported no issues.', agent: 'AI Agent', order_id: 'ORD-2002' },
    ],
    invoices: [
      { id: 'INV-003', number: 'INV-2026-002', date: '2026-01-31', amount: 350.00, paid: 0, status: 'open',
        line_items: [
          { name: 'Tirzepatide 5mg', dosage: '5mg', frequency: 'Weekly injection', rx_number: '924316', qty: 1, amount: 350.00 },
        ]
      },
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
      { id: 'COM-004', date: '2026-01-15', type: 'phone', subject: 'Billing dispute', summary: 'Patient called about unexpected charge on invoice. Reviewed and confirmed correct amount. Patient satisfied.', agent: 'Sarah K.', duration: '8m 15s', order_id: 'ORD-3001' },
      { id: 'COM-013', date: '2026-01-19', type: 'text', subject: 'Processing status check', summary: 'Patient texted asking why Semaglutide order is still in processing. Advised standard processing takes 2–3 days.', agent: 'AI Agent', order_id: 'ORD-3001' },
      { id: 'COM-014', date: '2026-01-13', type: 'email', subject: 'Atorvastatin delivery', summary: 'Patient emailed confirming receipt of Atorvastatin 20mg. No issues reported with the order.', agent: 'Mike T.', order_id: 'ORD-3002' },
      { id: 'COM-005', date: '2025-12-20', type: 'email', subject: 'Lisinopril dosage question', summary: 'Patient emailed asking about Lisinopril dosage instructions. Advised to take in the morning with water.', agent: 'AI Agent', order_id: 'ORD-3003' },
      { id: 'COM-015', date: '2025-12-11', type: 'phone', subject: 'Lisinopril delivery issue', summary: 'Patient called saying Lisinopril package arrived damaged. Replacement order was initiated immediately.', agent: 'Sarah K.', duration: '5m 44s', order_id: 'ORD-3003' },
    ],
    invoices: [
      { id: 'INV-004', number: 'INV-2026-003', date: '2026-01-31', amount: 260.00, paid: 100.00, status: 'partially_paid',
        line_items: [
          { name: 'Semaglutide 1mg', dosage: '1mg', frequency: 'Weekly injection', rx_number: '924317', qty: 1, amount: 200.00 },
          { name: 'Atorvastatin 20mg', dosage: '20mg', frequency: 'Once daily', rx_number: '924318', qty: 1, amount: 35.00 },
          { name: 'Lisinopril 10mg', dosage: '10mg', frequency: 'Once daily', rx_number: '924319', qty: 1, amount: 25.00 },
        ]
      },
    ],
    cards: []
  }
];