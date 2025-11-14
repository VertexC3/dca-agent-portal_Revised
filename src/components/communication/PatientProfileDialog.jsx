import React from 'react';
import { X, User, Phone, Mail, MapPin, Calendar, Pill, ShoppingBag, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function PatientProfileDialog({ open, onClose, patient }) {
  const { data: allCommunications = [] } = useQuery({
    queryKey: ['patient-communications', patient?.patient_id],
    queryFn: () => base44.entities.PatientCommunication.list('-timestamp', 1000),
    enabled: open && !!patient
  });

  const patientComms = allCommunications.filter(c => 
    c.patient_name === patient?.patient_name || c.patient_id === patient?.patient_id
  );

  // Dummy prescription data
  const activePrescriptions = [
    { name: 'Lisinopril 10mg', prescriber: 'Dr. Smith', refills: 3, lastFilled: '2025-10-15' },
    { name: 'Metformin 500mg', prescriber: 'Dr. Johnson', refills: 2, lastFilled: '2025-10-20' },
    { name: 'Atorvastatin 20mg', prescriber: 'Dr. Smith', refills: 1, lastFilled: '2025-11-01' }
  ];

  const inactivePrescriptions = [
    { name: 'Amoxicillin 500mg', prescriber: 'Dr. Wilson', endDate: '2025-09-15', reason: 'Completed course' },
    { name: 'Prednisone 20mg', prescriber: 'Dr. Smith', endDate: '2025-08-10', reason: 'Treatment completed' }
  ];

  // Dummy order history
  const orderHistory = [
    { id: 'ORD-2024-103', date: '2025-11-01', items: 'Atorvastatin 20mg', total: '$15.00', status: 'Delivered' },
    { id: 'ORD-2024-089', date: '2025-10-20', items: 'Metformin 500mg', total: '$10.00', status: 'Delivered' },
    { id: 'ORD-2024-067', date: '2025-10-15', items: 'Lisinopril 10mg, Multivitamin', total: '$25.00', status: 'Delivered' }
  ];

  // Timeline events
  const timelineEvents = [
    { date: '2025-11-10', type: 'communication', title: 'Prescription Refill Request', icon: MessageSquare },
    { date: '2025-11-01', type: 'order', title: 'Order Delivered - Atorvastatin', icon: CheckCircle },
    { date: '2025-10-20', type: 'order', title: 'Order Delivered - Metformin', icon: CheckCircle },
    { date: '2025-10-15', type: 'order', title: 'Order Delivered - Lisinopril', icon: CheckCircle },
    { date: '2023-05-12', type: 'signup', title: 'Patient Enrolled', icon: User }
  ];

  if (!patient) return null;

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">Patient Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Header */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-20 h-20 rounded-full bg-[#8B1F1F] flex items-center justify-center text-white text-3xl font-bold">
              {patient.patient_name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">{patient.patient_name}</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Age: {calculateAge(patient.patient_date_of_birth)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{patient.patient_email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{patient.patient_phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{patient.patient_address}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Prescriptions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Pill className="w-5 h-5 text-green-600" />
                Active Prescriptions ({activePrescriptions.length})
              </h3>
              <div className="space-y-2">
                {activePrescriptions.map((rx, idx) => (
                  <div key={idx} className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="font-semibold text-gray-800">{rx.name}</p>
                    <p className="text-sm text-gray-600">Prescriber: {rx.prescriber}</p>
                    <p className="text-sm text-gray-600">Refills: {rx.refills} remaining</p>
                    <p className="text-xs text-gray-500">Last filled: {format(new Date(rx.lastFilled), 'MMM d, yyyy')}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Inactive Prescriptions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Pill className="w-5 h-5 text-gray-400" />
                Inactive Prescriptions ({inactivePrescriptions.length})
              </h3>
              <div className="space-y-2">
                {inactivePrescriptions.map((rx, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="font-semibold text-gray-800">{rx.name}</p>
                    <p className="text-sm text-gray-600">Prescriber: {rx.prescriber}</p>
                    <p className="text-sm text-gray-600">Ended: {format(new Date(rx.endDate), 'MMM d, yyyy')}</p>
                    <p className="text-xs text-gray-500">{rx.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order History */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              Order History
            </h3>
            <div className="space-y-2">
              {orderHistory.map((order) => (
                <div key={order.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{order.id}</p>
                    <p className="text-sm text-gray-600">{order.items}</p>
                    <p className="text-xs text-gray-500">{format(new Date(order.date), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">{order.total}</p>
                    <Badge className="bg-green-100 text-green-800">{order.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Communication History */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              Communication History ({patientComms.length})
            </h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {patientComms.slice(0, 10).map((comm) => (
                <div key={comm.id} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-gray-800 text-sm">{comm.request_type?.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500">{format(new Date(comm.date), 'MMM d, yyyy')}</p>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{comm.message_content}</p>
                  <Badge className="mt-1 text-xs">{comm.channel}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Patient Timeline
            </h3>
            <div className="relative pl-8 space-y-4">
              {/* Vertical line */}
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-300"></div>
              
              {timelineEvents.map((event, idx) => {
                const Icon = event.icon;
                return (
                  <div key={idx} className="relative">
                    <div className="absolute -left-8 w-6 h-6 rounded-full bg-white border-2 border-[#8B1F1F] flex items-center justify-center">
                      <Icon className="w-3 h-3 text-[#8B1F1F]" />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="font-semibold text-gray-800">{event.title}</p>
                      <p className="text-xs text-gray-500">{format(new Date(event.date), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}