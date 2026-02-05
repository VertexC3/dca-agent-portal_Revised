import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Users } from 'lucide-react';

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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredPhysicians = mockPhysicians.filter(physician => {
    if (searchTerm && !physician.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !physician.npi.includes(searchTerm) &&
        !physician.dea_id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
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
            placeholder="Search by name, NPI, or DEA ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 w-96 border-2 border-gray-300"
          />
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
                  <TableCell className="text-gray-700 whitespace-nowrap">{physician.states}</TableCell>
                  <TableCell className="text-gray-700 whitespace-nowrap">{physician.npi}</TableCell>
                  <TableCell className="text-gray-700 whitespace-nowrap">{physician.dea_id}</TableCell>
                  <TableCell className="text-center text-gray-900 font-semibold">{physician.num_patients}</TableCell>
                  <TableCell className="text-right text-gray-900 font-semibold">${formatCurrency(physician.billed_12m)}</TableCell>
                  <TableCell className="text-right text-gray-900 font-semibold">${formatCurrency(physician.billed_ytd)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}