import React, { useState } from 'react';
import { AlertTriangle, Package, CreditCard, Clock, ChevronRight, CheckCircle2, RefreshCw, TrendingUp, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, differenceInDays } from 'date-fns';
import { usePatients } from '@/hooks/usePatients';

// ─── Derive priority data from patients ────────────────────────────────────

function buildDashboardData(patients) {
  const pendingExceptions = [];
  const overdueShipments = [];
  const unprocessedPayments = [];

  const today = new Date();

  for (const patient of patients) {
    // Pending exceptions: orders with no tracking or stuck in Processing
    for (const order of patient.orders) {
      if (order.tracking === 'Pending' || order.status === 'Processing') {
        const daysAgo = differenceInDays(today, new Date(order.date));
        pendingExceptions.push({ patient, order, daysAgo });
      }
    }

    // Overdue shipments: In Progress/In Transit past est_delivery, or In Transit > 5 days
    for (const order of patient.orders) {
      if (order.status === 'In Progress' && order.est_delivery) {
        const daysOverdue = differenceInDays(today, new Date(order.est_delivery));
        if (daysOverdue >= 0) {
          overdueShipments.push({ patient, order, daysOverdue });
        }
      }
      if (order.status === 'In Transit') {
        const daysInTransit = differenceInDays(today, new Date(order.date));
        if (daysInTransit > 5) {
          overdueShipments.push({ patient, order, daysOverdue: daysInTransit - 5 });
        }
      }
    }

    // Unprocessed payments: open or partially_paid invoices
    for (const inv of (patient.invoices || [])) {
      if (inv.status === 'open' || inv.status === 'partially_paid') {
        const daysAgo = differenceInDays(today, new Date(inv.date));
        unprocessedPayments.push({ patient, invoice: inv, daysAgo });
      }
    }
  }

  return { pendingExceptions, overdueShipments, unprocessedPayments };
}

// ─── Summary stat card ─────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, count, color, onClick, active }) {
  const colors = {
    red:    { bg: 'bg-red-50',    border: active ? 'border-red-400' : 'border-red-200',    icon: 'text-red-500',    count: 'text-red-600',    ring: 'ring-red-200' },
    yellow: { bg: 'bg-yellow-50', border: active ? 'border-yellow-400' : 'border-yellow-200', icon: 'text-yellow-500', count: 'text-yellow-600', ring: 'ring-yellow-200' },
    blue:   { bg: 'bg-blue-50',   border: active ? 'border-blue-400' : 'border-blue-200',   icon: 'text-blue-500',   count: 'text-blue-600',   ring: 'ring-blue-200' },
  };
  const c = colors[color];

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-xl border-2 ${c.bg} ${c.border} transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.99] text-left w-full ${active ? `ring-2 ${c.ring}` : ''}`}
    >
      <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <div>
        <p className={`text-2xl font-bold ${c.count}`}>{count}</p>
        <p className="text-xs font-semibold text-gray-600">{label}</p>
      </div>
      <ChevronRight className={`w-4 h-4 ml-auto ${c.icon} opacity-60`} />
    </button>
  );
}

// ─── Row components ────────────────────────────────────────────────────────

function PatientAvatar({ patient }) {
  return patient.profile_picture ? (
    <img src={patient.profile_picture} alt={patient.name} className="w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0" />
  ) : (
    <div className="w-8 h-8 rounded-full bg-[#8B1F1F] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      {patient.name.charAt(0)}
    </div>
  );
}

function ExceptionRow({ patient, order, daysAgo, onSelect }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
      <PatientAvatar patient={patient} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-900">{patient.name}</span>
          <span className="text-xs text-[#8B1F1F] font-semibold">{order.id}</span>
        </div>
        <p className="text-xs text-gray-600 truncate">{order.medication}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Ordered {format(new Date(order.date), 'MMM d')} · {daysAgo}d ago · Tracking: <span className="font-mono">{order.tracking}</span>
        </p>
      </div>
      <Badge className="bg-orange-100 text-orange-800 flex-shrink-0">{order.status}</Badge>
      <Button size="sm" variant="outline" className="h-7 text-xs flex-shrink-0" onClick={() => onSelect(patient)}>
        View <ChevronRight className="w-3 h-3 ml-0.5" />
      </Button>
    </div>
  );
}

function ShipmentRow({ patient, order, daysOverdue, onSelect }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
      <PatientAvatar patient={patient} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-900">{patient.name}</span>
          <span className="text-xs text-[#8B1F1F] font-semibold">{order.id}</span>
        </div>
        <p className="text-xs text-gray-600 truncate">{order.medication}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {order.est_delivery
            ? `Est. delivery was ${format(new Date(order.est_delivery), 'MMM d')} · ${daysOverdue}d overdue`
            : `In transit for ${daysOverdue + 5}d · Tracking: ${order.tracking}`
          }
        </p>
      </div>
      <Badge className="bg-red-100 text-red-800 flex-shrink-0">
        {daysOverdue > 0 ? `${daysOverdue}d late` : 'Due today'}
      </Badge>
      <Button size="sm" variant="outline" className="h-7 text-xs flex-shrink-0" onClick={() => onSelect(patient)}>
        View <ChevronRight className="w-3 h-3 ml-0.5" />
      </Button>
    </div>
  );
}

function PaymentRow({ patient, invoice, daysAgo, onSelect }) {
  const outstanding = invoice.amount - (invoice.paid || 0);
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
      <PatientAvatar patient={patient} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-900">{patient.name}</span>
          <span className="text-xs text-[#8B1F1F] font-semibold">{invoice.number}</span>
        </div>
        <p className="text-xs text-gray-600">Balance due: <strong className="text-red-700">${outstanding.toFixed(2)}</strong>
          {invoice.paid > 0 && <span className="text-gray-400"> (${invoice.paid.toFixed(2)} paid)</span>}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">Issued {format(new Date(invoice.date), 'MMM d')} · {daysAgo}d ago</p>
      </div>
      <Badge className={`flex-shrink-0 ${invoice.status === 'partially_paid' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
        {invoice.status === 'partially_paid' ? 'Partial' : 'Unpaid'}
      </Badge>
      <Button size="sm" variant="outline" className="h-7 text-xs flex-shrink-0" onClick={() => onSelect(patient)}>
        Collect <ChevronRight className="w-3 h-3 ml-0.5" />
      </Button>
    </div>
  );
}

