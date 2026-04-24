import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  LayoutDashboard, Pill, ShoppingCart, MessageSquare, CreditCard,
  RefreshCw, Phone, Mail, Send, AlertTriangle, Bot, ExternalLink, Clock, IdCard, ChevronRight, CheckCircle2,
  Pencil, Check, X, StickyNote, Truck, GripVertical, Plus
} from 'lucide-react';
import DraggablePanelGrid from './DraggablePanelGrid';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import OrderDetailModal from './OrderDetailModal';
import PhysicianContextPopup from './PhysicianContextPopup';
import InvoicePaymentModal from './InvoicePaymentModal';
import FamilyMemberBar from './FamilyMemberBar';
import PhysicianPickerModal from './PhysicianPickerModal';
import AgentEngagementLog from './AgentEngagementLog';
import KBSuggestions from './KBSuggestions';
import QuickActionMacros from './QuickActionMacros';
import CommunicationDetailModal from './CommunicationDetailModal';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'prescriptions', label: 'Rx', icon: Pill },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'communications', label: 'Communications', icon: MessageSquare },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

function AddressField({ address, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(address);

  const handleSaveEdit = () => {
    onChange(draft);
    setEditing(false);
  };

  const handleCancelEdit = () => { 
    setDraft(address); 
    setEditing(false); 
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1 mt-0.5">
        <Input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          className="h-6 text-xs px-1.5 py-0 border-[#8B1F1F]/50 focus:border-[#8B1F1F]"
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') handleCancelEdit(); }}
        />
        <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-700 flex-shrink-0"><Check className="w-3.5 h-3.5" /></button>
        <button onClick={handleCancelEdit} className="text-gray-400 hover:text-red-500 flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center gap-1 font-semibold text-gray-800 text-xs hover:text-[#8B1F1F] transition-colors group text-left"
    >
      <span className="truncate max-w-[220px]">{address}</span>
      <Pencil className="w-2.5 h-2.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </button>
  );
}

function InsuranceCardPopover() {
  const [show, setShow] = useState(false);
  return (
    <>
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="p-0.5 rounded hover:bg-gray-200 transition-colors"
        title="View insurance card"
      >
        <IdCard className="w-3.5 h-3.5 text-[#8B1F1F]" />
      </button>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 w-[520px]">
            <img
              src="https://media.base44.com/images/public/695285fc94e8ef46bde70e16/50e86ad64_InsuranceCard.png"
              alt="Insurance Card"
              className="w-full rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}

function InlineEdit({ value, onSave, className = '' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleSave = () => { onSave(draft); setEditing(false); };
  const handleCancel = () => { setDraft(value); setEditing(false); };

  if (editing) {
    return (
      <div className="flex items-center gap-1 mt-0.5">
        <Input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          className="h-6 text-xs px-1.5 py-0 border-[#8B1F1F]/50 focus:border-[#8B1F1F]"
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
        />
        <button onClick={handleSave} className="text-green-600 hover:text-green-700 flex-shrink-0"><Check className="w-3.5 h-3.5" /></button>
        <button onClick={handleCancel} className="text-gray-400 hover:text-red-500 flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
      </div>
    );
  }

  return (
    <button
      onClick={() => { setDraft(value); setEditing(true); }}
      className={`flex items-center gap-1 group text-left ${className}`}
    >
      <span>{value}</span>
      <Pencil className="w-2.5 h-2.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </button>
  );
}

export default function AgentWorkspaceTabs({ patient, onSwitchPatient, onStartWorkflow }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');
  const [editedAllergies, setEditedAllergies] = useState(patient?.allergies || '');
  const [editedAddress, setEditedAddress] = useState(patient?.address || '');
  const [editedPhysician, setEditedPhysician] = useState(patient ? { name: patient.physician, npi: patient.physician_npi, phone: patient.physician_phone } : null);
  const [showPhysicianPicker, setShowPhysicianPicker] = useState(false);

  React.useEffect(() => {
    setEditedAllergies(patient?.allergies || '');
    setEditedAddress(patient?.address || '');
    setEditedPhysician(patient ? { name: patient.physician, npi: patient.physician_npi, phone: patient.physician_phone } : null);
  }, [patient?.id]);

  if (!patient) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="text-center text-gray-400 p-8">
          <LayoutDashboard className="w-14 h-14 mx-auto mb-3 opacity-20" />
          <p className="font-semibold text-gray-500">No patient selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm min-w-0">
      {showPhysicianPicker && (
        <PhysicianPickerModal
          currentPhysician={editedPhysician?.name || patient.physician}
          onSelect={(p) => { setEditedPhysician(p); setShowPhysicianPicker(false); }}
          onClose={() => setShowPhysicianPicker(false)}
        />
      )}
      {/* Patient Profile Card */}
      <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex items-start gap-4">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            {patient.profile_picture ? (
              <img 
                src={patient.profile_picture} 
                alt={patient.name}
                className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-[#8B1F1F] flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-sm">
                {patient.name?.charAt(0) || 'P'}
              </div>
            )}
          </div>
          
          {/* Patient Info Grid */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900">{patient.name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">ID: {patient.id}</p>
            
            <div className="grid grid-cols-3 gap-3 mt-2 text-xs">
               <div>
                 <p className="text-gray-500">DOB</p>
                 <p className="font-semibold text-gray-800">{format(new Date(patient.dob), 'MM/dd/yyyy')}</p>
               </div>
               <div>
                 <p className="text-gray-500">Phone</p>
                 <p className="font-semibold text-gray-800">{patient.phone}</p>
               </div>
               <div>
                 <p className="text-gray-500">Email</p>
                 <p className="font-semibold text-gray-800 truncate">{patient.email}</p>
               </div>
             </div>

             <div className="mt-2 text-xs">
               <p className="text-gray-500">Shipping</p>
               <AddressField address={editedAddress} onChange={setEditedAddress} />
             </div>

            <div className="grid grid-cols-3 gap-3 mt-2 text-xs border-t border-gray-200 pt-2">
              <div>
                <p className="text-gray-500">Physician</p>
                <button
                  onClick={() => setShowPhysicianPicker(true)}
                  className="flex items-center gap-1 group text-left font-semibold text-gray-800 hover:text-[#8B1F1F] transition-colors"
                >
                  <span>{editedPhysician?.name || patient.physician}</span>
                  <Pencil className="w-2.5 h-2.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </button>
              </div>
              <div>
                <p className="text-gray-500">Insurance</p>
                <div className="flex items-center gap-1">
                  <p className="font-semibold text-gray-800">{patient.insurance}</p>
                  <InsuranceCardPopover />
                </div>
              </div>
              <div>
                <p className="text-gray-500">Allergies</p>
                <InlineEdit
                  value={editedAllergies}
                  onSave={setEditedAllergies}
                  className="font-semibold text-red-700 text-xs hover:text-red-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <FamilyMemberBar
        familyMembers={patient.family_members}
        onSwitchPatient={onSwitchPatient}
      />

      {/* Tab Bar */}
      <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const count = tab.id === 'prescriptions' ? patient.prescriptions.length
            : tab.id === 'orders' ? patient.orders.length
            : tab.id === 'communications' ? patient.communications.length
            : null;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#8B1F1F] text-[#8B1F1F] bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {count !== null && (
                <span className={`ml-1 rounded-full text-xs px-1.5 py-0 ${
                  activeTab === tab.id ? 'bg-[#8B1F1F] text-white' : 'bg-gray-200 text-gray-600'
                }`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && <OverviewTab patient={patient} editedPhysician={editedPhysician} onChangePhysician={() => setShowPhysicianPicker(true)} onSwitchTab={setActiveTab} />}
        {activeTab === 'prescriptions' && <PrescriptionsTab patient={patient} />}
        {activeTab === 'orders' && <OrdersTab patient={patient} />}
        {activeTab === 'communications' && <CommunicationsTab patient={patient} newNote={newNote} setNewNote={setNewNote} />}
        {activeTab === 'billing' && <BillingTab patient={patient} />}
      </div>
    </div>
  );
}

function StatCardModal({ stat, patient, onClose, onGoToOrders }) {
  const unpaid = patient.invoices.filter(i => i.status !== 'paid');
  const lowRefills = patient.prescriptions.filter(p => p.refills <= 1);
  const [selectedRx, setSelectedRx] = React.useState([]);

  const addToCart = (rx) => {
    setSelectedRx(prev => prev.includes(rx.id) ? prev.filter(id => id !== rx.id) : [...prev, rx.id]);
  };

  const handleGoToCart = () => {
    onGoToOrders?.();
    onClose?.();
  };

  const renderContent = () => {
    if (stat === 'rx') return (
      <div className="space-y-2">
        {patient.prescriptions.map(rx => {
          const isSelected = selectedRx.includes(rx.id);
          return (
            <div key={rx.id} className={`p-3 border rounded-lg text-xs transition-all ${isSelected ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => addToCart(rx)}
                  className="mt-1 cursor-pointer accent-[#8B1F1F]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-900">{rx.name}</span>
                    <Badge className={rx.refills === 0 ? 'bg-red-100 text-red-800' : rx.refills <= 1 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                      {rx.refills} refill{rx.refills !== 1 ? 's' : ''} left
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-600">
                    <span>Rx #: <strong>{rx.rx_number}</strong></span>
                    <span>Dosage: <strong>{rx.dosage}</strong></span>
                    <span>Frequency: <strong>{rx.frequency}</strong></span>
                    <span>Last Filled: <strong>{format(new Date(rx.last_filled), 'MM/dd/yyyy')}</strong></span>
                    <span className="col-span-2">Prescriber: <strong>{rx.prescriber}</strong></span>
                  </div>
                </div>
                {isSelected && (
                  <button className="p-1.5 rounded hover:bg-blue-200 transition-colors flex-shrink-0" title="Add to cart">
                    <ShoppingCart className="w-4 h-4 text-blue-600" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
    if (stat === 'orders') return (
      <div className="space-y-2">
        {patient.orders.map(o => (
          <div key={o.id} onClick={onGoToOrders} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-gray-900">{o.medication}</span>
              <Badge className={o.status === 'Delivered' ? 'bg-green-100 text-green-800' : o.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}>
                {o.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-600">
              <span>Order: <strong>{o.id}</strong></span>
              <span>Receipt: <strong>#{o.receipt}</strong></span>
              <span>Date: <strong>{format(new Date(o.date), 'MM/dd/yyyy')}</strong></span>
              <span>Amount: <strong>${o.amount.toFixed(2)}</strong></span>
              <span className="col-span-2">Tracking: <strong className="font-mono">{o.tracking}</strong></span>
            </div>
            {o.status === 'Delivered' && o.delivered_at && (
              <div className="mt-1.5 pt-1.5 border-t border-gray-200 space-y-0.5">
                <p className="text-green-700"><span className="font-semibold">Delivered:</span> {o.delivered_at}</p>
                <p className="text-gray-500"><span className="font-semibold">To:</span> {o.delivered_to}</p>
              </div>
            )}
            {o.status === 'In Progress' && o.est_delivery && (
              <div className="mt-1.5 pt-1.5 border-t border-gray-200 space-y-0.5">
                <p className="text-blue-700"><span className="font-semibold">Est. Delivery:</span> {format(new Date(o.est_delivery), 'MMM d, yyyy')}</p>
                <p className="text-gray-500"><span className="font-semibold">Window:</span> {o.delivery_window}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
    if (stat === 'invoices') return (
      <div className="space-y-2">
        {unpaid.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No open invoices</p>
        ) : unpaid.map(inv => (
          <div key={inv.id} className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-gray-900">{inv.number}</span>
              <Badge className="bg-red-100 text-red-800">{inv.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-600">
              <span>Date: <strong>{format(new Date(inv.date), 'MM/dd/yyyy')}</strong></span>
              <span>Total: <strong>${inv.amount.toFixed(2)}</strong></span>
              <span>Paid: <strong>${inv.paid.toFixed(2)}</strong></span>
              <span>Outstanding: <strong className="text-red-700">${(inv.amount - inv.paid).toFixed(2)}</strong></span>
            </div>
            <Button size="sm" className="mt-2 h-7 text-xs bg-green-600 hover:bg-green-700 w-full">Pay Now</Button>
          </div>
        ))}
      </div>
    );
    if (stat === 'lowrefills') return (
      <div className="space-y-2">
        {lowRefills.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No low-refill prescriptions</p>
        ) : lowRefills.map(rx => (
          <div key={rx.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-gray-900">{rx.name}</span>
              <Badge className={rx.refills === 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                {rx.refills === 0 ? 'No refills' : `${rx.refills} left`}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-600">
              <span>Rx #: <strong>{rx.rx_number}</strong></span>
              <span>Dosage: <strong>{rx.dosage}</strong></span>
              <span>Frequency: <strong>{rx.frequency}</strong></span>
              <span>Last Filled: <strong>{format(new Date(rx.last_filled), 'MM/dd/yyyy')}</strong></span>
              <span className="col-span-2">Prescriber: <strong>{rx.prescriber}</strong></span>
            </div>
            <Button size="sm" className="mt-2 h-7 text-xs bg-[#8B1F1F] hover:bg-[#721919] w-full">
              <RefreshCw className="w-3 h-3 mr-1" />Request Refill
            </Button>
          </div>
        ))}
      </div>
    );
  };

  const titles = { rx: 'Active Prescriptions', orders: 'All Orders', invoices: 'Open Invoices', lowrefills: 'Low Refill Alerts' };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <h3 className="font-bold text-sm text-gray-900">{titles[stat]}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-lg leading-none">✕</button>
        </div>
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {renderContent()}
        </div>
        {stat === 'rx' && selectedRx.length > 0 && (
          <div className="px-4 py-3 bg-blue-50 border-t border-blue-200 flex gap-2">
            <button
              onClick={handleGoToCart}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Go to Cart ({selectedRx.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function OverviewTab({ patient, editedPhysician, onChangePhysician, onSwitchTab }) {
  const [openModal, setOpenModal] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(patient.orders[0]?.id || null);
  const [detailOrder, setDetailOrder] = useState(null);
  const [showPhysicianContext, setShowPhysicianContext] = useState(false);

  const unpaid = patient.invoices.filter(i => i.status !== 'paid');
  const lowRefills = patient.prescriptions.filter(p => p.refills <= 1);
  const filteredComms = selectedOrderId
    ? patient.communications.filter(c => c.order_id === selectedOrderId)
    : patient.communications;

  React.useEffect(() => {
    setSelectedOrderId(patient.orders[0]?.id || null);
  }, [patient.id]);

  const handlePhysicianCall = () => {
    window.dispatchEvent(new CustomEvent('softphone:dial', { detail: { number: patient.physician_phone } }));
    setShowPhysicianContext(true);
  };

  // Build draggable panels
  const StatsPanel = (
    <div className="grid grid-cols-4 gap-3">
      {[
        { key: 'rx',        label: 'Active Rx',     value: patient.prescriptions.length, color: 'blue' },
        { key: 'orders',    label: 'Orders',         value: patient.orders.length,        color: 'gray' },
        { key: 'invoices',  label: 'Open Invoices',  value: unpaid.length,                color: unpaid.length > 0 ? 'red' : 'gray' },
        { key: 'lowrefills',label: 'Low Refills',    value: lowRefills.length,            color: lowRefills.length > 0 ? 'yellow' : 'gray' },
      ].map(stat => (
        <button key={stat.label} onClick={() => setOpenModal(stat.key)}
          className={`text-center p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md hover:scale-105 active:scale-95 ${
            stat.color === 'blue'   ? 'bg-blue-50 border-blue-100 hover:border-blue-300' :
            stat.color === 'red'    ? 'bg-red-50 border-red-100 hover:border-red-300' :
            stat.color === 'yellow' ? 'bg-yellow-50 border-yellow-100 hover:border-yellow-300' :
            'bg-gray-50 border-gray-200 hover:border-gray-400'
          }`}>
          <p className={`text-2xl font-bold ${
            stat.color === 'blue' ? 'text-blue-700' : stat.color === 'red' ? 'text-red-600' :
            stat.color === 'yellow' ? 'text-yellow-600' : 'text-gray-600'
          }`}>{stat.value}</p>
          <p className="text-xs text-gray-600 mt-0.5">{stat.label}</p>
        </button>
      ))}
    </div>
  );

  const AlertsPanel = (lowRefills.length > 0 || unpaid.length > 0) ? (
    <div className="space-y-1.5">
      {lowRefills.map(rx => (
        <div key={rx.id} className="flex items-center gap-2 p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0" />
          <span className="text-yellow-800"><strong>{rx.name}</strong> — {rx.refills === 0 ? 'no refills remaining' : `${rx.refills} refill left`}</span>
          <Button size="sm" className="ml-auto h-6 text-xs bg-yellow-600 hover:bg-yellow-700 px-2"><RefreshCw className="w-3 h-3 mr-1" />Request Refill</Button>
        </div>
      ))}
      {unpaid.map(inv => (
        <div key={inv.id} className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
          <span className="text-red-800"><strong>{inv.number}</strong> — ${inv.amount.toFixed(2)} outstanding</span>
        </div>
      ))}
    </div>
  ) : null;

  const OrdersPanel = (
    <div className="space-y-1.5">
      {patient.orders.slice(0, 3).map(o => {
        const isSelected = selectedOrderId === o.id;
        const commCount = patient.communications.filter(c => c.order_id === o.id).length;
        return (
          <button key={o.id} onClick={() => setSelectedOrderId(o.id)}
            className={`w-full text-left p-2 rounded border text-xs transition-all ${isSelected ? 'bg-[#8B1F1F]/5 border-[#8B1F1F] ring-1 ring-[#8B1F1F]/30' : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100'}`}>
            <div className="flex items-center justify-between gap-2">
              <p className={`font-semibold truncate max-w-[110px] ${isSelected ? 'text-[#8B1F1F]' : 'text-gray-800'}`}>{o.medication}</p>
              <div className="flex items-center gap-1 flex-shrink-0">
                {commCount > 0 && <span className={`text-xs px-1.5 py-0 rounded-full font-bold ${isSelected ? 'bg-[#8B1F1F] text-white' : 'bg-gray-200 text-gray-600'}`}>{commCount}</span>}
                <Badge className={`text-xs ${o.status === 'Delivered' ? 'bg-green-100 text-green-800' : o.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : o.status === 'In Transit' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{o.status}</Badge>
              </div>
            </div>
            <p className="text-gray-500 mt-0.5">{format(new Date(o.date), 'MM/dd/yy')} • #{o.receipt}</p>
            {o.status === 'Delivered' && o.delivered_at && <p className="text-green-700 text-xs mt-1"><span className="font-semibold">Delivered:</span> {o.delivered_at}</p>}
            {o.status === 'In Progress' && o.est_delivery && <p className="text-blue-700 text-xs mt-1"><span className="font-semibold">Est. Delivery:</span> {format(new Date(o.est_delivery), 'MMM d, yyyy')}</p>}
            <div className="mt-1.5 pt-1.5 border-t border-gray-200 flex justify-end">
              <span onClick={e => { e.stopPropagation(); setDetailOrder(o); }} className={`text-xs font-semibold flex items-center gap-0.5 hover:underline cursor-pointer ${isSelected ? 'text-[#8B1F1F]' : 'text-gray-500'}`}>View Details <ChevronRight className="w-3 h-3" /></span>
            </div>
          </button>
        );
      })}
    </div>
  );

  const CommsPanel = (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">{selectedOrderId ? 'Order Communications' : 'Recent Communications'}</p>
        {selectedOrderId && <button onClick={() => setSelectedOrderId(null)} className="text-xs text-[#8B1F1F] hover:underline font-semibold">Show all</button>}
      </div>
      <div className="space-y-1.5">
        {filteredComms.length === 0 ? (
          <div className="p-3 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg">No communications for this order</div>
        ) : filteredComms.slice(0, 3).map(c => (
          <div key={c.id} className={`p-2 rounded border text-xs transition-all ${selectedOrderId ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-1 mb-0.5">
              <span className={`font-semibold ${c.type === 'phone' ? 'text-blue-700' : c.type === 'email' ? 'text-purple-700' : c.type === 'text' ? 'text-green-700' : 'text-orange-700'}`}>{c.type.toUpperCase()}</span>
              <span className="text-gray-400 ml-auto">{format(new Date(c.date), 'MM/dd/yy')}</span>
            </div>
            <p className="font-semibold text-gray-800 truncate">{c.subject}</p>
            <p className="text-gray-500 truncate">{c.agent}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const PhysicianPanel = (
    <div className="grid grid-cols-3 gap-2 text-xs">
      <div><p className="text-gray-500">Name</p><p className="font-semibold text-gray-800">{editedPhysician?.name || patient.physician}</p></div>
      <div><p className="text-gray-500">NPI</p><p className="font-semibold text-gray-800">{editedPhysician?.npi || patient.physician_npi}</p></div>
      <div>
        <p className="text-gray-500">Phone</p>
        <button onClick={handlePhysicianCall} className="font-semibold text-[#8B1F1F] hover:underline flex items-center gap-1 group" title="Click to call physician">
          <Phone className="w-3 h-3 group-hover:animate-pulse" />{editedPhysician?.phone || patient.physician_phone}
        </button>
      </div>
      <div className="col-span-3 flex justify-end mt-1">
        <button onClick={onChangePhysician} className="text-xs text-[#8B1F1F] hover:underline font-semibold flex items-center gap-1"><Pencil className="w-3 h-3" />Change Physician</button>
      </div>
    </div>
  );

  const basePanels = [
    { id: 'stats',     title: 'Quick Stats',            content: StatsPanel },
    { id: 'orders',    title: 'Recent Orders',           content: OrdersPanel },
    { id: 'comms',     title: 'Recent Communications',   content: CommsPanel },
    { id: 'physician', title: 'Prescribing Physician',   content: PhysicianPanel },
  ];
  if (AlertsPanel) basePanels.splice(1, 0, { id: 'alerts', title: 'Alerts', content: AlertsPanel });

  const [panels, setPanels] = useState(basePanels);

  // Re-sync if patient changes
  React.useEffect(() => {
    setPanels(basePanels);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient.id]);

  return (
    <div>
      {openModal && <StatCardModal stat={openModal} patient={patient} onClose={() => setOpenModal(null)} onGoToOrders={() => { setOpenModal(null); onSwitchTab('orders'); }} />}
      {detailOrder && <OrderDetailModal order={detailOrder} patient={patient} onClose={() => setDetailOrder(null)} />}
      {showPhysicianContext && <PhysicianContextPopup patient={patient} onClose={() => setShowPhysicianContext(false)} />}

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400 flex items-center gap-1"><GripVertical className="w-3 h-3" /> Drag panels to reorder</p>
      </div>

      <DraggablePanelGrid panels={panels} onReorder={setPanels} />
    </div>
  );
}

function PrescriptionsTab({ patient }) {
  const [filter, setFilter] = useState('active');

  // Mock: treat prescriptions with 0 refills as inactive, rest as active
  const activePrescriptions = patient.prescriptions.filter(rx => rx.refills > 0);
  const inactivePrescriptions = patient.prescriptions.filter(rx => rx.refills === 0);
  const displayed = filter === 'active' ? activePrescriptions : inactivePrescriptions;

  return (
    <div className="space-y-3">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
          {filter === 'active' ? activePrescriptions.length : inactivePrescriptions.length} Prescription{displayed.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 text-xs font-semibold">
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded-md transition-colors ${filter === 'active' ? 'bg-white text-[#8B1F1F] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-3 py-1 rounded-md transition-colors ${filter === 'inactive' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Inactive
          </button>
        </div>
      </div>

      {displayed.length === 0 && (
        <div className="p-6 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg">
          No {filter} prescriptions
        </div>
      )}

      {displayed.map(rx => (
        <div key={rx.id} className={`p-3 rounded-lg border ${
          filter === 'inactive' ? 'border-gray-200 bg-gray-50 opacity-75' :
          rx.refills <= 1 ? 'border-yellow-200 bg-yellow-50' :
          'border-gray-200 bg-white'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#8B1F1F] bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">Rx</span>
                <p className="font-bold text-sm text-gray-900">{rx.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1.5 text-xs text-gray-600">
                <span>Rx #: <strong>{rx.rx_number}</strong></span>
                <span>Dosage: <strong>{rx.dosage}</strong></span>
                <span>Frequency: <strong>{rx.frequency}</strong></span>
                <span>Last Filled: <strong>{format(new Date(rx.last_filled), 'MM/dd/yyyy')}</strong></span>
                <span className="col-span-2">Prescriber: <strong>{rx.prescriber}</strong></span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <Badge className={
                rx.refills === 0 ? 'bg-red-100 text-red-800' :
                rx.refills <= 1 ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }>
                {rx.refills} refill{rx.refills !== 1 ? 's' : ''} left
              </Badge>
              {filter === 'active' && (
                <Button size="sm" className="h-7 text-xs bg-[#8B1F1F] hover:bg-[#721919] px-3">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Request Refill
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BulkActionToolbar({ selectedIds, onAction, onClear }) {
  const count = selectedIds.length;
  const [noteText, setNoteText] = useState('');
  const [activeAction, setActiveAction] = useState(null);

  const handleAction = (type) => {
    if (type === 'note') { setActiveAction('note'); return; }
    onAction(type, selectedIds);
  };

  const submitNote = () => {
    onAction('note', selectedIds, noteText);
    setNoteText('');
    setActiveAction(null);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
      {activeAction === 'note' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-2xl p-3 w-80">
          <p className="text-xs font-bold text-gray-700 mb-1.5">Add Note to {count} order{count > 1 ? 's' : ''}</p>
          <textarea
            className="w-full text-xs border border-gray-200 rounded-lg p-2 resize-none h-16 focus:outline-none focus:border-[#8B1F1F]"
            placeholder="Enter note..."
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <Button size="sm" className="h-7 text-xs bg-[#8B1F1F] hover:bg-[#721919] flex-1" onClick={submitNote}>
              Save Note
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setActiveAction(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 bg-gray-900 text-white rounded-full px-4 py-2.5 shadow-2xl">
        <span className="text-xs font-bold text-gray-300 mr-1">{count} selected</span>
        <div className="w-px h-4 bg-gray-600" />
        <button
          onClick={() => handleAction('note')}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <StickyNote className="w-3.5 h-3.5" /> Add Note
        </button>
        <button
          onClick={() => handleAction('refill')}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Trigger Refill
        </button>
        <button
          onClick={() => handleAction('shipment')}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <Truck className="w-3.5 h-3.5" /> Shipment Update
        </button>
        <div className="w-px h-4 bg-gray-600" />
        <button onClick={onClear} className="p-1 rounded-full hover:bg-white/10 transition-colors" title="Clear selection">
          <X className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}

function OrdersTab({ patient }) {
  const [detailOrder, setDetailOrder] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [actionFeedback, setActionFeedback] = useState(null);

  const allIds = patient.orders.map(o => o.id);
  const allChecked = selectedIds.length === allIds.length && allIds.length > 0;
  const someChecked = selectedIds.length > 0 && !allChecked;

  const toggleAll = () => setSelectedIds(allChecked ? [] : [...allIds]);
  const toggleOne = (id, e) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkAction = (type, ids, note) => {
    const labels = { refill: 'Refill requested', shipment: 'Shipment update requested', note: `Note saved` };
    setActionFeedback(`${labels[type]} for ${ids.length} order${ids.length > 1 ? 's' : ''}`);
    setSelectedIds([]);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  return (
    <div className="space-y-2 relative">
      {detailOrder && <OrderDetailModal order={detailOrder} patient={patient} onClose={() => setDetailOrder(null)} />}
      {selectedIds.length > 0 && (
        <BulkActionToolbar selectedIds={selectedIds} onAction={handleBulkAction} onClear={() => setSelectedIds([])} />
      )}
      {actionFeedback && (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> {actionFeedback}
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-8 pr-0">
              <input
                type="checkbox"
                checked={allChecked}
                ref={el => { if (el) el.indeterminate = someChecked; }}
                onChange={toggleAll}
                className="cursor-pointer accent-[#8B1F1F]"
              />
            </TableHead>
            <TableHead className="text-xs font-bold text-gray-700">Receipt #</TableHead>
            <TableHead className="text-xs font-bold text-gray-700">Date</TableHead>
            <TableHead className="text-xs font-bold text-gray-700">Medication</TableHead>
            <TableHead className="text-xs font-bold text-gray-700">Amount</TableHead>
            <TableHead className="text-xs font-bold text-gray-700">Status</TableHead>
            <TableHead className="text-xs font-bold text-gray-700"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patient.orders.map(o => {
            const isChecked = selectedIds.includes(o.id);
            return (
              <TableRow
                key={o.id}
                className={`cursor-pointer transition-colors ${isChecked ? 'bg-red-50/60' : 'hover:bg-gray-50'}`}
                onClick={() => setDetailOrder(o)}
              >
                <TableCell className="w-8 pr-0" onClick={e => toggleOne(o.id, e)}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="cursor-pointer accent-[#8B1F1F]"
                  />
                </TableCell>
                <TableCell className="text-xs font-semibold text-[#8B1F1F]">{o.receipt}</TableCell>
                <TableCell className="text-xs">{format(new Date(o.date), 'MM/dd/yyyy')}</TableCell>
                <TableCell className="text-xs font-medium">{o.medication}</TableCell>
                <TableCell className="text-xs">${o.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className={`text-xs ${
                    o.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                    o.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                    o.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    o.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>{o.status}</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-[#8B1F1F] font-semibold flex items-center gap-0.5 hover:underline">
                    Details <ChevronRight className="w-3 h-3" />
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function CommunicationsTab({ patient, newNote, setNewNote }) {
  const [channelFilter, setChannelFilter] = useState('all');
  const [selectedComm, setSelectedComm] = useState(null);

  const channelConfig = {
    phone:    { label: 'Call',     color: 'text-blue-700 bg-blue-50',   icon: Phone },
    email:    { label: 'Email',    color: 'text-purple-700 bg-purple-50', icon: Mail },
    text:     { label: 'Text',     color: 'text-green-700 bg-green-50',  icon: Send },
    ai_agent: { label: 'AI Agent', color: 'text-orange-700 bg-orange-50', icon: Bot },
  };

  const CHANNEL_FILTERS = [
    { key: 'all',      label: 'All',      icon: MessageSquare },
    { key: 'phone',    label: 'Phone',    icon: Phone },
    { key: 'email',    label: 'Email',    icon: Mail },
    { key: 'text',     label: 'SMS/Text', icon: Send },
    { key: 'ai_agent', label: 'AI Agent', icon: Bot },
  ];

  const filtered = channelFilter === 'all'
    ? patient.communications
    : patient.communications.filter(c => c.type === channelFilter);

  return (
    <div className="space-y-4">
      {selectedComm && (
        <CommunicationDetailModal
          comm={selectedComm}
          patient={patient}
          onClose={() => setSelectedComm(null)}
        />
      )}
      {/* Agent Engagement Log */}
      <AgentEngagementLog communications={patient.communications} />

      {/* KB Suggestions */}
      <KBSuggestions communications={patient.communications} />

      {/* Quick Action Macros */}
      <QuickActionMacros patient={patient} />

      {/* Log New Interaction */}
      <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Log New Interaction</p>
        <Textarea
          placeholder="Enter call notes, message summary, or interaction details..."
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          className="text-xs h-20 resize-none bg-white"
        />
        <div className="flex gap-2 mt-2 flex-wrap">
          <Button size="sm" className="h-7 text-xs bg-[#8B1F1F] hover:bg-[#721919]">
            <Phone className="w-3 h-3 mr-1" />Log Call
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs">
            <Mail className="w-3 h-3 mr-1" />Send Email
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs">
            <Send className="w-3 h-3 mr-1" />Send Text
          </Button>
        </div>
      </div>

      {/* Channel Filter Tabs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
            Communication History
            {channelFilter !== 'all' && (
              <span className="ml-1 font-normal text-gray-500">({filtered.length} of {patient.communications.length})</span>
            )}
          </p>
        </div>
        <div className="flex gap-1 flex-wrap mb-3">
          {CHANNEL_FILTERS.map(cf => {
            const Icon = cf.icon;
            const count = cf.key === 'all'
              ? patient.communications.length
              : patient.communications.filter(c => c.type === cf.key).length;
            if (count === 0 && cf.key !== 'all') return null;
            return (
              <button
                key={cf.key}
                onClick={() => setChannelFilter(cf.key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold transition-all ${
                  channelFilter === cf.key
                    ? 'bg-[#8B1F1F] text-white border-[#8B1F1F]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-800'
                }`}
              >
                <Icon className="w-3 h-3" />
                {cf.label}
                <span className={`rounded-full px-1 text-xs ${channelFilter === cf.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg">
            No {channelFilter !== 'all' ? channelConfig[channelFilter]?.label : ''} communications found
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(c => {
              const cfg = channelConfig[c.type] || channelConfig.phone;
              const Icon = cfg.icon;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedComm(c)}
                  className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-[#8B1F1F]/40 hover:bg-red-50/30 hover:shadow-sm transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                      <Icon className="w-3 h-3" />{cfg.label}
                    </span>
                    <span className="text-xs font-semibold text-gray-800 group-hover:text-[#8B1F1F] transition-colors">{c.subject}</span>
                    <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{format(new Date(c.date), 'MM/dd/yyyy')}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#8B1F1F] transition-colors flex-shrink-0" />
                  </div>
                  <p className="text-xs text-gray-600">{c.summary}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Agent: <span className="font-semibold text-gray-600">{c.agent}</span>
                    {c.duration ? ` • Duration: ${c.duration}` : ''}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function BillingTab({ patient }) {
  const [payInvoice, setPayInvoice] = useState(null);
  const [paidIds, setPaidIds] = useState([]);

  const handlePaid = (id) => setPaidIds(prev => [...prev, id]);

  const openInvoices = patient.invoices.filter(i => i.status !== 'paid' && !paidIds.includes(i.id));
  const closedInvoices = patient.invoices.filter(i => i.status === 'paid' || paidIds.includes(i.id));

  return (
    <div className="space-y-4">
      {payInvoice && (
        <InvoicePaymentModal
          invoice={payInvoice}
          patient={patient}
          onClose={() => setPayInvoice(null)}
          onPaid={(id) => { handlePaid(id); setPayInvoice(null); }}
        />
      )}

      {/* Open Invoices */}
      {openInvoices.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Open Invoices
          </p>
          <div className="space-y-3">
            {openInvoices.map(inv => {
              const outstanding = inv.amount - inv.paid;
              return (
                <div key={inv.id} className="border border-red-200 rounded-xl overflow-hidden bg-red-50/40">
                  {/* Invoice Header */}
                  <div className="px-4 py-3 bg-red-50 border-b border-red-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-red-800">{inv.number}</p>
                      <p className="text-xs text-red-600">{format(new Date(inv.date), 'MMMM d, yyyy')}</p>
                    </div>
                    <Badge className={`text-xs font-bold ${inv.status === 'partially_paid' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {inv.status === 'partially_paid' ? 'Partially Paid' : 'Unpaid'}
                    </Badge>
                  </div>

                  {/* Line Items */}
                  <div className="px-4 py-3">
                    {inv.line_items?.map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 text-xs">
                        <div className="flex items-start gap-2">
                          <Pill className="w-3.5 h-3.5 text-[#8B1F1F] mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="text-gray-500">{item.dosage} · {item.frequency}</p>
                            <p className="text-gray-400 font-mono">Rx #{item.rx_number}</p>
                          </div>
                        </div>
                        <p className="font-bold text-gray-900">${item.amount.toFixed(2)}</p>
                      </div>
                    ))}

                    {/* Totals */}
                    <div className="mt-2 pt-2 space-y-1 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span><span>${inv.amount.toFixed(2)}</span>
                      </div>
                      {inv.paid > 0 && (
                        <div className="flex justify-between text-green-700">
                          <span>Previously Paid</span><span>−${inv.paid.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-sm text-gray-900 border-t border-gray-200 pt-1.5">
                        <span>Balance Due</span>
                        <span className="text-red-700">${outstanding.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full mt-3 h-9 bg-[#8B1F1F] hover:bg-[#721919] text-xs font-semibold"
                      onClick={() => setPayInvoice(inv)}
                    >
                      <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                      Collect Payment — ${outstanding.toFixed(2)}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {openInvoices.length === 0 && (
        <div className="p-4 text-center text-xs text-gray-400 border border-dashed border-green-300 bg-green-50 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-1" />
          No open invoices — account is current
        </div>
      )}

      {/* Payment Methods */}
      <div>
        <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Payment Methods on File</p>
        {patient.cards.length === 0 ? (
          <div className="p-3 border border-dashed border-gray-300 rounded-lg text-center text-xs text-gray-400">
            No payment methods on file
          </div>
        ) : (
          <div className="space-y-2">
            {patient.cards.map(card => (
              <div key={card.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{card.brand} •••• {card.last4}</p>
                    <p className="text-xs text-gray-500">Expires {card.expiry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {card.is_default && <Badge className="bg-blue-100 text-blue-800 text-xs">Default</Badge>}
                  <Button size="sm" variant="outline" className="h-7 text-xs">Update</Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <Button size="sm" variant="outline" className="mt-2 h-7 text-xs">
          <CreditCard className="w-3 h-3 mr-1" />Add Payment Method
        </Button>
      </div>

      {/* Paid Invoice History */}
      {closedInvoices.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Payment History</p>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs font-bold">Invoice #</TableHead>
                <TableHead className="text-xs font-bold">Date</TableHead>
                <TableHead className="text-xs font-bold">Amount</TableHead>
                <TableHead className="text-xs font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {closedInvoices.map(inv => (
                <TableRow key={inv.id} className="hover:bg-gray-50">
                  <TableCell className="text-xs font-semibold text-[#8B1F1F]">{inv.number}</TableCell>
                  <TableCell className="text-xs">{format(new Date(inv.date), 'MM/dd/yyyy')}</TableCell>
                  <TableCell className="text-xs">${inv.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className="text-xs bg-green-100 text-green-800">Paid</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}