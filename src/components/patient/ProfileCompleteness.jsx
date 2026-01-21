import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

export function checkProfileCompleteness(user) {
  const checks = [
    { field: 'full_name', label: 'Full Name', value: user?.full_name },
    { field: 'phone', label: 'Phone Number', value: user?.phone },
    { field: 'date_of_birth', label: 'Date of Birth', value: user?.date_of_birth },
    { field: 'addresses', label: 'Delivery Address', value: user?.addresses?.length > 0 && user?.addresses[0]?.address },
    { field: 'allergies', label: 'Known Allergies', value: user?.allergies },
    { field: 'current_medications', label: 'Current Medications', value: user?.current_medications },
    { field: 'known_conditions', label: 'Medical Conditions', value: user?.known_conditions },
    { field: 'emergency_contact_name', label: 'Emergency Contact Name', value: user?.emergency_contact_name },
    { field: 'emergency_contact_phone', label: 'Emergency Contact Phone', value: user?.emergency_contact_phone },
  ];

  const completed = checks.filter(check => check.value && check.value.toString().trim() !== '');
  const missing = checks.filter(check => !check.value || check.value.toString().trim() === '');
  const percentage = Math.round((completed.length / checks.length) * 100);

  return { completed, missing, percentage, isComplete: missing.length === 0 };
}

export default function ProfileCompleteness({ user }) {
  const { missing, percentage, isComplete } = checkProfileCompleteness(user);

  if (isComplete) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Your profile is complete! All required information has been provided.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="bg-yellow-50 border-yellow-200">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Profile Completion: {percentage}%</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
          <div>
            <p className="font-semibold mb-1">Missing Information:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {missing.map(item => (
                <li key={item.field}>{item.label}</li>
              ))}
            </ul>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}