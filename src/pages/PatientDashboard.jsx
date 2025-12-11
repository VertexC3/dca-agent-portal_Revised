import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Pill, MessageSquare, User, Loader2, Package, Filter, Calendar, FileText, CreditCard, Edit } from 'lucide-react';
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

export default function PatientDashboard() {
  const [showQuickRefill, setShowQuickRefill] = useState(false);
  const [prescriptionFilter, setPrescriptionFilter] = useState('Active');
  const [showEditActions, setShowEditActions] = useState(false);
  const [showSurveyAlert, setShowSurveyAlert] = useState(true);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: featureFlags = [] } = useQuery({
    queryKey: ['featureFlags'],
    queryFn: () => base44.entities.FeatureFlag.list(),
  });

  const isFeatureEnabled = (key) => {
    const flag = featureFlags.find(f => f.key === key);
    return flag ? flag.is_enabled : true;
  };

  // All available quick actions
  const allQuickActions = [
    { id: 'profile', label: 'Update Profile', icon: User, action: () => window.location.href = createPageUrl('PatientProfile') },
    { id: 'communication', label: 'Communication', icon: MessageSquare, action: () => window.location.href = createPageUrl('PatientMessages') },
    { id: 'refill', label: 'Request Refill', icon: Pill, action: () => setShowQuickRefill(true) },
    { id: 'renewal', label: 'Request Renewal', icon: FileText, action: () => alert('Renewal request will be sent to your prescriber') },
    { id: 'orders', label: 'View Orders', icon: Package, action: () => window.location.href = createPageUrl('PatientProfile#orders') },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard, action: () => alert('Payment management coming soon') }
  ];

  // Default quick actions (first 3)
  const defaultActions = ['profile', 'communication', 'refill'];
  const selectedActions = user?.quick_actions || defaultActions;

  const [tempSelectedActions, setTempSelectedActions] = useState(selectedActions);

  const updateQuickActionsMutation = useMutation({
    mutationFn: (actions) => base44.auth.updateMe({ quick_actions: actions }),
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      setShowEditActions(false);
    }
  });

  const handleToggleAction = (actionId) => {
    if (tempSelectedActions.includes(actionId)) {
      setTempSelectedActions(tempSelectedActions.filter(id => id !== actionId));
    } else if (tempSelectedActions.length < 3) {
      setTempSelectedActions([...tempSelectedActions, actionId]);
    }
  };

  const handleSaveActions = () => {
    updateQuickActionsMutation.mutate(tempSelectedActions);
  };

  const { data: communications = [], isLoading: commsLoading } = useQuery({
    queryKey: ['patient-communications'],
    queryFn: async () => {
      const allComms = await base44.entities.PatientCommunication.list('-timestamp', 100);
      const filtered = allComms.filter(c => c.patient_email === user?.email);
      
      // Add dummy communications if list is empty or has less than 2
      if (filtered.length < 2) {
        return [
          {
            id: 'dummy1',
            request_type: 'prescription_refill',
            channel: 'platform',
            message_content: 'I would like to request a refill for my Lisinopril prescription.',
            date: '2025-11-15',
            patient_email: user?.email
          },
          {
            id: 'dummy2',
            request_type: 'delivery_status',
            channel: 'email',
            message_content: 'Could you please check the status of my recent order?',
            date: '2025-11-12',
            patient_email: user?.email
          },
          ...filtered
        ];
      }
      return filtered;
    },
    enabled: !!user
  });

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
      image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6915f90e9513d40c38a60116/a43f1a648_LisinoprilPills_5mg-scaled.jpg'
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
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60'
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
      image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=60'
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
      image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=800&auto=format&fit=crop&q=60'
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
      image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=800&auto=format&fit=crop&q=60'
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
      image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&auto=format&fit=crop&q=60'
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
      image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&auto=format&fit=crop&q=60'
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
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60'
    }
    ];

  const prescriptions = allPrescriptions.filter(p => p.category === prescriptionFilter);

  return (
    <div className="space-y-6">
      {/* Survey Alert */}
      {isFeatureEnabled('patient_survey') && showSurveyAlert && !user?.survey_completed && (
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
          {isFeatureEnabled('patient_prescriptions') && user?.patient_pref_prescriptions !== false && (
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
          {isFeatureEnabled('patient_communications') && user?.patient_pref_communications !== false && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#8B1F1F]" />
              Recent Communications
            </h3>
            {commsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
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
              </>
            )}
            </div>
          )}

          {/* Quick Actions */}
          {isFeatureEnabled('patient_quick_actions') && user?.patient_pref_quick_actions !== false && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Quick Actions</h3>
              <button
                onClick={() => {
                  setTempSelectedActions(selectedActions);
                  setShowEditActions(true);
                }}
                className="text-sm text-[#8B1F1F] hover:text-[#721919] font-semibold flex items-center gap-1"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </div>
            <div className="space-y-2">
              {selectedActions.map(actionId => {
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
          {isFeatureEnabled('patient_orders') && user?.patient_pref_orders !== false && (
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
                disabled={tempSelectedActions.length === 0 || updateQuickActionsMutation.isPending}
                className="flex-1 bg-[#8B1F1F] hover:bg-[#721919] text-white"
              >
                {updateQuickActionsMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}