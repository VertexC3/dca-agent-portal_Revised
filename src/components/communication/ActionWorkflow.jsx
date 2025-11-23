import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Pill, Calendar, CreditCard, AlertCircle, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ActionWorkflow({ requestType, patientName, communication }) {
  const medications = [
    { name: 'Lisinopril 10mg', prescriber: 'Dr. Smith', refills: 2 },
    { name: 'Metformin 500mg', prescriber: 'Dr. Johnson', refills: 1 },
    { name: 'Atorvastatin 20mg', prescriber: 'Dr. Smith', refills: 3 },
    { name: 'Aspirin 81mg', prescriber: 'Dr. Smith', refills: 0 }
  ];

  const [workflowState, setWorkflowState] = useState({
    step: 1,
    medication: '',
    prescriber: '',
    refillsRemaining: '',
    insuranceVerified: false,
    deliveryMethod: 'pickup',
    notes: ''
  });

  const [selectedMed, setSelectedMed] = useState('');

  const handleMedicationChange = (medName) => {
    const med = medications.find(m => m.name === medName);
    if (med) {
      setWorkflowState({
        ...workflowState,
        medication: med.name,
        prescriber: med.prescriber,
        refillsRemaining: med.refills.toString()
      });
    }
  };

  if (requestType === 'prescription_refill') {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <Pill className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-gray-800">Refill Workflow</h3>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-1 mb-4">
          {[1, 2, 3, 4].map(step => (
            <div key={step} className="flex items-center flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                workflowState.step >= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {workflowState.step > step ? <CheckCircle className="w-4 h-4" /> : step}
              </div>
              {step < 4 && <div className={`flex-1 h-0.5 mx-1 ${workflowState.step > step ? 'bg-blue-600' : 'bg-gray-300'}`}></div>}
            </div>
          ))}
        </div>

        {/* Step 1: Verify Medication */}
        {workflowState.step === 1 && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-800">Step 1: Verify Medication</h4>
            <div>
              <Label className="text-xs">Medication</Label>
              <Select value={workflowState.medication} onValueChange={handleMedicationChange}>
                <SelectTrigger className="mt-1 h-8 text-xs">
                  <SelectValue placeholder="Select medication" />
                </SelectTrigger>
                <SelectContent>
                  {medications.map(med => (
                    <SelectItem key={med.name} value={med.name}>{med.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Prescriber</Label>
              <Input
                value={workflowState.prescriber}
                readOnly
                placeholder="Auto-filled"
                className="mt-1 h-8 text-xs bg-gray-50"
              />
            </div>
            <div>
              <Label className="text-xs">Refills</Label>
              <Input
                value={workflowState.refillsRemaining}
                readOnly
                placeholder="Auto-filled"
                className="mt-1 h-8 text-xs bg-gray-50"
              />
            </div>
            <Button 
              onClick={() => setWorkflowState({...workflowState, step: 2})}
              disabled={!workflowState.medication || !workflowState.prescriber}
              size="sm"
              className="w-full bg-blue-600 hover:bg-blue-700 h-8 text-xs"
            >
              Next
            </Button>
          </div>
        )}

        {/* Step 2: Verify Insurance */}
        {workflowState.step === 2 && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-800">Step 2: Insurance</h4>
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">{communication.insurance_provider || 'Blue Cross Blue Shield PPO'}</p>
              <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={workflowState.insuranceVerified}
                onCheckedChange={(checked) => setWorkflowState({...workflowState, insuranceVerified: checked})}
              />
              <label className="text-xs text-gray-700">Verified</label>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setWorkflowState({...workflowState, step: 1})}
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs"
              >
                Back
              </Button>
              <Button 
                onClick={() => setWorkflowState({...workflowState, step: 3})}
                disabled={!workflowState.insuranceVerified}
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700 h-8 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Process Refill */}
        {workflowState.step === 3 && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-800">Step 3: Process</h4>
            <div>
              <Label className="text-xs">Delivery</Label>
              <Select value={workflowState.deliveryMethod} onValueChange={(val) => setWorkflowState({...workflowState, deliveryMethod: val})}>
                <SelectTrigger className="mt-1 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pickup">Pickup</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="mail">Mail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Notes</Label>
              <Input
                value={workflowState.notes}
                onChange={(e) => setWorkflowState({...workflowState, notes: e.target.value})}
                placeholder="Optional..."
                className="mt-1 h-8 text-xs"
              />
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-gray-700"><strong>Ready:</strong> 30 min</p>
              <p className="text-xs text-gray-700"><strong>Cost:</strong> $15.00</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setWorkflowState({...workflowState, step: 2})}
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs"
              >
                Back
              </Button>
              <Button 
                onClick={() => setWorkflowState({...workflowState, step: 4})}
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700 h-8 text-xs"
              >
                Process
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {workflowState.step === 4 && (
          <div className="space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-xs font-semibold text-gray-800">Success!</h4>
            <div className="p-2 bg-white rounded-lg border border-gray-200 text-left space-y-1">
              <p className="text-xs text-gray-700"><strong>Med:</strong> {workflowState.medication}</p>
              <p className="text-xs text-gray-700"><strong>Dr:</strong> {workflowState.prescriber}</p>
              <p className="text-xs text-gray-700"><strong>Method:</strong> {workflowState.deliveryMethod}</p>
              <Badge className="bg-green-100 text-green-800 text-xs">Ready in 30 min</Badge>
            </div>
            <p className="text-xs text-gray-600">Notify via {communication.preferred_contact_method || 'email'}</p>
            <Button 
              onClick={() => setWorkflowState({step: 1, medication: '', prescriber: '', refillsRemaining: '', insuranceVerified: false, deliveryMethod: 'pickup', notes: ''})}
              size="sm"
              className="w-full bg-gray-600 hover:bg-gray-700 h-8 text-xs"
            >
              New Refill
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (requestType === 'delivery_status') {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-4 h-4 text-green-600" />
          <h3 className="text-sm font-bold text-gray-800">Delivery Status</h3>
        </div>
        <div className="space-y-2">
          <div className="p-2 bg-white rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-800">ORD-2024-103</p>
            <p className="text-xs text-gray-600">Atorvastatin 20mg</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-gray-200 h-1 rounded-full">
                <div className="bg-green-600 h-1 rounded-full" style={{width: '75%'}}></div>
              </div>
              <span className="text-xs text-gray-600">75%</span>
            </div>
            <Badge className="bg-green-100 text-green-800 text-xs mt-1">Out for Delivery</Badge>
            <p className="text-xs text-gray-500 mt-1">Today by 5:00 PM</p>
          </div>
          <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 h-8 text-xs">
            Send Tracking Link
          </Button>
        </div>
      </div>
    );
  }

  if (requestType === 'billing_question') {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="w-4 h-4 text-yellow-600" />
          <h3 className="text-sm font-bold text-gray-800">Billing</h3>
        </div>
        <div className="space-y-2">
          <div className="p-2 bg-white rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-800 mb-1">Recent Charges</p>
            <div className="space-y-0.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Atorvastatin 20mg</span>
                <span className="font-semibold">$15.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Metformin 500mg</span>
                <span className="font-semibold">$10.00</span>
              </div>
              <div className="flex justify-between border-t pt-0.5 mt-0.5">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-[#8B1F1F]">$25.00</span>
              </div>
            </div>
          </div>
          <Button size="sm" className="w-full bg-yellow-600 hover:bg-yellow-700 h-8 text-xs">
            Send Payment Link
          </Button>
        </div>
      </div>
    );
  }

  if (requestType === 'side_effects') {
    const sideEffectsData = {
      'Lisinopril 10mg': ['Dizziness', 'Dry cough', 'Headache', 'Fatigue', 'Nausea', 'Low blood pressure', 'Elevated potassium levels', 'Kidney problems', 'Angioedema (rare but serious)'],
      'Metformin 500mg': ['Nausea', 'Diarrhea', 'Stomach upset', 'Metallic taste', 'Loss of appetite', 'Vitamin B12 deficiency', 'Lactic acidosis (rare but serious)'],
      'Atorvastatin 20mg': ['Muscle pain', 'Headache', 'Nausea', 'Joint pain', 'Diarrhea', 'Elevated liver enzymes', 'Memory problems', 'Confusion'],
      'Aspirin 81mg': ['Stomach irritation', 'Heartburn', 'Nausea', 'Increased bleeding risk', 'Bruising', 'Ringing in ears', 'Allergic reactions']
    };

    return (
      <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-200">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <h3 className="text-sm font-bold text-gray-800">Side Effects Info</h3>
        </div>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Select Prescription</Label>
            <Select value={selectedMed} onValueChange={setSelectedMed}>
              <SelectTrigger className="mt-1 h-8 text-xs">
                <SelectValue placeholder="Choose medication" />
              </SelectTrigger>
              <SelectContent>
                {medications.map(med => (
                  <SelectItem key={med.name} value={med.name}>{med.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedMed && sideEffectsData[selectedMed] && (
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-800 mb-2">Known Side Effects:</p>
              <div className="max-h-48 overflow-y-auto space-y-1.5">
                {sideEffectsData[selectedMed].map((effect, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <span className="text-red-600 mt-0.5">•</span>
                    <span className="text-gray-700">{effect}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <Button size="sm" className="w-full bg-red-600 hover:bg-red-700 h-8 text-xs">
            Send Side Effects Info
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="w-4 h-4 text-gray-600" />
        <h3 className="text-sm font-bold text-gray-800">Quick Actions</h3>
      </div>
      <p className="text-xs text-gray-600 mb-3">For {requestType?.replace(/_/g, ' ')} requests:</p>
      <div className="space-y-1.5">
        <Button variant="outline" size="sm" className="w-full justify-start h-8 text-xs">
          View History
        </Button>
        <Button variant="outline" size="sm" className="w-full justify-start h-8 text-xs">
          Schedule Follow-up
        </Button>
        <Button variant="outline" size="sm" className="w-full justify-start h-8 text-xs">
          Send Info Packet
        </Button>
      </div>
    </div>
  );
}