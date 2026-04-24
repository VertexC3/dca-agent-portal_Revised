import React, { useState } from 'react';
import ShipmentVisibilityCard from './shipment/ShipmentVisibilityCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  X, Package, Truck, CheckCircle2, Clock, FileText,
  CreditCard, MapPin, Phone, Mail, Send, Bot, AlertTriangle,
  ClipboardList, Pill, ShieldCheck, RefreshCw, Share2, Plus
} from 'lucide-react';
import { format } from 'date-fns';

function ShareTrackingModal({ tracking, patient, onClose }) {
  const [mode, setMode] = useState(null); // 'email' | 'text'
  const [extraEmail, setExtraEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    setSent(true);
    setTimeout(() => { setSent(false); onClose(); }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-[#8B1F1F] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Share2 className="w-4 h-4" />
            <span className="font-bold text-sm">Share Tracking Number</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-4 text-center">
            <p className="text-xs text-gray-500 mb-0.5">Tracking Number</p>
            <p className="font-mono font-bold text-gray-900 text-sm">{tracking}</p>
          </div>

          {!mode && (
            <div className="flex gap-3">
              <button
                onClick={() => setMode('email')}
                className="flex-1 flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all group"
              >
                <Mail className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-gray-700">Email</span>
              </button>
              <button
                onClick={() => setMode('text')}
                className="flex-1 flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all group"
              >
                <Send className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-gray-700">Text (SMS)</span>
              </button>
            </div>
          )}

          {mode === 'email' && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Send via Email</p>
              <div className="flex items-center gap-2 p-2.5 bg-purple-50 border border-purple-200 rounded-lg">
                <Mail className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Patient email</p>
                  <p className="text-xs font-semibold text-gray-800 truncate">{patient?.email}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="Add another email..."
                  value={extraEmail}
                  onChange={e => setExtraEmail(e.target.value)}
                  className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-purple-400"
                />
                <button className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <Plus className="w-3.5 h-3.5 text-gray-600" />
                </button>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => setMode(null)}>Back</Button>
                <Button size="sm" className={`flex-1 h-8 text-xs ${sent ? 'bg-green-600 hover:bg-green-600' : 'bg-purple-600 hover:bg-purple-700'}`} onClick={handleSend}>
                  {sent ? <><CheckCircle2 className="w-3 h-3 mr-1" />Sent!</> : <><Mail className="w-3 h-3 mr-1" />Send Email</>}
                </Button>
              </div>
            </div>
          )}

          {mode === 'text' && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Send via SMS</p>
              <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
                <Phone className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Patient phone</p>
                  <p className="text-xs font-semibold text-gray-800">{patient?.phone}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => setMode(null)}>Back</Button>
                <Button size="sm" className={`flex-1 h-8 text-xs ${sent ? 'bg-green-600 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'}`} onClick={handleSend}>
                  {sent ? <><CheckCircle2 className="w-3 h-3 mr-1" />Sent!</> : <><Send className="w-3 h-3 mr-1" />Send SMS</>}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Generate a lifecycle timeline based on order data
function buildTimeline(order) {
  const timelines = {
    'Delivered': [
      { key: 'rx_received',     icon: FileText,      color: 'bg-blue-500',   label: 'Rx Received',           desc: 'Prescription received from prescriber',                   time: order.date,              timeLabel: format(new Date(order.date), 'MMM d, yyyy h:mm a') },
      { key: 'rx_verified',     icon: ShieldCheck,   color: 'bg-blue-600',   label: 'Rx Verified',           desc: 'Prescription verified by pharmacist — no interactions found', time: null,                 timeLabel: format(new Date(new Date(order.date).getTime() + 2*3600*1000), 'MMM d, yyyy h:mm a') },
      { key: 'rx_compounded',   icon: Pill,          color: 'bg-indigo-500', label: 'Rx Compounded',         desc: 'Medication compounded and quality checked',               time: null,                    timeLabel: format(new Date(new Date(order.date).getTime() + 5*3600*1000), 'MMM d, yyyy h:mm a') },
      { key: 'payment',         icon: CreditCard,    color: 'bg-purple-500', label: 'Payment Processed',     desc: `$${order.amount.toFixed(2)} charged — Receipt #${order.receipt}`, time: null,            timeLabel: format(new Date(new Date(order.date).getTime() + 6*3600*1000), 'MMM d, yyyy h:mm a') },
      { key: 'packaged',        icon: Package,       color: 'bg-orange-500', label: 'Packaged & Labeled',    desc: 'Order packaged with cold chain materials and labeled for shipping', time: null,             timeLabel: format(new Date(new Date(order.date).getTime() + 8*3600*1000), 'MMM d, yyyy h:mm a') },
      { key: 'shipped',         icon: Truck,         color: 'bg-yellow-600', label: 'Shipped',               desc: `Picked up by carrier — Tracking: ${order.tracking}`,      time: null,                   timeLabel: format(new Date(new Date(order.date).getTime() + 24*3600*1000), 'MMM d, yyyy h:mm a') },
      { key: 'in_transit',      icon: Truck,         color: 'bg-yellow-500', label: 'In Transit',            desc: 'Package in transit to destination',                       time: null,                    timeLabel: format(new Date(new Date(order.date).getTime() + 36*3600*1000), 'MMM d, yyyy h:mm a') },
      { key: 'delivered',       icon: CheckCircle2,  color: 'bg-green-500',  label: 'Delivered',             desc: `Delivered to ${order.delivered_to}`,                      time: null,                    timeLabel: order.delivered_at },
    ],
    'In Progress': [
      { key: 'rx_received',     icon: FileText,      color: 'bg-blue-500',   label: 'Rx Received',           desc: 'Prescription received from prescriber',                   time: null,                    timeLabel: format(new Date(order.date), 'MMM d, yyyy h:mm a') },
      { key: 'rx_verified',     icon: ShieldCheck,   color: 'bg-blue-600',   label: 'Rx Verified',           desc: 'Prescription verified by pharmacist',                     time: null,                    timeLabel: format(new Date(new Date(order.date).getTime() + 2*3600*1000), 'MMM d, yyyy h:mm a') },
      { key: 'rx_compounded',   icon: Pill,          color: 'bg-indigo-500', label: 'Rx Compounded',         desc: 'Medication currently being compounded',                   time: null,                    timeLabel: format(new Date(new Date(order.date).getTime() + 4*3600*1000), 'MMM d, yyyy h:mm a') },
      { key: 'payment',         icon: CreditCard,    color: 'bg-purple-500', label: 'Payment Processed',     desc: `$${order.amount.toFixed(2)} charged — Receipt #${order.receipt}`, time: null,            timeLabel: format(new Date(new Date(order.date).getTime() + 5*3600*1000), 'MMM d, yyyy h:mm a') },
      { key: 'packaged',        icon: Package,       color: 'bg-orange-400', label: 'Packaging',             desc: 'Preparing for shipment',                                  isPending: true,               timeLabel: 'In progress...' },
      { key: 'shipped',         icon: Truck,         color: 'bg-gray-300',   label: 'Shipping',              desc: 'Not yet shipped',                                         isPending: true,               timeLabel: `Est. ${order.est_delivery ? format(new Date(order.est_delivery), 'MMM d') : 'TBD'}` },
      { key: 'delivered',       icon: CheckCircle2,  color: 'bg-gray-300',   label: 'Delivery',              desc: order.delivery_window ? `Window: ${order.delivery_window}` : 'Pending', isPending: true,  timeLabel: order.est_delivery ? `Est. ${format(new Date(order.est_delivery), 'MMM d')} • ${order.delivery_window || ''}` : 'TBD' },
    ],
    'Processing': [
      { key: 'rx_received',     icon: FileText,      color: 'bg-blue-500',   label: 'Rx Received',           desc: 'Prescription received from prescriber',                   time: null,                    timeLabel: format(new Date(order.date), 'MMM d, yyyy h:mm a') },
      { key: 'rx_verified',     icon: ShieldCheck,   color: 'bg-blue-400',   label: 'Rx Verification',       desc: 'Currently being verified by pharmacist',                  isPending: true,               timeLabel: 'In progress...' },
      { key: 'rx_compounded',   icon: Pill,          color: 'bg-gray-300',   label: 'Compounding',           desc: 'Pending verification',                                    isPending: true,               timeLabel: 'Pending' },
      { key: 'payment',         icon: CreditCard,    color: 'bg-gray-300',   label: 'Payment',               desc: 'Will be charged upon processing',                         isPending: true,               timeLabel: 'Pending' },
      { key: 'packaged',        icon: Package,       color: 'bg-gray-300',   label: 'Packaging',             desc: 'Pending',                                                 isPending: true,               timeLabel: 'Pending' },
      { key: 'shipped',         icon: Truck,         color: 'bg-gray-300',   label: 'Shipping',              desc: 'Pending',                                                 isPending: true,               timeLabel: 'Pending' },
      { key: 'delivered',       icon: CheckCircle2,  color: 'bg-gray-300',   label: 'Delivery',              desc: 'Pending',                                                 isPending: true,               timeLabel: 'Pending' },
    ],
    'In Transit': [
      { key: 'rx_received',     icon: FileText,      color: 'bg-blue-500',   label: 'Rx Received',           desc: 'Prescription received from prescriber',                   time: null,                    timeLabel: format(new Date(order.date), 'MMM d, yyyy h:mm a') },
      { key: 'rx_verified',     icon: ShieldCheck,   color: 'bg-blue-600',   label: 'Rx Verified',           desc: 'Prescription verified by pharmacist',                     time: null,                    timeLabel: format(new Date(new Date(order.date).getTime() + 2*3600*1000), 'MMM d, yyyy h:mm a') },
      { key: 'rx_compounded',   icon: Pill,          color: 'bg-indigo-500', label: 'Rx Compounded',         desc: 'Medication compounded and quality checked',               time: null,                    timeLabel: format(new Date(new Date(order.date).getTime() + 5*3600*1000), 'MMM d, yyyy h:mm a') },
      { key: 'payment',         icon: CreditCard,    color: 'bg-purple-500', label: 'Payment Processed',     desc: `$${order.amount.toFixed(2)} charged — Receipt #${order.receipt}`, time: null,            timeLabel: format(new Date(new Date(order.date).getTime() + 6*3600*1000), 'MMM d, yyyy h:mm a') },
      { key: 'packaged',        icon: Package,       color: 'bg-orange-500', label: 'Packaged & Labeled',    desc: 'Order packaged and handed to carrier',                    time: null,                    timeLabel: format(new Date(new Date(order.date).getTime() + 8*3600*1000), 'MMM d, yyyy h:mm a') },
      { key: 'in_transit',      icon: Truck,         color: 'bg-yellow-500', label: 'In Transit',            desc: `Tracking: ${order.tracking}`,                             isActive: true,                timeLabel: 'Currently in transit' },
      { key: 'delivered',       icon: CheckCircle2,  color: 'bg-gray-300',   label: 'Delivery',              desc: 'Pending delivery',                                        isPending: true,               timeLabel: 'Pending' },
    ],
  };
  return timelines[order.status] || timelines['Processing'];
}

const CHANNEL_CONFIG = {
  phone:    { label: 'Call',     color: 'text-blue-700 bg-blue-50 border-blue-100',     icon: Phone },
  email:    { label: 'Email',    color: 'text-purple-700 bg-purple-50 border-purple-100', icon: Mail },
  text:     { label: 'Text',     color: 'text-green-700 bg-green-50 border-green-100',   icon: Send },
  ai_agent: { label: 'AI Agent', color: 'text-orange-700 bg-orange-50 border-orange-100', icon: Bot },
};

export default function OrderDetailModal({ order, patient, onClose }) {
  const [showShareTracking, setShowShareTracking] = useState(false);
  if (!order) return null;

  const timeline = buildTimeline(order);
  const orderComms = patient.communications.filter(c => c.order_id === order.id);
  const linkedRx = patient.prescriptions.find(rx =>
    rx.name.toLowerCase().includes(order.medication.split(' ')[0].toLowerCase())
  );

  return (
    <>
    {showShareTracking && (
      <ShareTrackingModal
        tracking={order.tracking}
        patient={patient}
        onClose={() => setShowShareTracking(false)}
      />
    )}
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8B1F1F] to-[#a52525] px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wide">Order Detail</p>
            <h2 className="text-white font-bold text-base mt-0.5">{order.medication}</h2>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`text-xs font-bold border ${
              order.status === 'Delivered' ? 'bg-green-100 text-green-800 border-green-200' :
              order.status === 'In Progress' || order.status === 'In Transit' ? 'bg-blue-100 text-blue-800 border-blue-200' :
              'bg-yellow-100 text-yellow-800 border-yellow-200'
            }`}>{order.status}</Badge>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Order Info Grid */}
          <div className="px-5 py-4 grid grid-cols-3 gap-4 border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Order ID</p>
              <p className="text-xs font-bold text-gray-900">{order.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Receipt #</p>
              <p className="text-xs font-bold text-[#8B1F1F]">{order.receipt}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Order Date</p>
              <p className="text-xs font-bold text-gray-900">{format(new Date(order.date), 'MMM d, yyyy')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Amount Charged</p>
              <p className="text-xs font-bold text-gray-900">${order.amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Tracking #</p>
              {order.tracking && order.tracking !== 'Pending' ? (
                <button
                  onClick={() => setShowShareTracking(true)}
                  className="flex items-center gap-1 group hover:text-[#8B1F1F] transition-colors"
                  title="Click to share tracking number"
                >
                  <span className="text-xs font-mono text-[#8B1F1F] underline underline-offset-2 decoration-dashed">{order.tracking}</span>
                  <Share2 className="w-3 h-3 text-gray-400 group-hover:text-[#8B1F1F] transition-colors opacity-0 group-hover:opacity-100" />
                </button>
              ) : (
                <p className="text-xs font-mono text-gray-400">{order.tracking || 'Pending'}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Medication</p>
              <p className="text-xs font-bold text-gray-900">{order.medication}</p>
            </div>
            {order.delivered_to && (
              <div className="col-span-3">
                <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />Delivery Address</p>
                <p className="text-xs font-semibold text-gray-900">{order.delivered_to}</p>
              </div>
            )}
            {order.delivered_at && (
              <div className="col-span-3">
                <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-600" />Delivered At</p>
                <p className="text-xs font-bold text-green-700">{order.delivered_at}</p>
              </div>
            )}
            {order.est_delivery && (
              <div className="col-span-3">
                <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1"><Clock className="w-3 h-3 text-blue-600" />Estimated Delivery</p>
                <p className="text-xs font-bold text-blue-700">
                  {format(new Date(order.est_delivery), 'MMMM d, yyyy')}
                  {order.delivery_window && <span className="font-normal text-gray-600"> • Window: {order.delivery_window}</span>}
                </p>
              </div>
            )}
          </div>

          {/* Linked Prescription */}
          {linkedRx && (
            <div className="px-5 py-3 border-b border-gray-100 bg-blue-50/40">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-[#8B1F1F]" /> Linked Prescription
              </p>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div><p className="text-gray-500">Rx #</p><p className="font-bold text-[#8B1F1F]">{linkedRx.rx_number}</p></div>
                <div><p className="text-gray-500">Medication</p><p className="font-semibold text-gray-900">{linkedRx.name}</p></div>
                <div><p className="text-gray-500">Dosage</p><p className="font-semibold text-gray-900">{linkedRx.dosage}</p></div>
                <div><p className="text-gray-500">Frequency</p><p className="font-semibold text-gray-900">{linkedRx.frequency}</p></div>
                <div><p className="text-gray-500">Refills Remaining</p>
                  <Badge className={`text-xs mt-0.5 ${linkedRx.refills === 0 ? 'bg-red-100 text-red-800' : linkedRx.refills <= 1 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {linkedRx.refills} left
                  </Badge>
                </div>
                <div><p className="text-gray-500">Prescriber</p><p className="font-semibold text-gray-900">{linkedRx.prescriber}</p></div>
              </div>
            </div>
          )}

          {/* Prescription Lifecycle Timeline */}
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-[#8B1F1F]" /> Prescription Lifecycle
            </p>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-3.5 top-3 bottom-3 w-px bg-gray-200" />
              <div className="space-y-3">
                {timeline.map((step, i) => {
                  const Icon = step.icon;
                  const isLast = i === timeline.length - 1;
                  return (
                    <div key={step.key} className="flex items-start gap-3 relative">
                      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center z-10 ${
                        step.isPending ? 'bg-gray-100 border-2 border-gray-200' :
                        step.isActive ? `${step.color} ring-2 ring-offset-1 ring-yellow-400 animate-pulse` :
                        step.color
                      }`}>
                        <Icon className={`w-3.5 h-3.5 ${step.isPending ? 'text-gray-400' : 'text-white'}`} />
                      </div>
                      <div className="flex-1 min-w-0 pb-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs font-bold ${step.isPending ? 'text-gray-400' : 'text-gray-800'}`}>{step.label}</p>
                          <p className={`text-xs flex-shrink-0 ${step.isPending ? 'text-gray-300' : step.isActive ? 'text-yellow-600 font-semibold' : 'text-gray-400'}`}>{step.timeLabel}</p>
                        </div>
                        <p className={`text-xs mt-0.5 ${step.isPending ? 'text-gray-300' : 'text-gray-500'}`}>{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Shipment Visibility */}
          <div className="px-5 py-4 border-b border-gray-100">
            <ShipmentVisibilityCard tracking={order.tracking} />
          </div>

          {/* Related Communications */}
          <div className="px-5 py-4">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#8B1F1F]" /> Related Communications
              {orderComms.length > 0 && (
                <span className="ml-1 bg-[#8B1F1F] text-white text-xs px-1.5 py-0 rounded-full">{orderComms.length}</span>
              )}
            </p>
            {orderComms.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg">
                No communications logged for this order
              </div>
            ) : (
              <div className="space-y-2">
                {orderComms.map(c => {
                  const cfg = CHANNEL_CONFIG[c.type] || CHANNEL_CONFIG.phone;
                  const Icon = cfg.icon;
                  return (
                    <div key={c.id} className={`p-3 rounded-lg border text-xs ${cfg.color}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-1 font-bold">
                          <Icon className="w-3 h-3" />{cfg.label}
                        </span>
                        <span className="text-gray-500">{format(new Date(c.date), 'MMM d, yyyy')}</span>
                      </div>
                      <p className="font-semibold text-gray-800">{c.subject}</p>
                      <p className="text-gray-600 mt-0.5">{c.summary}</p>
                      <p className="text-gray-400 mt-1">Agent: {c.agent}{c.duration ? ` • ${c.duration}` : ''}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex gap-2 flex-shrink-0">
          <Button size="sm" className="h-7 text-xs bg-[#8B1F1F] hover:bg-[#721919]">
            <Phone className="w-3 h-3 mr-1" />Log Call
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs">
            <Mail className="w-3 h-3 mr-1" />Send Email
          </Button>
          {order.tracking && order.tracking !== 'Pending' && (
            <Button size="sm" variant="outline" className="h-7 text-xs border-blue-300 text-blue-700 hover:bg-blue-50" onClick={() => setShowShareTracking(true)}>
              <Share2 className="w-3 h-3 mr-1" />Share Tracking
            </Button>
          )}
          {linkedRx && linkedRx.refills === 0 && (
            <Button size="sm" variant="outline" className="h-7 text-xs border-yellow-300 text-yellow-700 hover:bg-yellow-50">
              <RefreshCw className="w-3 h-3 mr-1" />Request Refill
            </Button>
          )}
          <button onClick={onClose} className="ml-auto text-xs text-gray-500 hover:text-gray-700 font-medium">Close</button>
        </div>
      </div>
    </div>
    </>
  );
}