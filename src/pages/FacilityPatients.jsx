import React, { useState } from 'react';
import { Users, Pill, Stethoscope, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

// Mock patient data
const mockPatients = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    patient_since: '2024-06-15',
    physician_name: 'Dr. Sarah Smith',
    physician_specialty: 'Endocrinology',
    prescriptions: [
      { name: 'Semaglutide 2.4mg', refills_remaining: 3, last_filled: '2026-01-15' },
      { name: 'Metformin 500mg', refills_remaining: 5, last_filled: '2026-01-10' }
    ],
    address: '123 Main St, Franklin, TN 37064',
    total_orders: 8
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '(555) 234-5678',
    patient_since: '2024-08-20',
    physician_name: 'Dr. Michael Johnson',
    physician_specialty: 'Internal Medicine',
    prescriptions: [
      { name: 'Tirzepatide 5mg', refills_remaining: 2, last_filled: '2026-01-20' }
    ],
    address: '456 Oak Ave, Nashville, TN 37203',
    total_orders: 5
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    phone: '(555) 345-6789',
    patient_since: '2025-02-10',
    physician_name: 'Dr. Emily Davis',
    physician_specialty: 'Family Medicine',
    prescriptions: [
      { name: 'Semaglutide 1mg', refills_remaining: 4, last_filled: '2026-01-18' },
      { name: 'Atorvastatin 20mg', refills_remaining: 6, last_filled: '2026-01-12' },
      { name: 'Lisinopril 10mg', refills_remaining: 3, last_filled: '2026-01-08' }
    ],
    address: '789 Pine Rd, Brentwood, TN 37027',
    total_orders: 12
  }
];

export default function FacilityPatients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDetail, setSelectedDetail] = useState(null);

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-h-screen">
      {/* Parallax Background Elements */}
      <motion.div
        className="absolute top-10 right-32 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl pointer-events-none"
        animate={{
          y: [0, 35, 0],
          x: [0, 15, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-10 left-32 w-72 h-72 bg-pink-200/20 rounded-full blur-3xl pointer-events-none"
        animate={{
          y: [0, -30, 0],
          x: [0, -20, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative z-10 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-1">Manage patient information</p>
        </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search patients by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-12"
        />
      </div>

      {/* Summary Card */}
      <Card className="border-2 border-purple-200 bg-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Users className="w-12 h-12 text-purple-600" />
            <div>
              <p className="text-3xl font-bold text-purple-900">{mockPatients.length}</p>
              <p className="text-sm text-purple-700">Total Active Patients</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPatients.map(patient => (
          <Card key={patient.id} className="hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Patient Info */}
                <div>
                  <p className="text-lg font-bold text-gray-900">{patient.name}</p>
                  <p className="text-sm text-gray-600">{patient.email}</p>
                  <p className="text-sm text-gray-600">{patient.phone}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Patient since {format(new Date(patient.patient_since), 'MMM yyyy')}</span>
                  </div>
                </div>

                {/* Prescriptions */}
                <div>
                  <button
                    onClick={() => setSelectedDetail({ type: 'prescriptions', patient })}
                    className="flex items-center gap-2 text-left hover:text-[#1a1f5c] transition-colors group"
                  >
                    <Pill className="w-5 h-5 text-[#1a1f5c]" />
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:underline">
                        {patient.prescriptions.length} Prescriptions
                      </p>
                      <p className="text-xs text-gray-600">Click to view details</p>
                    </div>
                  </button>
                </div>

                {/* Physician */}
                <div>
                  <button
                    onClick={() => setSelectedDetail({ type: 'physician', patient })}
                    className="flex items-center gap-2 text-left hover:text-[#1a1f5c] transition-colors group"
                  >
                    <Stethoscope className="w-5 h-5 text-[#1a1f5c]" />
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:underline">
                        {patient.physician_name}
                      </p>
                      <p className="text-xs text-gray-600">{patient.physician_specialty}</p>
                    </div>
                  </button>
                </div>

                {/* Address & Orders */}
                <div>
                  <button
                    onClick={() => setSelectedDetail({ type: 'address', patient })}
                    className="flex items-center gap-2 text-left hover:text-[#1a1f5c] transition-colors group mb-2"
                  >
                    <MapPin className="w-5 h-5 text-[#1a1f5c]" />
                    <div>
                      <p className="text-sm text-gray-900 group-hover:underline line-clamp-2">
                        {patient.address}
                      </p>
                    </div>
                  </button>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    {patient.total_orders} Total Orders
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedDetail} onOpenChange={() => setSelectedDetail(null)}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>
              {selectedDetail?.type === 'prescriptions' && 'Prescription Details'}
              {selectedDetail?.type === 'physician' && 'Physician Information'}
              {selectedDetail?.type === 'address' && 'Address Information'}
            </DialogTitle>
          </DialogHeader>
          {selectedDetail && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-900">{selectedDetail.patient.name}</p>
                <p className="text-sm text-gray-600">{selectedDetail.patient.email}</p>
              </div>

              {selectedDetail.type === 'prescriptions' && (
                <div className="space-y-3">
                  {selectedDetail.patient.prescriptions.map((rx, index) => (
                    <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="font-semibold text-gray-900">{rx.name}</p>
                      <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                        <div>
                          <p className="text-gray-600">Refills Remaining</p>
                          <p className="font-semibold text-gray-900">{rx.refills_remaining}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Last Filled</p>
                          <p className="font-semibold text-gray-900">
                            {format(new Date(rx.last_filled), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedDetail.type === 'physician' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-semibold text-gray-900 text-lg">{selectedDetail.patient.physician_name}</p>
                  <p className="text-gray-700 mt-1">{selectedDetail.patient.physician_specialty}</p>
                </div>
              )}

              {selectedDetail.type === 'address' && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-purple-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">{selectedDetail.patient.address}</p>
                      <p className="text-sm text-gray-600 mt-2">Total Orders: {selectedDetail.patient.total_orders}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}