// ─── Section panel ─────────────────────────────────────────────────────────

function SectionPanel({ title, icon: Icon, iconColor, emptyText, children, count }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">{title}</h3>
        <span className="ml-auto text-xs font-bold text-gray-500 bg-gray-200 rounded-full px-2 py-0.5">{count}</span>
      </div>
      {count === 0 ? (
        <div className="px-4 py-6 text-center">
          <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-1.5" />
          <p className="text-xs text-gray-400">{emptyText}</p>
        </div>
      ) : children}
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────

export default function AgentDashboard({ onSelectPatient }) {
  const { patients } = usePatients();
  const { pendingExceptions, overdueShipments, unprocessedPayments } = buildDashboardData(patients);
  const [activeSection, setActiveSection] = useState(null);

  const totalUrgent = pendingExceptions.length + overdueShipments.length + unprocessedPayments.length;

  const sections = [
    { key: 'exceptions', label: 'Pending Exceptions', color: 'yellow', icon: AlertTriangle, count: pendingExceptions.length },
    { key: 'shipments',  label: 'Overdue Shipments',  color: 'red',    icon: Package,       count: overdueShipments.length },
    { key: 'payments',   label: 'Unprocessed Payments', color: 'blue', icon: CreditCard,    count: unprocessedPayments.length },
  ];

  const visibleSection = activeSection || (pendingExceptions.length > 0 ? 'exceptions' : overdueShipments.length > 0 ? 'shipments' : 'payments');

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gray-50 p-5 gap-5">

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Agent Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {totalUrgent > 0
              ? <span className="text-red-600 font-semibold">{totalUrgent} urgent item{totalUrgent !== 1 ? 's' : ''} need attention</span>
              : <span className="text-green-600 font-semibold">All clear — no urgent items</span>
            }
            <span className="text-gray-400 ml-2">· {patients.length} patients · {patients.reduce((a, p) => a + p.orders.length, 0)} total orders</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Updated just now</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sections.map(s => (
          <StatCard
            key={s.key}
            icon={s.icon}
            label={s.label}
            count={s.count}
            color={s.color}
            active={visibleSection === s.key}
            onClick={() => setActiveSection(s.key)}
          />
        ))}
      </div>

      {/* Detail Panel */}
      {visibleSection === 'exceptions' && (
        <SectionPanel
          title="Pending Exceptions"
          icon={AlertTriangle}
          iconColor="text-yellow-500"
          emptyText="No pending exceptions"
          count={pendingExceptions.length}
        >
          {pendingExceptions.map(({ patient, order, daysAgo }) => (
            <ExceptionRow key={order.id} patient={patient} order={order} daysAgo={daysAgo} onSelect={onSelectPatient} />
          ))}
        </SectionPanel>
      )}

      {visibleSection === 'shipments' && (
        <SectionPanel
          title="Overdue Shipments"
          icon={Package}
          iconColor="text-red-500"
          emptyText="No overdue shipments"
          count={overdueShipments.length}
        >
          {overdueShipments.map(({ patient, order, daysOverdue }) => (
            <ShipmentRow key={order.id} patient={patient} order={order} daysOverdue={daysOverdue} onSelect={onSelectPatient} />
          ))}
        </SectionPanel>
      )}

      {visibleSection === 'payments' && (
        <SectionPanel
          title="Unprocessed Payments"
          icon={CreditCard}
          iconColor="text-blue-500"
          emptyText="No outstanding payments"
          count={unprocessedPayments.length}
        >
          {unprocessedPayments.map(({ patient, invoice, daysAgo }) => (
            <PaymentRow key={invoice.id} patient={patient} invoice={invoice} daysAgo={daysAgo} onSelect={onSelectPatient} />
          ))}
        </SectionPanel>
      )}

      {/* All Patients Quick Access */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
          <Users className="w-4 h-4 text-gray-500" />
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">All Patients</h3>
          <span className="ml-auto text-xs font-bold text-gray-500 bg-gray-200 rounded-full px-2 py-0.5">{patients.length}</span>
        </div>
        <div className="divide-y divide-gray-100">
          {patients.map(patient => {
            const openInvCount = patient.invoices?.filter(i => i.status !== 'paid').length || 0;
            const lowRx = patient.prescriptions.filter(r => r.refills <= 1).length;
            return (
              <button
                key={patient.id}
                onClick={() => onSelectPatient(patient)}
                className="w-full flex flex-col gap-2 sm:flex-row sm:items-center px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                <PatientAvatar patient={patient} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900">{patient.name}</p>
                  <p className="text-xs text-gray-500 truncate">{patient.email} · {patient.phone}</p>
                </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:flex-shrink-0 pl-11 sm:pl-0">
                  {openInvCount > 0 && <Badge className="bg-red-100 text-red-700 text-xs">{openInvCount} invoice{openInvCount > 1 ? 's' : ''}</Badge>}
                  {lowRx > 0 && <Badge className="bg-yellow-100 text-yellow-700 text-xs">{lowRx} low Rx</Badge>}
                  <Badge className="bg-gray-100 text-gray-600 text-xs">{patient.orders.length} orders</Badge>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}