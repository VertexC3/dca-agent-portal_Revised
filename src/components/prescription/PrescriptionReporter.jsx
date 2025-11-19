import React, { useState } from 'react';
import { FileDown, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function PrescriptionReporter({ prescriptions, patientName }) {
  const [generating, setGenerating] = useState(false);

  const generateCSV = () => {
    setGenerating(true);
    try {
      const headers = [
        'Medication Name',
        'Dosage',
        'Frequency',
        'Prescriber',
        'Dispense Date',
        'Quantity',
        'Refills Remaining',
        'Status',
        'Drug Class',
        'Notes'
      ];

      const rows = prescriptions.map(p => [
        p.medication_name,
        p.dosage,
        p.frequency,
        p.prescriber_name,
        format(new Date(p.dispense_date), 'yyyy-MM-dd'),
        p.quantity_dispensed || '',
        p.refills_remaining !== undefined ? p.refills_remaining : '',
        p.status,
        p.drug_class || '',
        p.notes || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${patientName.replace(/\s+/g, '_')}_Prescriptions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating CSV:', error);
      alert('Failed to generate CSV report');
    } finally {
      setGenerating(false);
    }
  };

  const generatePDF = () => {
    setGenerating(true);
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Prescription History Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #8B1F1F; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #8B1F1F; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .active { color: green; font-weight: bold; }
            .discontinued { color: red; font-weight: bold; }
            .completed { color: gray; }
          </style>
        </head>
        <body>
          <h1>Prescription History Report</h1>
          <p><strong>Patient:</strong> ${patientName}</p>
          <p><strong>Report Date:</strong> ${format(new Date(), 'MMMM d, yyyy')}</p>
          <p><strong>Total Prescriptions:</strong> ${prescriptions.length}</p>
          
          <table>
            <thead>
              <tr>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Prescriber</th>
                <th>Dispense Date</th>
                <th>Quantity</th>
                <th>Refills</th>
                <th>Status</th>
                <th>Drug Class</th>
              </tr>
            </thead>
            <tbody>
              ${prescriptions.map(p => `
                <tr>
                  <td>${p.medication_name}</td>
                  <td>${p.dosage}</td>
                  <td>${p.frequency}</td>
                  <td>${p.prescriber_name}</td>
                  <td>${format(new Date(p.dispense_date), 'MMM d, yyyy')}</td>
                  <td>${p.quantity_dispensed || 'N/A'}</td>
                  <td>${p.refills_remaining !== undefined ? p.refills_remaining : 'N/A'}</td>
                  <td class="${p.status}">${p.status}</td>
                  <td>${p.drug_class || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${patientName.replace(/\s+/g, '_')}_Prescriptions_${format(new Date(), 'yyyy-MM-dd')}.html`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-[#8B1F1F]" />
        Generate Report
      </h3>

      <div className="space-y-3">
        <Button
          onClick={generateCSV}
          disabled={generating || prescriptions.length === 0}
          className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300"
        >
          <FileDown className="w-4 h-4 mr-2" />
          Export as CSV
        </Button>

        <Button
          onClick={generatePDF}
          disabled={generating || prescriptions.length === 0}
          className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300"
        >
          <FileDown className="w-4 h-4 mr-2" />
          Export as PDF
        </Button>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        {prescriptions.length} prescription(s) will be included
      </p>
    </div>
  );
}