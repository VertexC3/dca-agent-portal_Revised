import React, { useState } from 'react';
import { Pill, Calendar, Package, Truck, MoreVertical, RefreshCw, CreditCard, FileText, Play, History, BookOpen, StopCircle, ChevronDown, Download, Receipt } from 'lucide-react';
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
import PrescriberProfileDialog from './PrescriberProfileDialog';
import PrescriptionPaymentDialog from './PrescriptionPaymentDialog';
import { format } from 'date-fns';

const statusConfig = {
  'Ready for Pickup': { color: 'bg-green-100 text-green-800 border-green-200', icon: Package },
  'Shipped': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Truck },
  'In Delivery': { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck },
  'Discontinued': { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: StopCircle }
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
  const [showPrescriberProfile, setShowPrescriberProfile] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

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
            <div className="flex items-center gap-2">
              <Badge className={`${statusConfig[prescription.status]?.color} border`}>
                {prescription.status}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 text-xs h-8">
                    Actions
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {prescription.category === 'Active' && (
                    <DropdownMenuItem onClick={() => setShowRefillRequest(true)}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Request Refill
                    </DropdownMenuItem>
                  )}
                  {prescription.category === 'Inactive' && (
                    <DropdownMenuItem onClick={() => setShowRenewal(true)}>
                      <FileText className="w-4 h-4 mr-2" />
                      Request Renewal
                    </DropdownMenuItem>
                  )}
                  {prescription.category === 'Active' && (
                    <DropdownMenuItem onClick={() => setShowPayment(true)}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Payment
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setShowOrders(true)}>
                    <Package className="w-4 h-4 mr-2" />
                    Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowHistory(true)}>
                    <History className="w-4 h-4 mr-2" />
                    Fill History
                  </DropdownMenuItem>
                  {prescription.category === 'Active' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setShowStopConfirm(true)} className="text-red-600">
                        <StopCircle className="w-4 h-4 mr-2" />
                        Stop Prescription
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2 text-sm">
              <p className="text-gray-600">
                <strong>Prescriber:</strong> 
                <button 
                  onClick={() => setShowPrescriberProfile(true)}
                  className="ml-1 text-[#8B1F1F] hover:underline font-medium"
                >
                  {prescription.prescriber}
                </button>
              </p>
              <p className="text-gray-600">
                <strong>Dosage:</strong> {prescription.dosage}
              </p>
              <p className="text-gray-600">
                <strong>Date Written:</strong> {prescription.dateWritten ? format(new Date(prescription.dateWritten), 'MMM d, yyyy') : 'N/A'}
              </p>
              <p className="text-gray-600">
                <strong>Last Filled:</strong> {format(new Date(prescription.lastFilled), 'MMM d, yyyy')}
              </p>
              <p className="text-gray-600">
                <strong>Date Expires:</strong> {prescription.dateExpires ? format(new Date(prescription.dateExpires), 'MMM d, yyyy') : 'N/A'}
              </p>
              <p className="text-gray-600">
                <strong>Refills Remaining:</strong> {prescription.refills}
              </p>
              {prescription.tracking && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 mt-3">
                  <p className="text-gray-800 font-semibold">Tracking Information</p>
                  <p className="text-sm text-gray-600">Carrier: FedEx</p>
                  <p className="text-sm text-gray-600">Tracking #: {prescription.tracking}</p>
                  <p className="text-xs text-gray-500 mt-1">Expected delivery: {prescription.expectedDelivery}</p>
                </div>
              )}
            </div>
            {prescription.image && (
              <div className="flex flex-col gap-2 w-24">
                <div className="w-24 h-24">
                  <img 
                    src={prescription.image} 
                    alt={prescription.name} 
                    className="w-full h-full object-cover rounded-lg border border-gray-200"
                  />
                </div>
                <div className="flex gap-1">
                   <Button size="sm" variant="outline" className="h-6 text-[10px] px-1 w-full" onClick={() => setShowVideo(true)}>Video</Button>
                   <Button size="sm" variant="outline" className="h-6 text-[10px] px-1 w-full" onClick={() => setShowMedicalGuide(true)}>Guide</Button>
                </div>
              </div>
            )}
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
      <PrescriptionPaymentDialog
        open={showPayment}
        onClose={() => setShowPayment(false)}
        prescription={prescription}
      />

      {/* Orders Dialog */}
      {showOrders && (
        <Dialog open={showOrders} onOpenChange={() => setShowOrders(false)}>
          <DialogContent className="max-w-3xl bg-white">
            <DialogHeader>
              <DialogTitle>Orders for {prescription.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Order #</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Date</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-700">Amount</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      { id: 'ORD-2024-001', date: '2025-11-15', status: 'Completed', amount: 15.00 },
                      { id: 'ORD-2024-089', date: '2025-10-15', status: 'Completed', amount: 15.00 },
                      { id: 'ORD-2024-156', date: '2025-09-15', status: 'Completed', amount: 15.00 },
                    ].map((order, idx) => (
                      <tr key={idx} className="bg-white">
                        <td className="px-4 py-3 font-medium text-gray-900">{order.id}</td>
                        <td className="px-4 py-3 text-gray-600">{order.date}</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-green-100 text-green-800 border-green-200 shadow-none font-normal">
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">${order.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0" 
                              title="View Receipt"
                              onClick={() => setSelectedReceipt(order)}
                            >
                              <Receipt className="w-4 h-4 text-[#8B1F1F]" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0" 
                              title="Download Receipt"
                              onClick={() => {
                                alert('Downloading receipt for ' + order.id);
                              }}
                            >
                              <Download className="w-4 h-4 text-[#8B1F1F]" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setShowOrders(false)} className="bg-[#8B1F1F] hover:bg-[#721919]">
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Receipt Dialog */}
      {selectedReceipt && (
        <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#8B1F1F]" />
                Receipt - {selectedReceipt.id}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm">Receipt Image Preview</p>
                <div className="mt-2 h-32 bg-gray-200 rounded flex items-center justify-center">
                  <Receipt className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{selectedReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">${selectedReceipt.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-medium">{selectedReceipt.status}</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setSelectedReceipt(null)}>
                  Close
                </Button>
                <Button className="bg-[#8B1F1F] hover:bg-[#721919] text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Prescriber Profile Dialog */}
      <PrescriberProfileDialog
        open={showPrescriberProfile}
        onClose={() => setShowPrescriberProfile(false)}
        prescriberName={prescription.prescriber}
      />
    </>
  );
}