import React, { useState } from 'react';
import { Package, TrendingUp, Truck, FileText, Download, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, subDays } from 'date-fns';
import { createPageUrl } from '../utils';
import { useNavigate } from 'react-router-dom';
import OrderDetailDialog from '../components/facility/OrderDetailDialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data
const mockOrders = [
  { id: '1', order_number: 'ORD-001', patient_name: 'John Smith', medication_name: 'Semaglutide', order_stage: 'new', payment_status: 'unpaid', total_amount: 250, invoice_id: 'INV-001', order_date: '2026-01-28' },
  { id: '2', order_number: 'ORD-002', patient_name: 'Sarah Johnson', medication_name: 'Tirzepatide', order_stage: 'new', payment_status: 'unpaid', total_amount: 180, invoice_id: 'INV-001', order_date: '2026-01-28' },
  { id: '3', order_number: 'ORD-003', patient_name: 'Mike Davis', medication_name: 'Semaglutide', order_stage: 'in_process', payment_status: 'unpaid', total_amount: 320, invoice_id: 'INV-002', order_date: '2026-01-27' },
  { id: '4', order_number: 'ORD-004', patient_name: 'Emily Brown', medication_name: 'Tirzepatide', order_stage: 'in_process', payment_status: 'paid', total_amount: 150, invoice_id: 'INV-002', order_date: '2026-01-27' },
  { id: '5', order_number: 'ORD-005', patient_name: 'Robert Wilson', medication_name: 'Semaglutide', order_stage: 'shipped', payment_status: 'paid', total_amount: 400, invoice_id: 'INV-003', order_date: '2026-01-25', tracking_number: '773890123456', carrier: 'FedEx', shipped_date: '2026-01-26', estimated_delivery: '2026-01-30' },
];

const mockInvoices = [
  { id: 'INV-001', invoice_number: 'INV-2026-001', invoice_date: '2026-01-15', billing_period_start: '2026-01-01', billing_period_end: '2026-01-15', payment_terms: 'Net 30 days', bill_to_name: 'DCA Pharmacy', bill_from_name: 'Mochi Health Corp.', subtotal: 430, total_due: 430, total_paid: 0, status: 'open' },
  { id: 'INV-002', invoice_number: 'INV-2026-002', invoice_date: '2026-01-20', billing_period_start: '2026-01-16', billing_period_end: '2026-01-20', payment_terms: 'Net 30 days', bill_to_name: 'DCA Pharmacy', bill_from_name: 'Mochi Health Corp.', subtotal: 470, total_due: 470, total_paid: 150, status: 'partially_paid' },
  { id: 'INV-003', invoice_number: 'INV-2026-003', invoice_date: '2026-01-25', billing_period_start: '2026-01-21', billing_period_end: '2026-01-25', payment_terms: 'Net 30 days', bill_to_name: 'DCA Pharmacy', bill_from_name: 'Mochi Health Corp.', subtotal: 400, total_due: 400, total_paid: 400, status: 'paid' }
];

