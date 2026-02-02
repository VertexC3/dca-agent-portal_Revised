import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, User, FileText, Stethoscope, Building2 } from 'lucide-react';
import { createPageUrl } from '../utils';

export default function FacilitySearchResults() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q') || '';
  const type = urlParams.get('type') || 'all';

  // Mock search results
  const mockResults = {
    patients: [
      { id: '1', name: 'John Doe', email: 'john.doe@example.com', type: 'patient' },
      { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', type: 'patient' }
    ],
    invoices: [
      { id: 'INV-001', number: 'INV-2026-001', total: 1250.00, status: 'open', type: 'invoice' },
      { id: 'INV-002', number: 'INV-2026-002', total: 875.50, status: 'paid', type: 'invoice' }
    ],
    physicians: [
      { id: '1', name: 'Dr. Sarah Johnson', specialty: 'Endocrinology', type: 'physician' }
    ],
    pharmacies: [
      { id: '1', name: 'DCA Pharmacy Main', location: 'San Francisco, CA', type: 'pharmacy' }
    ]
  };

  const getFilteredResults = () => {
    if (type === 'all') {
      return [
        ...mockResults.patients.map(p => ({ ...p, category: 'Patient' })),
        ...mockResults.invoices.map(i => ({ ...i, category: 'Invoice' })),
        ...mockResults.physicians.map(p => ({ ...p, category: 'Physician' })),
        ...mockResults.pharmacies.map(p => ({ ...p, category: 'Pharmacy' }))
      ];
    }
    
    const categoryMap = {
      patient: mockResults.patients.map(p => ({ ...p, category: 'Patient' })),
      invoice: mockResults.invoices.map(i => ({ ...i, category: 'Invoice' })),
      physician: mockResults.physicians.map(p => ({ ...p, category: 'Physician' })),
      pharmacy: mockResults.pharmacies.map(p => ({ ...p, category: 'Pharmacy' }))
    };
    
    return categoryMap[type] || [];
  };

  const results = getFilteredResults();

  const getIcon = (category) => {
    switch(category) {
      case 'Patient': return <User className="w-5 h-5" />;
      case 'Invoice': return <FileText className="w-5 h-5" />;
      case 'Physician': return <Stethoscope className="w-5 h-5" />;
      case 'Pharmacy': return <Building2 className="w-5 h-5" />;
      default: return <Search className="w-5 h-5" />;
    }
  };

  const handleResultClick = (result) => {
    if (result.category === 'Patient') {
      navigate(createPageUrl('FacilityPatients'));
    } else if (result.category === 'Invoice') {
      navigate(createPageUrl('FacilityInvoices'));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
        <p className="text-gray-600 mt-1">
          Found {results.length} results for "{query}"
          {type !== 'all' && ` in ${type}s`}
        </p>
      </div>

      {results.length === 0 ? (
        <Card className="border-2 border-gray-200">
          <CardContent className="p-12 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {results.map((result, idx) => (
            <Card
              key={idx}
              className="border-2 border-gray-200 hover:border-[#1a1f5c] transition-all cursor-pointer"
              onClick={() => handleResultClick(result)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-100 rounded-lg text-gray-700">
                      {getIcon(result.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {result.name || result.number}
                        </h3>
                        <Badge className="bg-gray-100 text-gray-700 text-xs">
                          {result.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {result.email || result.specialty || result.location || 
                         (result.total && `Total: $${result.total.toFixed(2)}`)}
                      </p>
                    </div>
                  </div>
                  {result.status && (
                    <Badge className={
                      result.status === 'paid' ? 'bg-green-100 text-green-800' :
                      result.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {result.status}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}