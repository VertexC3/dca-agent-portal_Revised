import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookOpen, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function MedicalGuideDialog({ open, onClose, prescription }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <BookOpen className="w-6 h-6 text-[#8B1F1F]" />
            Medical Guide: {prescription.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* What is this medication */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Info className="w-5 h-5" />
              What is {prescription.name}?
            </h3>
            <p className="text-sm text-blue-800">
              {prescription.name.includes('Lisinopril') && 
                'Lisinopril is an ACE inhibitor used to treat high blood pressure (hypertension) and heart failure. It works by relaxing blood vessels to help blood flow more easily.'}
              {prescription.name.includes('Metformin') && 
                'Metformin is an oral diabetes medication that helps control blood sugar levels. It works by decreasing glucose production in the liver and improving insulin sensitivity.'}
              {prescription.name.includes('Atorvastatin') && 
                'Atorvastatin is a statin medication used to lower cholesterol and triglyceride levels in the blood. It helps reduce the risk of heart disease and stroke.'}
              {prescription.name.includes('Levothyroxine') && 
                'Levothyroxine is a thyroid hormone replacement used to treat hypothyroidism. It replaces the hormone that your thyroid gland cannot produce in sufficient amounts.'}
              {prescription.name.includes('Omeprazole') && 
                'Omeprazole is a proton pump inhibitor (PPI) that reduces stomach acid production. It is used to treat gastroesophageal reflux disease (GERD), ulcers, and heartburn.'}
              {prescription.name.includes('Amlodipine') && 
                'Amlodipine is a calcium channel blocker used to treat high blood pressure and chest pain (angina). It works by relaxing blood vessels to improve blood flow.'}
            </p>
          </div>

          {/* How to take */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              How to Take This Medication
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-[#8B1F1F] font-bold">•</span>
                <span><strong>Dosage:</strong> {prescription.dosage}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8B1F1F] font-bold">•</span>
                <span>Take at the same time each day for best results</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8B1F1F] font-bold">•</span>
                <span>Can be taken with or without food, unless otherwise directed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8B1F1F] font-bold">•</span>
                <span>Do not stop taking without consulting your doctor</span>
              </li>
            </ul>
          </div>

          {/* Side Effects */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Possible Side Effects
            </h3>
            <div className="space-y-2 text-sm text-yellow-800">
              <p className="font-medium">Common (usually mild):</p>
              <ul className="ml-4 space-y-1">
                <li>• Dizziness or lightheadedness</li>
                <li>• Headache</li>
                <li>• Mild stomach upset</li>
                <li>• Fatigue</li>
              </ul>
              <p className="font-medium mt-3">Serious (contact doctor immediately):</p>
              <ul className="ml-4 space-y-1">
                <li>• Severe allergic reaction (rash, swelling, difficulty breathing)</li>
                <li>• Irregular heartbeat</li>
                <li>• Severe dizziness or fainting</li>
                <li>• Unusual bleeding or bruising</li>
              </ul>
            </div>
          </div>

          {/* Important Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Important Information</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-[#8B1F1F] font-bold">•</span>
                <span>Store at room temperature away from moisture and heat</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8B1F1F] font-bold">•</span>
                <span>Keep out of reach of children and pets</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8B1F1F] font-bold">•</span>
                <span>Inform your doctor of all other medications you are taking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8B1F1F] font-bold">•</span>
                <span>Avoid alcohol unless approved by your doctor</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">
              <strong>Questions or concerns?</strong> Contact your pharmacist or prescribing physician. 
              In case of emergency, call 911 or go to the nearest emergency room.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              This is general information. Always follow your doctor's specific instructions.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}