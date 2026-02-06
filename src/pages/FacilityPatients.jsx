import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, X, Filter, Pill, Stethoscope, Calendar, MapPin, ShoppingCart, ArrowUpDown, Download, Share2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

// Mock patient data
const mockPatients = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    date_of_birth: '1985-03-15',
    patient_since: '2024-06-15',
    physician_name: 'Dr. Sarah Johnson',
    physician_npi: '1245319599',
    physician_specialty: 'Endocrinology',
    prescriptions: [
      { 
        name: 'Semaglutide 2.4mg', 
        refills_remaining: 3, 
        last_filled: '2026-01-15',
        fill_history: [
          { date: '2026-01-15', hasChange: false, changeNote: "" },
          { date: '2025-11-20', hasChange: true, changeNote: "Reviewed patient's current therapy and instructed change in prescription as follows: increase dosage of lisinopril from 10 mg once daily to 20 mg once daily due to persistent elevated blood pressure; quantity updated to 30 tablets with 2 refills. Patient was informed of the change, counseled on potential side effects (including dizziness and cough), and advised to monitor blood pressure at home and report any adverse symptoms." },
          { date: '2025-10-15', hasChange: false, changeNote: "" }
        ]
      },
      { 
        name: 'Metformin 500mg', 
        refills_remaining: 5, 
        last_filled: '2026-01-10',
        fill_history: [
          { date: '2026-01-10', hasChange: false, changeNote: "" },
          { date: '2025-11-05', hasChange: true, changeNote: "Reviewed patient's current therapy and instructed change in prescription as follows: Metformin dosage changed from 1000mg BID to 500mg BID due to patient experiencing hypoglycemic episodes; quantity updated to 60 tablets with 3 refills. Patient was informed of the change, counseled on potential side effects (including gastrointestinal upset), and advised to monitor blood glucose levels closely." },
          { date: '2025-09-10', hasChange: false, changeNote: "" }
        ]
      }
    ],
    address: '123 Main St, Franklin, TN 37064',
    orders: [
      { id: 'ORD-1001', date: '2026-01-15', medication: 'Semaglutide 2.4mg', amount: 250.00, status: 'Delivered' },
      { id: 'ORD-1002', date: '2026-01-10', medication: 'Metformin 500mg', amount: 45.00, status: 'Delivered' },
      { id: 'ORD-1003', date: '2025-12-20', medication: 'Semaglutide 2.4mg', amount: 250.00, status: 'Delivered' },
      { id: 'ORD-1004', date: '2025-11-20', medication: 'Semaglutide 2.4mg', amount: 250.00, status: 'Delivered' },
      { id: 'ORD-1005', date: '2025-11-05', medication: 'Metformin 500mg', amount: 45.00, status: 'Delivered' },
      { id: 'ORD-1006', date: '2025-10-15', medication: 'Semaglutide 2.4mg', amount: 250.00, status: 'Delivered' },
      { id: 'ORD-1007', date: '2025-09-10', medication: 'Metformin 500mg', amount: 45.00, status: 'Delivered' },
      { id: 'ORD-1008', date: '2025-08-05', medication: 'Semaglutide 2.4mg', amount: 250.00, status: 'Delivered' }
    ]
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '(555) 234-5678',
    date_of_birth: '1978-11-22',
    patient_since: '2024-08-20',
    physician_name: 'Dr. Michael Chen',
    physician_npi: '1356824791',
    physician_specialty: 'Internal Medicine',
    prescriptions: [
      { 
        name: 'Tirzepatide 5mg', 
        refills_remaining: 2, 
        last_filled: '2026-01-20',
        fill_history: [
          { date: '2026-01-20', hasChange: false, changeNote: "" },
          { date: '2025-12-15', hasChange: false, changeNote: "" },
          { date: '2025-10-20', hasChange: false, changeNote: "" }
        ]
      }
    ],
    address: '456 Oak Ave, Nashville, TN 37203',
    orders: [
      { id: 'ORD-2001', date: '2026-01-20', medication: 'Tirzepatide 5mg', amount: 350.00, status: 'Delivered' },
      { id: 'ORD-2002', date: '2025-12-15', medication: 'Tirzepatide 5mg', amount: 350.00, status: 'Delivered' },
      { id: 'ORD-2003', date: '2025-10-20', medication: 'Tirzepatide 5mg', amount: 350.00, status: 'Delivered' },
      { id: 'ORD-2004', date: '2025-09-10', medication: 'Tirzepatide 5mg', amount: 350.00, status: 'Delivered' },
      { id: 'ORD-2005', date: '2025-08-01', medication: 'Tirzepatide 5mg', amount: 350.00, status: 'Delivered' }
    ]
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    phone: '(555) 345-6789',
    date_of_birth: '1992-07-08',
    patient_since: '2025-02-10',
    physician_name: 'Dr. Emily Rodriguez',
    physician_npi: '1467935802',
    physician_specialty: 'Family Medicine',
    prescriptions: [
      { 
        name: 'Semaglutide 1mg', 
        refills_remaining: 4, 
        last_filled: '2026-01-18',
        fill_history: [
          { date: '2026-01-18', hasChange: false, changeNote: "" },
          { date: '2025-11-12', hasChange: false, changeNote: "" },
          { date: '2025-09-18', hasChange: false, changeNote: "" }
        ]
      },
      { 
        name: 'Atorvastatin 20mg', 
        refills_remaining: 6, 
        last_filled: '2026-01-12',
        fill_history: [
          { date: '2026-01-12', hasChange: false, changeNote: "" },
          { date: '2025-10-20', hasChange: false, changeNote: "" },
          { date: '2025-08-12', hasChange: false, changeNote: "" }
        ]
      },
      { 
        name: 'Lisinopril 10mg', 
        refills_remaining: 3, 
        last_filled: '2026-01-08',
        fill_history: [
          { date: '2026-01-08', hasChange: false, changeNote: "" },
          { date: '2025-10-05', hasChange: false, changeNote: "" },
          { date: '2025-07-08', hasChange: false, changeNote: "" }
        ]
      }
    ],
    address: '789 Pine Rd, Brentwood, TN 37027',
    orders: [
      { id: 'ORD-3001', date: '2026-01-18', medication: 'Semaglutide 1mg', amount: 200.00, status: 'Delivered' },
      { id: 'ORD-3002', date: '2026-01-12', medication: 'Atorvastatin 20mg', amount: 35.00, status: 'Delivered' },
      { id: 'ORD-3003', date: '2026-01-08', medication: 'Lisinopril 10mg', amount: 25.00, status: 'Delivered' },
      { id: 'ORD-3004', date: '2025-11-12', medication: 'Semaglutide 1mg', amount: 200.00, status: 'Delivered' },
      { id: 'ORD-3005', date: '2025-10-20', medication: 'Atorvastatin 20mg', amount: 35.00, status: 'Delivered' },
      { id: 'ORD-3006', date: '2025-10-05', medication: 'Lisinopril 10mg', amount: 25.00, status: 'Delivered' },
      { id: 'ORD-3007', date: '2025-09-18', medication: 'Semaglutide 1mg', amount: 200.00, status: 'Delivered' },
      { id: 'ORD-3008', date: '2025-08-12', medication: 'Atorvastatin 20mg', amount: 35.00, status: 'Delivered' },
      { id: 'ORD-3009', date: '2025-07-08', medication: 'Lisinopril 10mg', amount: 25.00, status: 'Delivered' },
      { id: 'ORD-3010', date: '2025-06-15', medication: 'Semaglutide 1mg', amount: 200.00, status: 'Delivered' },
      { id: 'ORD-3011', date: '2025-05-10', medication: 'Atorvastatin 20mg', amount: 35.00, status: 'Delivered' },
      { id: 'ORD-3012', date: '2025-04-05', medication: 'Lisinopril 10mg', amount: 25.00, status: 'Delivered' }
    ]
  }
];

