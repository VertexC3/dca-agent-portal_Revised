import React from 'react';
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { differenceInDays, addDays, parseISO } from 'date-fns';

export default function AdherenceMonitor({ prescriptions }) {
  const adherenceData = React.useMemo(() => {
    return prescriptions
      .filter(p => p.status === 'active')
      .map(prescription => {
        // Simple adherence calculation based on dispense dates
        // Calculate expected days supply based on quantity and frequency
        let daysSupply = 30; // Default assumption
        if (prescription.quantity_dispensed && prescription.frequency) {
          const freqMatch = prescription.frequency.match(/(\d+)/);
          const timesPerDay = freqMatch ? parseInt(freqMatch[0]) : 1;
          daysSupply = Math.floor(prescription.quantity_dispensed / timesPerDay);
        }

        const dispenseDate = parseISO(prescription.dispense_date);
        const expectedRefillDate = addDays(dispenseDate, daysSupply);
        const daysUntilRefill = differenceInDays(expectedRefillDate, new Date());

        let adherenceStatus = 'good';
        let adherenceMessage = 'On track';
        
        if (daysUntilRefill < -7) {
          adherenceStatus = 'critical';
          adherenceMessage = `Overdue by ${Math.abs(daysUntilRefill)} days`;
        } else if (daysUntilRefill < 0) {
          adherenceStatus = 'warning';
          adherenceMessage = `Overdue by ${Math.abs(daysUntilRefill)} days`;
        } else if (daysUntilRefill <= 7) {
          adherenceStatus = 'warning';
          adherenceMessage = `Refill due in ${daysUntilRefill} days`;
        }

        return {
          ...prescription,
          adherenceStatus,
          adherenceMessage,
          daysUntilRefill
        };
      })
      .sort((a, b) => a.daysUntilRefill - b.daysUntilRefill);
  }, [prescriptions]);

  const criticalCount = adherenceData.filter(d => d.adherenceStatus === 'critical').length;
  const warningCount = adherenceData.filter(d => d.adherenceStatus === 'warning').length;
  const goodCount = adherenceData.filter(d => d.adherenceStatus === 'good').length;

  const getStatusIcon = (status) => {
    if (status === 'critical') return <AlertTriangle className="w-5 h-5 text-red-600" />;
    if (status === 'warning') return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <CheckCircle2 className="w-5 h-5 text-green-600" />;
  };

  const getStatusColor = (status) => {
    if (status === 'critical') return 'bg-red-100 text-red-800';
    if (status === 'warning') return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Medication Adherence</h3>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
          <p className="text-xs text-gray-600">Critical</p>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
          <p className="text-xs text-gray-600">Warning</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-2xl font-bold text-green-600">{goodCount}</p>
          <p className="text-xs text-gray-600">On Track</p>
        </div>
      </div>

      {/* Adherence List */}
      <div className="space-y-3">
        {adherenceData.length === 0 ? (
          <p className="text-center py-4 text-gray-500">No active prescriptions to monitor</p>
        ) : (
          adherenceData.map(item => (
            <div
              key={item.id}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-3"
            >
              {getStatusIcon(item.adherenceStatus)}
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{item.medication_name}</p>
                <p className="text-sm text-gray-600">{item.dosage} - {item.frequency}</p>
                <p className="text-xs text-gray-500 mt-1">{item.adherenceMessage}</p>
              </div>
              <Badge className={`${getStatusColor(item.adherenceStatus)} text-xs`}>
                {item.adherenceStatus}
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
}