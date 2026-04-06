import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  LayoutDashboard, Pill, ShoppingCart, MessageSquare, CreditCard,
  RefreshCw, Phone, Mail, Send, AlertTriangle, Bot, ExternalLink, Clock, IdCard, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import OrderDetailModal from './OrderDetailModal';
import PhysicianContextPopup from './PhysicianContextPopup';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'prescriptions', label: 'Rx', icon: Pill },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'communications', label: 'Communications', icon: MessageSquare },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

function AddressDropdown({ address }) {
  const [open, setOpen] = useState(false);
  const addresses = [
    { label: 'Main', value: address },
    { label: 'Work', value: '123 Business Park Dr, Suite 400, Columbia, SC 29201' },
  ];
  const [selected, setSelected] = useState(0);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 font-semibold text-gray-800 text-xs hover:text-[#8B1F1F] transition-colors"
      >
        <span>{addresses[selected].value}</span>
        <span className={`px-1.5 py-0 rounded-full text-xs font-bold ${selected === 0 ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
          {addresses[selected].label}
        </span>
        <svg className={`w-3 h-3 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-72 py-1">
          {addresses.map((addr, i) => (
            <button
              key={i}
              onClick={() => { setSelected(i); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-start gap-2 ${selected === i ? 'bg-red-50' : ''}`}
            >
              <span className={`mt-0.5 px-1.5 py-0 rounded-full text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                {addr.label}
              </span>
              <span className="text-gray-800">{addr.value}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function InsuranceCardPopover() {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(v => !v)}
        className="p-0.5 rounded hover:bg-gray-200 transition-colors"
        title="View insurance card"
      >
        <IdCard className="w-3.5 h-3.5 text-[#8B1F1F]" />
      </button>
      {show && (
        <div className="absolute left-6 top-0 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-2 w-64">
          <img
            src="https://media.base44.com/images/public/695285fc94e8ef46bde70e16/50e86ad64_InsuranceCard.png"
            alt="Insurance Card"
            className="w-full rounded"
          />
        </div>
      )}
    </div>
  );
}

export default function AgentWorkspaceTabs({ patient }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');

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
              <div className="col-span-2">
                <p className="text-gray-500">Address</p>
                <AddressDropdown address={patient.address} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-2 text-xs border-t border-gray-200 pt-2">
              <div>
                <p className="text-gray-500">Physician</p>
                <p className="font-semibold text-gray-800">{patient.physician}</p>
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
                <p className="font-semibold text-red-700">{patient.allergies}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
        {activeTab === 'overview' && <OverviewTab patient={patient} />}
        {activeTab === 'prescriptions' && <PrescriptionsTab patient={patient} />}
        {activeTab === 'orders' && <OrdersTab patient={patient} />}
        {activeTab === 'communications' && <CommunicationsTab patient={patient} newNote={newNote} setNewNote={setNewNote} />}
        {activeTab === 'billing' && <BillingTab patient={patient} />}
      </div>
    </div>
  );
}

function StatCardModal({ stat, patient, onClose }) {
  const unpaid = patient.invoices.filter(i => i.status !== 'paid');
  const lowRefills = patient.prescriptions.filter(p => p.refills <= 1);

  const renderContent = () => {
    if (stat === 'rx') return (
      <div className="space-y-2">
        {patient.prescriptions.map(rx => (
          <div key={rx.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
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
        ))}
      </div>
    );
    if (stat === 'orders') return (
      <div className="space-y-2">
        {patient.orders.map(o => (
          <div key={o.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
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
      </div>
    </div>
  );
}

function OverviewTab({ patient }) {
  const [openModal, setOpenModal] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(patient.orders[0]?.id || null);
  const [detailOrder, setDetailOrder] = useState(null);
  const [showPhysicianContext, setShowPhysicianContext] = useState(false);

  React.useEffect(() => {
    setSelectedOrderId(patient.orders[0]?.id || null);
  }, [patient.id]);

  const handlePhysicianCall = () => {
    window.dispatchEvent(new CustomEvent('softphone:dial', { detail: { number: patient.physician_phone } }));
    setShowPhysicianContext(true);
  };
  const unpaid = patient.invoices.filter(i => i.status !== 'paid');
  const lowRefills = patient.prescriptions.filter(p => p.refills <= 1);
  const filteredComms = selectedOrderId
    ? patient.communications.filter(c => c.order_id === selectedOrderId)
    : patient.communications;

  return (
    <div className="space-y-4">
      {openModal && <StatCardModal stat={openModal} patient={patient} onClose={() => setOpenModal(null)} />}
      {detailOrder && <OrderDetailModal order={detailOrder} patient={patient} onClose={() => setDetailOrder(null)} />}
      {showPhysicianContext && <PhysicianContextPopup patient={patient} onClose={() => setShowPhysicianContext(false)} />}
      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { key: 'rx', label: 'Active Rx', value: patient.prescriptions.length, color: 'blue' },
          { key: 'orders', label: 'Orders', value: patient.orders.length, color: 'gray' },
          { key: 'invoices', label: 'Open Invoices', value: unpaid.length, color: unpaid.length > 0 ? 'red' : 'gray' },
          { key: 'lowrefills', label: 'Low Refills', value: lowRefills.length, color: lowRefills.length > 0 ? 'yellow' : 'gray' },
        ].map(stat => (
          <button
            key={stat.label}
            onClick={() => setOpenModal(stat.key)}
            className={`text-center p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md hover:scale-105 active:scale-95 ${
              stat.color === 'blue' ? 'bg-blue-50 border-blue-100 hover:border-blue-300' :
              stat.color === 'red' ? 'bg-red-50 border-red-100 hover:border-red-300' :
              stat.color === 'yellow' ? 'bg-yellow-50 border-yellow-100 hover:border-yellow-300' :
              'bg-gray-50 border-gray-200 hover:border-gray-400'
            }`}>
            <p className={`text-2xl font-bold ${
              stat.color === 'blue' ? 'text-blue-700' :
              stat.color === 'red' ? 'text-red-600' :
              stat.color === 'yellow' ? 'text-yellow-600' :
              'text-gray-600'
            }`}>{stat.value}</p>
            <p className="text-xs text-gray-600 mt-0.5">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Alerts Banner */}
      {(lowRefills.length > 0 || unpaid.length > 0) && (
        <div className="space-y-1.5">
          {lowRefills.map(rx => (
            <div key={rx.id} className="flex items-center gap-2 p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0" />
              <span className="text-yellow-800"><strong>{rx.name}</strong> — {rx.refills === 0 ? 'no refills remaining' : `${rx.refills} refill left`}</span>
              <Button size="sm" className="ml-auto h-6 text-xs bg-yellow-600 hover:bg-yellow-700 px-2">
                <RefreshCw className="w-3 h-3 mr-1" />Request Refill
              </Button>
            </div>
          ))}
          {unpaid.map(inv => (
            <div key={inv.id} className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
              <span className="text-red-800"><strong>{inv.number}</strong> — ${inv.amount.toFixed(2)} outstanding</span>
            </div>
          ))}
        </div>
      )}

      {/* Two-column: Recent Orders + Recent Comms */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Recent Orders</p>
          <div className="space-y-1.5">
            {patient.orders.slice(0, 3).map(o => {
              const isSelected = selectedOrderId === o.id;
              const commCount = patient.communications.filter(c => c.order_id === o.id).length;
              return (
                <button
                  key={o.id}
                  onClick={() => setSelectedOrderId(isSelected ? null : o.id)}
                  className={`w-full text-left p-2 rounded border text-xs transition-all ${
                    isSelected
                      ? 'bg-[#8B1F1F]/5 border-[#8B1F1F] ring-1 ring-[#8B1F1F]/30'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className={`font-semibold truncate max-w-[110px] ${isSelected ? 'text-[#8B1F1F]' : 'text-gray-800'}`}>{o.medication}</p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {commCount > 0 && (
                        <span className={`text-xs px-1.5 py-0 rounded-full font-bold ${isSelected ? 'bg-[#8B1F1F] text-white' : 'bg-gray-200 text-gray-600'}`}>
                          {commCount}
                        </span>
                      )}
                      <Badge className={`text-xs ${
                        o.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        o.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        o.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>{o.status}</Badge>
                    </div>
                  </div>
                  <p className="text-gray-500 mt-0.5">{format(new Date(o.date), 'MM/dd/yy')} • #{o.receipt}</p>
                  {o.status === 'Delivered' && o.delivered_at && (
                    <div className="mt-1 pt-1 border-t border-gray-200 space-y-0.5">
                      <p className="text-green-700"><span className="font-semibold">Delivered:</span> {o.delivered_at}</p>
                    </div>
                  )}
                  {o.status === 'In Progress' && o.est_delivery && (
                    <div className="mt-1 pt-1 border-t border-gray-200 space-y-0.5">
                      <p className="text-blue-700"><span className="font-semibold">Est. Delivery:</span> {format(new Date(o.est_delivery), 'MMM d, yyyy')}</p>
                    </div>
                  )}
                  <div className="mt-1.5 pt-1.5 border-t border-gray-200 flex justify-end">
                    <span
                      onClick={e => { e.stopPropagation(); setDetailOrder(o); }}
                      className={`text-xs font-semibold flex items-center gap-0.5 hover:underline cursor-pointer ${isSelected ? 'text-[#8B1F1F]' : 'text-gray-500'}`}
                    >
                      View Details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              {selectedOrderId ? 'Order Communications' : 'Recent Communications'}
            </p>
            {selectedOrderId && (
              <button
                onClick={() => setSelectedOrderId(null)}
                className="text-xs text-[#8B1F1F] hover:underline font-semibold"
              >
                Show all
              </button>
            )}
          </div>
          <div className="space-y-1.5">
            {filteredComms.length === 0 ? (
              <div className="p-3 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg">
                No communications for this order
              </div>
            ) : filteredComms.slice(0, 3).map(c => (
              <div key={c.id} className={`p-2 rounded border text-xs transition-all ${
                selectedOrderId ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-1 mb-0.5">
                  <span className={`font-semibold ${
                    c.type === 'phone' ? 'text-blue-700' :
                    c.type === 'email' ? 'text-purple-700' :
                    c.type === 'text' ? 'text-green-700' : 'text-orange-700'
                  }`}>{c.type.toUpperCase()}</span>
                  <span className="text-gray-400 ml-auto">{format(new Date(c.date), 'MM/dd/yy')}</span>
                </div>
                <p className="font-semibold text-gray-800 truncate">{c.subject}</p>
                <p className="text-gray-500 truncate">{c.agent}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Physician Card */}
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Prescribing Physician</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div><p className="text-gray-500">Name</p><p className="font-semibold text-gray-800">{patient.physician}</p></div>
          <div><p className="text-gray-500">NPI</p><p className="font-semibold text-gray-800">{patient.physician_npi}</p></div>
          <div>
            <p className="text-gray-500">Phone</p>
            <button
              onClick={handlePhysicianCall}
              className="font-semibold text-[#8B1F1F] hover:underline flex items-center gap-1 group"
              title="Click to call physician"
            >
              <Phone className="w-3 h-3 group-hover:animate-pulse" />
              {patient.physician_phone}
            </button>
          </div>
        </div>
      </div>
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

function OrdersTab({ patient }) {
  const [detailOrder, setDetailOrder] = useState(null);

  return (
    <div className="space-y-2">
      {detailOrder && <OrderDetailModal order={detailOrder} patient={patient} onClose={() => setDetailOrder(null)} />}
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="text-xs font-bold text-gray-700">Receipt #</TableHead>
            <TableHead className="text-xs font-bold text-gray-700">Date</TableHead>
            <TableHead className="text-xs font-bold text-gray-700">Medication</TableHead>
            <TableHead className="text-xs font-bold text-gray-700">Amount</TableHead>
            <TableHead className="text-xs font-bold text-gray-700">Status</TableHead>
            <TableHead className="text-xs font-bold text-gray-700"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patient.orders.map(o => (
            <TableRow
              key={o.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => setDetailOrder(o)}
            >
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CommunicationsTab({ patient, newNote, setNewNote }) {
  const channelConfig = {
    phone: { label: 'Call', color: 'text-blue-700 bg-blue-50', icon: Phone },
    email: { label: 'Email', color: 'text-purple-700 bg-purple-50', icon: Mail },
    text: { label: 'Text', color: 'text-green-700 bg-green-50', icon: Send },
    ai_agent: { label: 'AI Agent', color: 'text-orange-700 bg-orange-50', icon: Bot },
  };

  return (
    <div className="space-y-4">
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

      {/* History */}
      <div>
        <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Communication History</p>
        <div className="space-y-2">
          {patient.communications.map(c => {
            const cfg = channelConfig[c.type] || channelConfig.phone;
            const Icon = cfg.icon;
            return (
              <div key={c.id} className="p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                    <Icon className="w-3 h-3" />{cfg.label}
                  </span>
                  <span className="text-xs font-semibold text-gray-800">{c.subject}</span>
                  <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />{format(new Date(c.date), 'MM/dd/yyyy')}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{c.summary}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Agent: {c.agent}{c.duration ? ` • Duration: ${c.duration}` : ''}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BillingTab({ patient }) {
  return (
    <div className="space-y-4">
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
          <CreditCard className="w-3 h-3 mr-1" />
          Add Payment Method
        </Button>
      </div>

      {/* Invoice History */}
      <div>
        <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Invoice History</p>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs font-bold">Invoice #</TableHead>
              <TableHead className="text-xs font-bold">Date</TableHead>
              <TableHead className="text-xs font-bold">Amount</TableHead>
              <TableHead className="text-xs font-bold">Outstanding</TableHead>
              <TableHead className="text-xs font-bold">Status</TableHead>
              <TableHead className="text-xs font-bold"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patient.invoices.map(inv => (
              <TableRow key={inv.id} className="hover:bg-gray-50">
                <TableCell className="text-xs font-semibold text-[#8B1F1F]">{inv.number}</TableCell>
                <TableCell className="text-xs">{format(new Date(inv.date), 'MM/dd/yyyy')}</TableCell>
                <TableCell className="text-xs">${inv.amount.toFixed(2)}</TableCell>
                <TableCell className="text-xs">${(inv.amount - inv.paid).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className={`text-xs ${inv.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {inv.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {inv.status !== 'paid' && (
                    <Button size="sm" className="h-6 text-xs bg-green-600 hover:bg-green-700 px-2">
                      Pay Now
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}