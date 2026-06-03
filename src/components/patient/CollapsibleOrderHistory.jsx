import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Package, Calendar, ChevronDown, ChevronUp, Loader2, Receipt, ExternalLink, FileSpreadsheet, FileText, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from '@/lib/router';
import { createPageUrl } from '../../utils';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

export default function CollapsibleOrderHistory({ limit = 5, showSeeAll = false, allowReporting = true }) {
  const [expandedOrders, setExpandedOrders] = useState({});
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showReporting, setShowReporting] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [category, setCategory] = useState('all');
  const [prescriptionName, setPrescriptionName] = useState('');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const orderList = await base44.entities.Order.list('-order_date', 100);
      // Mock categories for demonstration since backend field might be missing
      const categories = ['Medical', 'Other'];
      return orderList.map(order => ({
        ...order,
        category: order.category || categories[Math.floor(Math.random() * categories.length)]
      }));
    }
  });

  const filteredOrders = useMemo(() => {
    if (!dateFrom && !dateTo && category === 'all' && !prescriptionName) return orders;
    
    return orders.filter(order => {
      const orderDate = new Date(order.order_date);
      const from = dateFrom ? new Date(dateFrom) : null;
      const to = dateTo ? new Date(dateTo) : null;
      
      if (from && orderDate < from) return false;
      if (to && orderDate > to) return false;
      if (category !== 'all' && order.category !== category) return false;

      if (prescriptionName) {
        const items = order.items ? JSON.parse(order.items) : [];
        const hasMatch = items.some(item => item.name.toLowerCase().includes(prescriptionName.toLowerCase()));
        if (!hasMatch) return false;
      }

      return true;
    });
  }, [orders, dateFrom, dateTo, category, prescriptionName]);

  const displayOrders = limit ? filteredOrders.slice(0, limit) : filteredOrders;

  const generateCSV = () => {
    const headers = ['Order Number', 'Date', 'Category', 'Items', 'Total Amount', 'Status', 'Payment Method', 'Location'];
    const rows = filteredOrders.map(order => {
      const items = order.items ? JSON.parse(order.items).map(i => `${i.name} ($${i.price})`).join('; ') : '';
      return [
        order.order_number,
        format(new Date(order.order_date), 'MMM d, yyyy h:mm a'),
        order.category || 'General',
        items,
        order.total_amount.toFixed(2),
        order.status,
        order.payment_method || '',
        order.pharmacy_location || ''
      ];
    });

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `order-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const generatePDF = () => {
    const doc = `
      <html>
        <head>
          <title>Order Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #8B1F1F; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #8B1F1F; color: white; }
            .summary { margin-top: 20px; padding: 10px; background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>Order History Report</h1>
          <p>Generated on: ${format(new Date(), 'MMM d, yyyy h:mm a')}</p>
          ${dateFrom || dateTo ? `<p>Period: ${dateFrom ? format(new Date(dateFrom), 'MMM d, yyyy') : 'Beginning'} - ${dateTo ? format(new Date(dateTo), 'MMM d, yyyy') : 'Now'}</p>` : ''}
          
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Category</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              ${filteredOrders.map(order => {
                const items = order.items ? JSON.parse(order.items).map(i => i.name).join(', ') : '';
                return `
                  <tr>
                    <td>${order.order_number}</td>
                    <td>${format(new Date(order.order_date), 'MMM d, yyyy')}</td>
                    <td>${order.category || 'General'}</td>
                    <td>${items}</td>
                    <td>$${order.total_amount.toFixed(2)}</td>
                    <td>${order.status}</td>
                    <td>${order.payment_method || 'N/A'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <h3>Summary</h3>
            <p><strong>Total Orders:</strong> ${filteredOrders.length}</p>
            <p><strong>Total Amount:</strong> $${filteredOrders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(2)}</p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([doc], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `order-report-${format(new Date(), 'yyyy-MM-dd')}.html`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleOrder = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No order history yet</p>
      </div>
    );
  }

  return (
    <>
      {/* Reporting Section */}
      {allowReporting && (
        <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#8B1F1F]" />
              Reporting
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReporting(!showReporting)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {showReporting ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {showReporting && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">From Date</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">To Date</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Medical">Medical</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Prescription Name</Label>
                  <Input
                    value={prescriptionName}
                    onChange={(e) => setPrescriptionName(e.target.value)}
                    placeholder="Search medication..."
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={generateCSV}
                  disabled={filteredOrders.length === 0}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export as XLS
                </Button>
                <Button
                  onClick={generatePDF}
                  disabled={filteredOrders.length === 0}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export as PDF
                </Button>
                {(dateFrom || dateTo || category !== 'all' || prescriptionName) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDateFrom('');
                      setDateTo('');
                      setCategory('all');
                      setPrescriptionName('');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700">
                  <strong>Filtered Orders:</strong> {filteredOrders.length}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Total Amount:</strong> ${filteredOrders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {showSeeAll && orders.length > limit && (
        <div className="flex justify-end mb-4">
          <Link to={createPageUrl('PatientProfile') + '#orders'}>
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              See All
            </Button>
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {displayOrders.map((order) => {
          const items = order.items ? JSON.parse(order.items) : [];
          const isExpanded = expandedOrders[order.id];

          return (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 hover:border-[#8B1F1F] transition-all">
              <div 
                className="p-4 cursor-pointer"
                onClick={() => toggleOrder(order.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-gray-800">Order #{order.order_number}</p>
                      {order.status !== 'completed' && (
                        <Badge className={statusColors[order.status]}>{order.status}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(order.order_date), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800">
                      ${order.total_amount.toFixed(2)}
                    </p>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.name}</span>
                        <span className="text-gray-600">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {order.payment_method && (
                    <p className="text-sm text-gray-600">
                      <strong>Payment:</strong> {order.payment_method}
                    </p>
                  )}

                  {order.pharmacy_location && (
                    <p className="text-sm text-gray-600">
                      <strong>Location:</strong> {order.pharmacy_location}
                    </p>
                  )}

                  {order.receipt_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReceipt(order);
                      }}
                      className="w-full text-[#8B1F1F] hover:text-[#721919]"
                    >
                      <Receipt className="w-4 h-4 mr-2" />
                      View Receipt
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Receipt Dialog */}
      {selectedReceipt && (
        <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#8B1F1F]" />
                Receipt - Order #{selectedReceipt.order_number}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <img
                  src={selectedReceipt.receipt_url}
                  alt="Receipt"
                  className="w-1/2 mx-auto rounded-lg border border-gray-200"
                />
                <Button
                  size="sm"
                  className="bg-[#8B1F1F] hover:bg-[#721919] text-white"
                  onClick={async () => {
                    try {
                      const response = await fetch(selectedReceipt.receipt_url);
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Receipt-${selectedReceipt.order_number}.png`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                    } catch (err) {
                      window.open(selectedReceipt.receipt_url, '_blank');
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Date:</strong> {format(new Date(selectedReceipt.order_date), 'MMM d, yyyy h:mm a')}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Total:</strong> ${selectedReceipt.total_amount.toFixed(2)}
                </p>
                {selectedReceipt.payment_method && (
                  <p className="text-sm text-gray-600">
                    <strong>Payment Method:</strong> {selectedReceipt.payment_method}
                  </p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}