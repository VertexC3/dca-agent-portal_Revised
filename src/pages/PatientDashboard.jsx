import React, { useState } from 'react';
import { Pill, MessageSquare, User, Package, Filter, Calendar, FileText, CreditCard, Edit, CheckCircle2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import PrescriptionCard from '../components/patient/PrescriptionCard';
import CollapsibleOrderHistory from '../components/patient/CollapsibleOrderHistory';
import RefillRequestDialog from '../components/patient/RefillRequestDialog';
import SatisfactionSurveyAlert from '../components/patient/SatisfactionSurveyAlert';

// Mock user data
const mockUser = {
  full_name: "John Doe",
  email: "john.doe@example.com",
  quick_actions: ['profile', 'communication', 'refill'],
  patient_pref_prescriptions: true,
  patient_pref_communications: true,
  patient_pref_quick_actions: true,
  patient_pref_orders: true,
  survey_completed: false
};

export default function PatientDashboard() {
  const [showQuickRefill, setShowQuickRefill] = useState(false);
  const [prescriptionFilter, setPrescriptionFilter] = useState('Active');
  const [showEditActions, setShowEditActions] = useState(false);
  const [showSurveyAlert, setShowSurveyAlert] = useState(true);
  const [quickActions, setQuickActions] = useState(mockUser.quick_actions);
  const [showRenewalDialog, setShowRenewalDialog] = useState(false);
  const [renewalSubmitted, setRenewalSubmitted] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showOrdersDialog, setShowOrdersDialog] = useState(false);
  
  const user = mockUser;

  // All available quick actions
  const allQuickActions = [
    { id: 'profile', label: 'Update Profile', icon: User, action: () => window.location.href = createPageUrl('PatientProfile') },
    { id: 'communication', label: 'Communication', icon: MessageSquare, action: () => window.location.href = createPageUrl('PatientMessages') },
    { id: 'refill', label: 'Request Refill', icon: Pill, action: () => setShowQuickRefill(true) },
    { id: 'renewal', label: 'Request Renewal', icon: FileText, action: () => { setRenewalSubmitted(false); setShowRenewalDialog(true); } },
    { id: 'orders', label: 'View Orders', icon: Package, action: () => setShowOrdersDialog(true) },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard, action: () => setShowPaymentDialog(true) }
  ];

  // Default quick actions (first 3)
  const defaultActions = ['profile', 'communication', 'refill'];
  const selectedActions = user?.quick_actions || defaultActions;

  const [tempSelectedActions, setTempSelectedActions] = useState(quickActions);

  const handleToggleAction = (actionId) => {
    if (tempSelectedActions.includes(actionId)) {
      setTempSelectedActions(tempSelectedActions.filter(id => id !== actionId));
    } else if (tempSelectedActions.length < 3) {
      setTempSelectedActions([...tempSelectedActions, actionId]);
    }
  };

  const handleSaveActions = () => {
    setQuickActions(tempSelectedActions);
    setShowEditActions(false);
  };

  // Mock communications data
  const communications = [
    {
      id: '1',
      request_type: 'prescription_refill',
      channel: 'platform',
      message_content: 'I would like to request a refill for my Lisinopril prescription.',
      date: '2025-11-15',
      timestamp: '2025-11-15T10:30:00Z'
    },
    {
      id: '2',
      request_type: 'delivery_status',
      channel: 'email',
      message_content: 'Could you please check the status of my recent order?',
      date: '2025-11-12',
      timestamp: '2025-11-12T14:20:00Z'
    },
    {
      id: '3',
      request_type: 'billing_question',
      channel: 'phone',
      message_content: 'I have a question about my recent invoice.',
      date: '2025-11-10',
      timestamp: '2025-11-10T09:15:00Z'
    }
  ];

  // Dummy prescriptions with different statuses
  const allPrescriptions = [
    {
      id: 1,
      name: 'Lisinopril 10mg',
      dosage: 'Take 1 tablet daily',
      prescriber: 'Dr. Smith',
      refills: 3,
      quantity: 30,
      lastFilled: '2025-11-01',
      dateWritten: '2025-05-01',
      dateExpires: '2026-05-01',
      status: 'Ready for Pickup',
      category: 'Active',
      image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695285fc94e8ef46bde70e16/20aa3eaaf_Tizepatide.jpg'
    },
    {
      id: 2,
      name: 'Metformin 500mg',
      dosage: 'Take 2 tablets twice daily with meals',
      prescriber: 'Dr. Johnson',
      refills: 2,
      quantity: 90,
      lastFilled: '2025-10-25',
      dateWritten: '2025-04-15',
      dateExpires: '2026-04-15',
      status: 'Shipped',
      tracking: '1Z999AA10123456784',
      expectedDelivery: 'Nov 16, 2025',
      category: 'Active',
      image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695285fc94e8ef46bde70e16/20aa3eaaf_Tizepatide.jpg'
    },
    {
      id: 3,
      name: 'Atorvastatin 20mg',
      dosage: 'Take 1 tablet at bedtime',
      prescriber: 'Dr. Smith',
      refills: 1,
      quantity: 30,
      lastFilled: '2025-10-20',
      dateWritten: '2025-06-10',
      dateExpires: '2026-06-10',
      status: 'Delivered',
      tracking: '1Z999AA10987654321',
      expectedDelivery: 'Nov 15, 2025',
      category: 'Active',
      image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695285fc94e8ef46bde70e16/20aa3eaaf_Tizepatide.jpg'
    },
    {
      id: 4,
      name: 'Aspirin 81mg',
      dosage: 'Take 1 tablet daily',
      prescriber: 'Dr. Smith',
      refills: 0,
      quantity: 30,
      lastFilled: '2025-08-01',
      dateWritten: '2025-02-01',
      dateExpires: '2026-02-01',
      status: 'Request Renewal',
      category: 'Inactive',
      image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695285fc94e8ef46bde70e16/20aa3eaaf_Tizepatide.jpg'
    },
    {
      id: 5,
      name: 'Ibuprofen 200mg',
      dosage: 'Take as needed',
      prescriber: 'Dr. Johnson',
      refills: 0,
      quantity: 60,
      lastFilled: '2025-06-01',
      dateWritten: '2025-01-15',
      dateExpires: '2026-01-15',
      status: 'Renewal Requested',
      category: 'Inactive',
      image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695285fc94e8ef46bde70e16/20aa3eaaf_Tizepatide.jpg'
    },
    {
      id: 6,
      name: 'Amoxicillin 500mg',
      dosage: 'Take 1 capsule 3 times daily',
      prescriber: 'Dr. Smith',
      refills: 0,
      quantity: 21,
      lastFilled: '2024-12-01',
      dateWritten: '2024-12-01',
      dateExpires: '2025-12-01',
      status: 'Discontinued',
      category: 'Inactive',
      image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695285fc94e8ef46bde70e16/20aa3eaaf_Tizepatide.jpg'
    },
    {
      id: 7,
      name: 'Prednisone 10mg',
      dosage: 'Take as directed on taper schedule',
      prescriber: 'Dr. Martinez',
      refills: 0,
      quantity: 14,
      lastFilled: '2024-11-15',
      dateWritten: '2024-11-15',
      dateExpires: '2025-11-15',
      status: 'Discontinued',
      category: 'Inactive',
      image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695285fc94e8ef46bde70e16/20aa3eaaf_Tizepatide.jpg'
    },
    {
      id: 8,
      name: 'Benzonatate 100mg',
      dosage: 'Take 1 capsule 3 times daily as needed for cough',
      prescriber: 'Dr. Johnson',
      refills: 0,
      quantity: 30,
      lastFilled: '2024-10-01',
      dateWritten: '2024-10-01',
      dateExpires: '2025-10-01',
      status: 'Discontinued',
      category: 'Inactive',
      image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695285fc94e8ef46bde70e16/20aa3eaaf_Tizepatide.jpg'
    }
    ];

  const prescriptions = allPrescriptions.filter(p => p.category === prescriptionFilter);

  return (
    <div className="space-y-6">
      {/* Survey Alert */}
      {showSurveyAlert && !user?.survey_completed && (
        <SatisfactionSurveyAlert 
          user={user} 
          onDismiss={() => setShowSurveyAlert(false)} 
        />
      )}

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#8B1F1F] to-[#6B1515] rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.full_name}!</h1>
        <p className="text-white/80">Here's an overview of your prescriptions and recent activity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Prescriptions Section */}
        <div className="lg:col-span-2 space-y-6">
          {user?.patient_pref_prescriptions !== false && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  {prescriptionFilter} Prescriptions ({prescriptions.length})
                </h2>
                <Select value={prescriptionFilter} onValueChange={setPrescriptionFilter}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {prescriptions.map(prescription => (
                  <PrescriptionCard key={prescription.id} prescription={prescription} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Communications */}
          {user?.patient_pref_communications !== false && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#8B1F1F]" />
              Recent Communications
            </h3>
            <div className="space-y-3">
              {communications.slice(0, 5).map(comm => (
                    <Link
                      key={comm.id}
                      to={createPageUrl(`PatientCommunicationDetail?id=${comm.id}`)}
                      className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-gray-800">
                          {comm.request_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <Badge className="text-xs">{comm.channel}</Badge>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{comm.message_content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(comm.date), 'MMM d, yyyy')}
                      </p>
                    </Link>
                  ))}
                </div>
                <Link to={createPageUrl('PatientCommunications')}>
                  <button className="w-full mt-4 py-2 text-sm text-[#8B1F1F] hover:text-[#721919] font-semibold">
                    See All →
                  </button>
                </Link>
            </div>
          )}

          {/* Quick Actions */}
          {user?.patient_pref_quick_actions !== false && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Quick Actions</h3>
              <button
                onClick={() => {
                  setTempSelectedActions(quickActions);
                  setShowEditActions(true);
                }}
                className="text-sm text-[#8B1F1F] hover:text-[#721919] font-semibold flex items-center gap-1"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </div>
            <div className="space-y-2">
              {quickActions.map(actionId => {
                const action = allQuickActions.find(a => a.id === actionId);
                if (!action) return null;
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-left transition-all"
                  >
                    <Icon className="w-4 h-4 inline mr-2 text-[#8B1F1F]" />
                    <span className="text-sm font-semibold text-gray-800">{action.label}</span>
                  </button>
                );
              })}
            </div>
            </div>
          )}

          {/* Recent Orders */}
          {user?.patient_pref_orders !== false && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#8B1F1F]" />
                  Recent Orders
                </h3>
                <Link to={createPageUrl('PatientProfile') + '#orders'} className="text-sm text-[#8B1F1F] hover:text-[#721919] font-semibold">
                  See All →
                </Link>
              </div>
              <CollapsibleOrderHistory limit={5} showSeeAll={false} allowReporting={false} />
            </div>
          )}
        </div>
      </div>

      <RefillRequestDialog
        open={showQuickRefill}
        onClose={() => setShowQuickRefill(false)}
        prescription={prescriptions[0]}
      />

      {/* Request Renewal Dialog */}
      <Dialog open={showRenewalDialog} onOpenChange={setShowRenewalDialog}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#8B1F1F]" />
              Request Prescription Renewal
            </DialogTitle>
          </DialogHeader>
          {renewalSubmitted ? (
            <div className="flex flex-col items-center py-6 gap-3">
              <CheckCircle2 className="w-14 h-14 text-green-500" />
              <p className="text-lg font-bold text-gray-800">Renewal Request Sent!</p>
              <p className="text-sm text-gray-600 text-center">Your renewal request has been forwarded to your prescriber. You'll be notified once approved.</p>
              <Button className="mt-2 bg-[#8B1F1F] hover:bg-[#721919] text-white w-full" onClick={() => setShowRenewalDialog(false)}>Done</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Select the prescription you'd like to renew:</p>
              <div className="space-y-2">
                {allPrescriptions.filter(p => p.category === 'Inactive').map(rx => (
                  <div key={rx.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <Pill className="w-4 h-4 text-[#8B1F1F] flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{rx.name}</p>
                      <p className="text-xs text-gray-500">{rx.prescriber}</p>
                    </div>
                    <Badge className="bg-gray-200 text-gray-700 text-xs">{rx.status}</Badge>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowRenewalDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-[#8B1F1F] hover:bg-[#721919] text-white" onClick={() => setRenewalSubmitted(true)}>Submit Request</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Methods Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#8B1F1F]" />
              Payment Methods
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { brand: 'Visa', last4: '4242', expiry: '12/27', isDefault: true },
              { brand: 'Mastercard', last4: '8888', expiry: '09/26', isDefault: false },
            ].map((card, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <CreditCard className="w-6 h-6 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{card.brand} •••• {card.last4}</p>
                  <p className="text-xs text-gray-500">Expires {card.expiry}</p>
                </div>
                {card.isDefault && <Badge className="bg-green-100 text-green-700 text-xs">Default</Badge>}
              </div>
            ))}
            <Button className="w-full mt-2 bg-[#8B1F1F] hover:bg-[#721919] text-white">+ Add New Card</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Orders Dialog */}
      <Dialog open={showOrdersDialog} onOpenChange={setShowOrdersDialog}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#8B1F1F]" />
              Recent Orders
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {[
              { id: 'ORD-1001', medication: 'Lisinopril 10mg', date: 'Nov 1, 2025', amount: 45.00, status: 'Delivered', tracking: '1Z999AA10123456784' },
              { id: 'ORD-1002', medication: 'Metformin 500mg', date: 'Oct 25, 2025', amount: 32.00, status: 'Shipped', tracking: '1Z999AA10987654321' },
              { id: 'ORD-1003', medication: 'Atorvastatin 20mg', date: 'Oct 20, 2025', amount: 28.00, status: 'Delivered', tracking: '1Z999AA10111111111' },
              { id: 'ORD-1004', medication: 'Aspirin 81mg', date: 'Sep 5, 2025', amount: 12.00, status: 'Delivered', tracking: '1Z999AA10222222222' },
            ].map(order => (
              <div key={order.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <Package className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{order.medication}</p>
                  <p className="text-xs text-gray-500">{order.id} · {order.date}</p>
                  <p className="text-xs text-gray-400">Tracking: {order.tracking}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">${order.amount.toFixed(2)}</p>
                  <Badge className={order.status === 'Delivered' ? 'bg-green-100 text-green-700 text-xs' : 'bg-blue-100 text-blue-700 text-xs'}>{order.status}</Badge>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-2" onClick={() => setShowOrdersDialog(false)}>Close</Button>
        </DialogContent>
      </Dialog>

      {/* Edit Quick Actions Dialog */}
      <Dialog open={showEditActions} onOpenChange={setShowEditActions}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Edit Quick Actions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Select up to 3 quick actions to display on your dashboard.</p>
            <div className="space-y-2">
              {allQuickActions.map(action => {
                const Icon = action.icon;
                const isSelected = tempSelectedActions.includes(action.id);
                const isDisabled = !isSelected && tempSelectedActions.length >= 3;
                return (
                  <div
                    key={action.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      isSelected ? 'border-[#8B1F1F] bg-red-50' : 'border-gray-200 bg-gray-50'
                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#8B1F1F]'}`}
                    onClick={() => !isDisabled && handleToggleAction(action.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      onCheckedChange={() => !isDisabled && handleToggleAction(action.id)}
                    />
                    <Icon className="w-4 h-4 text-[#8B1F1F]" />
                    <span className="text-sm font-semibold text-gray-800">{action.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEditActions(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveActions}
                disabled={tempSelectedActions.length === 0}
                className="flex-1 bg-[#8B1F1F] hover:bg-[#721919] text-white"
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}