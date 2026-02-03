import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, DollarSign, Clock, CheckCircle, Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FacilityInvoices() {
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedInvoices, setExpandedInvoices] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    minAmount: '',
    maxAmount: ''
  });

  // Mock data
  const mockInvoices = [
    {
      id: 'INV-001',
      invoice_number: 'INV-2026-001',
      invoice_date: '2026-01-15',
      billing_period_start: '2026-01-01',
      billing_period_end: '2026-01-31',
      total_due: 1250.00,
      total_paid: 0,
      status: 'open',
      bill_to_name: 'DCA Pharmacy',
      orders: [
        { id: 'ORD-001', patient_name: 'J.D.', order_date: '2026-01-10', total_amount: 625.00, payment_status: 'unpaid' },
        { id: 'ORD-002', patient_name: 'S.M.', order_date: '2026-01-12', total_amount: 625.00, payment_status: 'unpaid' }
      ]
    },
    {
      id: 'INV-002',
      invoice_number: 'INV-2026-002',
      invoice_date: '2026-01-20',
      billing_period_start: '2026-01-01',
      billing_period_end: '2026-01-31',
      total_due: 875.50,
      total_paid: 875.50,
      status: 'paid',
      bill_to_name: 'DCA Pharmacy',
      orders: [
        { id: 'ORD-003', patient_name: 'A.J.', order_date: '2026-01-15', total_amount: 875.50, payment_status: 'paid' }
      ]
    }
  ];

  const handleOrderSelect = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleInvoice = (invoiceId) => {
    setExpandedInvoices(prev =>
      prev.includes(invoiceId)
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const clearFilters = () => {
    setFilters({ status: 'all', dateRange: 'all', minAmount: '', maxAmount: '' });
    setSearchTerm('');
  };

  const hasActiveFilters = Object.entries(filters).some(([k, v]) => 
    v && v !== 'all' && (k !== 'minAmount' && k !== 'maxAmount' ? true : v !== '')
  ) || searchTerm;

  const filteredInvoices = mockInvoices.filter(inv => {
    if (filters.status !== 'all' && inv.status !== filters.status) return false;
    if (searchTerm && !inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !inv.bill_to_name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filters.minAmount && inv.total_due < parseFloat(filters.minAmount)) return false;
    if (filters.maxAmount && inv.total_due > parseFloat(filters.maxAmount)) return false;
    return true;
  });

  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.total_due, 0);
  const paidInvoices = filteredInvoices.filter(inv => inv.status === 'paid').length;
  const openInvoices = filteredInvoices.filter(inv => inv.status === 'open').length;
  const totalPaid = filteredInvoices.reduce((sum, inv) => sum + inv.total_paid, 0);

  return (
    <>
      <div className="space-y-6">
        {/* Header with Search */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          </div>

          {/* Invoice-Specific Search */}
          <div className="relative">
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={() => setSearchExpanded(true)}
              className="h-11 w-80 border-2 border-gray-300 cursor-pointer"
            />

            <AnimatePresence>
              {searchExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-14 right-0 bg-white border-2 border-gray-200 rounded-lg shadow-xl p-6 z-50 w-[600px]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Filter className="w-5 h-5 text-[#1a1f5c]" />
                      <h3 className="font-semibold text-lg">Filter Invoices</h3>
                    </div>
                    <button onClick={() => setSearchExpanded(false)} className="p-1 hover:bg-gray-100 rounded-full">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label className="text-sm font-medium mb-2">Status</Label>
                      <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2">Date Range</Label>
                      <Select value={filters.dateRange} onValueChange={(v) => setFilters({...filters, dateRange: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                          <SelectItem value="quarter">This Quarter</SelectItem>
                          <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2">Min Amount</Label>
                      <Input
                        type="number"
                        placeholder="$0.00"
                        value={filters.minAmount}
                        onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2">Max Amount</Label>
                      <Input
                        type="number"
                        placeholder="$10,000.00"
                        value={filters.maxAmount}
                        onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t">
                    <Button variant="outline" onClick={clearFilters} disabled={!hasActiveFilters}>
                      Clear All
                    </Button>
                    <Button 
                      onClick={() => {
                        setSearchExpanded(false);
                        // Filters are already applied via state
                      }} 
                      className="bg-[#1a1f5c]"
                    >
                      Apply Filters & Search
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-2 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <FileText className="w-10 h-10 text-gray-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{filteredInvoices.length}</p>
                  <p className="text-sm text-gray-600">Total Invoices</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <DollarSign className="w-10 h-10 text-gray-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">${formatCurrency(totalRevenue)}</p>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Clock className="w-10 h-10 text-gray-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{openInvoices}</p>
                  <p className="text-sm text-gray-600">Open Invoices</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-10 h-10 text-gray-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">${formatCurrency(totalPaid)}</p>
                  <p className="text-sm text-gray-600">Total Paid</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        <div className="space-y-4">
          {filteredInvoices.map(invoice => {
            const isExpanded = expandedInvoices.includes(invoice.id);
            return (
              <Card key={invoice.id} className="border-2 border-gray-200">
                <CardHeader 
                  className="border-b bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleInvoice(invoice.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
                      <div>
                        <CardTitle className="text-xl">{invoice.invoice_number}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {invoice.bill_to_name} • {invoice.invoice_date} • {invoice.orders.length} {invoice.orders.length === 1 ? 'Order' : 'Orders'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">${formatCurrency(invoice.total_due)}</p>
                        <p className="text-sm text-gray-600">Paid: ${formatCurrency(invoice.total_paid)}</p>
                      </div>
                      <Badge className={
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          {invoice.orders.map(order => (
                            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-4">
                                <Checkbox
                                  checked={selectedOrders.includes(order.id)}
                                  onCheckedChange={() => handleOrderSelect(order.id)}
                                  disabled={order.payment_status === 'paid'}
                                />
                                <div>
                                  <p className="font-semibold">{order.id}</p>
                                  <p className="text-sm text-gray-600">Patient: {order.patient_name} • {order.order_date}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <p className="font-semibold text-lg">${formatCurrency(order.total_amount)}</p>
                                <Badge className={
                                  order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }>
                                  {order.payment_status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>

        {/* Payment Action Bar */}
        {selectedOrders.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <p className="font-semibold text-lg">{selectedOrders.length} order(s) selected</p>
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-2">
                Process Payment
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}