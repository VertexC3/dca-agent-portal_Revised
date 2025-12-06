import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Pill, Loader2 } from 'lucide-react';
import PrescriptionCard from '../components/patient/PrescriptionCard';

export default function Prescriptions() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Full prescription history with different statuses
  const prescriptions = [
    {
      id: 1,
      name: 'Lisinopril 10mg',
      dosage: 'Take 1 tablet daily',
      prescriber: 'Dr. Smith',
      refills: 3,
      lastFilled: '2025-11-01',
      dateWritten: '2025-05-01',
      dateExpires: '2026-05-01',
      status: 'Ready for Pickup',
      image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6915f90e9513d40c38a60116/a43f1a648_LisinoprilPills_5mg-scaled.jpg'
    },
    {
      id: 2,
      name: 'Metformin 500mg',
      dosage: 'Take 2 tablets twice daily with meals',
      prescriber: 'Dr. Johnson',
      refills: 2,
      lastFilled: '2025-10-25',
      dateWritten: '2025-04-15',
      dateExpires: '2026-04-15',
      status: 'Shipped',
      tracking: '1Z999AA10123456784',
      expectedDelivery: 'Nov 16, 2025',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60'
    },
    {
      id: 3,
      name: 'Atorvastatin 20mg',
      dosage: 'Take 1 tablet at bedtime',
      prescriber: 'Dr. Smith',
      refills: 1,
      lastFilled: '2025-10-20',
      dateWritten: '2025-06-10',
      dateExpires: '2026-06-10',
      status: 'In Delivery',
      tracking: '1Z999AA10987654321',
      expectedDelivery: 'Nov 15, 2025',
      image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=60'
    },
    {
      id: 4,
      name: 'Levothyroxine 50mcg',
      dosage: 'Take 1 tablet every morning on empty stomach',
      prescriber: 'Dr. Johnson',
      refills: 5,
      lastFilled: '2025-10-15',
      dateWritten: '2025-03-20',
      dateExpires: '2026-03-20',
      status: 'Ready for Pickup',
      image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=800&auto=format&fit=crop&q=60'
    },
    {
      id: 5,
      name: 'Omeprazole 20mg',
      dosage: 'Take 1 capsule daily before breakfast',
      prescriber: 'Dr. Martinez',
      refills: 3,
      lastFilled: '2025-10-10',
      dateWritten: '2025-07-05',
      dateExpires: '2026-07-05',
      status: 'Shipped',
      tracking: '1Z999AA10555666777',
      expectedDelivery: 'Nov 17, 2025',
      image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=800&auto=format&fit=crop&q=60'
    },
    {
      id: 6,
      name: 'Amlodipine 5mg',
      dosage: 'Take 1 tablet daily',
      prescriber: 'Dr. Smith',
      refills: 2,
      lastFilled: '2025-10-05',
      dateWritten: '2025-05-25',
      dateExpires: '2026-05-25',
      status: 'In Delivery',
      tracking: '1Z999AA10888999000',
      expectedDelivery: 'Nov 15, 2025',
      image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&auto=format&fit=crop&q=60'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <Pill className="w-8 h-8 text-[#8B1F1F]" />
          My Prescriptions
        </h1>
        <p className="text-gray-600">View and manage all your prescriptions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <p className="text-green-700 text-sm font-semibold mb-1">Ready for Pickup</p>
          <p className="text-3xl font-bold text-green-800">
            {prescriptions.filter(p => p.status === 'Ready for Pickup').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <p className="text-blue-700 text-sm font-semibold mb-1">Shipped</p>
          <p className="text-3xl font-bold text-blue-800">
            {prescriptions.filter(p => p.status === 'Shipped').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <p className="text-purple-700 text-sm font-semibold mb-1">In Delivery</p>
          <p className="text-3xl font-bold text-purple-800">
            {prescriptions.filter(p => p.status === 'In Delivery').length}
          </p>
        </div>
      </div>

      {/* Prescription List */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">All Prescriptions ({prescriptions.length})</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {prescriptions.map(prescription => (
            <PrescriptionCard key={prescription.id} prescription={prescription} />
          ))}
        </div>
      </div>
    </div>
  );
}