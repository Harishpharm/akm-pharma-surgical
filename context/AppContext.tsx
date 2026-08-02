import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { User, Product, Order, CartItem, Customer, DbNotification } from '../types';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : 'https://akm-pharma-surgical-api.onrender.com';

type UnitType = 'Strip' | 'Box' | 'Piece';

interface AppContextType {
  user: User | null;
  products: Product[];
  customers: Customer[];
  orders: Order[];
  cart: CartItem[];
  notifications: DbNotification[];
  googleSheetId: string;
  googleScriptUrl: string;
  lowStockThreshold: number;
  catalogueData: string | null;
  catalogueFileName: string;
  catalogueFileType: string;
  isSyncing: boolean;
  login: (user: User) => void;
  logout: () => void;
  setGoogleSheetId: (id: string) => Promise<void>;
  setGoogleScriptUrl: (url: string) => Promise<void>;
  setLowStockThreshold: (val: number) => Promise<void>;
  setCatalogueData: (data: string | null, fileName?: string, fileType?: string) => Promise<void>;
  refreshFromGoogleSheet: () => Promise<void>;
  loadProductsFromCSV: (data: Product[]) => void;
  loadCustomersFromCSV: (data: Customer[]) => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'timestamp' | 'viewed'>) => Promise<string>;
  markOrdersAsViewed: (orderId?: string) => Promise<void>;
  addToCart: (product: Product, quantity: number, unit: UnitType) => void;
  updateCartQuantity: (productId: string, unit: UnitType, quantity: number) => void;
  removeFromCart: (productId: string, unit: UnitType) => void;
  clearCart: () => void;
  markNotificationAsRead: (id: string) => Promise<void>;
  clearReadNotifications: () => Promise<void>;
  refreshAllData: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useLocalStorage<User | null>('user', null);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useLocalStorage<CartItem[]>('cart', []);
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  
  const [googleSheetId, setGoogleSheetIdState] = useState('');
  const [googleScriptUrl, setGoogleScriptUrlState] = useState('');
  const [lowStockThreshold, setLowStockThresholdState] = useState(10);
  const [catalogueData, setCatalogueDataState] = useState<string | null>(null);
  const [catalogueFileName, setCatalogueFileNameState] = useState<string>('AKM_Pharma_Catalog.pdf');
  const [catalogueFileType, setCatalogueFileTypeState] = useState<string>('application/pdf');
  const [isSyncing, setIsSyncing] = useState(false);

  const login = (user: User) => setUser(user);
  const logout = () => {
    setUser(null);
    clearCart();
  };

  const refreshAllData = useCallback(async () => {
    try {
      // 1. Fetch settings
      const sRes = await fetch(`${API_URL}/api/settings`);
      if (sRes.ok) {
        const settings = await sRes.json();
        if (settings.google_sheet_id) setGoogleSheetIdState(settings.google_sheet_id);
        if (settings.google_script_url) setGoogleScriptUrlState(settings.google_script_url);
        if (settings.low_stock_threshold) setLowStockThresholdState(parseInt(settings.low_stock_threshold) || 10);
      }

      // 2. Fetch products
      const pRes = await fetch(`${API_URL}/api/products`);
      if (pRes.ok) setProducts(await pRes.json());

      // 3. Fetch customers
      const cRes = await fetch(`${API_URL}/api/customers`);
      if (cRes.ok) setCustomers(await cRes.json());

      // 4. Fetch orders
      const oRes = await fetch(`${API_URL}/api/orders`);
      if (oRes.ok) setOrders(await oRes.json());

      // 5. Fetch catalogue
      const catRes = await fetch(`${API_URL}/api/catalog/download`);
      if (catRes.ok) {
        const catData = await catRes.json();
        if (catData.success && catData.catalogBase64) {
          setCatalogueDataState(catData.catalogBase64);
          if (catData.fileName) setCatalogueFileNameState(catData.fileName);
          if (catData.fileType) setCatalogueFileTypeState(catData.fileType);
        }
      }

      // 6. Fetch notifications
      const nRes = await fetch(`${API_URL}/api/notifications`);
      if (nRes.ok) setNotifications(await nRes.json());
    } catch (err) {
      console.error("Failed to fetch fresh data from Express backend API:", err);
    }
  }, []);

  // Fetch initial data on mount & poll every 5s for live new orders
  useEffect(() => {
    refreshAllData();
    const interval = setInterval(() => {
      fetch(`${API_URL}/api/orders`)
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (Array.isArray(data)) setOrders(data); })
        .catch(() => {});
        
      fetch(`${API_URL}/api/notifications`)
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (Array.isArray(data)) setNotifications(data); })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshAllData]);

  const loadProductsFromCSV = (data: Product[]) => {
    // Left for direct client CSV loading compatibility if needed, otherwise sync from sheet
    setProducts(data);
  };

  const loadCustomersFromCSV = async (data: Customer[]) => {
    try {
      const res = await fetch(`${API_URL}/api/customers/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customers: data })
      });
      if (res.ok) {
        const cRes = await fetch(`${API_URL}/api/customers`);
        if (cRes.ok) setCustomers(await cRes.json());
      }
    } catch (err) {
      console.error("Failed to import customers base:", err);
    }
  };

  const handleSetGoogleSheetId = async (input: string) => {
    const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    const id = match ? match[1] : input.trim();
    setGoogleSheetIdState(id);
    try {
      await fetch(`${API_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'google_sheet_id', value: id })
      });
    } catch (e) {
      console.error("Failed to update Google Sheet ID setting:", e);
    }
  };

  const handleSetGoogleScriptUrl = async (url: string) => {
    setGoogleScriptUrlState(url);
    try {
      await fetch(`${API_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'google_script_url', value: url })
      });
    } catch (e) {
      console.error("Failed to update Apps Script URL setting:", e);
    }
  };

  const handleSetLowStockThreshold = async (val: number) => {
    setLowStockThresholdState(val);
    try {
      await fetch(`${API_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'low_stock_threshold', value: String(val) })
      });
      // Refresh notifications as threshold changed
      const nRes = await fetch(`${API_URL}/api/notifications`);
      if (nRes.ok) setNotifications(await nRes.json());
    } catch (e) {
      console.error("Failed to update Low Stock Threshold setting:", e);
    }
  };

  const handleSetCatalogueData = async (data: string | null, fileName: string = 'AKM_Pharma_Catalog.pdf', fileType: string = 'application/pdf') => {
    setCatalogueDataState(data);
    setCatalogueFileNameState(fileName);
    setCatalogueFileTypeState(fileType);
    try {
      await fetch(`${API_URL}/api/catalog/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catalogBase64: data || '', fileName, fileType })
      });
    } catch (e) {
      console.error("Failed to upload catalogue:", e);
    }
  };

  const refreshFromGoogleSheet = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`${API_URL}/api/inventory/sync`, {
        method: 'POST'
      });
      if (res.ok) {
        // Fetch products and notifications updated from sync
        const pRes = await fetch(`${API_URL}/api/products`);
        if (pRes.ok) setProducts(await pRes.json());

        const nRes = await fetch(`${API_URL}/api/notifications`);
        if (nRes.ok) setNotifications(await nRes.json());
      }
    } catch (err) {
      console.error("Inventory synchronization failed:", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const addOrder = async (order: Omit<Order, 'id' | 'timestamp' | 'viewed'>): Promise<string> => {
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      
      const result = await res.json();
      if (res.ok && result.success) {
        // Fetch fresh products, orders, and notifications states
        const pRes = await fetch(`${API_URL}/api/products`);
        if (pRes.ok) setProducts(await pRes.json());

        const oRes = await fetch(`${API_URL}/api/orders`);
        if (oRes.ok) setOrders(await oRes.json());

        const nRes = await fetch(`${API_URL}/api/notifications`);
        if (nRes.ok) setNotifications(await nRes.json());

        return result.orderId;
      } else {
        throw new Error(result.error || 'Checkout process rejected.');
      }
    } catch (err: any) {
      console.error("Failed to place order:", err);
      throw err;
    }
  };
  
  const markOrdersAsViewed = async (orderId?: string) => {
    try {
      setOrders(prevOrders => prevOrders.map(o => {
        if (!orderId || o.id === orderId) {
          return { ...o, viewed: true };
        }
        return o;
      }));

      await fetch(`${API_URL}/api/orders/mark-viewed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
    } catch (err) {
      console.error("Failed to mark order(s) as viewed:", err);
    }
  };

  const addToCart = (product: Product, quantity: number, unit: UnitType) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id && item.unit === unit);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id && item.unit === unit
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity, unit }];
    });
  };
  
  const updateCartQuantity = (productId: string, unit: UnitType, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, unit);
    } else {
      setCart(cart => cart.map(item => (item.id === productId && item.unit === unit) ? {...item, quantity} : item));
    }
  };

  const removeFromCart = (productId: string, unit: UnitType) => {
    setCart(cart => cart.filter(item => !(item.id === productId && item.unit === unit)));
  };
  
  const clearCart = () => setCart([]);

  const markNotificationAsRead = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const clearReadNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/clear`, {
        method: 'POST'
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => !n.read));
      }
    } catch (err) {
      console.error("Failed to clear read notifications:", err);
    }
  };

  return (
    <AppContext.Provider value={{ 
      user, products, customers, orders, cart, notifications, googleSheetId, googleScriptUrl, lowStockThreshold, catalogueData, catalogueFileName, catalogueFileType, isSyncing,
      login, logout, setGoogleSheetId: handleSetGoogleSheetId, setGoogleScriptUrl: handleSetGoogleScriptUrl, setLowStockThreshold: handleSetLowStockThreshold, setCatalogueData: handleSetCatalogueData,
      refreshFromGoogleSheet, loadProductsFromCSV, loadCustomersFromCSV, addOrder, markOrdersAsViewed, 
      addToCart, updateCartQuantity, removeFromCart, clearCart, markNotificationAsRead, clearReadNotifications, refreshAllData
    }}>
      {children}
    </AppContext.Provider>
  );
};
