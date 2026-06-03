import React, { useState } from 'react';
import { Link } from '@/lib/router';
import { createPageUrl } from '../utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowUpDown, Users, Search, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const mockPhysicians = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    organizations: 'Nashville Health Center, Metro Medical Group',
    states: 'TN, KY',
    npi: '1245319599',
    dea_id: 'BJ1234567',
    num_patients: 142,
    billed_12m: 356000.00,
    billed_ytd: 42500.00
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    organizations: 'Franklin Medical Associates',
    states: 'TN',
    npi: '1356824791',
    dea_id: 'FC8765432',
    num_patients: 98,
    billed_12m: 245000.00,
    billed_ytd: 28900.00
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    organizations: 'Brentwood Family Practice, Wellness Clinic of TN',
    states: 'TN, AL',
    npi: '1467935802',
    dea_id: 'ER2468135',
    num_patients: 215,
    billed_12m: 538000.00,
    billed_ytd: 67200.00
  }
];

export default function FacilityPhysicians() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showStatesDialog, setShowStatesDialog] = useState(false);
  const [selectedPhysicianStates, setSelectedPhysicianStates] = useState('');
  const [filters, setFilters] = useState({
    minPatients: '',
    maxPatients: '',
    minBilled: '',
    maxBilled: '',
    organization: ''
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const clearFilters = () => {
    setFilters({ minPatients: '', maxPatients: '', minBilled: '', maxBilled: '', organization: '' });
    setSearchTerm('');
  };

  const hasActiveFilters = Object.entries(filters).some(([k, v]) => v && v !== '') || searchTerm;

  const filteredPhysicians = mockPhysicians.filter(physician => {
    if (searchTerm && !physician.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !physician.npi.includes(searchTerm) &&
        !physician.dea_id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filters.minPatients && physician.num_patients < parseInt(filters.minPatients)) return false;
    if (filters.maxPatients && physician.num_patients > parseInt(filters.maxPatients)) return false;
    if (filters.minBilled && physician.billed_ytd < parseFloat(filters.minBilled)) return false;
    if (filters.maxBilled && physician.billed_ytd > parseFloat(filters.maxBilled)) return false;
    if (filters.organization && !physician.organizations.toLowerCase().includes(filters.organization.toLowerCase())) return false;
    return true;
  });

  const sortedPhysicians = [...filteredPhysicians].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Physicians</h1>
        </div>
        
        <div className="relative">
          <Input
            placeholder="Search physicians..."
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
                    <h3 className="font-semibold text-lg">Filter Physicians</h3>
                  </div>
                  <button onClick={() => setSearchExpanded(false)} className="p-1 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-sm font-medium mb-2">Min # Patients</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.minPatients}
                      onChange={(e) => setFilters({...filters, minPatients: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2">Max # Patients</Label>
                    <Input
                      type="number"
                      placeholder="1000"
                      value={filters.maxPatients}
                      onChange={(e) => setFilters({...filters, maxPatients: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2">Min Billed (YTD)</Label>
                    <Input
                      type="number"
                      placeholder="$0.00"
                      value={filters.minBilled}
                      onChange={(e) => setFilters({...filters, minBilled: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2">Max Billed (YTD)</Label>
                    <Input
                      type="number"
                      placeholder="$1,000,000.00"
                      value={filters.maxBilled}
                      onChange={(e) => setFilters({...filters, maxBilled: e.target.value})}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-sm font-medium mb-2">Organization</Label>
                    <Input
                      placeholder="Search by organization name..."
                      value={filters.organization}
                      onChange={(e) => setFilters({...filters, organization: e.target.value})}
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

      <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-bold text-gray-900 whitespace-nowrap cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">
                    Name
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead className="font-bold text-gray-900 whitespace-nowrap cursor-pointer hover:bg-gray-100" onClick={() => handleSort('organizations')}>
                  <div className="flex items-center gap-2">
                    Organization(s)
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead className="font-bold text-gray-900 whitespace-nowrap cursor-pointer hover:bg-gray-100" onClick={() => handleSort('states')}>
                  <div className="flex items-center gap-2">
                    States Registered
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead className="font-bold text-gray-900 whitespace-nowrap cursor-pointer hover:bg-gray-100" onClick={() => handleSort('npi')}>
                  <div className="flex items-center gap-2">
                    NPI
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead className="font-bold text-gray-900 whitespace-nowrap cursor-pointer hover:bg-gray-100" onClick={() => handleSort('dea_id')}>
                  <div className="flex items-center gap-2">
                    DEA ID
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead className="font-bold text-gray-900 whitespace-nowrap text-center cursor-pointer hover:bg-gray-100" onClick={() => handleSort('num_patients')}>
                  <div className="flex items-center gap-2 justify-center">
                    # Patients
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead className="font-bold text-gray-900 whitespace-nowrap text-right cursor-pointer hover:bg-gray-100" onClick={() => handleSort('billed_12m')}>
                  <div className="flex items-center gap-2 justify-end">
                    Billed (Last 12 Mo)
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead className="font-bold text-gray-900 whitespace-nowrap text-right cursor-pointer hover:bg-gray-100" onClick={() => handleSort('billed_ytd')}>
                  <div className="flex items-center gap-2 justify-end">
                    Billed (YTD)
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPhysicians.map(physician => (
                <TableRow 
                  key={physician.id} 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="font-semibold text-gray-900 whitespace-nowrap">{physician.name}</TableCell>
                  <TableCell className="text-gray-700">{physician.organizations}</TableCell>
                  <TableCell className="text-gray-700 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPhysicianStates(physician.states);
                        setShowStatesDialog(true);
                      }}
                      className="text-[#1a1f5c] hover:underline font-semibold"
                    >
                      {physician.states.split(',').length} {physician.states.split(',').length === 1 ? 'state' : 'states'}
                    </button>
                  </TableCell>
                  <TableCell className="text-gray-700 whitespace-nowrap">{physician.npi}</TableCell>
                  <TableCell className="text-gray-700 whitespace-nowrap">{physician.dea_id}</TableCell>
                  <TableCell className="text-center">
                    <Link
                      to={`${createPageUrl('FacilityPatients')}?physician=${encodeURIComponent(physician.name)}`}
                      className="text-[#1a1f5c] hover:underline font-semibold"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {physician.num_patients}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right text-gray-900 font-semibold">${formatCurrency(physician.billed_12m)}</TableCell>
                  <TableCell className="text-right text-gray-900 font-semibold">${formatCurrency(physician.billed_ytd)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* States Dialog */}
      <Dialog open={showStatesDialog} onOpenChange={setShowStatesDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Registered States</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex flex-wrap gap-2">
              {selectedPhysicianStates.split(',').map((state, index) => (
                <div key={index} className="px-4 py-2 bg-[#1a1f5c] text-white rounded-lg font-semibold">
                  {state.trim()}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}