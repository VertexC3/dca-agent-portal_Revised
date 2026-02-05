import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileText, DollarSign, Clock, CheckCircle, Search, X, Filter, ChevronDown, ChevronUp, Download, Share2, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FacilityInvoices() {
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedInvoices, setExpandedInvoices] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState([]);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
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
      invoice_date: '2026-01-31',
      billing_period_start: '2026-01-01',
      billing_period_end: '2026-01-31',
      total_due: 200.00,
      total_paid: 0,
      status: 'open',
      bill_to_name: 'DCA Pharmacy',
      orders: [
        { 
          id: 'ORD-001', 
          account: 'Mochi Health',
          origin_reference: 'Electronic',
          patient_name: 'Jones, Karen',
          prescribed_item_name: 'Tirzepatide + Niacinamide',
          dispensed_item_name: 'Tirzepatide + Niacinamide',
          rx_number: '924314',
          receipt: '883659',
          priority: 'MOCHI-Local ND RXMile',
          accepted_date: '1/28/26 18:11',
          pos_date: '1/28/26 10:42',
          shipped_date: '1/29/26 19:55',
          shipper: 'Inhouse',
          tracking_number: '144RCQ7IMNAA1LOERC6VSF6FK',
          amount: 100.00,
          dca_id: 'DCA-SW1CXw8nNG3ajuU',
          external_id: '74f29080-b88a-4149-8d11-8be3f6648ba9',
          facility_confirmation_date: '1/29/26 20:05',
          facility_confirmation_id: '21679981',
          physician_name: 'Dr. Sarah Mitchell',
          payment_status: 'unpaid'
        },
        { 
          id: 'ORD-002', 
          account: 'Mochi Health',
          origin_reference: 'Electronic',
          patient_name: 'Smith, Michael',
          prescribed_item_name: 'Semaglutide',
          dispensed_item_name: 'Semaglutide',
          rx_number: '924315',
          receipt: '883660',
          priority: 'MOCHI-Local ND RXMile',
          accepted_date: '1/28/26 19:20',
          pos_date: '1/28/26 11:30',
          shipped_date: '1/29/26 20:10',
          shipper: 'Inhouse',
          tracking_number: '144RCQ7IMNAA1LOERC6VSF6FL',
          amount: 100.00,
          dca_id: 'DCA-TX2DYx9oOH4bkvV',
          external_id: '85g30191-c99b-5250-9e22-9cf4g7759ca0',
          facility_confirmation_date: '1/29/26 20:15',
          facility_confirmation_id: '21679982',
          physician_name: 'Dr. James Wilson',
          payment_status: 'unpaid'
        }
      ]
    },
    {
      id: 'INV-002',
      invoice_number: 'INV-2026-002',
      invoice_date: '2026-01-31',
      billing_period_start: '2026-01-01',
      billing_period_end: '2026-01-31',
      total_due: 150.00,
      total_paid: 150.00,
      status: 'paid',
      bill_to_name: 'DCA Pharmacy',
      orders: [
        { 
          id: 'ORD-003', 
          account: 'Mochi Health',
          origin_reference: 'Electronic',
          patient_name: 'Anderson, Julie',
          prescribed_item_name: 'Tirzepatide',
          dispensed_item_name: 'Tirzepatide',
          rx_number: '924316',
          receipt: '883661',
          priority: 'MOCHI-Local ND RXMile',
          accepted_date: '1/27/26 15:45',
          pos_date: '1/27/26 09:20',
          shipped_date: '1/28/26 18:30',
          shipper: 'Inhouse',
          tracking_number: '144RCQ7IMNAA1LOERC6VSF6FM',
          amount: 150.00,
          dca_id: 'DCA-UY3EZy0pPI5clwW',
          external_id: '96h41202-d00c-6361-0f33-0dg5h8860db1',
          facility_confirmation_date: '1/28/26 18:40',
          facility_confirmation_id: '21679980',
          physician_name: 'Dr. Emily Chen',
          payment_status: 'paid'
        }
      ]
    }
  ];

  const handleInvoiceSelect = (invoiceId) => {
    setSelectedInvoices(prev =>
      prev.includes(invoiceId)
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

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

  const toggleOrder = (orderId) => {
    setExpandedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleExportInvoices = (format) => {
    console.log(`Exporting all invoices as ${format.toUpperCase()}`);
    alert(`Exporting ${filteredInvoices.length} invoice(s) as ${format.toUpperCase()}`);
  };

  const handleDownloadInvoices = () => {
    const selectedData = mockInvoices.filter(inv => selectedInvoices.includes(inv.id));
    console.log('Downloading invoices:', selectedData);
    alert(`Downloading ${selectedInvoices.length} invoice(s)`);
  };

  const handleShareInvoices = () => {
    setShowShareDialog(true);
  };

  const handleSendEmail = () => {
    console.log('Sending invoices to:', shareEmail);
    alert(`Invoices shared with ${shareEmail}`);
    setShowShareDialog(false);
    setShareEmail('');
  };

  const handlePayOutstanding = () => {
    const selectedData = mockInvoices.filter(inv => selectedInvoices.includes(inv.id) && inv.status === 'open');
    const total = selectedData.reduce((sum, inv) => sum + (inv.total_due - inv.total_paid), 0);
    console.log('Processing payment for:', selectedData);
    alert(`Processing payment of $${formatCurrency(total)}`);
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

          <div className="flex items-center gap-3">
            {/* Export Icon with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="border-2">
                  <Download className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem onClick={() => handleExportInvoices('xlsx')} className="cursor-pointer">
                  Export as Excel (XLSX)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportInvoices('pdf')} className="cursor-pointer">
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
              </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-2 border-gray-200 overflow-hidden">
            <CardContent className="p-6">
              <div className="min-w-0">
                <p className="text-2xl font-bold text-gray-900 truncate">{filteredInvoices.length}</p>
                <p className="text-sm text-gray-600 truncate">Total Invoices</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 overflow-hidden">
            <CardContent className="p-6">
              <div className="min-w-0">
                <p className="text-2xl font-bold text-gray-900 truncate">${formatCurrency(totalRevenue)}</p>
                <p className="text-sm text-gray-600 truncate">Total Revenue</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 overflow-hidden">
            <CardContent className="p-6">
              <div className="min-w-0">
                <p className="text-2xl font-bold text-gray-900 truncate">{openInvoices}</p>
                <p className="text-sm text-gray-600 truncate">Open Invoices</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 overflow-hidden">
            <CardContent className="p-6">
              <div className="min-w-0">
                <p className="text-2xl font-bold text-gray-900 truncate">${formatCurrency(totalPaid)}</p>
                <p className="text-sm text-gray-600 truncate">Total Paid</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        <div className="space-y-2">
          {/* Select All Row */}
          <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
            <Checkbox
              checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedInvoices(filteredInvoices.map(inv => inv.id));
                } else {
                  setSelectedInvoices([]);
                }
              }}
              className="flex-shrink-0"
            />
            <p className="font-semibold text-gray-700">
              Select All ({filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''})
            </p>
          </div>

          {filteredInvoices.map(invoice => {
            const isExpanded = expandedInvoices.includes(invoice.id);
            const isSelected = selectedInvoices.includes(invoice.id);
            return (
              <Card key={invoice.id} className="border-2 border-gray-200 overflow-hidden">
                <div 
                  className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors h-16 ${isSelected ? 'bg-blue-50' : ''}`}
                  onClick={(e) => {
                    if (e.target.type !== 'checkbox') {
                      toggleInvoice(invoice.id);
                    }
                  }}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleInvoiceSelect(invoice.id)}
                    className="flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{invoice.invoice_number}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 truncate">{invoice.bill_to_name}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-sm text-gray-600">{invoice.invoice_date}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-sm text-gray-600">{invoice.orders.length} {invoice.orders.length === 1 ? 'Order' : 'Orders'}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="font-bold text-gray-900">${formatCurrency(invoice.total_due)}</p>
                    <p className="text-xs text-gray-600">Paid: ${formatCurrency(invoice.total_paid)}</p>
                  </div>
                  <Badge className={
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {invoice.status}
                  </Badge>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="border-t bg-gray-50 p-4">
                        <div className="space-y-2">
                          {invoice.orders.map(order => {
                            const isOrderExpanded = expandedOrders.includes(order.id);
                            return (
                              <div key={order.id}>
                                <div 
                                  className="flex items-center gap-4 p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                  onClick={() => toggleOrder(order.id)}
                                >
                                  {isOrderExpanded ? <ChevronUp className="w-4 h-4 text-gray-600 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-600 flex-shrink-0" />}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{order.patient_name}</p>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-600 truncate">{order.prescribed_item_name}</p>
                                  </div>
                                  <div className="flex-shrink-0">
                                    <p className="text-sm text-gray-600">Rx: {order.rx_number}</p>
                                  </div>
                                  <div className="flex-shrink-0">
                                    <p className="font-semibold text-gray-900">${formatCurrency(order.amount)}</p>
                                  </div>
                                  <Badge className={
                                    order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                                  }>
                                    {order.payment_status}
                                  </Badge>
                                </div>

                                <AnimatePresence>
                                  {isOrderExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <div className="ml-8 mt-2 p-4 bg-white border border-gray-200 rounded-lg">
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                          <div>
                                            <p className="font-semibold text-gray-700">Account</p>
                                            <p className="text-gray-600">{order.account}</p>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-gray-700">Origin Reference</p>
                                            <p className="text-gray-600">{order.origin_reference}</p>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-gray-700">Physician</p>
                                            <p className="text-gray-600">{order.physician_name}</p>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-gray-700">Dispensed Item</p>
                                            <p className="text-gray-600">{order.dispensed_item_name}</p>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-gray-700">Receipt</p>
                                            <p className="text-gray-600">{order.receipt}</p>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-gray-700">Priority</p>
                                            <p className="text-gray-600">{order.priority}</p>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-gray-700">Accepted Date</p>
                                            <p className="text-gray-600">{order.accepted_date}</p>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-gray-700">POS Date</p>
                                            <p className="text-gray-600">{order.pos_date}</p>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-gray-700">Shipped Date</p>
                                            <p className="text-gray-600">{order.shipped_date}</p>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-gray-700">Shipper</p>
                                            <p className="text-gray-600">{order.shipper}</p>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-gray-700">Tracking Number</p>
                                            <p className="text-gray-600">{order.tracking_number}</p>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-gray-700">DCA ID</p>
                                            <p className="text-gray-600">{order.dca_id}</p>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-gray-700">External ID</p>
                                            <p className="text-gray-600 truncate" title={order.external_id}>{order.external_id}</p>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-gray-700">Facility Confirmation Date</p>
                                            <p className="text-gray-600">{order.facility_confirmation_date}</p>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-gray-700">Facility Confirmation ID</p>
                                            <p className="text-gray-600">{order.facility_confirmation_id}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>

        {/* Global Actions Bar */}
        {selectedInvoices.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <p className="font-semibold text-lg">{selectedInvoices.length} invoice(s) selected</p>
              <div className="flex gap-3">
                <Button 
                  onClick={handlePayOutstanding} 
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay Outstanding
                </Button>
                <Button 
                  onClick={handleDownloadInvoices}
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button 
                  onClick={handleShareInvoices}
                  variant="outline"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Invoices via Email</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="email" className="text-sm font-medium mb-2">Recipient Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendEmail}
                disabled={!shareEmail}
                className="bg-[#1a1f5c]"
              >
                Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}