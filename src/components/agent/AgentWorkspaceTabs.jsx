import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  LayoutDashboard, Pill, ShoppingCart, MessageSquare, CreditCard,
  RefreshCw, Phone, Mail, Send, AlertTriangle, Bot, ExternalLink, Clock
} from 'lucide-react';
import { format } from 'date-fns';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'communications', label: 'Communications', icon: MessageSquare },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

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
                <p className="font-semibold text-gray-800 text-xs">{patient.address}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-2 text-xs border-t border-gray-200 pt-2">
              <div>
                <p className="text-gray-500">Physician</p>
                <p className="font-semibold text-gray-800">{patient.physician}</p>
              </div>
              <div>
                <p className="text-gray-500">Insurance</p>
                <p className="font-semibold text-gray-800">{patient.insurance}</p>
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

function OverviewTab({ patient }) {
  const unpaid = patient.invoices.filter(i => i.status !== 'paid');
  const lowRefills = patient.prescriptions.filter(p => p.refills <= 1);

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Active Rx', value: patient.prescriptions.length, color: 'blue' },
          { label: 'Orders', value: patient.orders.length, color: 'gray' },
          { label: 'Open Invoices', value: unpaid.length, color: unpaid.length > 0 ? 'red' : 'gray' },
          { label: 'Low Refills', value: lowRefills.length, color: lowRefills.length > 0 ? 'yellow' : 'gray' },
        ].map(stat => (
          <div key={stat.label} className={`text-center p-3 rounded-lg border ${
            stat.color === 'blue' ? 'bg-blue-50 border-blue-100' :
            stat.color === 'red' ? 'bg-red-50 border-red-100' :
            stat.color === 'yellow' ? 'bg-yellow-50 border-yellow-100' :
            'bg-gray-50 border-gray-200'
          }`}>
            <p className={`text-2xl font-bold ${
              stat.color === 'blue' ? 'text-blue-700' :
              stat.color === 'red' ? 'text-red-600' :
              stat.color === 'yellow' ? 'text-yellow-600' :
              'text-gray-600'
            }`}>{stat.value}</p>
            <p className="text-xs text-gray-600 mt-0.5">{stat.label}</p>
          </div>
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
            {patient.orders.slice(0, 3).map(o => (
              <div key={o.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200 text-xs">
                <div>
                  <p className="font-semibold text-gray-800 truncate max-w-[120px]">{o.medication}</p>
                  <p className="text-gray-500">{format(new Date(o.date), 'MM/dd/yy')} • #{o.receipt}</p>
                </div>
                <Badge className={`text-xs ${
                  o.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  o.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>{o.status}</Badge>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Recent Communications</p>
          <div className="space-y-1.5">
            {patient.communications.slice(0, 3).map(c => (
              <div key={c.id} className="p-2 bg-gray-50 rounded border border-gray-200 text-xs">
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
          <div><p className="text-gray-500">Phone</p><p className="font-semibold text-gray-800">{patient.physician_phone}</p></div>
        </div>
      </div>
    </div>
  );
}

function PrescriptionsTab({ patient }) {
  return (
    <div className="space-y-3">
      {patient.prescriptions.map(rx => (
        <div key={rx.id} className={`p-3 rounded-lg border ${
          rx.refills === 0 ? 'border-red-300 bg-red-50' :
          rx.refills <= 1 ? 'border-yellow-200 bg-yellow-50' :
          'border-gray-200 bg-white'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-gray-900">{rx.name}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1 text-xs text-gray-600">
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
              <Button size="sm" className="h-7 text-xs bg-[#8B1F1F] hover:bg-[#721919] px-3">
                <RefreshCw className="w-3 h-3 mr-1" />
                Request Refill
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function OrdersTab({ patient }) {
  const [expandedOrder, setExpandedOrder] = useState(null);

  return (
    <div className="space-y-2">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="text-xs font-bold text-gray-700">Receipt #</TableHead>
            <TableHead className="text-xs font-bold text-gray-700">Date</TableHead>
            <TableHead className="text-xs font-bold text-gray-700">Medication</TableHead>
            <TableHead className="text-xs font-bold text-gray-700">Amount</TableHead>
            <TableHead className="text-xs font-bold text-gray-700">Status</TableHead>
            <TableHead className="text-xs font-bold text-gray-700">Tracking</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patient.orders.map(o => (
            <React.Fragment key={o.id}>
              <TableRow
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
              >
                <TableCell className="text-xs font-semibold text-[#8B1F1F]">{o.receipt}</TableCell>
                <TableCell className="text-xs">{format(new Date(o.date), 'MM/dd/yyyy')}</TableCell>
                <TableCell className="text-xs font-medium">{o.medication}</TableCell>
                <TableCell className="text-xs">${o.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className={`text-xs ${
                    o.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                    o.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                    o.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>{o.status}</Badge>
                </TableCell>
                <TableCell className="text-xs font-mono truncate max-w-[100px]">{o.tracking}</TableCell>
              </TableRow>
              {expandedOrder === o.id && (
                <TableRow>
                  <TableCell colSpan={6} className="bg-gray-50 p-3">
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div><p className="text-gray-500">Order ID</p><p className="font-semibold">{o.id}</p></div>
                      <div><p className="text-gray-500">Receipt Number</p><p className="font-semibold">{o.receipt}</p></div>
                      <div><p className="text-gray-500">Full Tracking</p><p className="font-mono break-all">{o.tracking}</p></div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
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