import React, { useState } from 'react';
import { Zap, RefreshCw, Truck, Mail, Phone, Send, MessageSquare, CheckCircle2, ChevronDown, ChevronUp, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MACROS = [
  {
    id: 'refill_approved',
    label: 'Refill Approved',
    icon: RefreshCw,
    color: 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100',
    iconColor: 'text-green-600',
    message: 'Your prescription refill has been approved and is being processed. You will receive a shipping notification within 1–2 business days.',
  },
  {
    id: 'order_in_transit',
    label: 'Order In Transit',
    icon: Truck,
    color: 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100',
    iconColor: 'text-blue-600',
    message: 'Your order is currently in transit and on track for delivery within your estimated delivery window. Please use your tracking number to monitor progress.',
  },
  {
    id: 'billing_followup',
    label: 'Billing Follow-Up',
    icon: Mail,
    color: 'bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100',
    iconColor: 'text-yellow-600',
    message: 'We noticed you have an outstanding balance on your account. Please contact our billing team or log in to the patient portal to settle your invoice.',
  },
  {
    id: 'side_effects_support',
    label: 'Side Effects Support',
    icon: MessageSquare,
    color: 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100',
    iconColor: 'text-red-600',
    message: 'We\'re sorry to hear you\'re experiencing side effects. These are often temporary. Please eat a small meal before your injection and stay hydrated. Contact your prescriber if symptoms persist.',
  },
  {
    id: 'schedule_callback',
    label: 'Schedule Callback',
    icon: Phone,
    color: 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100',
    iconColor: 'text-purple-600',
    message: 'A customer service agent will call you back within 1 business day to address your inquiry.',
  },
  {
    id: 'escalate_ai',
    label: 'Escalate to AI Agent',
    icon: Bot,
    color: 'bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100',
    iconColor: 'text-orange-600',
    message: 'Your inquiry has been routed to our AI Agent for immediate automated assistance. A human representative will follow up if further support is needed.',
  },
];

export default function QuickActionMacros({ patient, onStartWorkflow }) {
  const [expanded, setExpanded] = useState(true);
  const [firedMacros, setFiredMacros] = useState({});
  const [previewMacro, setPreviewMacro] = useState(null);

  const fire = (macro) => {
    setFiredMacros(prev => ({ ...prev, [macro.id]: true }));
    setPreviewMacro(null);
    setTimeout(() => setFiredMacros(prev => ({ ...prev, [macro.id]: false })), 3000);
  };

  const handleWorkflowClick = (workflowType) => {
    if (workflowType === 'refill_approved') {
      onStartWorkflow?.('refill', { selectedRx: [] });
    } else if (workflowType === 'order_in_transit') {
      onStartWorkflow?.('shipment', { selectedOrder: patient?.orders?.[0] });
    } else if (workflowType === 'billing_followup') {
      onStartWorkflow?.('payment', { cartTotal: 0 });
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-[#8B1F1F]" />
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Quick Action Macros</span>
          <Badge className="bg-gray-200 text-gray-700 text-xs px-1.5 py-0">{MACROS.length}</Badge>
        </div>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
      </button>

      {expanded && (
        <div className="p-3 space-y-2 bg-white">
          <p className="text-xs text-gray-400">Click a macro to preview, then confirm to send to {patient?.name?.split(' ')[0] || 'patient'}.</p>
          <div className="grid grid-cols-2 gap-2">
            {MACROS.map(macro => {
              const Icon = macro.icon;
              const fired = firedMacros[macro.id];
              const isPreviewing = previewMacro?.id === macro.id;
              const isWorkflowMacro = ['refill_approved', 'order_in_transit', 'billing_followup'].includes(macro.id);
              return (
                <button
                  key={macro.id}
                  onClick={() => isWorkflowMacro ? handleWorkflowClick(macro.id) : setPreviewMacro(isPreviewing ? null : macro)}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left transition-all text-xs font-semibold ${macro.color} ${isPreviewing ? 'ring-2 ring-offset-1 ring-[#8B1F1F]' : ''}`}
                >
                  {fired ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Icon className={`w-3.5 h-3.5 ${macro.iconColor} flex-shrink-0`} />
                  )}
                  <span className={fired ? 'text-green-700' : ''}>{fired ? 'Sent!' : macro.label}</span>
                </button>
              );
            })}
          </div>

          {/* Preview panel */}
          {previewMacro && (
            <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
              <p className="text-xs font-bold text-gray-700">Preview message:</p>
              <p className="text-xs text-gray-600 italic">"{previewMacro.message}"</p>
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  className="h-7 text-xs bg-[#8B1F1F] hover:bg-[#721919] flex-1"
                  onClick={() => fire(previewMacro)}
                >
                  <Send className="w-3 h-3 mr-1" /> Send via Text
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs flex-1"
                  onClick={() => fire(previewMacro)}
                >
                  <Mail className="w-3 h-3 mr-1" /> Send via Email
                </Button>
                <button
                  onClick={() => setPreviewMacro(null)}
                  className="text-xs text-gray-400 hover:text-gray-600 px-1"
                >Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}