import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, ShieldCheck, Layout } from 'lucide-react';

const DEFAULT_FLAGS = [
  { key: 'patient_quick_actions', label: 'Quick Actions', description: 'Enable the quick actions panel on the dashboard' },
  { key: 'patient_prescriptions', label: 'Active Prescriptions', description: 'Show active prescriptions list' },
  { key: 'patient_communications', label: 'Recent Communications', description: 'Show recent messages and communications' },
  { key: 'patient_stats', label: 'Dashboard Statistics', description: 'Show the top statistics cards (Prescriptions, Messages, etc.)' },
  { key: 'patient_survey', label: 'Satisfaction Survey', description: 'Enable the satisfaction survey alert' },
  { key: 'patient_nav_prescriptions', label: 'Prescriptions Page', description: 'Show Prescriptions in the navigation menu' },
  { key: 'patient_nav_messages', label: 'Messages Page', description: 'Show Communications in the navigation menu' },
];

export default function PatientPortalSettings() {
  const queryClient = useQueryClient();

  const { data: flags = [], isLoading } = useQuery({
    queryKey: ['featureFlags'],
    queryFn: () => base44.entities.FeatureFlag.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FeatureFlag.create(data),
    onSuccess: () => queryClient.invalidateQueries(['featureFlags']),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FeatureFlag.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['featureFlags']),
  });

  const handleToggle = async (key, currentValue, flagRecord) => {
    if (flagRecord) {
      updateMutation.mutate({ id: flagRecord.id, data: { is_enabled: !currentValue } });
    } else {
      // Create if doesn't exist
      const defaultDef = DEFAULT_FLAGS.find(d => d.key === key);
      if (defaultDef) {
        createMutation.mutate({ ...defaultDef, is_enabled: !currentValue });
      }
    }
  };

  const initializeDefaults = () => {
    DEFAULT_FLAGS.forEach(def => {
      const exists = flags.find(f => f.key === def.key);
      if (!exists) {
        createMutation.mutate(def);
      }
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Patient Portal Features</h3>
          <p className="text-sm text-gray-500">Manage visibility of features in the patient portal.</p>
        </div>
        <Button variant="outline" size="sm" onClick={initializeDefaults}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset / Initialize
        </Button>
      </div>

      <div className="grid gap-4">
        {DEFAULT_FLAGS.map((def) => {
          const flag = flags.find(f => f.key === def.key);
          const isEnabled = flag ? flag.is_enabled : true; // Default to true if not set

          return (
            <Card key={def.key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-base font-medium">
                    {def.label}
                  </CardTitle>
                  <CardDescription>
                    {def.description}
                  </CardDescription>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={() => handleToggle(def.key, isEnabled, flag)}
                />
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}