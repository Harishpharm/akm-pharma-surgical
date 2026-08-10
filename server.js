import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import supabase from './supabase.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from production build directory if present
app.use(express.static(path.join(__dirname, 'dist')));

// SHA-256 Password Hashing Utility
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// ------------------------------------------------------------------------------
// ROOT ROUTE & HEALTH CHECK (CONNECTED TO SUPABASE)
// ------------------------------------------------------------------------------

app.get('/', async (req, res) => {
  let dbStatus = 'DISCONNECTED';
  let dbError = null;

  try {
    const { error } = await supabase.from('products').select('id').limit(1);
    if (error && !error.message.includes('relation "public.products" does not exist')) {
      dbError = error.message;
    } else {
      dbStatus = 'CONNECTED';
    }
  } catch (err) {
    dbError = err.message;
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>AKM Pharma Supabase API Server</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #1e293b; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 2rem; box-sizing: border-box; }
        .card { background: white; padding: 2.5rem; border-radius: 1.5rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); max-width: 600px; width: 100%; border: 1px solid #e2e8f0; text-align: left; }
        .badge { display: inline-block; padding: 0.4rem 0.9rem; border-radius: 9999px; font-weight: 800; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .badge-success { background: #dcfce7; color: #166534; }
        .badge-danger { background: #fee2e2; color: #991b1b; }
        h1 { margin-top: 0; color: #0d47a1; font-size: 1.5rem; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; }
        p { color: #64748b; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem; }
        .endpoint-list { background: #f1f5f9; padding: 1.25rem; border-radius: 1rem; font-family: monospace; font-size: 0.85rem; margin-top: 1rem; border: 1px solid #e2e8f0; }
        .endpoint-list p { margin: 0.5rem 0; }
        .endpoint-list a { color: #0284c7; text-decoration: none; font-weight: bold; }
        .endpoint-list a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>AKM Pharma Supabase API Backend</h1>
        <p>Connected to Supabase Cloud PostgreSQL Database</p>
        <div style="margin: 1.25rem 0;">
          <span class="badge ${dbStatus === 'CONNECTED' ? 'badge-success' : 'badge-danger'}">
            Supabase Status: ${dbStatus}
          </span>
        </div>
        ${dbError ? `<p style="color: #ef4444; font-size: 0.8rem; font-weight: bold;">Connection Warning: ${dbError}</p>` : ''}
        <h3 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: #334155; margin-top: 1.5rem;">Available Supabase Endpoints:</h3>
        <div class="endpoint-list">
          <p>• <a href="/api/health" target="_blank">/api/health</a> - Supabase Health & Connection</p>
          <p>• <a href="/api/products" target="_blank">/api/products</a> - Live Products Inventory</p>
          <p>• <a href="/api/orders" target="_blank">/api/orders</a> - Customer Orders List</p>
          <p>• <a href="/api/customers" target="_blank">/api/customers</a> - Registered Pharmacies</p>
          <p>• <a href="/api/login-history" target="_blank">/api/login-history</a> - Audit Log History</p>
          <p>• <a href="/api/settings" target="_blank">/api/settings</a> - System Settings</p>
        </div>
        <p style="margin-top: 1.5rem; font-size: 0.8rem; text-align: center; color: #94a3b8;">
          Website App: <a href="http://localhost:5173" style="color:#0d47a1; font-weight:bold;">http://localhost:5173</a>
        </p>
      </div>
    </body>
    </html>
  `);
});

// GET /api/health - JSON Connection Test
app.get('/api/health', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('id').limit(1);
    if (error && !error.message.includes('does not exist')) {
      throw error;
    }
    res.json({
      status: 'ONLINE',
      database: 'SUPABASE_CONNECTED',
      message: 'Connected successfully to Supabase PostgreSQL Database.',
      url: process.env.SUPABASE_URL,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'OFFLINE',
      database: 'SUPABASE_DISCONNECTED',
      error: error.message
    });
  }
});

// ------------------------------------------------------------------------------
// 1.5 CATALOG MANAGEMENT API
// ------------------------------------------------------------------------------

let cachedCatalogBuffer = null;
let cachedCatalogFileName = null;
let cachedCatalogFileType = null;
let isCacheLoaded = false;

app.post('/api/catalog/upload', async (req, res) => {
  const { catalogBase64, fileName, fileType } = req.body;
  try {
    if (catalogBase64) {
      await supabase.from('system_settings').upsert({ setting_key: 'catalog_base64', setting_value: catalogBase64 }, { onConflict: 'setting_key' });
      await supabase.from('system_settings').upsert({ setting_key: 'catalog_file_name', setting_value: fileName || 'AKM_Pharma_Catalog.pdf' }, { onConflict: 'setting_key' });
      await supabase.from('system_settings').upsert({ setting_key: 'catalog_file_type', setting_value: fileType || 'application/pdf' }, { onConflict: 'setting_key' });
      
      const base64String = catalogBase64.includes(',') ? catalogBase64.split(',')[1] : catalogBase64;
      cachedCatalogBuffer = Buffer.from(base64String, 'base64');
      cachedCatalogFileName = fileName || 'AKM_Pharma_Catalog.pdf';
      cachedCatalogFileType = fileType || 'application/pdf';
      isCacheLoaded = true;
    } else {
      await supabase.from('system_settings').delete().eq('setting_key', 'catalog_base64');
      await supabase.from('system_settings').delete().eq('setting_key', 'catalog_file_name');
      await supabase.from('system_settings').delete().eq('setting_key', 'catalog_file_type');
      
      cachedCatalogBuffer = null;
      cachedCatalogFileName = null;
      cachedCatalogFileType = null;
      isCacheLoaded = true;
    }
    res.json({ success: true, message: 'Catalogue document updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/catalog/download', async (req, res) => {
  try {
    const { data: base64Data } = await supabase.from('system_settings').select('setting_value').eq('setting_key', 'catalog_base64').maybeSingle();
    const { data: nameData } = await supabase.from('system_settings').select('setting_value').eq('setting_key', 'catalog_file_name').maybeSingle();
    const { data: typeData } = await supabase.from('system_settings').select('setting_value').eq('setting_key', 'catalog_file_type').maybeSingle();

    if (!base64Data || !base64Data.setting_value) {
      return res.status(404).json({ error: 'Catalog not found.' });
    }

    res.json({
      success: true,
      catalogBase64: base64Data.setting_value,
      fileName: nameData?.setting_value || 'AKM_Pharma_Catalog.pdf',
      fileType: typeData?.setting_value || 'application/pdf'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/catalog/file', async (req, res) => {
  try {
    if (!isCacheLoaded) {
      const { data: base64Data } = await supabase.from('system_settings').select('setting_value').eq('setting_key', 'catalog_base64').maybeSingle();
      const { data: nameData } = await supabase.from('system_settings').select('setting_value').eq('setting_key', 'catalog_file_name').maybeSingle();
      const { data: typeData } = await supabase.from('system_settings').select('setting_value').eq('setting_key', 'catalog_file_type').maybeSingle();

      if (base64Data && base64Data.setting_value) {
        const base64String = base64Data.setting_value.includes(',') 
          ? base64Data.setting_value.split(',')[1] 
          : base64Data.setting_value;
        cachedCatalogBuffer = Buffer.from(base64String, 'base64');
        cachedCatalogFileName = nameData?.setting_value || 'AKM_Pharma_Catalog.pdf';
        cachedCatalogFileType = typeData?.setting_value || 'application/pdf';
      } else {
        cachedCatalogBuffer = null;
      }
      isCacheLoaded = true;
    }

    if (!cachedCatalogBuffer) {
      return res.status(404).send('No PDF catalogue uploaded by the admin yet.');
    }

    res.setHeader('Content-Type', cachedCatalogFileType);
    res.setHeader('Content-Disposition', `attachment; filename="${cachedCatalogFileName}"`);
    res.send(cachedCatalogBuffer);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// ------------------------------------------------------------------------------
// 2. PRODUCTS / STOCK API (SUPABASE & GOOGLE SHEETS SYNC)
// ------------------------------------------------------------------------------

// Low Stock Notification Sync Helper
const checkAndCreateLowStockNotification = async (productId, name, currentStock) => {
  try {
    let threshold = 10;
    const { data: thresholdSetting } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'low_stock_threshold')
      .single();

    if (thresholdSetting && thresholdSetting.setting_value) {
      threshold = parseInt(thresholdSetting.setting_value) || 10;
    }

    const notificationId = `notif_low_${productId}`;

    if (currentStock <= threshold) {
      const title = currentStock === 0 ? 'Out of Stock Alert' : 'Low Stock Alert';
      const message = `${name} (Code: ${productId}) has reached ${currentStock} units (Threshold: ${threshold}).`;
      
      await supabase
        .from('notifications')
        .upsert({
          id: notificationId,
          title,
          message,
          type: 'low_stock',
          read: false,
          created_at: new Date().toISOString()
        }, { onConflict: 'id' });
    } else {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
    }
  } catch (err) {
    console.error('Failed to update stock notification:', err.message);
  }
};

app.get('/api/products', async (req, res) => {
  try {
    let allData = [];
    let from = 0;
    const step = 999;
    
    while (true) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true })
        .range(from, from + step);

      if (error) throw error;
      
      if (data && data.length > 0) {
        allData = allData.concat(data);
      }
      
      if (!data || data.length <= step) {
        break; // Reached the end
      }
      
      from += step + 1;
    }

    res.json(allData || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products/upsert', async (req, res) => {
  const { id, code, name, manufacturer, category, batchNumber, mrp, price, stock, expiryDate, availability } = req.body;
  try {
    const prodId = id || `prod_${Date.now()}_${Math.floor(Math.random()*1000)}`;
    const availStatus = stock <= 0 ? 'Out of Stock' : (availability || 'In Stock');

    const { error } = await supabase
      .from('products')
      .upsert({
        id: prodId,
        code,
        name,
        manufacturer: manufacturer || 'AKM Pharma',
        category: category || 'General',
        batch_number: batchNumber || '',
        mrp: mrp || price,
        price,
        stock,
        expiry_date: expiryDate || null,
        availability: availStatus,
        updated_at: new Date().toISOString()
      }, { onConflict: 'code' });

    if (error) throw error;
    
    // Trigger low stock check
    await checkAndCreateLowStockNotification(code || prodId, name, stock);

    res.json({ success: true, message: 'Product updated in Supabase.', productId: prodId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products/bulk-upsert', async (req, res) => {
  const { products } = req.body;
  if (!Array.isArray(products)) {
    return res.status(400).json({ error: 'Products must be an array.' });
  }
  try {
    const formattedProducts = products.map(p => {
      const prodId = p.id || p.code || `prod_${Date.now()}_${Math.floor(Math.random()*1000)}`;
      const availStatus = p.stock <= 0 ? 'Out of Stock' : (p.availability || 'In Stock');
      return {
        id: prodId,
        code: p.code || prodId,
        name: p.name,
        manufacturer: p.manufacturer || 'AKM Pharma',
        category: p.category || 'General',
        batch_number: p.batch || p.batchNumber || '',
        mrp: p.mrp || p.price || 0.00,
        price: p.price || 0.00,
        stock: p.stock || 0,
        expiry_date: p.expiryDate || null,
        availability: availStatus,
        updated_at: new Date().toISOString()
      };
    });

    const { error } = await supabase
      .from('products')
      .upsert(formattedProducts, { onConflict: 'code' });

    if (error) {
      console.error('Supabase bulk upsert database rejection:', error);
      throw error;
    }

    // Trigger low stock checks in parallel
    await Promise.all(formattedProducts.map(p => 
      checkAndCreateLowStockNotification(p.code, p.name, p.stock)
    ));

    res.json({ success: true, message: `Successfully upserted ${formattedProducts.length} products.` });
  } catch (error) {
    console.error('Bulk upsert processing crash:', error);
    res.status(500).json({ error: error.message || 'Database transaction failed.' });
  }
});

app.post('/api/inventory/sync', async (req, res) => {
  try {
    const { data: dbUrlSetting } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'google_script_url')
      .single();

    const { data: dbIdSetting } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'google_sheet_id')
      .single();

    const sheetUrl = dbUrlSetting?.setting_value || process.env.GOOGLE_SCRIPT_URL;
    const sheetId = dbIdSetting?.setting_value || process.env.GOOGLE_SHEET_ID;

    if (!sheetUrl) throw new Error("GOOGLE_SCRIPT_URL is missing.");

    const fetchUrl = sheetId ? `${sheetUrl}?action=getInventory&sheetId=${sheetId}` : `${sheetUrl}?action=getInventory`;

    const response = await fetch(fetchUrl);
    if (!response.ok) throw new Error("Failed to fetch from Google Sheets.");
    
    const inventoryData = await response.json();
    let updatedCount = 0;
    
    if (inventoryData && inventoryData.length > 0) {
      const formattedProducts = [];
      for (const item of inventoryData) {
        if (!item.code && !item.name) continue;
        
        // If code is missing, derive it from the name to keep it consistent across syncs
        const rawCode = String(item.code || item.name.replace(/[^a-zA-Z0-9]/g, '-').toUpperCase()).trim();
        const rawStock = parseInt(item.stock) || 0;
        const availStatus = rawStock <= 0 ? 'Out of Stock' : 'In Stock';
        const productName = item.name || 'Unknown Product';
        const itemPrice = parseFloat(item.price) || 0;
        
        formattedProducts.push({
          id: rawCode,
          code: rawCode,
          name: productName,
          manufacturer: item.manufacturer || 'AKM Pharma',
          category: item.category || 'General',
          mrp: parseFloat(item.mrp) || itemPrice,
          price: itemPrice,
          stock: rawStock,
          availability: availStatus,
          updated_at: new Date().toISOString()
        });
      }

      // Deduplicate array by 'code' before bulk upsert to prevent Postgres transaction errors
      const uniqueProductsMap = new Map();
      for (const p of formattedProducts) {
        uniqueProductsMap.set(p.code, p);
      }
      const uniqueFormattedProducts = Array.from(uniqueProductsMap.values());

      // Execute a single bulk upsert for extreme speed and to avoid timeouts
      const { error } = await supabase
        .from('products')
        .upsert(uniqueFormattedProducts, { onConflict: 'code' });

      if (error) {
        console.error('Supabase bulk upsert error:', error);
        throw error;
      }
      
      // Fire off notifications async
      uniqueFormattedProducts.forEach(p => checkAndCreateLowStockNotification(p.code, p.name, p.stock).catch(console.error));
      
      updatedCount = uniqueFormattedProducts.length;
    }
    
    res.json({ success: true, message: `Synced ${updatedCount} products from Google Sheets.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------------------------------------------------------------------
// 3. AUTHENTICATION & LOGIN API (SUPABASE)
// ------------------------------------------------------------------------------

app.post('/api/customers/login', async (req, res) => {
  const { identifier, loginId, email, phone, password } = req.body;
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

  if (!identifier && !loginId && !email && !phone) {
    return res.status(400).json({ success: false, message: 'User ID, Email, or Mobile Number required.' });
  }
  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required.' });
  }

  try {
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*');

    if (error) throw error;

    // Try to match using all provided fields
    const cleanPhone = (phone || identifier || '').replace(/[^0-9]/g, '');
    const searchLoginId = (loginId || identifier || '').trim().toLowerCase();
    const searchEmail = (email || identifier || '').trim().toLowerCase();

    let matchedCustomer = (customers || []).find(c => {
      const matchByLoginId = c.login_id && searchLoginId && c.login_id.toLowerCase() === searchLoginId;
      const matchByEmail = c.email && searchEmail && c.email.toLowerCase() === searchEmail;
      const matchByPhone = c.phone && cleanPhone.length >= 7 && c.phone.replace(/[^0-9]/g, '').endsWith(cleanPhone.slice(-10));
      return matchByLoginId || matchByEmail || matchByPhone;
    });

    let isValid = false;
    if (matchedCustomer) {
      const hashed = hashPassword(password);
      // Allow plain-text match (for legacy) or hashed match
      isValid = matchedCustomer.password_hash === password || matchedCustomer.password_hash === hashed;
    }

    // Log the attempt
    const logId = `log_${Date.now()}`;
    await supabase.from('login_history').insert({
      id: logId,
      user_id: matchedCustomer ? matchedCustomer.id : 'unknown',
      identifier_used: identifier || loginId || email || phone,
      user_type: 'customer',
      ip_address: ipAddress,
      status: isValid ? 'SUCCESS' : 'FAILED',
      failure_reason: isValid ? null : (matchedCustomer ? 'Wrong password' : 'User not found')
    });

    if (isValid) {
      const userData = {
        uid: `cust_${matchedCustomer.id}`,
        name: matchedCustomer.customer_name,
        email: matchedCustomer.email || '',
        phone: matchedCustomer.phone || '',
        role: 'customer',
        loginId: matchedCustomer.login_id,
        outstandingAmount: matchedCustomer.outstanding_amount,
        creditStatus: matchedCustomer.credit_status,
        pharmacyName: matchedCustomer.pharmacy_name || ''
      };
      return res.json({ success: true, user: userData });
    } else {
      const msg = matchedCustomer 
        ? 'Incorrect password. Please try again.' 
        : 'No account found with these credentials. Please register first or contact AKM Office.';
      return res.status(401).json({ success: false, message: msg });
    }
  } catch (error) {
    console.error('Customer login error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during login.', error: error.message });
  }
});

// Customer Registration Endpoint
app.post('/api/customers/register', async (req, res) => {
  const { loginId, name, email, phone, password, pharmacyName } = req.body;

  if (!loginId || !name || !password) {
    return res.status(400).json({ success: false, message: 'User ID, Name, and Password are required.' });
  }

  try {
    // Check if login_id already exists
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('login_id', loginId.trim())
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(409).json({ success: false, message: 'This User ID is already taken. Please choose a different one.' });
    }

    // Check if email already exists (if provided)
    if (email) {
      const { data: emailExists } = await supabase
        .from('customers')
        .select('id')
        .eq('email', email.trim())
        .limit(1);
      if (emailExists && emailExists.length > 0) {
        return res.status(409).json({ success: false, message: 'This email is already registered.' });
      }
    }

    const custId = `cust_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const hashedPassword = hashPassword(password);

    const { error } = await supabase
      .from('customers')
      .insert({
        id: custId,
        login_id: loginId.trim(),
        password_hash: hashedPassword,
        customer_name: name.trim(),
        pharmacy_name: pharmacyName || '',
        phone: phone || null,
        email: email || null,
        outstanding_amount: 0,
        credit_status: 'Very Good'
      });

    if (error) throw error;

    // Log success
    await supabase.from('login_history').insert({
      id: `log_${Date.now()}`,
      user_id: custId,
      identifier_used: loginId.trim(),
      user_type: 'customer',
      ip_address: req.ip || '127.0.0.1',
      status: 'SUCCESS',
      failure_reason: null
    });

    res.json({ 
      success: true, 
      message: 'Account created successfully! You can now log in.',
      user: {
        uid: `cust_${custId}`,
        name: name.trim(),
        email: email || '',
        phone: phone || '',
        role: 'customer',
        loginId: loginId.trim(),
        outstandingAmount: 0,
        creditStatus: 'Very Good',
        pharmacyName: pharmacyName || ''
      }
    });
  } catch (error) {
    console.error('Customer registration error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during registration.', error: error.message });
  }
});

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username.trim());

    let isValid = false;
    let adminUser = users && users.length > 0 ? users[0] : null;
    const inputHash = hashPassword(password);

    if (adminUser) {
      isValid = adminUser.password_hash === password || adminUser.password_hash === inputHash;
    } else if (username.toLowerCase() === 'admin' && (password === 'admin123' || inputHash === hashPassword('admin123'))) {
      isValid = true;
    }

    const logId = `log_${Date.now()}`;
    await supabase.from('login_history').insert({
      id: logId,
      user_id: adminUser ? adminUser.id : 'admin_sys_uid',
      identifier_used: username,
      user_type: 'admin',
      ip_address: ipAddress,
      status: isValid ? 'SUCCESS' : 'FAILED'
    });

    if (isValid) {
      return res.json({
        success: true,
        user: {
          uid: adminUser ? adminUser.id : 'admin_sys_uid',
          name: adminUser ? adminUser.full_name : 'Administrator',
          role: 'owner',
          creditStatus: 'Very Good'
        }
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid Admin Username or Password.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/change-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin');

    if (error) throw error;
    const adminUser = users && users.length > 0 ? users[0] : null;

    if (!adminUser) {
      return res.status(404).json({ success: false, message: 'Admin account not found in database.' });
    }

    const currentHash = hashPassword(currentPassword);
    const isValid = adminUser.password_hash === currentPassword || adminUser.password_hash === currentHash;

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Incorrect current password.' });
    }

    const newHash = hashPassword(newPassword);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newHash })
      .eq('id', adminUser.id);

    if (updateError) throw updateError;
    res.json({ success: true, message: 'Admin password updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ------------------------------------------------------------------------------
// 4. ORDERS & CHECKOUT API (SUPABASE)
// ------------------------------------------------------------------------------

app.get('/api/orders', async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    for (let order of orders || []) {
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      order.items = (items || []).map(i => ({
        id: i.product_id,
        name: i.product_name,
        code: i.product_code,
        manufacturer: i.manufacturer,
        unit: i.unit,
        quantity: i.quantity,
        price: i.unit_price,
        total: i.total_price
      }));

      let ts = order.created_at ? String(order.created_at).trim() : '';
      if (ts && !ts.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(ts)) {
        ts = ts.replace(' ', 'T') + 'Z';
      }
      order.timestamp = ts || order.created_at;
      order.totalAmount = parseFloat(order.total_amount) || 0;
      order.customer = {
        uid: order.customer_id,
        name: order.customer_name,
        pharmacyName: order.pharmacy_name,
        phone: order.phone,
        role: 'customer'
      };
    }

    res.json(orders || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders/mark-viewed', async (req, res) => {
  const { orderId } = req.body;
  try {
    if (orderId) {
      const { error } = await supabase
        .from('orders')
        .update({ viewed: true })
        .eq('id', orderId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('orders')
        .update({ viewed: true })
        .eq('viewed', false);
      if (error) throw error;
    }
    res.json({ success: true, message: 'Order(s) marked as viewed.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/orders/status', async (req, res) => {
  const { orderId, orderStatus, paymentStatus, deliveryStatus } = req.body;
  try {
    const updateData = { viewed: true };
    if (orderStatus) updateData.order_status = orderStatus;
    if (paymentStatus) updateData.payment_status = paymentStatus;
    if (deliveryStatus) updateData.delivery_status = deliveryStatus;

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) throw error;
    res.json({ success: true, message: 'Order status updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  const { customer, items, totalAmount, comments } = req.body;

  try {
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const custId = customer?.uid || `cust_${Date.now()}`;

    // 0. Ensure Customer Exists to satisfy Foreign Key Constraint
    // First check if customer already exists by login_id or id
    let resolvedCustId = custId;
    const loginIdToCheck = customer?.loginId || custId;
    
    const { data: existingByLogin } = await supabase
      .from('customers')
      .select('id')
      .eq('login_id', loginIdToCheck)
      .limit(1);

    if (existingByLogin && existingByLogin.length > 0) {
      resolvedCustId = existingByLogin[0].id;
    } else {
      // Check by id directly
      const { data: existingById } = await supabase
        .from('customers')
        .select('id')
        .eq('id', custId)
        .limit(1);

      if (existingById && existingById.length > 0) {
        resolvedCustId = existingById[0].id;
      } else {
        // Customer doesn't exist at all, create them
        const { error: custErr } = await supabase.from('customers').insert({
          id: custId,
          login_id: loginIdToCheck,
          password_hash: 'fallback_hash',
          customer_name: customer?.name || 'Customer',
          pharmacy_name: customer?.pharmacyName || null,
          phone: customer?.phone || null,
          email: customer?.email || null
        });
        if (custErr) throw new Error("Customer Insert Error: " + custErr.message);
        resolvedCustId = custId;
      }
    }

    // 1. Insert Order Header into Supabase
    const { error: orderErr } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        customer_id: resolvedCustId,
        customer_name: customer?.name || 'Customer',
        pharmacy_name: customer?.pharmacyName || '',
        phone: customer?.phone || '',
        total_amount: totalAmount,
        payment_status: 'Pending',
        order_status: 'Received',
        delivery_status: 'Pending',
        comments: comments || '',
        created_at: new Date().toISOString()
      });

    if (orderErr) throw orderErr;

    // 2. Insert Order Items & Deduct Stock in Supabase
    for (let item of items) {
      await supabase.from('order_items').insert({
        order_id: orderId,
        product_id: item.id,
        product_name: item.name,
        product_code: item.code || '',
        manufacturer: item.manufacturer || '',
        unit: item.unit || 'Strip',
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      });

      // Deduct stock in products table
      const { data: prod } = await supabase.from('products').select('stock, name').eq('id', item.id).single();
      if (prod) {
        const newStock = Math.max(0, (prod.stock || 0) - item.quantity);
        await supabase
          .from('products')
          .update({
            stock: newStock,
            availability: newStock <= 0 ? 'Out of Stock' : 'In Stock'
          })
          .eq('id', item.id);
          
        await checkAndCreateLowStockNotification(item.id, prod.name || item.name, newStock);
      }
    }

    // Create new order notification
    const orderNotificationId = `notif_order_${orderId}`;
    await supabase.from('notifications').insert({
      id: orderNotificationId,
      title: 'New Order Received',
      message: `Order #${orderId} has been placed by ${customer?.name || 'Customer'} for ₹${totalAmount.toFixed(2)}.`,
      type: 'new_order',
      read: false,
      created_at: new Date().toISOString()
    });

    // 3. Update Google Sheet Master Inventory Asynchronously
    if (process.env.GOOGLE_SCRIPT_URL) {
      try {
        const sheetPayload = {
          action: 'deductStock',
          orderId: orderId,
          items: items.map(i => ({ id: i.id, code: i.code, name: i.name, quantity: i.quantity }))
        };
        // Fire and forget (don't await fully to prevent hanging the checkout)
        fetch(process.env.GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sheetPayload)
        }).catch(err => console.error('Google Sheet Sync Error:', err));
      } catch (err) {
        console.error('Failed to notify Google Sheet:', err);
      }
    }

    res.json({ success: true, message: 'Order placed successfully.', orderId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------------------------------------------------------------------
// 5. CUSTOMERS & SETTINGS API (SUPABASE)
// ------------------------------------------------------------------------------

app.get('/api/customers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('customer_name', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/login-history', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('login_history')
      .select('*')
      .order('login_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    const { data, error } = await supabase.from('system_settings').select('*');
    if (error) throw error;
    const settings = {};
    (data || []).forEach(r => { settings[r.setting_key] = r.setting_value; });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/settings', async (req, res) => {
  const { key, value } = req.body;
  try {
    const { error } = await supabase
      .from('system_settings')
      .upsert({ setting_key: key, setting_value: String(value) }, { onConflict: 'setting_key' });
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------------------------------------------------------------------
// 6. ADMINISTRATION & MANAGEMENT API (SUPABASE)
// ------------------------------------------------------------------------------

app.post('/api/products/delete', async (req, res) => {
  const { id } = req.body;
  try {
    await supabase.from('notifications').delete().eq('id', `notif_low_${id}`);

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/customers/import', async (req, res) => {
  const { customers } = req.body;
  if (!customers || !Array.isArray(customers)) {
    return res.status(400).json({ error: 'Customers array required' });
  }

  try {
    let imported = 0;
    for (const c of customers) {
      const loginId = c.loginId || c.login_id;
      if (!loginId) continue;

      const rawPassword = c.password || '1234';
      const hashedPassword = hashPassword(rawPassword);

      // Check if customer with this login_id already exists
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('login_id', loginId)
        .limit(1);

      if (existing && existing.length > 0) {
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update({
            password_hash: hashedPassword,
            customer_name: c.name || c.customer_name || 'Customer',
            pharmacy_name: c.pharmacyName || c.pharmacy_name || '',
            phone: c.phone || null,
            email: c.email || null,
            outstanding_amount: parseFloat(c.outstandingAmount || c.outstanding_amount) || 0,
            credit_status: c.status || c.credit_status || 'Very Good',
            updated_at: new Date().toISOString()
          })
          .eq('id', existing[0].id);
        if (error) throw error;
      } else {
        // Insert new customer
        const custId = c.id || `cust_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const { error } = await supabase
          .from('customers')
          .insert({
            id: custId,
            login_id: loginId,
            password_hash: hashedPassword,
            customer_name: c.name || c.customer_name || 'Customer',
            pharmacy_name: c.pharmacyName || c.pharmacy_name || '',
            phone: c.phone || null,
            email: c.email || null,
            outstanding_amount: parseFloat(c.outstandingAmount || c.outstanding_amount) || 0,
            credit_status: c.status || c.credit_status || 'Very Good'
          });
        if (error) throw error;
      }
      imported++;
    }

    res.json({ success: true, message: `Successfully imported ${imported} customers.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/customers/update', async (req, res) => {
  const { id, creditStatus, outstandingAmount, pharmacyName, phone, email, name } = req.body;
  try {
    const { error } = await supabase
      .from('customers')
      .update({
        customer_name: name,
        pharmacy_name: pharmacyName,
        phone: phone || null,
        email: email || null,
        outstanding_amount: parseFloat(outstandingAmount) || 0,
        credit_status: creditStatus || 'Very Good'
      })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders/update-status', async (req, res) => {
  const { id, orderStatus, paymentStatus, deliveryStatus } = req.body;
  try {
    const { error } = await supabase
      .from('orders')
      .update({
        order_status: orderStatus,
        payment_status: paymentStatus,
        delivery_status: deliveryStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/notifications', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications/read', async (req, res) => {
  const { id } = req.body;
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications/clear', async (req, res) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('read', true);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Database Initialization Function
const initializeDatabase = async () => {
  try {
    const { data: admins, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'admin')
      .limit(1);

    if (error) {
      console.error('Error checking admin status:', error.message);
      return;
    }

    if (!admins || admins.length === 0) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: 'admin_sys_uid',
          username: 'admin',
          password_hash: hashPassword('admin123'),
          full_name: 'Administrator',
          role: 'owner'
        });

      if (insertError) {
        console.error('Failed to create default administrator account:', insertError.message);
      } else {
        console.log('✅ Default administrator account created successfully (admin/admin123)');
      }
    } else {
      console.log('✅ Administrator account verified.');
    }
  } catch (err) {
    console.error('Database initialization error:', err.message);
  }
};

// Start Server
app.listen(PORT, async () => {
  console.log(`===================================================`);
  console.log(`🚀 AKM Pharma Supabase Express API Server Online`);
  console.log(`📡 Listening on http://localhost:${PORT}`);
  console.log(`⚡ Connected to Supabase Cloud Database`);
  console.log(`===================================================`);
  await initializeDatabase();
});
