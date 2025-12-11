import React, { useState, useMemo } from 'react';
import { Pill, Calendar, Filter, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  refilled: 'bg-blue-100 text-blue-800 border-blue-200'
};

export default function PrescriptionHistory() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // Mock prescription history data - extends the data from PatientDashboard
  const allPrescriptions = [
    {
      id: 1,
      name: 'Lisinopril 10mg',
      dosage: 'Take 1 tablet daily',
      status: 'active',
      lastRefilled: '2025-11-01',
      dateWritten: '2025-05-01',
      refills: 3,
      prescriber: 'Dr. Smith'
    },
    {
      id: 2,
      name: 'Metformin 500mg',
      dosage: 'Take 2 tablets twice daily with meals',
      status: 'active',
      lastRefilled: '2025-10-25',
      dateWritten: '2025-04-15',
      refills: 2,
      prescriber: 'Dr. Johnson'
    },
    {
      id: 3,
      name: 'Atorvastatin 20mg',
      dosage: 'Take 1 tablet at bedtime',
      status: 'active',
      lastRefilled: '2025-10-20',
      dateWritten: '2025-06-10',
      refills: 1,
      prescriber: 'Dr. Smith'
    },
    {
      id: 4,
      name: 'Aspirin 81mg',
      dosage: 'Take 1 tablet daily',
      status: 'inactive',
      lastRefilled: '2025-08-01',
      dateWritten: '2025-02-01',
      refills: 0,
      prescriber: 'Dr. Smith'
    },
    {
      id: 5,
      name: 'Ibuprofen 200mg',
      dosage: 'Take as needed',
      status: 'inactive',
      lastRefilled: '2025-06-01',
      dateWritten: '2025-01-15',
      refills: 0,
      prescriber: 'Dr. Johnson'
    },
    {
      id: 6,
      name: 'Amoxicillin 500mg',
      dosage: 'Take 1 capsule 3 times daily',
      status: 'inactive',
      lastRefilled: '2024-12-01',
      dateWritten: '2024-12-01',
      refills: 0,
      prescriber: 'Dr. Smith'
    },
    {
      id: 7,
      name: 'Prednisone 10mg',
      dosage: 'Take as directed on taper schedule',
      status: 'inactive',
      lastRefilled: '2024-11-15',
      dateWritten: '2024-11-15',
      refills: 0,
      prescriber: 'Dr. Martinez'
    },
    {
      id: 8,
      name: 'Benzonatate 100mg',
      dosage: 'Take 1 capsule 3 times daily as needed for cough',
      status: 'inactive',
      lastRefilled: '2024-10-01',
      dateWritten: '2024-10-01',
      refills: 0,
      prescriber: 'Dr. Johnson'
    }
  ];

  // Filter and sort prescriptions
  const filteredAndSortedPrescriptions = useMemo(() => {
    let filtered = [...allPrescriptions];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.lastRefilled) - new Date(a.lastRefilled);
        case 'date-asc':
          return new Date(a.lastRefilled) - new Date(b.lastRefilled);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [statusFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Prescription History</h2>
        <p className="text-gray-600">View all your past and current prescriptions</p>
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-gray-500" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto text-sm text-gray-600">
          Showing {filteredAndSortedPrescriptions.length} of {allPrescriptions.length} prescriptions
        </div>
      </div>

      {/* Prescription List */}
      <div className="space-y-3">
        {filteredAndSortedPrescriptions.map(prescription => (
          <div
            key={prescription.id}
            className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Pill className="w-5 h-5 text-[#8B1F1F]" />
                  <h3 className="font-semibold text-gray-800">{prescription.name}</h3>
                  <Badge className={`${statusColors[prescription.status]} border`}>
                    {prescription.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-gray-600 ml-8">
                  <p><strong>Dosage:</strong> {prescription.dosage}</p>
                  <p><strong>Prescriber:</strong> {prescription.prescriber}</p>
                  <p><strong>Date Written:</strong> {format(new Date(prescription.dateWritten), 'MMM d, yyyy')}</p>
                  <p><strong>Refills Remaining:</strong> {prescription.refills}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">Last Refilled</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  {format(new Date(prescription.lastRefilled), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>
        ))}

        {filteredAndSortedPrescriptions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Pill className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No prescriptions found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}