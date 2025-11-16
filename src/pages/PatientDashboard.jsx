import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Pill, MessageSquare, User, Loader2, Package, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PrescriptionCard from '../components/patient/PrescriptionCard';
import CollapsibleOrderHistory from '../components/patient/CollapsibleOrderHistory';
import RefillRequestDialog from '../components/patient/RefillRequestDialog';

export default function PatientDashboard() {
  const [showQuickRefill, setShowQuickRefill] = useState(false);
  const [prescriptionFilter, setPrescriptionFilter] = useState('Active');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: communications = [], isLoading: commsLoading } = useQuery({
    queryKey: ['patient-communications'],
    queryFn: async () => {
      const allComms = await base44.entities.PatientCommunication.list('-timestamp', 100);
      return allComms.filter(c => c.patient_email === user?.email);
    },
    enabled: !!user
  });

  // Dummy prescriptions with different statuses
  const allPrescriptions = [
    {
      id: 1,
      name: 'Lisinopril 10mg',
      dosage: 'Take 1 tablet daily',
      prescriber: 'Dr. Smith',
      refills: 3,
      lastFilled: '2025-11-01',
      status: 'Ready for Pickup',
      category: 'Active'
    },
    {
      id: 2,
      name: 'Metformin 500mg',
      dosage: 'Take 2 tablets twice daily with meals',
      prescriber: 'Dr. Johnson',
      refills: 2,
      lastFilled: '2025-10-25',
      status: 'Shipped',
      tracking: '1Z999AA10123456784',
      expectedDelivery: 'Nov 16, 2025',
      category: 'Active'
    },
    {
      id: 3,
      name: 'Atorvastatin 20mg',
      dosage: 'Take 1 tablet at bedtime',
      prescriber: 'Dr. Smith',
      refills: 1,
      lastFilled: '2025-10-20',
      status: 'In Delivery',
      tracking: '1Z999AA10987654321',
      expectedDelivery: 'Nov 15, 2025',
      category: 'Active'
    },
    {
      id: 4,
      name: 'Aspirin 81mg',
      dosage: 'Take 1 tablet daily',
      prescriber: 'Dr. Smith',
      refills: 0,
      lastFilled: '2025-08-01',
      status: 'Ready for Pickup',
      category: 'Inactive'
    },
    {
      id: 5,
      name: 'Ibuprofen 200mg',
      dosage: 'Take as needed',
      prescriber: 'Dr. Johnson',
      refills: 0,
      lastFilled: '2025-06-01',
      status: 'Ready for Pickup',
      category: 'Discontinued'
    }
  ];

  const prescriptions = allPrescriptions.filter(p => p.category === prescriptionFilter);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#8B1F1F] to-[#6B1515] rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.full_name}!</h1>
        <p className="text-white/80">Here's an overview of your prescriptions and recent activity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Prescriptions Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Pill className="w-6 h-6 text-[#8B1F1F]" />
              {prescriptionFilter} Prescriptions ({prescriptions.length})
            </h2>
            <Select value={prescriptionFilter} onValueChange={setPrescriptionFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {prescriptions.map(prescription => (
              <PrescriptionCard key={prescription.id} prescription={prescription} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Communications */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#8B1F1F]" />
              Recent Communications
            </h3>
            {commsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : communications.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No recent communications</p>
            ) : (
              <div className="space-y-3">
                {communications.slice(0, 5).map(comm => (
                  <Link
                    key={comm.id}
                    to={createPageUrl(`PatientCommunicationDetail?id=${comm.id}`)}
                    className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {comm.request_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <Badge className="text-xs">{comm.channel}</Badge>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{comm.message_content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(comm.date), 'MMM d, yyyy')}
                    </p>
                  </Link>
                ))}
              </div>
            )}
            <Link to={createPageUrl('PatientCommunications')}>
              <button className="w-full mt-4 py-2 text-sm text-[#8B1F1F] hover:text-[#721919] font-semibold">
                View All Communications →
              </button>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link to={createPageUrl('PatientProfile')}>
                <button className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-left transition-all">
                  <User className="w-4 h-4 inline mr-2 text-[#8B1F1F]" />
                  <span className="text-sm font-semibold text-gray-800">Update Profile</span>
                </button>
              </Link>
              <Link to={createPageUrl('PatientMessages')}>
                <button className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-left transition-all">
                  <MessageSquare className="w-4 h-4 inline mr-2 text-[#8B1F1F]" />
                  <span className="text-sm font-semibold text-gray-800">Communication</span>
                </button>
              </Link>
              <button 
                onClick={() => setShowQuickRefill(true)}
                className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-left transition-all"
              >
                <Pill className="w-4 h-4 inline mr-2 text-[#8B1F1F]" />
                <span className="text-sm font-semibold text-gray-800">Request Refill</span>
              </button>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#8B1F1F]" />
              Recent Orders
            </h3>
            <CollapsibleOrderHistory limit={5} showSeeAll={true} />
          </div>
        </div>
      </div>

      <RefillRequestDialog
        open={showQuickRefill}
        onClose={() => setShowQuickRefill(false)}
        prescription={prescriptions[0]}
      />
    </div>
  );
}