import React, { useContext, useState, useEffect, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { Order, Customer, CreditStatus, Product } from '../types';
import OrderHistory from './OrderHistory';
import { UploadIcon, UserIcon } from './Icons';
import useLocalStorage from '../hooks/useLocalStorage';
import * as XLSX from 'xlsx';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : '';

const OwnerDashboard: React.FC = () => {
  const context = useContext(AppContext);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'new_orders' | 'orders' | 'notifications' | 'catalog_management'>('dashboard');
  const [showSecurity, setShowSecurity] = useState(false);
  const [isSoundEnabled] = useLocalStorage<boolean>('soundEnabled', true);
  
  // Password Change State
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Product CRUD State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [prodForm, setProdForm] = useState({
    code: '',
    name: '',
    manufacturer: 'AKM Pharma',
    category: 'General',
    mrp: 0,
    price: 0,
    stock: 0,
    expiryDate: '',
    availability: 'In Stock'
  });

  // Customer CRUD State
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [custForm, setCustForm] = useState({
    loginId: '',
    name: '',
    pharmacyName: '',
    phone: '',
    email: '',
    password: '',
    outstandingAmount: 0,
    status: 'Very Good' as CreditStatus
  });

  // Order status editing state
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [orderStatusForm, setOrderStatusForm] = useState({
    orderStatus: 'Received',
    paymentStatus: 'Pending',
    deliveryStatus: 'Pending'
  });

  if (!context) return null;
  const { 
    googleSheetId, 
    setGoogleSheetId, 
    googleScriptUrl,
    setGoogleScriptUrl,
    refreshFromGoogleSheet, 
    isSyncing,
    customers, 
    orders,
    notifications,
    lowStockThreshold,
    setLowStockThreshold,
    loadCustomersFromCSV,
    markNotificationAsRead,
    clearReadNotifications,
    refreshAllData,
    logout,
    products,
    catalogueData,
    catalogueFileName,
    setCatalogueData
  } = context;

  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'orders' && event.newValue && event.oldValue) {
            try {
                const oldOrders: Order[] = JSON.parse(event.oldValue);
                const newOrders: Order[] = JSON.parse(event.newValue);
                if (newOrders.length > oldOrders.length) {
                    const latestOrder = newOrders[0];
                    if (!oldOrders.find(o => o.id === latestOrder.id)) {
                        if (isSoundEnabled) playNotificationSound();
                        if ('Notification' in window && Notification.permission === 'granted') {
                            new Notification('New Order Received!', {
                                body: `Customer: ${latestOrder.customer.name}\nTotal: ₹${latestOrder.totalAmount.toFixed(2)}`,
                                tag: latestOrder.id
                            });
                        }
                    }
                }
            } catch (error) { console.error(error); }
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isSoundEnabled]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassInput.length < 4) {
      setPasswordError('New password must be at least 4 characters.');
      return;
    }
    if (newPassInput !== confirmPassInput) {
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPassInput, newPassword: newPassInput })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setPasswordSuccess('Admin password updated successfully.');
        setCurrentPassInput('');
        setNewPassInput('');
        setConfirmPassInput('');
        setTimeout(() => setShowSecurity(false), 2000);
      } else {
        setPasswordError(result.message || 'Failed to change password.');
      }
    } catch (err) {
      setPasswordError('Connection error.');
    }
  };

  const handleCustomerFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n').filter(row => row.trim() !== '');
        if (rows.length < 2) return;
        const customerData: Customer[] = rows.slice(1).map((row, index) => {
           const vals = row.split(',').map(v => v.trim());
           return {
             id: `cust_${Date.now()}_${index}`,
             name: vals[0] || 'Unknown Name', 
             loginId: vals[1] || `user_${index}`, 
             password: vals[2] || '1234',
             outstandingAmount: parseFloat(vals[7]) || 0,
             status: (vals[8] as CreditStatus) || 'Very Good'
           };
        });
        loadCustomersFromCSV(customerData);
      } catch (err) { console.error(err); }
    };
    reader.readAsText(file);
  };

  const handleExcelStockUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to array of arrays
        const sheetData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        if (sheetData.length < 2) {
          alert("Selected file has no data rows.");
          return;
        }

        // Match headers, removing outer quotes if present
        const headers = sheetData[0].map((h: any) => String(h || '').trim().replace(/^"|"$/g, '').toLowerCase());
        const nameIdx = headers.findIndex((h: string) => h.includes('name') || h.includes('medicine'));
        const codeIdx = headers.findIndex((h: string) => h.includes('code') || h.includes('sku'));
        const manufacturerIdx = headers.findIndex((h: string) => h.includes('manufacturer') || h.includes('brand'));
        const priceIdx = headers.findIndex((h: string) => h.includes('price'));
        const stockIdx = headers.findIndex((h: string) => h.includes('stock') || h.includes('qty'));
        const mrpIdx = headers.findIndex((h: string) => h.includes('mrp'));
        const catIdx = headers.findIndex((h: string) => h.includes('category'));

        const productsData = sheetData.slice(1)
          .filter((row: any[]) => row && row.length > 0)
          .map((vals: any[], index: number) => {
            const code = codeIdx !== -1 && vals[codeIdx] !== undefined ? String(vals[codeIdx]).trim() : `AKM-${Date.now()}-${index}`;
            const name = nameIdx !== -1 && vals[nameIdx] !== undefined ? String(vals[nameIdx]).trim() : 'Unknown Medicine';
            const manufacturer = manufacturerIdx !== -1 && vals[manufacturerIdx] !== undefined ? String(vals[manufacturerIdx]).trim() : 'AKM Pharma';
            const price = priceIdx !== -1 && vals[priceIdx] !== undefined ? parseFloat(vals[priceIdx]) || 0 : 0;
            const stock = stockIdx !== -1 && vals[stockIdx] !== undefined ? parseInt(vals[stockIdx]) || 0 : 0;
            const mrp = mrpIdx !== -1 && vals[mrpIdx] !== undefined ? parseFloat(vals[mrpIdx]) || price : price;
            const category = catIdx !== -1 && vals[catIdx] !== undefined ? String(vals[catIdx]).trim() : 'General';
            
            return {
              id: code,
              code,
              name,
              manufacturer,
              category,
              mrp,
              price,
              stock,
              availability: stock <= 0 ? 'Out of Stock' : 'In Stock'
            };
          });

        // Bulk upsert products to database
        const res = await fetch(`${API_URL}/api/products/bulk-upsert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: productsData })
        });
        
        if (res.ok) {
          alert(`Successfully imported/updated ${productsData.length} products.`);
          refreshAllData();
        } else {
          const errData = await res.json().catch(() => ({}));
          alert(`Failed to import products: ${errData.error || errData.message || 'Server Error'}`);
        }
      } catch (err: any) {
        console.error(err);
        alert(`Failed to parse stock file: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handlePdfCatalogUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert("Please select a valid PDF file (.pdf).");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      if (base64 && setCatalogueData) {
        await setCatalogueData(base64, file.name, file.type);
        alert(`✅ PDF Catalogue "${file.name}" uploaded successfully! Customers can now view and download this PDF catalogue.`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePdfCatalog = async () => {
    if (confirm("Are you sure you want to remove the current PDF Catalogue?")) {
      if (setCatalogueData) {
        await setCatalogueData(null);
        alert("PDF Catalogue removed.");
      }
    }
  };

  // Product CRUD functions
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/products/upsert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingProduct?.id || undefined,
          ...prodForm
        })
      });
      if (res.ok) {
        setIsAddProductOpen(false);
        setEditingProduct(null);
        setProdForm({
          code: '',
          name: '',
          manufacturer: 'AKM Pharma',
          category: 'General',
          mrp: 0,
          price: 0,
          stock: 0,
          expiryDate: '',
          availability: 'In Stock'
        });
        refreshAllData();
      } else {
        alert("Failed to save product.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdForm({
      code: prod.id,
      name: prod.name,
      manufacturer: prod.manufacturer || 'AKM Pharma',
      category: 'General', 
      mrp: prod.price,
      price: prod.price,
      stock: prod.stock,
      expiryDate: '',
      availability: prod.stock <= 0 ? 'Out of Stock' : 'In Stock'
    });
    setActiveTab('catalog_management');
    setIsAddProductOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${API_URL}/api/products/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        refreshAllData();
      } else {
        alert("Failed to delete product.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Customer Edit/Submit functions
  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (editingCustomer) {
        res = await fetch(`${API_URL}/api/customers/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingCustomer.id,
            name: custForm.name,
            pharmacyName: custForm.pharmacyName,
            phone: custForm.phone,
            email: custForm.email,
            outstandingAmount: custForm.outstandingAmount,
            creditStatus: custForm.status
          })
        });
      } else {
        res = await fetch(`${API_URL}/api/customers/import`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customers: [{
              loginId: custForm.loginId,
              name: custForm.name,
              pharmacyName: custForm.pharmacyName,
              phone: custForm.phone,
              email: custForm.email,
              password: custForm.password || '1234',
              outstandingAmount: custForm.outstandingAmount,
              status: custForm.status
            }]
          })
        });
      }
      if (res.ok) {
        setIsAddCustomerOpen(false);
        setEditingCustomer(null);
        setCustForm({
          loginId: '',
          name: '',
          pharmacyName: '',
          phone: '',
          email: '',
          password: '',
          outstandingAmount: 0,
          status: 'Very Good'
        });
        refreshAllData();
      } else {
        alert("Failed to save customer details.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditCustomer = (c: Customer) => {
    setEditingCustomer(c);
    setCustForm({
      loginId: c.loginId,
      name: c.name,
      pharmacyName: '', 
      phone: '',
      email: '',
      password: '',
      outstandingAmount: c.outstandingAmount,
      status: c.status
    });
    setIsAddCustomerOpen(true);
  };

  // Order status edit functions
  const handleOrderStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    try {
      const res = await fetch(`${API_URL}/api/orders/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingOrder.id,
          ...orderStatusForm
        })
      });
      if (res.ok) {
        setEditingOrder(null);
        refreshAllData();
      } else {
        alert("Failed to update order status.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenOrderStatus = (order: Order) => {
    setEditingOrder(order);
    setOrderStatusForm({
      orderStatus: order.order_status || 'Received',
      paymentStatus: order.payment_status || 'Pending',
      deliveryStatus: order.delivery_status || 'Pending'
    });
  };

  return (
    <div className="container mx-auto space-y-8 pt-40 md:pt-48 pb-20 px-6">
      
      {/* Header aligned with mocks */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-dark tracking-tight uppercase">Admin Management Portal</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Authorized Control System for AKM Pharma & Surgicals</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowSecurity(!showSecurity)}
            className="text-[10px] font-black uppercase tracking-widest px-5 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all border border-slate-200"
          >
            {showSecurity ? 'Close Security' : 'Change Passkey'}
          </button>
          <button 
            onClick={logout}
            className="text-[10px] font-black uppercase tracking-widest px-5 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all border border-red-100"
          >
            Logout Admin
          </button>
        </div>
      </div>

      {showSecurity && (
        <div className="bg-brand-dark text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
          <h3 className="text-xl font-black uppercase tracking-tighter mb-8">Security Settings</h3>
          <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
            <input 
              type="password" 
              value={currentPassInput}
              onChange={(e) => setCurrentPassInput(e.target.value)}
              className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl outline-none transition-all font-bold text-sm"
              placeholder="Current Passkey"
              required
            />
            <input 
              type="password" 
              value={newPassInput}
              onChange={(e) => setNewPassInput(e.target.value)}
              className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl outline-none transition-all font-bold text-sm"
              placeholder="New Passkey"
              required
            />
            <input 
              type="password" 
              value={confirmPassInput}
              onChange={(e) => setConfirmPassInput(e.target.value)}
              className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl outline-none transition-all font-bold text-sm"
              placeholder="Confirm New"
              required
            />
            <div className="md:col-span-3 flex items-center gap-6">
              <button type="submit" className="px-10 py-4 bg-brand-blue text-white font-black rounded-xl uppercase tracking-widest text-[10px] hover:bg-white hover:text-brand-dark transition-all">Update Access</button>
              {passwordError && <p className="text-red-400 text-[10px] font-black uppercase">{passwordError}</p>}
              {passwordSuccess && <p className="text-brand-green text-[10px] font-black uppercase">{passwordSuccess}</p>}
            </div>
          </form>
        </div>
      )}

      {/* Tabs navigation matching mocks with inline icons */}
      <div className="flex flex-wrap justify-center gap-2 pb-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center space-x-2 px-5 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${
            activeTab === 'dashboard' ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" /></svg>
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center space-x-2 px-5 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${
            activeTab === 'inventory' ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          <span>Inventory</span>
        </button>

        <button
          onClick={() => setActiveTab('new_orders')}
          className={`flex items-center space-x-2 px-5 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all relative ${
            activeTab === 'new_orders' ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          <span>New Orders</span>
          {(orders || []).filter(o => !o.viewed).length > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-red-600 text-white rounded-full text-[9px] font-black animate-pulse">
              {(orders || []).filter(o => !o.viewed).length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center space-x-2 px-5 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${
            activeTab === 'orders' ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <span>All Orders</span>
        </button>


        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center space-x-2 px-5 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${
            activeTab === 'notifications' ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          <span>Notifications</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog_management')}
          className={`flex items-center space-x-2 px-5 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${
            activeTab === 'catalog_management' ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
          <span>Catalog Management</span>
        </button>
      </div>

      {/* Tab Modals Order status update */}
      {editingOrder && (
        <div className="bg-brand-dark text-white p-8 rounded-[2rem] mb-8 shadow-2xl">
          <h3 className="text-lg font-black uppercase tracking-tight mb-6">Modify Order #{editingOrder.id} Status</h3>
          <form onSubmit={handleOrderStatusSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Order Status</label>
              <select 
                value={orderStatusForm.orderStatus}
                onChange={(e) => setOrderStatusForm(prev => ({ ...prev, orderStatus: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none font-bold text-xs"
              >
                {['Received', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s} className="text-brand-dark font-bold">{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment Status</label>
              <select 
                value={orderStatusForm.paymentStatus}
                onChange={(e) => setOrderStatusForm(prev => ({ ...prev, paymentStatus: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none font-bold text-xs"
              >
                {['Pending', 'Paid', 'Credit'].map(s => <option key={s} value={s} className="text-brand-dark font-bold">{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Delivery Status</label>
              <select 
                value={orderStatusForm.deliveryStatus}
                onChange={(e) => setOrderStatusForm(prev => ({ ...prev, deliveryStatus: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none font-bold text-xs"
              >
                {['Pending', 'In Transit', 'Delivered'].map(s => <option key={s} value={s} className="text-brand-dark font-bold">{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-3 flex gap-4">
              <button type="submit" className="px-8 py-3 bg-brand-blue text-white font-black rounded-lg text-[10px] uppercase tracking-widest">Save Changes</button>
              <button type="button" onClick={() => setEditingOrder(null)} className="px-8 py-3 bg-white/10 text-slate-300 font-black rounded-lg text-[10px] uppercase tracking-widest">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* DASHBOARD TAB CONTENT */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Summary Metrics Row aligned with mocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Stock Count */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 text-center flex flex-col justify-center items-center">
              <span className="text-5xl font-black text-blue-600 leading-none">
                {(products || []).length}
              </span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4">
                Total Medicines in Stock
              </span>
            </div>

            {/* Total Orders */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 text-center flex flex-col justify-center items-center">
              <span className="text-5xl font-black text-blue-600 leading-none">
                {(orders || []).length}
              </span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4">
                Total Customer Orders
              </span>
            </div>

            {/* Total Pharmacies */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 text-center flex flex-col justify-center items-center">
              <span className="text-5xl font-black text-emerald-600 leading-none">
                {(customers || []).length}
              </span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4">
                Registered Pharmacies
              </span>
            </div>

            {/* Pending Orders */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 text-center flex flex-col justify-center items-center">
              <span className="text-5xl font-black text-red-500 leading-none">
                {(orders || []).filter(o => o && (o.order_status === 'Received' || o.order_status === 'Pending')).length}
              </span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4">
                New Pending Orders
              </span>
            </div>

          </div>

          {/* Admin Order History block */}
          <OrderHistory onUpdateStatus={handleOpenOrderStatus} />
        </div>
      )}

      {/* INVENTORY TAB CONTENT */}
      {activeTab === 'inventory' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          <div>
            <h2 className="text-xl font-bold text-brand-dark uppercase tracking-tight">Live Product Stock Table ({products.length} Items)</h2>
          </div>
          
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-4 px-6">Code</th>
                  <th className="py-4 px-6">Medicine Name</th>
                  <th className="py-4 px-6">Manufacturer</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6 text-right">MRP</th>
                  <th className="py-4 px-6 text-right">Price</th>
                  <th className="py-4 px-6 text-center">Stock</th>
                  <th className="py-4 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs font-bold text-slate-700 divide-y divide-slate-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-black text-brand-blue uppercase">{p.code || p.id}</td>
                    <td className="py-4 px-6 text-brand-dark">{p.name}</td>
                    <td className="py-4 px-6 text-slate-400">{p.manufacturer || 'AKM Pharma'}</td>
                    <td className="py-4 px-6 text-slate-400">{p.category || 'General'}</td>
                    <td className="py-4 px-6 text-right">₹{(p.mrp || p.price || 0).toFixed(2)}</td>
                    <td className="py-4 px-6 text-right">₹{(p.price || 0).toFixed(2)}</td>
                    <td className="py-4 px-6 text-center font-black">{p.stock}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg tracking-wider ${
                        p.stock <= 0 ? 'bg-red-50 text-red-600' : p.stock <= lowStockThreshold ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {p.stock <= 0 ? 'Out of Stock' : p.stock <= lowStockThreshold ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NEW ORDERS TAB CONTENT */}
      {activeTab === 'new_orders' && (
        <OrderHistory filterUnviewedOnly={true} onUpdateStatus={handleOpenOrderStatus} />
      )}

      {/* ORDERS TAB CONTENT */}
      {activeTab === 'orders' && (
        <OrderHistory onUpdateStatus={handleOpenOrderStatus} />
      )}



      {/* NOTIFICATIONS TAB CONTENT */}
      {activeTab === 'notifications' && (
        <div className="bg-white border border-brand-border rounded-[2rem] p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="text-sm font-black text-brand-dark uppercase tracking-widest">Active Alerts & Notifications</h3>
            <button onClick={clearReadNotifications} className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase">Clear Read</button>
          </div>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-slate-400 font-bold uppercase text-[10px] text-center py-6">No active notifications.</p>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`p-4 rounded-xl border flex justify-between items-center transition-all ${
                    n.read ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-red-50/20 border-red-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${n.type === 'low_stock' ? 'bg-amber-500' : 'bg-brand-blue'}`}></span>
                      <span className="text-xs font-black uppercase tracking-tight text-slate-800">{n.title}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-bold mt-1">{n.message}</p>
                    <span className="text-[9px] text-slate-400 font-bold">{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                  {!n.read && (
                    <button 
                      onClick={() => markNotificationAsRead(n.id)}
                      className="px-3 py-1.5 bg-brand-dark text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-brand-blue"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CATALOG MANAGEMENT TAB CONTENT */}
      {activeTab === 'catalog_management' && (
        <div className="space-y-8">
          
          {/* PDF Catalogue Document Module Card */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-brand-dark uppercase flex items-center gap-2">
                  <span>📄 PDF Catalogue Document Module</span>
                  <span className="text-[9px] font-black bg-red-100 text-red-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    PDF Supported
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-bold uppercase mt-1">
                  Upload your official PDF Product Catalogue (.pdf format). Customers can view & download this PDF directly from the header catalog button.
                </p>
              </div>
              {catalogueData && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = catalogueData;
                      link.download = catalogueFileName || 'AKM_Pharma_Catalog.pdf';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
                  >
                    📥 Download PDF
                  </button>
                  <button
                    onClick={handleRemovePdfCatalog}
                    className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    🗑️ Remove
                  </button>
                </div>
              )}
            </div>
            
            <div className="border-2 border-dashed border-red-300 bg-red-50/20 rounded-3xl p-8 text-center relative group flex flex-col items-center justify-center">
              <input type="file" accept=".pdf,application/pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePdfCatalogUpload} />
              
              <svg className="w-12 h-12 text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              
              <p className="text-sm font-black text-brand-dark uppercase tracking-widest">
                {catalogueData ? `Active PDF: ${catalogueFileName || 'AKM_Pharma_Catalog.pdf'}` : 'Select or Drag PDF Product Catalogue (.pdf)'}
              </p>
              <p className="text-[10px] text-slate-500 font-bold mt-1">
                {catalogueData ? 'Click or drag a new PDF file to update the current catalogue.' : 'Supports standard PDF documents (.pdf)'}
              </p>
            </div>
          </div>

          {/* Excel Stock Upload Module Card */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-brand-dark uppercase">Excel Stock Upload Module</h2>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">
                Upload stock files (.xlsx, .xls, .csv). Existing items will update, new items will be added, and out-of-stock products will mark automatically.
              </p>
            </div>
            
            <div className="border-2 border-dashed border-blue-200 bg-slate-50/20 rounded-3xl p-10 text-center relative group flex flex-col items-center justify-center">
              <input type="file" accept=".xlsx,.xls,.csv" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleExcelStockUpload} />
              
              <svg className="w-10 h-10 text-blue-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              
              <p className="text-sm font-black text-brand-dark uppercase tracking-widest">Select or Drag Excel / CSV Stock File</p>
              <p className="text-[10px] text-slate-400 font-bold mt-1">Supports .xlsx, .xls, and .csv formats</p>
              
              <div className="flex flex-wrap gap-2 justify-center mt-6">
                {['Name', 'Code/SKU', 'Category', 'Batch', 'Manufacturer', 'MRP', 'Price', 'Stock', 'Expiry'].map(b => (
                  <span key={b} className="px-2.5 py-1 bg-slate-100/80 text-slate-500 rounded-md text-[8px] font-black uppercase tracking-wider">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Google Sheets Sync Card */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-brand-dark uppercase">Google Sheet Master Inventory Sync</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" value={googleSheetId} onChange={(e) => setGoogleSheetId(e.target.value)} placeholder="Google Sheet ID" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs" />
              <input type="text" value={googleScriptUrl} onChange={(e) => setGoogleScriptUrl(e.target.value)} placeholder="Apps Script Web App URL" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs" />
            </div>
            <button onClick={refreshFromGoogleSheet} disabled={isSyncing || !googleSheetId} className="w-full bg-[#64748B] hover:bg-slate-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 uppercase tracking-widest text-xs">
              {isSyncing ? 'Syncing...' : 'Sync Catalog From Google Sheet'}
            </button>
          </div>

          {/* Configurable threshold */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-xl font-bold text-brand-dark uppercase">Low Stock Threshold Configuration</h2>
              <p className="text-xs text-slate-400 font-bold mt-1 uppercase">Products with quantities at or below this value generate dashboard alerts.</p>
            </div>
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <input 
                type="number" 
                value={lowStockThreshold} 
                onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 0)} 
                className="w-24 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm text-center" 
                min="0"
              />
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">units</span>
            </div>
          </div>

          {/* Add/Edit products CRUD form */}
          {isAddProductOpen && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl space-y-6">
              <h3 className="text-lg font-black text-brand-dark uppercase tracking-tight">{editingProduct ? 'Edit Product Details' : 'Add New Inventory Item'}</h3>
              <form onSubmit={handleProductSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Product Code (Unique)</label>
                  <input 
                    type="text" 
                    value={prodForm.code} 
                    onChange={(e) => setProdForm(prev => ({ ...prev, code: e.target.value }))}
                    disabled={!!editingProduct}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs" 
                    placeholder="e.g. CI-101"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Product Name</label>
                  <input 
                    type="text" 
                    value={prodForm.name} 
                    onChange={(e) => setProdForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs" 
                    placeholder="e.g. Paracetamol"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Manufacturer</label>
                  <input 
                    type="text" 
                    value={prodForm.manufacturer} 
                    onChange={(e) => setProdForm(prev => ({ ...prev, manufacturer: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs" 
                    placeholder="e.g. Cipla"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Price (₹)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={prodForm.price} 
                    onChange={(e) => setProdForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs" 
                    placeholder="0.00"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Stock Level</label>
                  <input 
                    type="number" 
                    value={prodForm.stock} 
                    onChange={(e) => setProdForm(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs" 
                    placeholder="0"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Category</label>
                  <input 
                    type="text" 
                    value={prodForm.category} 
                    onChange={(e) => setProdForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs" 
                    placeholder="e.g. Tablets" 
                  />
                </div>
                <div className="sm:col-span-2 md:col-span-3 flex gap-4">
                  <button type="submit" className="px-8 py-3.5 bg-brand-blue text-white font-black rounded-xl text-[10px] uppercase tracking-widest">{editingProduct ? 'Update Product' : 'Add Item'}</button>
                  <button type="button" onClick={() => { setIsAddProductOpen(false); setEditingProduct(null); }} className="px-8 py-3.5 bg-slate-200 text-slate-700 font-black rounded-xl text-[10px] uppercase tracking-widest">Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default OwnerDashboard;