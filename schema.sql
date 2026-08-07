-- ==============================================================================
-- AKM PHARMA & SURGICALS - REALTIME PRODUCTION SQL DATABASE SCHEMA
-- PostgreSQL (Supabase) Compatible
-- ==============================================================================

-- 1. USERS & ADMINS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('owner', 'admin', 'staff')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_user_role ON users (role);

-- 2. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(64) PRIMARY KEY,
    login_id VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    pharmacy_name VARCHAR(150),
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(150) UNIQUE,
    outstanding_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    credit_status VARCHAR(20) NOT NULL DEFAULT 'Very Good' CHECK (credit_status IN ('Very Good', 'Good', 'Moderate', 'Critical')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_customer_login ON customers (login_id);
CREATE INDEX IF NOT EXISTS idx_customer_email ON customers (email);
CREATE INDEX IF NOT EXISTS idx_customer_phone ON customers (phone);

-- 3. LOGIN HISTORY TABLE
CREATE TABLE IF NOT EXISTS login_history (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    identifier_used VARCHAR(150) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('customer', 'admin')),
    ip_address VARCHAR(45) NOT NULL DEFAULT '127.0.0.1',
    status VARCHAR(20) NOT NULL CHECK (status IN ('SUCCESS', 'FAILED')),
    failure_reason VARCHAR(255),
    login_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_login_history_user ON login_history (user_id);

-- 4. PRODUCTS (MEDICINE STOCK) TABLE
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(150) NOT NULL DEFAULT 'AKM Pharma',
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    batch_number VARCHAR(100),
    mrp DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    expiry_date DATE,
    availability VARCHAR(20) NOT NULL DEFAULT 'In Stock' CHECK (availability IN ('In Stock', 'Out of Stock', 'Unavailable')),
    offer_percentage DECIMAL(5, 2) DEFAULT 0.00,
    free_offer VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_product_code ON products (code);
CREATE INDEX IF NOT EXISTS idx_product_availability ON products (availability);

-- 5. ORDERS TABLE (WITH SHIPPING ADDRESS & PERSISTED DETAILS)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    pharmacy_name VARCHAR(150),
    phone VARCHAR(20),
    street_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Credit')),
    order_status VARCHAR(20) NOT NULL DEFAULT 'Received' CHECK (order_status IN ('Received', 'Processing', 'Dispatched', 'Delivered', 'Cancelled')),
    delivery_status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (delivery_status IN ('Pending', 'In Transit', 'Delivered')),
    viewed BOOLEAN NOT NULL DEFAULT FALSE,
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_order_customer ON orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_order_status ON orders (order_status);

-- 6. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL,
    product_id VARCHAR(64) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_code VARCHAR(50),
    manufacturer VARCHAR(150),
    unit VARCHAR(20) NOT NULL DEFAULT 'Strip' CHECK (unit IN ('Strip', 'Box', 'Piece')),
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_item_order ON order_items (order_id);

-- 7. EXCEL STOCK UPLOAD LOGS TABLE
CREATE TABLE IF NOT EXISTS upload_logs (
    id VARCHAR(64) PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    new_products_count INT NOT NULL DEFAULT 0,
    updated_products_count INT NOT NULL DEFAULT 0,
    failed_rows_count INT NOT NULL DEFAULT 0,
    log_details TEXT,
    admin_username VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. SYSTEM SETTINGS TABLE (PERSISTENT CATALOGUE & LOW STOCK THRESHOLD)
CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Initialize Default Settings
INSERT INTO system_settings (setting_key, setting_value)
VALUES 
    ('low_stock_threshold', '10'),
    ('catalog_file_url', '')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;


