import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Pill, Calendar, CreditCard, AlertCircle, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ActionWorkflow({ requestType, patientName, communication }) {
  const [workflowState, setWorkflowState] = useState({
    step: 1,
    medication: '',
    prescriber: '',
    refillsRemaining: '',
    insuranceVerified: false,
    deliveryMethod: 'pickup',
    notes: ''
  });

  if (requestType === 'prescription_refill') {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center gap-2 mb-4">
          <Pill className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-800">Prescription Refill Workflow</h3>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4].map(step => (
            <div key={step} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                workflowState.step >= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {workflowState.step > step ? <CheckCircle className="w-5 h-5" /> : step}
              </div>
              {step < 4 && <div className={`flex-1 h-1 mx-2 ${workflowState.step > step ? 'bg-blue-600' : 'bg-gray-300'}`}></div>}
            </div>
          ))}
        </div>

        {/* Step 1: Verify Medication */}
        {workflowState.step === 1 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Step 1: Verify Medication Details</h4>
            <div>
              <Label>Medication Name</Label>
              <Input
                value={workflowState.medication}
                onChange={(e) => setWorkflowState({...workflowState, medication: e.target.value})}
                placeholder="e.g., Lisinopril 10mg"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Prescriber</Label>
              <Select value={workflowState.prescriber} onValueChange={(val) => setWorkflowState({...workflowState, prescriber: val})}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select prescriber" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dr. Smith">Dr. Smith</SelectItem>
                  <SelectItem value="Dr. Johnson">Dr. Johnson</SelectItem>
                  <SelectItem value="Dr. Wilson">Dr. Wilson</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Refills Remaining</Label>
              <Input
                type="number"
                value={workflowState.refillsRemaining}
                onChange={(e) => setWorkflowState({...workflowState, refillsRemaining: e.target.value})}
                placeholder="3"
                className="mt-1"
              />
            </div>
            <Button 
              onClick={() => setWorkflowState({...workflowState, step: 2})}
              disabled={!workflowState.medication || !workflowState.prescriber}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Next: Verify Insurance
            </Button>
          </div>
        )}

        {/* Step 2: Verify Insurance */}
        {workflowState.step === 2 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Step 2: Verify Insurance Coverage</h4>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Patient Insurance: <span className="font-semibold">{communication.insurance_provider || 'Blue Cross Blue Shield PPO'}</span></p>
              <Badge className="bg-green-100 text-green-800">Active Coverage</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={workflowState.insuranceVerified}
                onCheckedChange={(checked) => setWorkflowState({...workflowState, insuranceVerified: checked})}
              />
              <label className="text-sm text-gray-700">Insurance verified and approved</label>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setWorkflowState({...workflowState, step: 1})}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={() => setWorkflowState({...workflowState, step: 3})}
                disabled={!workflowState.insuranceVerified}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Next: Process Refill
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Process Refill */}
        {workflowState.step === 3 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Step 3: Process Refill</h4>
            <div>
              <Label>Delivery Method</Label>
              <Select value={workflowState.deliveryMethod} onValueChange={(val) => setWorkflowState({...workflowState, deliveryMethod: val})}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pickup">Pharmacy Pickup</SelectItem>
                  <SelectItem value="delivery">Home Delivery</SelectItem>
                  <SelectItem value="mail">Mail Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Processing Notes</Label>
              <Input
                value={workflowState.notes}
                onChange={(e) => setWorkflowState({...workflowState, notes: e.target.value})}
                placeholder="Any additional notes..."
                className="mt-1"
              />
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-700"><strong>Estimated Ready Time:</strong> 30 minutes</p>
              <p className="text-sm text-gray-700"><strong>Total Cost:</strong> $15.00 (after insurance)</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setWorkflowState({...workflowState, step: 2})}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={() => setWorkflowState({...workflowState, step: 4})}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Process Refill
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {workflowState.step === 4 && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-800 text-xl">Refill Processed Successfully!</h4>
            <div className="p-4 bg-white rounded-lg border border-gray-200 text-left">
              <p className="text-sm text-gray-700 mb-1"><strong>Medication:</strong> {workflowState.medication}</p>
              <p className="text-sm text-gray-700 mb-1"><strong>Prescriber:</strong> {workflowState.prescriber}</p>
              <p className="text-sm text-gray-700 mb-1"><strong>Delivery:</strong> {workflowState.deliveryMethod}</p>
              <p className="text-sm text-gray-700"><strong>Status:</strong> <Badge className="bg-green-100 text-green-800">Ready for pickup in 30 min</Badge></p>
            </div>
            <p className="text-sm text-gray-600">Patient will be notified via {communication.preferred_contact_method || 'email'}</p>
            <Button 
              onClick={() => setWorkflowState({step: 1, medication: '', prescriber: '', refillsRemaining: '', insuranceVerified: false, deliveryMethod: 'pickup', notes: ''})}
              className="w-full bg-gray-600 hover:bg-gray-700"
            >
              Process Another Refill
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (requestType === 'delivery_status') {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-bold text-gray-800">Delivery Status Inquiry</h3>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-800">Order #ORD-2024-103</p>
            <p className="text-sm text-gray-600">Atorvastatin 20mg</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 bg-gray-200 h-2 rounded-full">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '75%'}}></div>
              </div>
              <span className="text-xs text-gray-600">75%</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Status: <Badge className="bg-green-100 text-green-800">Out for Delivery</Badge></p>
            <p className="text-xs text-gray-500">Expected: Today by 5:00 PM</p>
          </div>
          <Button className="w-full bg-green-600 hover:bg-green-700">
            Send Tracking Link to Patient
          </Button>
        </div>
      </div>
    );
  }

  if (requestType === 'billing_question') {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-bold text-gray-800">Billing Inquiry</h3>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-800">Recent Charges</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Atorvastatin 20mg</span>
                <span className="font-semibold">$15.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Metformin 500mg</span>
                <span className="font-semibold">$10.00</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-1 mt-1">
                <span className="text-gray-800 font-semibold">Total Due</span>
                <span className="font-bold text-[#8B1F1F]">$25.00</span>
              </div>
            </div>
          </div>
          <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
            Send Payment Link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-bold text-gray-800">Quick Actions</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">Common actions for {requestType?.replace(/_/g, ' ')} requests:</p>
      <div className="space-y-2">
        <Button variant="outline" className="w-full justify-start">
          View Patient History
        </Button>
        <Button variant="outline" className="w-full justify-start">
          Schedule Follow-up
        </Button>
        <Button variant="outline" className="w-full justify-start">
          Send Information Packet
        </Button>
      </div>
    </div>
  );
}