export default function FacilityDashboard() {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedOrderStage, setSelectedOrderStage] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [exportingInvoice, setExportingInvoice] = useState(null);
  const [chartView, setChartView] = useState('orders');
  const navigate = useNavigate();

  const handleExportInvoicePDF = (invoice) => {
    alert(`Exporting invoice ${invoice.invoice_number} to PDF...`);
    setExportingInvoice(null);
  };

  const handleExportInvoiceExcel = (invoice) => {
    alert(`Exporting invoice ${invoice.invoice_number} to Excel...`);
    setExportingInvoice(null);
  };

  const newOrders = mockOrders.filter(o => o.order_stage === 'new');
  const inProcessOrders = mockOrders.filter(o => o.order_stage === 'in_process');
  const shippedOrders = mockOrders.filter(o => o.order_stage === 'shipped');

  const handleExportPDF = () => {
    alert('Exporting to PDF... (Feature in development)');
  };

  const handleExportExcel = () => {
    alert('Exporting to Excel... (Feature in development)');
  };

  const handleRefresh = () => {
    alert('Dashboard refreshed!');
  };

  const handlePayNow = (orderId) => {
    navigate(createPageUrl('FacilityInvoices') + `?orderId=${orderId}`);
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

  // Generate chart data for last 30 days
  const generateChartData = () => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'MMM d');
      
      // Generate random data for demonstration
      const ordersCount = Math.floor(Math.random() * 10) + 1;
      const invoicesCount = Math.floor(Math.random() * 3) + 1;
      
      data.push({
        date: dateStr,
        orders: ordersCount,
        invoices: invoicesCount
      });
    }
    return data;
  };

  const chartData = generateChartData();

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Facility Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 border-2 border-gray-300 hover:border-[#1a1f5c]">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer">
                  <FileText className="w-4 h-4 mr-2" />
                  Export to PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportExcel} className="cursor-pointer">
                  <FileText className="w-4 h-4 mr-2" />
                  Export to Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Refresh Button */}
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="border-2 border-gray-300 hover:border-[#1a1f5c]"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-gray-200 cursor-pointer hover:border-gray-400 transition-all" onClick={() => setSelectedOrderStage('new')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">New Orders</CardTitle>
            <Package className="w-5 h-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{newOrders.length}</div>
            <p className="text-xs text-gray-600 mt-1">${newOrders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(2)} total</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200 cursor-pointer hover:border-gray-400 transition-all" onClick={() => setSelectedOrderStage('in_process')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">In Process</CardTitle>
            <TrendingUp className="w-5 h-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{inProcessOrders.length}</div>
            <p className="text-xs text-gray-600 mt-1">${inProcessOrders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(2)} total</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200 cursor-pointer hover:border-gray-400 transition-all" onClick={() => setSelectedOrderStage('shipped')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Shipped</CardTitle>
            <Truck className="w-5 h-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{shippedOrders.length}</div>
            <p className="text-xs text-gray-600 mt-1">${shippedOrders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(2)} total</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart - Orders/Invoices Over Time */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Last 30 Days</CardTitle>
            <Tabs value={chartView} onValueChange={setChartView}>
              <TabsList>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                />
                <Bar 
                  dataKey={chartView} 
                  fill={chartView === 'orders' ? '#1a1f5c' : '#3b82f6'} 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Invoices</CardTitle>
            <a href={createPageUrl('FacilityInvoices')} className="text-sm text-[#1a1f5c] hover:underline font-medium">
              View all
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockInvoices.map(invoice => (
              <div key={invoice.id} className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{invoice.invoice_number}</p>
                    <p className="text-sm text-gray-600">
                      Period: {format(new Date(invoice.billing_period_start), 'MMM d')} - {format(new Date(invoice.billing_period_end), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">${invoice.total_due.toFixed(2)}</p>
                      <Badge className={`mt-1 ${getStatusBadge(invoice.status)}`}>
                        {invoice.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedInvoice(invoice)}
                        className="border-[#1a1f5c] text-[#1a1f5c] hover:bg-[#1a1f5c] hover:text-white"
                      >
                        View Details
                      </Button>
                      <DropdownMenu open={exportingInvoice === invoice.id} onOpenChange={(open) => setExportingInvoice(open ? invoice.id : null)}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="border-gray-300">
                            <Download className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleExportInvoicePDF(invoice)} className="cursor-pointer">
                            <FileText className="w-4 h-4 mr-2" />
                            Export to PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportInvoiceExcel(invoice)} className="cursor-pointer">
                            <FileText className="w-4 h-4 mr-2" />
                            Export to Excel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
            {mockOrders.filter(order => order.order_stage === selectedOrderStage).map(order => (
              <div key={order.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100" onClick={() => setSelectedOrder(order)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-lg font-bold text-gray-900">{order.order_number}</p>
                      <Badge className={`${getPaymentStatusBadge(order.payment_status)}`}>
                        {order.payment_status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700"><span className="font-semibold">Patient:</span> {order.patient_name}</p>
                    <p className="text-sm text-gray-700"><span className="font-semibold">Medication:</span> {order.medication_name}</p>
                    <p className="text-sm text-gray-600 mt-1">Order Date: {format(new Date(order.order_date), 'MMM d, yyyy')}</p>
                    
                    {order.order_stage === 'shipped' && order.tracking_number && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Truck className="w-4 h-4 text-green-600" />
                          <p className="text-sm font-semibold text-green-900">FedEx Shipment</p>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-700"><span className="font-semibold">Tracking:</span> <a href={`https://www.fedex.com/fedextrack/?trknbr=${order.tracking_number}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{order.tracking_number}</a></p>
                          <p className="text-gray-700"><span className="font-semibold">Shipped:</span> {format(new Date(order.shipped_date), 'MMM d, yyyy')}</p>
                          <p className="text-gray-700"><span className="font-semibold">Est. Delivery:</span> {format(new Date(order.estimated_delivery), 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xl font-bold text-gray-900">${order.total_amount.toFixed(2)}</p>
                    {order.payment_status === 'unpaid' && (
                      <button onClick={() => { setSelectedOrderStage(null); handlePayNow(order.id); }} className="mt-2 px-4 py-2 bg-[#1a1f5c] hover:bg-[#151a4d] text-white text-sm font-semibold rounded-lg transition-all">
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
                <div><p className="text-sm font-semibold text-gray-700">Invoice Date</p><p className="text-sm text-gray-900">{format(new Date(selectedInvoice.invoice_date), 'MMMM d, yyyy')}</p></div>
                <div><p className="text-sm font-semibold text-gray-700">Payment Terms</p><p className="text-sm text-gray-900">{selectedInvoice.payment_terms}</p></div>
                <div><p className="text-sm font-semibold text-gray-700">Bill From</p><p className="text-sm text-gray-900">{selectedInvoice.bill_from_name}</p></div>
                <div><p className="text-sm font-semibold text-gray-700">Bill To</p><p className="text-sm text-gray-900">{selectedInvoice.bill_to_name}</p></div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Orders in this Invoice</h3>
                <div className="space-y-2">
                  {mockOrders.filter(order => order.invoice_id === selectedInvoice.id).map(order => (
                    <div key={order.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{order.order_number}</p>
                          <p className="text-sm text-gray-600">Stage: {order.order_stage.replace('_', ' ')}</p>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <p className="text-lg font-bold text-gray-900">${order.total_amount.toFixed(2)}</p>
                            <Badge className={`text-xs ${getPaymentStatusBadge(order.payment_status)}`}>{order.payment_status.replace('_', ' ').toUpperCase()}</Badge>
                          </div>
                          {order.payment_status === 'unpaid' && (
                            <button onClick={() => handlePayNow(order.id)} className="px-3 py-1 bg-[#1a1f5c] hover:bg-[#151a4d] text-white text-sm font-semibold rounded-lg transition-all">Pay Now</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold"><span>Total Due:</span><span>${selectedInvoice.total_due.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm text-gray-600 mt-1"><span>Total Paid:</span><span>${selectedInvoice.total_paid.toFixed(2)}</span></div>
                <div className="flex justify-between text-lg font-bold text-green-600 mt-2"><span>Balance Due:</span><span>${(selectedInvoice.total_due - selectedInvoice.total_paid).toFixed(2)}</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

        {/* Order Detail Dialog */}
        <OrderDetailDialog order={selectedOrder} open={!!selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}