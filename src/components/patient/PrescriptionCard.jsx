import React, { useState } from 'react';
import { Pill, Play, History, StopCircle, Calendar, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VideoExplainerDialog from './VideoExplainerDialog';
import FillHistoryDialog from './FillHistoryDialog';
import { format } from 'date-fns';

const statusConfig = {
  'Ready for Pickup': { color: 'bg-green-100 text-green-800 border-green-200', icon: Package },
  'Shipped': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Truck },
  'In Delivery': { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck }
};

export default function PrescriptionCard({ prescription }) {
  const [showVideo, setShowVideo] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);

  const StatusIcon = statusConfig[prescription.status]?.icon || Package;

  return (
    <>
      <Card className="hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-[#8B1F1F]" />
              <span className="text-lg">{prescription.name}</span>
            </div>
            <Badge className={`${statusConfig[prescription.status]?.color} border`}>
              {prescription.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">
              <strong>Prescriber:</strong> {prescription.prescriber}
            </p>
            <p className="text-gray-600">
              <strong>Dosage:</strong> {prescription.dosage}
            </p>
            <p className="text-gray-600">
              <strong>Refills Remaining:</strong> {prescription.refills}
            </p>
            <p className="text-gray-600">
              <strong>Last Filled:</strong> {format(new Date(prescription.lastFilled), 'MMM d, yyyy')}
            </p>
            {prescription.tracking && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-gray-800 font-semibold">Tracking Information</p>
                <p className="text-sm text-gray-600">Carrier: FedEx</p>
                <p className="text-sm text-gray-600">Tracking #: {prescription.tracking}</p>
                <p className="text-xs text-gray-500 mt-1">Expected delivery: {prescription.expectedDelivery}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVideo(true)}
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-1" />
              Video Explainer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(true)}
              className="flex-1"
            >
              <History className="w-4 h-4 mr-1" />
              Fill History
            </Button>
          </div>

          {!showStopConfirm ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStopConfirm(true)}
              className="w-full text-red-600 hover:text-red-700 border-red-200"
            >
              <StopCircle className="w-4 h-4 mr-1" />
              Stop Prescription
            </Button>
          ) : (
            <div className="space-y-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-gray-700 font-semibold">Are you sure you want to stop this prescription?</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowStopConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    alert('Prescription stop request submitted. Your pharmacist will contact you.');
                    setShowStopConfirm(false);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Confirm Stop
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <VideoExplainerDialog
        open={showVideo}
        onClose={() => setShowVideo(false)}
        prescription={prescription}
      />

      <FillHistoryDialog
        open={showHistory}
        onClose={() => setShowHistory(false)}
        prescription={prescription}
      />
    </>
  );
}