import React, { useState } from 'react';
import { Pill, Calendar, Package, Truck, MoreVertical, RefreshCw, CreditCard, FileText, Play, History, BookOpen, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VideoExplainerDialog from './VideoExplainerDialog';
import FillHistoryDialog from './FillHistoryDialog';
import MedicalGuideDialog from './MedicalGuideDialog';
import RefillRequestDialog from './RefillRequestDialog';
import { format } from 'date-fns';

const statusConfig = {
  'Ready for Pickup': { color: 'bg-green-100 text-green-800 border-green-200', icon: Package },
  'Shipped': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Truck },
  'In Delivery': { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck }
};

export default function PrescriptionCard({ prescription }) {
  const [showVideo, setShowVideo] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showMedicalGuide, setShowMedicalGuide] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [showRefillRequest, setShowRefillRequest] = useState(false);
  const [showRenewal, setShowRenewal] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showOrders, setShowOrders] = useState(false);

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

          <div className="space-y-2">
            <Button
              onClick={() => setShowRefillRequest(true)}
              className="w-full bg-[#8B1F1F] hover:bg-[#721919] text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Request Refill
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVideo(true)}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-1" />
                Video Guide
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStopConfirm(true)}
                className="flex-1 text-red-600 hover:text-red-700 border-red-200"
              >
                <StopCircle className="w-4 h-4 mr-1" />
                Stop Prescription
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMedicalGuide(true)}
                className="flex-1"
              >
                <BookOpen className="w-4 h-4 mr-1" />
                Medical Guide
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
          </div>

          {showStopConfirm && (
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

      <MedicalGuideDialog
        open={showMedicalGuide}
        onClose={() => setShowMedicalGuide(false)}
        prescription={prescription}
      />

      <RefillRequestDialog
        open={showRefillRequest}
        onClose={() => setShowRefillRequest(false)}
        prescription={prescription}
      />

      {/* Renewal Dialog */}
      {showRenewal && (
        <Dialog open={showRenewal} onOpenChange={() => setShowRenewal(false)}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>Request Renewal</DialogTitle>
            </DialogHeader>
            <p className="text-gray-600">Renewal request for {prescription.name} will be sent to your prescriber.</p>
            <Button onClick={() => { alert('Renewal request submitted!'); setShowRenewal(false); }} className="bg-[#8B1F1F] hover:bg-[#721919]">
              Submit Request
            </Button>
          </DialogContent>
        </Dialog>
      )}

      {/* Payment Dialog */}
      {showPayment && (
        <Dialog open={showPayment} onOpenChange={() => setShowPayment(false)}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>Payment for {prescription.name}</DialogTitle>
            </DialogHeader>
            <p className="text-gray-600">Payment options will be available here.</p>
            <Button onClick={() => setShowPayment(false)} className="bg-[#8B1F1F] hover:bg-[#721919]">
              Close
            </Button>
          </DialogContent>
        </Dialog>
      )}

      {/* Orders Dialog */}
      {showOrders && (
        <Dialog open={showOrders} onOpenChange={() => setShowOrders(false)}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle>Orders for {prescription.name}</DialogTitle>
            </DialogHeader>
            <p className="text-gray-600">Order history for this prescription will be displayed here.</p>
            <Button onClick={() => setShowOrders(false)} className="bg-[#8B1F1F] hover:bg-[#721919]">
              Close
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}