export default function FacilityPatients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailDialog, setDetailDialog] = useState({ open: false, type: null, patient: null });
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [expandedPrescription, setExpandedPrescription] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [editingZip, setEditingZip] = useState(null);
  const [zipCode, setZipCode] = useState('');
  const [showChangeNote, setShowChangeNote] = useState(null); // State to manage visibility of change note dialog
  const [filters, setFilters] = useState({
    status: 'all',
    physician: 'all',
    medication: 'all',
    dateFrom: '',
    dateTo: ''
  });

  // Check for URL parameter for physician filter
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const physicianName = urlParams.get('physician');
    if (physicianName) {
      setFilters(prev => ({ ...prev, physician: physicianName }));
    }
  }, []);

  const clearFilters = () => {
    setFilters({ status: 'all', physician: 'all', medication: 'all', dateFrom: '', dateTo: '' });
    setSearchTerm('');
  };

  const hasActiveFilters = Object.entries(filters).some(([k, v]) => v && v !== 'all' && v !== '') || searchTerm;

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectPatient = (patientId) => {
    setSelectedPatients(prev =>
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPatients.length === filteredPatients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(filteredPatients.map(p => p.id));
    }
  };

  const handleExport = () => {
    alert(`Exporting ${selectedPatients.length} selected patients...`);
  };

  const handleShare = () => {
    setShowShareDialog(true);
  };

  const handleSendEmail = () => {
    console.log('Sharing patient data with:', shareEmail);
    alert(`Patient data shared with ${shareEmail}`);
    setShowShareDialog(false);
    setShareEmail('');
  };

  const handleSaveZip = (patientId) => {
    console.log(`Updated zip code for patient ${patientId}: ${zipCode}`);
    alert(`Zip code updated to: ${zipCode}`);
    setEditingZip(null);
    setZipCode('');
  };

  const filteredPatients = mockPatients.filter(patient => {
    if (searchTerm && !patient.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !patient.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filters.physician !== 'all' && patient.physician_name !== filters.physician) return false;
    return true;
  });

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    
    if (sortConfig.key === 'prescriptions') {
      aValue = a.prescriptions.length;
      bValue = b.prescriptions.length;
    } else if (sortConfig.key === 'patient_since') {
      aValue = new Date(a.patient_since);
      bValue = new Date(b.patient_since);
    } else if (sortConfig.key === 'total_orders') {
      aValue = a.total_orders;
      bValue = b.total_orders;
    }
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          {filters.physician !== 'all' && (
            <p className="text-sm text-gray-600 mt-1">
              Showing patients of <span className="font-semibold">{filters.physician}</span>
            </p>
          )}
        </div>
          
          {/* Patient-Specific Search */}
          <div className="relative">
            <Input
              placeholder="Search patients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={() => setSearchExpanded(true)}
              className="h-11 w-96 border-2 border-gray-300 cursor-pointer"
            />

            <AnimatePresence>
              {searchExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-14 right-0 bg-white border-2 border-gray-200 rounded-lg shadow-xl p-6 z-50 w-[600px]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Filter className="w-5 h-5 text-[#1a1f5c]" />
                      <h3 className="font-semibold text-lg">Filter Patients</h3>
                    </div>
                    <button onClick={() => setSearchExpanded(false)} className="p-1 hover:bg-gray-100 rounded-full">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label className="text-sm font-medium mb-2">Status</Label>
                      <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2">Physician</Label>
                      <Select value={filters.physician} onValueChange={(v) => setFilters({...filters, physician: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Physicians</SelectItem>
                          <SelectItem value="Dr. Sarah Johnson">Dr. Sarah Johnson</SelectItem>
                          <SelectItem value="Dr. Michael Chen">Dr. Michael Chen</SelectItem>
                          <SelectItem value="Dr. Emily Rodriguez">Dr. Emily Rodriguez</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <Label className="text-sm font-medium mb-2">Medication</Label>
                      <Select value={filters.medication} onValueChange={(v) => setFilters({...filters, medication: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Medications</SelectItem>
                          <SelectItem value="Semaglutide">Semaglutide</SelectItem>
                          <SelectItem value="Tirzepatide">Tirzepatide</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2">Date From</Label>
                      <Input
                        type="text"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                        placeholder="mm/dd/yyyy"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2">Date To</Label>
                      <Input
                        type="text"
                        value={filters.dateTo}
                        onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                        placeholder="mm/dd/yyyy"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t">
                    <Button variant="outline" onClick={clearFilters} disabled={!hasActiveFilters}>
                      Clear All
                    </Button>
                    <Button 
                      onClick={() => {
                        setSearchExpanded(false);
                        // Filters are already applied via state
                      }} 
                      className="bg-[#1a1f5c]"
                    >
                      Apply Filters & Search
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Bar */}
        {selectedPatients.length > 0 && (
          <div className="bg-[#1a1f5c] text-white p-4 rounded-lg flex items-center justify-between">
            <p className="font-semibold">{selectedPatients.length} patient(s) selected</p>
            <div className="flex items-center gap-2">
              <Button onClick={handleExport} variant="outline" className="bg-white text-[#1a1f5c] hover:bg-gray-100 border-0">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={handleShare} variant="outline" className="bg-white text-[#1a1f5c] hover:bg-gray-100 border-0">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        )}

        {/* Patients Table */}
        <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedPatients.length === sortedPatients.length && sortedPatients.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-2">
                      Name
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap cursor-pointer hover:bg-gray-100" onClick={() => handleSort('date_of_birth')}>
                    <div className="flex items-center gap-2">
                      Date of Birth
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap cursor-pointer hover:bg-gray-100" onClick={() => handleSort('phone')}>
                    <div className="flex items-center gap-2">
                      Phone Number
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap cursor-pointer hover:bg-gray-100" onClick={() => handleSort('email')}>
                    <div className="flex items-center gap-2">
                      Email
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap cursor-pointer hover:bg-gray-100" onClick={() => handleSort('patient_since')}>
                    <div className="flex items-center gap-2">
                      Patient Since
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap text-center cursor-pointer hover:bg-gray-100" onClick={() => handleSort('prescriptions')}>
                    <div className="flex items-center gap-2 justify-center">
                      # Prescriptions
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap cursor-pointer hover:bg-gray-100" onClick={() => handleSort('physician_name')}>
                    <div className="flex items-center gap-2">
                      Physician
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap cursor-pointer hover:bg-gray-100" onClick={() => handleSort('address')}>
                    <div className="flex items-center gap-2">
                      Address
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap text-center cursor-pointer hover:bg-gray-100" onClick={() => handleSort('total_orders')}>
                    <div className="flex items-center gap-2 justify-center">
                      Orders
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPatients.map(patient => (
                  <TableRow 
                    key={patient.id} 
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedPatients.includes(patient.id)}
                        onCheckedChange={() => handleSelectPatient(patient.id)}
                      />
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span>{patient.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm whitespace-nowrap">{format(new Date(patient.date_of_birth), 'MM/dd/yyyy')}</TableCell>
                    <TableCell className="text-gray-700 whitespace-nowrap">{patient.phone}</TableCell>
                    <TableCell className="text-gray-700 whitespace-nowrap">{patient.email}</TableCell>
                    <TableCell className="text-gray-700 whitespace-nowrap">{format(new Date(patient.patient_since), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailDialog({ open: true, type: 'prescriptions', patient });
                        }}
                        className="inline-flex items-center gap-1 text-[#1a1f5c] hover:underline font-semibold"
                      >
                        <Pill className="w-4 h-4" />
                        {patient.prescriptions.length}
                      </button>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailDialog({ open: true, type: 'physician', patient });
                        }}
                        className="text-left hover:text-[#1a1f5c] hover:underline transition-colors"
                      >
                        <p className="font-semibold text-gray-900 whitespace-nowrap">{patient.physician_name}</p>
                        <p className="text-xs text-gray-600 whitespace-nowrap">{patient.physician_specialty}</p>
                      </button>
                    </TableCell>
                    <TableCell className="text-gray-700 max-w-xs truncate">{patient.address}</TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailDialog({ open: true, type: 'orders', patient });
                        }}
                        className="inline-flex items-center gap-1 text-[#1a1f5c] hover:underline font-semibold"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {patient.orders.length}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Patient Detail Dialog (Full Profile) */}
        <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
          <DialogContent className="max-w-3xl bg-white max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Patient Information</DialogTitle>
            </DialogHeader>
            {selectedPatient && (
              <div className="space-y-6">
                {/* Personal Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold text-lg text-gray-900 mb-3">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-gray-600">Name</p><p className="font-semibold text-gray-900">{selectedPatient.name}</p></div>
                    <div><p className="text-gray-600">Phone</p><p className="font-semibold text-gray-900">{selectedPatient.phone}</p></div>
                    <div><p className="text-gray-600">Email</p><p className="font-semibold text-gray-900">{selectedPatient.email}</p></div>
                    <div><p className="text-gray-600">Date of Birth</p><p className="font-semibold text-gray-900">{format(new Date(selectedPatient.date_of_birth), 'MM/dd/yyyy')}</p></div>
                    <div><p className="text-gray-600">Patient Since</p><p className="font-semibold text-gray-900">{format(new Date(selectedPatient.patient_since), 'MM/dd/yyyy')}</p></div>
                  </div>
                </div>

                {/* Address */}
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Address</h3>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-purple-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-gray-900">{selectedPatient.address}</p>
                      {!selectedPatient.address.match(/\d{5}/) && (
                        <div className="mt-2 flex items-center gap-2">
                          {editingZip === selectedPatient.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="text"
                                placeholder="Enter 5-digit zip"
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                                className="w-32"
                                maxLength={5}
                              />
                              <Button size="sm" onClick={() => handleSaveZip(selectedPatient.id)} disabled={zipCode.length !== 5}>
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => { setEditingZip(null); setZipCode(''); }}>
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingZip(selectedPatient.id)}
                              className="inline-flex items-center gap-1 text-sm text-red-600 hover:underline font-semibold"
                            >
                              <AlertCircle className="w-4 h-4" />
                              Missing Zip Code - Click to Add
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Prescriptions */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900">Prescriptions ({selectedPatient.prescriptions.length})</h3>
                    <button
                      onClick={() => setDetailDialog({ open: true, type: 'prescriptions', patient: selectedPatient })}
                      className="text-sm text-[#1a1f5c] hover:underline font-semibold"
                    >
                      View Details
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selectedPatient.prescriptions.map((rx, index) => (
                      <div key={index} className="p-3 bg-white rounded-lg">
                        <p className="font-semibold text-gray-900">{rx.name}</p>
                        <p className="text-sm text-gray-600">Refills: {rx.refills_remaining} • Last filled: {format(new Date(rx.last_filled), 'MMM d, yyyy')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Physician */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-900">Physician</h3>
                    <button
                      onClick={() => setDetailDialog({ open: true, type: 'physician', patient: selectedPatient })}
                      className="text-sm text-[#1a1f5c] hover:underline font-semibold"
                    >
                      View Details
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-900">{selectedPatient.physician_name}</p>
                      <p className="text-sm text-gray-700">{selectedPatient.physician_specialty}</p>
                    </div>
                  </div>
                </div>

                {/* Orders */}
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900">Order History</h3>
                    <button
                      onClick={() => setDetailDialog({ open: true, type: 'orders', patient: selectedPatient })}
                      className="text-sm text-[#1a1f5c] hover:underline font-semibold"
                    >
                      View All Orders
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selectedPatient.orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="p-3 bg-white rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900">{order.id}</p>
                          <Badge className="bg-green-100 text-green-800">{order.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{order.medication} • {format(new Date(order.date), 'MMM d, yyyy')} • ${order.amount.toFixed(2)}</p>
                      </div>
                    ))}
                    {selectedPatient.orders.length > 3 && (
                      <p className="text-sm text-gray-600 text-center pt-1">
                        +{selectedPatient.orders.length - 3} more orders
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Specific Detail Dialogs */}
        <Dialog open={detailDialog.open} onOpenChange={() => setDetailDialog({ open: false, type: null, patient: null })}>
          <DialogContent className="max-w-2xl bg-white max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {detailDialog.type === 'prescriptions' && 'Prescription Details'}
                {detailDialog.type === 'physician' && 'Physician Information'}
                {detailDialog.type === 'orders' && 'Order History'}
              </DialogTitle>
            </DialogHeader>
            {detailDialog.patient && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">{detailDialog.patient.name}</p>
                  <p className="text-sm text-gray-600">{detailDialog.patient.email}</p>
                </div>

                {detailDialog.type === 'prescriptions' && (
                  <div className="space-y-3">
                    {detailDialog.patient.prescriptions.map((rx, index) => (
                      <div key={index}>
                        <div 
                          className="p-4 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => setExpandedPrescription(expandedPrescription === index ? null : index)}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-900">{rx.name}</p>
                            <span className="text-sm text-[#1a1f5c] font-semibold">
                              {expandedPrescription === index ? 'Hide Fill History' : 'View Fill History'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                            <div>
                              <p className="text-gray-600">Refills Remaining</p>
                              <p className="font-semibold text-gray-900">{rx.refills_remaining}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Last Filled</p>
                              <p className="font-semibold text-gray-900">{format(new Date(rx.last_filled), 'MMM d, yyyy')}</p>
                            </div>
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {expandedPrescription === index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="ml-4 mt-2 p-4 bg-white border-l-4 border-blue-400 rounded">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  Fill History
                                </h4>
                                <div className="space-y-2">
                                  {rx.fill_history.map((fill, fillIndex) => (
                                    <div key={fillIndex} className="p-2 bg-gray-50 rounded">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-900">Fill #{rx.fill_history.length - fillIndex}</span>
                                        <span className="text-sm font-semibold text-gray-900">{format(new Date(fill.date), 'MMM d, yyyy')}</span>
                                      </div>
                                      {fill.hasChange && (
                                        <button
                                          onClick={() => setShowChangeNote({ rxIndex: index, fillIndex: fillIndex })}
                                          className="mt-1 text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                                        >
                                          <AlertCircle className="w-3 h-3" />
                                          View Change Information
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}

                {detailDialog.type === 'physician' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-semibold text-gray-900 text-lg">{detailDialog.patient.physician_name}</p>
                    <p className="text-gray-700 mt-1">{detailDialog.patient.physician_specialty}</p>
                    <p className="text-sm text-gray-600 mt-2"><strong>Physician NPI:</strong> {detailDialog.patient.physician_npi}</p>
                  </div>
                )}

                {detailDialog.type === 'orders' && (
                  <div className="space-y-3">
                    {detailDialog.patient.orders.map((order, index) => (
                      <div key={order.id}>
                        <div 
                          className="p-4 bg-orange-50 border border-orange-200 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                          onClick={() => setExpandedOrder(expandedOrder === index ? null : index)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-gray-900">{order.id}</p>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-100 text-green-800">{order.status}</Badge>
                              <span className="text-sm text-[#1a1f5c] font-semibold">
                                {expandedOrder === index ? 'Hide Details' : 'View Details'}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Date Filled</p>
                              <p className="font-semibold text-gray-900">{format(new Date(order.date), 'MMM d, yyyy')}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Amount</p>
                              <p className="font-semibold text-gray-900">${order.amount.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {expandedOrder === index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="ml-4 mt-2 p-4 bg-white border-l-4 border-orange-400 rounded">
                                <h4 className="font-semibold text-gray-900 mb-3">Receipt Details</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Order ID</span>
                                    <span className="font-semibold text-gray-900">{order.id}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Date Filled</span>
                                    <span className="font-semibold text-gray-900">{format(new Date(order.date), 'MMMM d, yyyy')}</span>
                                  </div>
                                  <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between mb-1">
                                      <span className="text-gray-600">Product</span>
                                      <span className="text-gray-600">Price</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="font-semibold text-gray-900">{order.medication}</span>
                                      <span className="font-semibold text-gray-900">${(order.amount * 0.85).toFixed(2)}</span>
                                    </div>
                                  </div>
                                  <div className="border-t pt-2 mt-2 space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Subtotal</span>
                                      <span className="text-gray-900">${(order.amount * 0.85).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Tax (8.5%)</span>
                                      <span className="text-gray-900">${(order.amount * 0.0723).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Shipping</span>
                                      <span className="text-gray-900">${(order.amount * 0.0777).toFixed(2)}</span>
                                    </div>
                                  </div>
                                  <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between">
                                      <span className="text-gray-700 font-semibold">Total</span>
                                      <span className="font-bold text-gray-900">${order.amount.toFixed(2)}</span>
                                    </div>
                                  </div>
                                  <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Status</span>
                                      <Badge className="bg-green-100 text-green-800">{order.status}</Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Change Note Dialog */}
        <Dialog open={showChangeNote !== null} onOpenChange={() => setShowChangeNote(null)}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                Prescription Change Information
              </DialogTitle>
            </DialogHeader>
            {showChangeNote !== null && detailDialog.patient && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {detailDialog.patient.prescriptions[showChangeNote.rxIndex].fill_history[showChangeNote.fillIndex].changeNote}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Fill Date:</strong> {format(new Date(detailDialog.patient.prescriptions[showChangeNote.rxIndex].fill_history[showChangeNote.fillIndex].date), 'MM/dd/yyyy')}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Medication:</strong> {detailDialog.patient.prescriptions[showChangeNote.rxIndex].name}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Share Patient Data via Email</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-gray-700 leading-relaxed">
                <strong>PHI Disclaimer:</strong> This message contains protected health information (PHI) and is being shared in accordance with the Health Insurance Portability and Accountability Act (HIPAA). It is intended solely for the use of the authorized recipient for treatment, payment, or healthcare operations. Any unauthorized review, use, disclosure, distribution, or copying is strictly prohibited. If you are not the intended recipient, please notify the sender immediately and delete all copies of this message and any attachments.
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium mb-2">Recipient Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendEmail}
                disabled={!shareEmail}
                className="bg-[#1a1f5c]"
              >
                Send
              </Button>
            </div>
          </DialogContent>
        </Dialog>
    </div>
  );
}