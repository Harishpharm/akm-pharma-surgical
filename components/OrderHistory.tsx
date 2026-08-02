import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { Order } from '../types';
import { DownloadIcon } from './Icons';

interface OrderHistoryProps {
  onUpdateStatus?: (order: Order) => void;
  filterUnviewedOnly?: boolean;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ onUpdateStatus, filterUnviewedOnly = false }) => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { orders = [], markOrdersAsViewed, customers = [] } = context;

  // Internal search and filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];

    return orders.filter(order => {
      if (!order) return false;

      // Filter by unviewed if requested
      if (filterUnviewedOnly && order.viewed) return false;

      const rawTimestamp = order.timestamp || (order as any).created_at;
      const orderDate = rawTimestamp ? new Date(rawTimestamp) : new Date(0);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999);

      const customerName = order.customer?.name || (order as any).customer_name || 'Unknown';
      const pharmacyName = order.customer?.pharmacyName || (order as any).pharmacy_name || '';

      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = searchTerm.trim() === '' ||
        (order.id && order.id.toLowerCase().includes(lowerSearch)) ||
        customerName.toLowerCase().includes(lowerSearch) ||
        pharmacyName.toLowerCase().includes(lowerSearch);

      const matchesCustomer = customerFilter === 'all' || customerName === customerFilter;
      const matchesStatus = statusFilter === 'all' || (order.order_status || 'Received') === statusFilter;

      const validDate = isNaN(orderDate.getTime()) ? new Date(0) : orderDate;

      return matchesSearch && matchesCustomer && matchesStatus && (!start || validDate >= start) && (!end || validDate <= end);
    }).sort((a, b) => {
      const rawA = a?.timestamp || (a as any)?.created_at;
      const rawB = b?.timestamp || (b as any)?.created_at;
      const timeA = rawA ? new Date(rawA).getTime() : 0;
      const timeB = rawB ? new Date(rawB).getTime() : 0;
      return sortOrder === 'latest' ? timeB - timeA : timeA - timeB;
    });
  }, [orders, filterUnviewedOnly, searchTerm, customerFilter, statusFilter, startDate, endDate, sortOrder]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setCustomerFilter('all');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const exportOrderToCSV = (order: Order) => {
    if (!order) return;
    const items = Array.isArray(order.items) ? order.items : [];
    const headers = ['Product Name', 'Manufacturer', 'Type', 'Price', 'Quantity', 'Total'];
    const rows = items.map(item => 
      [item.name || '', item.manufacturer || '', item.unit || '', item.price || 0, item.quantity || 0, (item.price || 0) * (item.quantity || 0)].join(',')
    );

    const customerName = order.customer?.name || (order as any).customer_name || 'Unknown';
    const pharmacyName = order.customer?.pharmacyName || (order as any).pharmacy_name || '';
    const phone = order.customer?.phone || (order as any).phone || '';
    const rawTimestamp = order.timestamp || (order as any).created_at;
    const formattedDate = rawTimestamp && !isNaN(new Date(rawTimestamp).getTime()) ? new Date(rawTimestamp).toLocaleString() : 'N/A';
    const totalVal = typeof order.totalAmount === 'number' ? order.totalAmount : (parseFloat((order as any).total_amount) || 0);

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += `Order ID,${order.id || ''}\n`;
    csvContent += `Customer Name,${customerName}\n`;
    csvContent += `Pharmacy Name,${pharmacyName}\n`;
    csvContent += `Customer Phone,${phone}\n`;
    csvContent += `Order Date,${formattedDate}\n`;
    if (order.comments) {
        csvContent += `Comments,${order.comments.replace(/(\r\n|\n|\r)/gm, " ")}\n`;
    }
    csvContent += `Total Amount,${totalVal.toFixed(2)}\n\n`;
    csvContent += headers.join(',') + '\n' + rows.join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `order_${customerName.replace(/ /g, '_')}_${order.id || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseDateWithTimezone = (dateStr?: string): Date | null => {
    if (!dateStr) return null;
    let s = String(dateStr).trim();
    if (!s) return null;

    if (s.includes(' ') && !s.includes('T')) {
      s = s.replace(' ', 'T');
    }

    if (!s.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(s)) {
      s += 'Z';
    }

    const d = new Date(s);
    if (!isNaN(d.getTime())) return d;

    const fallback = new Date(dateStr);
    return isNaN(fallback.getTime()) ? null : fallback;
  };

  const formatOrderDateTime = (dateStr?: string) => {
    const d = parseDateWithTimezone(dateStr);
    if (!d) return 'N/A';

    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(d);
  };

  const isToday = (dateStr?: string) => {
    const d = parseDateWithTimezone(dateStr);
    if (!d) return false;
    const now = new Date();
    return d.getDate() === now.getDate() &&
           d.getMonth() === now.getMonth() &&
           d.getFullYear() === now.getFullYear();
  };

  const unviewedCount = (orders || []).filter(o => !o.viewed).length;

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
      
      {/* Header and Sorting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-brand-dark uppercase tracking-tight">
              {filterUnviewedOnly ? 'Incoming New Orders Feed' : 'Admin Order History & Live Feed'}
            </h2>
            {unviewedCount > 0 && (
              <span className="bg-red-600 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full animate-pulse shadow-sm">
                {unviewedCount} UNSEEN
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {unviewedCount > 0 && (
            <button
              onClick={() => markOrdersAsViewed()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-lg text-[9px] uppercase tracking-widest transition-all shadow-sm active:scale-95"
            >
              ✓ Mark All as Seen
            </button>
          )}
          <button
            onClick={() => setSortOrder(prev => prev === 'latest' ? 'oldest' : 'latest')}
            className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center space-x-1.5"
          >
            <span>Sort: {sortOrder === 'latest' ? 'Latest First' : 'Oldest First'}</span>
            <span>↓</span>
          </button>
        </div>
      </div>

      {/* Custom styled Filter Bar */}
      <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Search Orders</label>
            <input
              type="text"
              placeholder="Search Customer, Pharmacy, Order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-600/30 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Filter By Customer</label>
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-600/30 transition-all"
            >
              <option value="all">All Customers</option>
              {(customers || []).map(c => c && <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Order Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-600/30 transition-all"
            >
              <option value="all">All Statuses</option>
              {['Received', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-600/30 transition-all text-slate-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-600/30 transition-all text-slate-500"
            />
          </div>

        </div>
        
        <div className="flex justify-end mt-4">
          <button
            onClick={handleClearFilters}
            className="px-6 py-2.5 bg-sky-50 hover:bg-[#bae6fd] text-[#0369a1] font-black rounded-xl text-[9px] uppercase tracking-widest transition-all active:scale-95"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-slate-50/30 border border-dashed border-slate-200 rounded-3xl">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-slate-500 font-black uppercase tracking-wider text-xs">
            {filterUnviewedOnly ? 'No unseen new orders right now!' : 'No matching orders found.'}
          </p>
          {filterUnviewedOnly && (
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
              All incoming customer orders have been seen and acknowledged.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map(order => {
            const rawTimestamp = order.timestamp || (order as any).created_at;
            const isUnseen = !order.viewed;
            const isOrderToday = isToday(rawTimestamp);
            const showNewBadge = isUnseen || (isOrderToday && order.order_status === 'Received');
            
            const customerName = order.customer?.name || (order as any).customer_name || 'Customer';
            const pharmacyName = order.customer?.pharmacyName || (order as any).pharmacy_name || 'N/A';
            const phone = order.customer?.phone || (order as any).phone || 'N/A';
            const email = order.customer?.email || (order as any).email || 'N/A';
            const formattedDate = formatOrderDateTime(rawTimestamp);
            const totalAmountVal = typeof order.totalAmount === 'number' ? order.totalAmount : (parseFloat((order as any).total_amount) || 0);
            const itemsList = Array.isArray(order.items) ? order.items : [];

            // Delivery / Street Address
            const addressParts = [
              (order as any).street_address,
              (order as any).city,
              (order as any).state,
              (order as any).pincode
            ].filter(Boolean);
            const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : null;

            return (
              <div 
                key={order.id} 
                className={`border rounded-[2rem] p-6 transition-all relative overflow-hidden ${
                  showNewBadge 
                    ? 'bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-blue-50/80 border-2 border-blue-500 shadow-md shadow-blue-500/10' 
                    : 'border-slate-100 bg-white'
                }`}
              >
                {/* Visual New Banner Ribbon */}
                {showNewBadge && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
                    <span>LIVE NEW ORDER</span>
                  </div>
                )}

                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight">Customer: {customerName}</h3>
                      {showNewBadge && (
                         <span className="text-[9px] font-black text-white bg-red-600 px-3 py-1 rounded-full animate-pulse tracking-widest uppercase shadow-md flex items-center gap-1">
                           🚨 NEW ORDER
                         </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600 font-bold">
                      <p><span className="text-slate-400 uppercase text-[10px]">Pharmacy:</span> {pharmacyName}</p>
                      <p><span className="text-slate-400 uppercase text-[10px]">Phone:</span> {phone}</p>
                      <p><span className="text-slate-400 uppercase text-[10px]">Email:</span> {email}</p>
                      <p><span className="text-slate-400 uppercase text-[10px]">Order Time:</span> {formattedDate}</p>
                    </div>

                    {fullAddress && (
                      <p className="text-xs text-slate-600 font-bold pt-1">
                        <span className="text-slate-400 uppercase text-[10px]">Address:</span> {fullAddress}
                      </p>
                    )}

                    <p className="text-[10px] text-blue-600 font-mono font-bold mt-1 uppercase tracking-wider">ORDER ID: {order.id}</p>
                    
                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                        order.order_status === 'Cancelled' ? 'bg-red-100 text-red-700 border border-red-200' :
                        order.order_status === 'Delivered' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        Status: {order.order_status || 'Received'}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                        order.payment_status === 'Paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        order.payment_status === 'Credit' ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        Payment: {order.payment_status || 'Pending'}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                        order.delivery_status === 'Delivered' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        order.delivery_status === 'In Transit' ? 'bg-sky-100 text-sky-800 border border-sky-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        Delivery: {order.delivery_status || 'Pending'}
                      </span>
                    </div>

                    {order.comments && (
                       <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-slate-800 font-bold shadow-sm">
                          <span className="font-black text-amber-900 uppercase tracking-widest mr-1">📝 Customer Note:</span> {order.comments}
                       </div>
                    )}
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-3 min-w-[180px]">
                    <div className="text-left md:text-right">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Total Order Amount</span>
                      <p className="text-3xl font-black text-[#0D47A1]">₹{totalAmountVal.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 justify-end">
                      {isUnseen && (
                        <button 
                          onClick={() => markOrdersAsViewed(order.id)}
                          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-[9px] uppercase tracking-widest transition active:scale-95 shadow-sm flex items-center gap-1.5"
                        >
                          <span>👁️ Mark as Seen</span>
                        </button>
                      )}
                      {onUpdateStatus && (
                        <button 
                          onClick={() => onUpdateStatus(order)}
                          className="px-4 py-2.5 bg-brand-dark hover:bg-brand-blue text-white font-black rounded-xl text-[9px] uppercase tracking-widest transition active:scale-95 shadow-sm"
                        >
                          Modify Status
                        </button>
                      )}
                      <button 
                        onClick={() => exportOrderToCSV(order)}
                        className="flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-4 rounded-xl transition duration-300 text-[9px] uppercase tracking-widest active:scale-95 shadow-sm"
                      >
                        <DownloadIcon className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Itemized Products Details */}
                <div className="border-t border-slate-200/80 pt-4 mt-4 bg-white/70 rounded-2xl p-4 border border-slate-100">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
                    <span>Order Items Breakdown ({itemsList.length} Items)</span>
                    <span className="text-[10px] text-slate-400 font-bold">Qty & Unit Pricing</span>
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                          <th className="pb-2">Product Name</th>
                          <th className="pb-2">Manufacturer</th>
                          <th className="pb-2 text-center">Unit Type</th>
                          <th className="pb-2 text-center">Quantity</th>
                          <th className="pb-2 text-right">Unit Price</th>
                          <th className="pb-2 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                        {itemsList.map((item, index) => {
                          const itemPrice = typeof item.price === 'number' ? item.price : 0;
                          const itemQty = typeof item.quantity === 'number' ? item.quantity : 0;
                          const itemSubtotal = itemQty * itemPrice;
                          return (
                            <tr key={`${item.id || 'item'}-${index}`} className="hover:bg-slate-50/50">
                              <td className="py-2.5 font-extrabold text-slate-900">{item.name || 'Unnamed Product'}</td>
                              <td className="py-2.5 text-slate-500 text-[11px]">{item.manufacturer || 'AKM Pharma'}</td>
                              <td className="py-2.5 text-center text-slate-500 text-[11px]">{item.unit || 'Strip'}</td>
                              <td className="py-2.5 text-center font-black text-blue-600">{itemQty}</td>
                              <td className="py-2.5 text-right">₹{itemPrice.toFixed(2)}</td>
                              <td className="py-2.5 text-right font-black text-slate-900">₹{itemSubtotal.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
