import React, { useState } from 'react';
import { Package, TrendingUp, Truck, FileText, Search, X, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { createPageUrl } from '../utils';
import { useNavigate } from 'react-router-dom';
import OrderDetailDialog from '../components/facility/OrderDetailDialog';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data
const mockOrders = [
  { 
    id: '1', 
    order_number: 'ORD-001', 
    patient_name: 'John Smith',
    medication_name: 'Semaglutide',
    order_stage: 'new', 
    payment_status: 'unpaid', 
    total_amount: 250, 
    invoice_id: 'INV-001',
    order_date: '2026-01-28'
  },
  { 
    id: '2', 
    order_number: 'ORD-002', 
    patient_name: 'Sarah Johnson',
    medication_name: 'Tirzepatide',
    order_stage: 'new', 
    payment_status: 'unpaid', 
    total_amount: 180, 
    invoice_id: 'INV-001',
    order_date: '2026-01-28'
  },
  { 
    id: '3', 
    order_number: 'ORD-003', 
    patient_name: 'Mike Davis',
    medication_name: 'Semaglutide',
    order_stage: 'in_process', 
    payment_status: 'unpaid', 
    total_amount: 320, 
    invoice_id: 'INV-002',
    order_date: '2026-01-27'
  },
  { 
    id: '4', 
    order_number: 'ORD-004', 
    patient_name: 'Emily Brown',
    medication_name: 'Tirzepatide',
    order_stage: 'in_process', 
    payment_status: 'paid', 
    total_amount: 150, 
    invoice_id: 'INV-002',
    order_date: '2026-01-27'
  },
  { 
    id: '5', 
    order_number: 'ORD-005', 
    patient_name: 'Robert Wilson',
    medication_name: 'Semaglutide',
    order_stage: 'shipped', 
    payment_status: 'paid', 
    total_amount: 400, 
    invoice_id: 'INV-003',
    order_date: '2026-01-25',
    tracking_number: '773890123456',
    carrier: 'FedEx',
    shipped_date: '2026-01-26',
    estimated_delivery: '2026-01-30'
  },
];

const mockInvoices = [
  {
    id: 'INV-001',
    invoice_number: 'INV-2026-001',
    invoice_date: '2026-01-15',
    billing_period_start: '2026-01-01',
    billing_period_end: '2026-01-15',
    payment_terms: 'Net 30 days',
    bill_to_name: 'DCA Pharmacy',
    bill_from_name: 'Mochi Health Corp.',
    subtotal: 430,
    total_due: 430,
    total_paid: 0,
    status: 'open'
  },
  {
    id: 'INV-002',
    invoice_number: 'INV-2026-002',
    invoice_date: '2026-01-20',
    billing_period_start: '2026-01-16',
    billing_period_end: '2026-01-20',
    payment_terms: 'Net 30 days',
    bill_to_name: 'DCA Pharmacy',
    bill_from_name: 'Mochi Health Corp.',
    subtotal: 470,
    total_due: 470,
    total_paid: 150,
    status: 'partially_paid'
  },
  {
    id: 'INV-003',
    invoice_number: 'INV-2026-003',
    invoice_date: '2026-01-25',
    billing_period_start: '2026-01-21',
    billing_period_end: '2026-01-25',
    payment_terms: 'Net 30 days',
    bill_to_name: 'DCA Pharmacy',
    bill_from_name: 'Mochi Health Corp.',
    subtotal: 400,
    total_due: 400,
    total_paid: 400,
    status: 'paid'
  }
];

export default function FacilityDashboard() {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedOrderStage, setSelectedOrderStage] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    type: 'all',
    amountFrom: '',
    amountTo: '',
    patient: '',
    physician: ''
  });
  const navigate = useNavigate();

  // Filter orders based on search criteria
  const filteredOrders = mockOrders.filter(order => {
    // Date filter
    if (filters.dateFrom && new Date(order.order_date) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(order.order_date) > new Date(filters.dateTo)) return false;
    
    // Type filter
    if (filters.type !== 'all' && order.order_stage !== filters.type) return false;
    
    // Amount filter
    if (filters.amountFrom && order.total_amount < parseFloat(filters.amountFrom)) return false;
    if (filters.amountTo && order.total_amount > parseFloat(filters.amountTo)) return false;
    
    // Patient filter
    if (filters.patient && !order.patient_name.toLowerCase().includes(filters.patient.toLowerCase())) return false;
    
    // Physician filter (would need physician data on orders - for demo purposes)
    // if (filters.physician && !order.physician_name?.toLowerCase().includes(filters.physician.toLowerCase())) return false;
    
    return true;
  });

  const newOrders = filteredOrders.filter(o => o.order_stage === 'new');
  const inProcessOrders = filteredOrders.filter(o => o.order_stage === 'in_process');
  const shippedOrders = filteredOrders.filter(o => o.order_stage === 'shipped');

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      type: 'all',
      amountFrom: '',
      amountTo: '',
      patient: '',
      physician: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v && v !== 'all');

  const handlePayNow = (orderId) => {
    navigate(createPageUrl('FacilityPayment') + `?orderId=${orderId}`);
  };

  const getStatusBadge = (status) => {
    const colors = {
      'open': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'partially_paid': 'bg-blue-100 text-blue-800 border-blue-200',
      'paid': 'bg-green-100 text-green-800 border-green-200',
      'overdue': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPaymentStatusBadge = (status) => {
    const colors = {
      'paid': 'bg-green-100 text-green-800 border-green-200',
      'unpaid': 'bg-red-100 text-red-800 border-red-200',
      'partially_paid': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="relative min-h-screen">
      {/* Parallax Background Elements */}
      <motion.div
        className="absolute top-20 right-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none"
        animate={{
          y: [0, 30, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 left-10 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl pointer-events-none"
        animate={{
          y: [0, -40, 0],
          x: [0, -30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Facility Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview of orders and invoices</p>
          </div>
          
          {/* Global Search */}
          <div className="relative">
            <AnimatePresence>
              {!searchExpanded ? (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setSearchExpanded(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 hover:border-[#1a1f5c] rounded-lg shadow-sm transition-all"
                >
                  <Search className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-semibold text-gray-700">Search & Filter</span>
                  {hasActiveFilters && (
                    <Badge className="bg-[#1a1f5c] text-white">Active</Badge>
                  )}
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute right-0 top-0 w-[600px] bg-white border-2 border-[#1a1f5c] rounded-lg shadow-2xl p-6 z-50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Filter className="w-5 h-5 text-[#1a1f5c]" />
                      <h3 className="text-lg font-bold text-gray-900">Advanced Search & Filters</h3>
                    </div>
                    <button
                      onClick={() => setSearchExpanded(false)}
                      className="p-1 hover:bg-gray-100 rounded transition-all"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Date From</Label>
                        <Input
                          type="date"
                          value={filters.dateFrom}
                          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Date To</Label>
                        <Input
                          type="date"
                          value={filters.dateTo}
                          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Order Type */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Order Type</Label>
                      <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Orders</SelectItem>
                          <SelectItem value="new">New Orders</SelectItem>
                          <SelectItem value="in_process">In Process</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Amount Range */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Amount From ($)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={filters.amountFrom}
                          onChange={(e) => setFilters({ ...filters, amountFrom: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Amount To ($)</Label>
                        <Input
                          type="number"
                          placeholder="10000"
                          value={filters.amountTo}
                          onChange={(e) => setFilters({ ...filters, amountTo: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Patient Search */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Patient Name</Label>
                      <Input
                        placeholder="Search by patient name..."
                        value={filters.patient}
                        onChange={(e) => setFilters({ ...filters, patient: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    {/* Physician Search */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Physician Name</Label>
                      <Input
                        placeholder="Search by physician name..."
                        value={filters.physician}
                        onChange={(e) => setFilters({ ...filters, physician: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={clearFilters}
                        variant="outline"
                        className="flex-1"
                      >
                        Clear All
                      </Button>
                      <Button
                        onClick={() => setSearchExpanded(false)}
                        className="flex-1 bg-[#1a1f5c] hover:bg-[#151a4d] text-white"
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className="border-2 border-blue-200 bg-blue-50 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setSelectedOrderStage('new')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">New Orders</CardTitle>
            <Package className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{newOrders.length}</div>
            <p className="text-xs text-blue-700 mt-1">
              ${newOrders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(2)} total
            </p>
          </CardContent>
        </Card>

        <Card 
          className="border-2 border-orange-200 bg-orange-50 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setSelectedOrderStage('in_process')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">In Process</CardTitle>
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{inProcessOrders.length}</div>
            <p className="text-xs text-orange-700 mt-1">
              ${inProcessOrders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(2)} total
            </p>
          </CardContent>
        </Card>

        <Card 
          className="border-2 border-green-200 bg-green-50 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setSelectedOrderStage('shipped')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Shipped</CardTitle>
            <Truck className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{shippedOrders.length}</div>
            <p className="text-xs text-green-700 mt-1">
              ${shippedOrders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(2)} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Invoices
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockInvoices.map(invoice => (
              <div
                key={invoice.id}
                onClick={() => setSelectedInvoice(invoice)}
                className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{invoice.invoice_number}</p>
                    <p className="text-sm text-gray-600">
                      Period: {format(new Date(invoice.billing_period_start), 'MMM d')} - {format(new Date(invoice.billing_period_end), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {invoice.payment_terms} | {invoice.bill_from_name} → {invoice.bill_to_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">${invoice.total_due.toFixed(2)}</p>
                    <Badge className={`mt-1 ${getStatusBadge(invoice.status)}`}>
                      {invoice.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Orders by Stage Dialog */}
      <Dialog open={!!selectedOrderStage} onOpenChange={() => setSelectedOrderStage(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedOrderStage === 'new' && <><Package className="w-5 h-5 text-blue-600" /> New Orders</>}
              {selectedOrderStage === 'in_process' && <><TrendingUp className="w-5 h-5 text-orange-600" /> In Process Orders</>}
              {selectedOrderStage === 'shipped' && <><Truck className="w-5 h-5 text-green-600" /> Shipped Orders</>}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {mockOrders
              .filter(order => order.order_stage === selectedOrderStage)
              .map(order => (
                <div 
                  key={order.id} 
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 hover:shadow-md transition-all"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-lg font-bold text-gray-900">{order.order_number}</p>
                        <Badge className={`${getPaymentStatusBadge(order.payment_status)}`}>
                          {order.payment_status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Patient:</span> {order.patient_name}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Medication:</span> {order.medication_name}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Order Date: {format(new Date(order.order_date), 'MMM d, yyyy')}
                      </p>
                      
                      {/* FedEx Tracking Info for Shipped Orders */}
                      {order.order_stage === 'shipped' && order.tracking_number && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Truck className="w-4 h-4 text-green-600" />
                            <p className="text-sm font-semibold text-green-900">FedEx Shipment</p>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-700">
                              <span className="font-semibold">Tracking:</span>{' '}
                              <a 
                                href={`https://www.fedex.com/fedextrack/?trknbr=${order.tracking_number}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {order.tracking_number}
                              </a>
                            </p>
                            <p className="text-gray-700">
                              <span className="font-semibold">Shipped:</span> {format(new Date(order.shipped_date), 'MMM d, yyyy')}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-semibold">Est. Delivery:</span> {format(new Date(order.estimated_delivery), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xl font-bold text-gray-900">${order.total_amount.toFixed(2)}</p>
                      {order.payment_status === 'unpaid' && (
                        <button
                          onClick={() => {
                            setSelectedOrderStage(null);
                            handlePayNow(order.id);
                          }}
                          className="mt-2 px-4 py-2 bg-[#1a1f5c] hover:bg-[#151a4d] text-white text-sm font-semibold rounded-lg transition-all"
                        >
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Detail Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Invoice Details - {selectedInvoice?.invoice_number}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Invoice Date</p>
                  <p className="text-sm text-gray-900">{format(new Date(selectedInvoice.invoice_date), 'MMMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Payment Terms</p>
                  <p className="text-sm text-gray-900">{selectedInvoice.payment_terms}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Bill From</p>
                  <p className="text-sm text-gray-900">{selectedInvoice.bill_from_name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Bill To</p>
                  <p className="text-sm text-gray-900">{selectedInvoice.bill_to_name}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Orders in this Invoice</h3>
                <div className="space-y-2">
                  {mockOrders
                    .filter(order => order.invoice_id === selectedInvoice.id)
                    .map(order => (
                      <div 
                        key={order.id} 
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 hover:shadow-md transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{order.order_number}</p>
                            <p className="text-sm text-gray-600">Stage: {order.order_stage.replace('_', ' ')}</p>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <p className="text-lg font-bold text-gray-900">${order.total_amount.toFixed(2)}</p>
                              <Badge className={`text-xs ${getPaymentStatusBadge(order.payment_status)}`}>
                                {order.payment_status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            {order.payment_status === 'unpaid' && (
                              <button
                                onClick={() => handlePayNow(order.id)}
                                className="px-3 py-1 bg-[#1a1f5c] hover:bg-[#151a4d] text-white text-sm font-semibold rounded-lg transition-all"
                              >
                                Pay Now
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Due:</span>
                  <span>${selectedInvoice.total_due.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>Total Paid:</span>
                  <span>${selectedInvoice.total_paid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-green-600 mt-2">
                  <span>Balance Due:</span>
                  <span>${(selectedInvoice.total_due - selectedInvoice.total_paid).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

        {/* Order Detail Dialog */}
        <OrderDetailDialog 
          order={selectedOrder} 
          open={!!selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      </div>
    </div>
  );
}