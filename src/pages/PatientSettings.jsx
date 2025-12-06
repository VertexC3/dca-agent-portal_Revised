import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Save, Loader2, Layout, Sliders, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export default function PatientSettings() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const [preferences, setPreferences] = useState({
    patient_pref_prescriptions: true,
    patient_pref_communications: true,
    patient_pref_quick_actions: true,
    patient_pref_orders: true,
    patient_pref_prescriptions_nav: true,
    patient_pref_messages_nav: true,
  });

  useEffect(() => {
    if (user) {
      setPreferences({
        patient_pref_prescriptions: user.patient_pref_prescriptions ?? true,
        patient_pref_communications: user.patient_pref_communications ?? true,
        patient_pref_quick_actions: user.patient_pref_quick_actions ?? true,
        patient_pref_orders: user.patient_pref_orders ?? true,
        patient_pref_prescriptions_nav: user.patient_pref_prescriptions_nav ?? true,
        patient_pref_messages_nav: user.patient_pref_messages_nav ?? true,
      });
    }
  }, [user]);

  const updatePreferencesMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      alert('Settings updated successfully!');
    }
  });

  const handleSave = () => {
    updatePreferencesMutation.mutate(preferences);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
          <Loader2 className="w-12 h-12 text-[#8B1F1F] animate-spin mx-auto mb-4" />
          <p className="text-gray-700 text-center">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          to={createPageUrl('PatientDashboard')}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Settings</h1>
          <p className="text-gray-600">Customize your portal experience</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="p-6 space-y-8">
          
          {/* Dashboard Customization */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Layout className="w-5 h-5 text-[#8B1F1F]" />
              <h2 className="text-xl font-bold text-gray-800">Dashboard Layout</h2>
            </div>
            <p className="text-gray-600 mb-6 text-sm">Choose which sections to display on your dashboard home page.</p>

            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div>
                  <p className="font-medium text-gray-800">Prescriptions</p>
                  <p className="text-sm text-gray-600">Show active prescriptions list</p>
                </div>
                <Switch
                  checked={preferences.patient_pref_prescriptions}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, patient_pref_prescriptions: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div>
                  <p className="font-medium text-gray-800">Recent Communications</p>
                  <p className="text-sm text-gray-600">Show messages and requests history</p>
                </div>
                <Switch
                  checked={preferences.patient_pref_communications}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, patient_pref_communications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div>
                  <p className="font-medium text-gray-800">Quick Actions</p>
                  <p className="text-sm text-gray-600">Show quick access buttons</p>
                </div>
                <Switch
                  checked={preferences.patient_pref_quick_actions}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, patient_pref_quick_actions: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div>
                  <p className="font-medium text-gray-800">Recent Orders</p>
                  <p className="text-sm text-gray-600">Show recent medication orders</p>
                </div>
                <Switch
                  checked={preferences.patient_pref_orders}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, patient_pref_orders: checked })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Navigation Customization */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sliders className="w-5 h-5 text-[#8B1F1F]" />
              <h2 className="text-xl font-bold text-gray-800">Navigation Menu</h2>
            </div>
            <p className="text-gray-600 mb-6 text-sm">Choose which items appear in your top navigation menu.</p>

            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div>
                  <p className="font-medium text-gray-800">Prescriptions</p>
                  <p className="text-sm text-gray-600">Show "Prescriptions" link in header</p>
                </div>
                <Switch
                  checked={preferences.patient_pref_prescriptions_nav}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, patient_pref_prescriptions_nav: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div>
                  <p className="font-medium text-gray-800">Communication</p>
                  <p className="text-sm text-gray-600">Show "Communication" link in header</p>
                </div>
                <Switch
                  checked={preferences.patient_pref_messages_nav}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, patient_pref_messages_nav: checked })
                  }
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleSave}
              disabled={updatePreferencesMutation.isPending}
              className="bg-[#8B1F1F] hover:bg-[#721919] text-white min-w-[150px]"
            >
              {updatePreferencesMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}