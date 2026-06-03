import React, { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from '@/lib/router';
import { createPageUrl } from '../../utils';

export default function MasterSearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: 'all'
  });
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(createPageUrl('FacilitySearchResults') + `?q=${encodeURIComponent(searchTerm)}&type=${filters.type}&status=${filters.status}&dateRange=${filters.dateRange}`);
    }
  };

  const clearFilters = () => {
    setFilters({ type: 'all', status: 'all', dateRange: 'all' });
    setSearchTerm('');
  };

  const hasActiveFilters = Object.values(filters).some(v => v && v !== 'all') || searchTerm;

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search patients, invoices, physicians, pharmacies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          onClick={() => setIsExpanded(true)}
          className="h-11 w-96 border-2 border-gray-300 focus:border-[#1a1f5c] cursor-pointer"
        />

        {searchTerm && (
          <Button variant="outline" onClick={handleSearch} className="border-2">
            Search
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-14 left-0 bg-white border-2 border-gray-200 rounded-lg shadow-xl p-6 z-50 w-[750px]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#1a1f5c]" />
                <h3 className="font-semibold text-lg text-gray-900">Advanced Search</h3>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <Label className="text-sm font-medium mb-2">Search Type</Label>
                <Select value={filters.type} onValueChange={(v) => setFilters({...filters, type: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="patient">Patients</SelectItem>
                    <SelectItem value="invoice">Invoices</SelectItem>
                    <SelectItem value="physician">Physicians</SelectItem>
                    <SelectItem value="pharmacy">Pharmacies</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2">Status</Label>
                <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2">Date Range</Label>
                <Select value={filters.dateRange} onValueChange={(v) => setFilters({...filters, dateRange: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="text-sm"
              >
                Clear All
              </Button>
              <Button
                onClick={handleSearch}
                className="bg-[#1a1f5c] hover:bg-[#141842] text-white"
              >
                Apply Filters & Search
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}