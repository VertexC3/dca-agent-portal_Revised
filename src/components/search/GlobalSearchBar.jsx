import React, { useState } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const statusColors = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  resolved: 'bg-green-50 text-green-700 border-green-200'
};

export default function GlobalSearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { data: communications = [], isLoading } = useQuery({
    queryKey: ['communications'],
    queryFn: () => base44.entities.PatientCommunication.list('-timestamp', 100)
  });

  const filteredResults = searchTerm.trim().length >= 2
    ? communications.filter(comm => {
        const searchLower = searchTerm.toLowerCase();
        return (
          comm.patient_name?.toLowerCase().includes(searchLower) ||
          comm.patient_email?.toLowerCase().includes(searchLower) ||
          comm.patient_phone?.includes(searchTerm) ||
          comm.message_content?.toLowerCase().includes(searchLower) ||
          comm.request_type?.toLowerCase().includes(searchLower) ||
          comm.patient_id?.toLowerCase().includes(searchLower)
        );
      }).slice(0, 8)
    : [];

  const handleClear = () => {
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative flex-1 max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search patients, messages, IDs..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1F1F] focus:border-transparent text-sm"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && searchTerm.trim().length >= 2 && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Results */}
          <div className="absolute top-full mt-2 w-full md:w-[500px] bg-white rounded-lg border border-gray-200 shadow-xl z-50 max-h-[500px] overflow-y-auto">
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <p className="text-sm font-semibold text-gray-700">
                Search Results {filteredResults.length > 0 && `(${filteredResults.length})`}
              </p>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 text-[#8B1F1F] animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Searching...</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No results found for "{searchTerm}"</p>
                <p className="text-sm text-gray-500 mt-1">Try searching by patient name, email, phone, or message content</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredResults.map(comm => (
                  <Link
                    key={comm.id}
                    to={createPageUrl(`CommunicationDetail?id=${comm.id}`)}
                    onClick={() => {
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className="block p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-800">{comm.patient_name}</p>
                          <Badge className={`${statusColors[comm.status]} border text-xs`}>
                            {comm.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {comm.message_content}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="capitalize">{comm.channel}</span>
                          {comm.patient_email && (
                            <span className="truncate">{comm.patient_email}</span>
                          )}
                          {comm.patient_phone && (
                            <span>{comm.patient_phone}</span>
                          )}
                          <span>{format(new Date(comm.date), 'MMM d')}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {filteredResults.length > 0 && (
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <Link
                  to={createPageUrl(`Communications?search=${encodeURIComponent(searchTerm)}`)}
                  onClick={() => {
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className="text-sm text-[#8B1F1F] hover:underline font-medium"
                >
                  View all results for "{searchTerm}" →
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}