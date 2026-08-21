-- KeyNexa Production Database Schema
-- Initial migration: 001_initial_schema.sql
-- Created: 2026-08-21
-- Purpose: Create all tables, functions, triggers, indexes, and RLS policies for the ecommerce platform

-- ============================================================================
-- SECTION 1: EXTENSIONS
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SECTION 2: CUSTOM TYPES & ENUMS
-- ============================================================================

-- User roles
CREATE TYPE user_role AS ENUM ('customer', 'admin');

-- Order status
CREATE TYPE order_status AS ENUM (
  'pending',        -- Just created, awaiting payment
  'confirmed',      -- Payment received
  'processing',     -- Being prepared for shipment
  'shipped',        -- In transit
  'delivered',      -- Successfully delivered
  'cancelled',      -- Customer or system cancelled
  'refunded'        -- Refund processed
);

-- Payment status
CREATE TYPE payment_status AS ENUM (
  'pending',        -- Awaiting payment
  'paid',           -- Payment received and confirmed
  'failed',         -- Payment attempt failed
  'refunded',       -- Money returned to customer
  'partially_refunded' -- Partial refund processed
);

-- Fulfillment status
CREATE TYPE fulfillment_status AS ENUM (
  'pending',        -- Not yet shipped
  'partially_shipped', -- Some items shipped
  'shipped',        -- All items shipped
  'delivered',      -- Confirmed delivery
  'cancelled'       -- Order cancelled before fulfillment
);

-- ============================================================================
-- SECTION 3: PROFILES TABLE (Customer/Admin)
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE RESTRICT,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CHECK (role IN ('customer', 'admin')),
  CHECK (full_name IS NULL OR char_length(full_name) > 0),
  CHECK (phone IS NULL OR char_length(phone) > 0)
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- ============================================================================
-- SECTION 4: CATALOG TABLES
-- ============================================================================

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CHECK (char_length(name) > 0),
  CHECK (char_length(slug) > 0),
  CHECK (sort_order >= 0)
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  short_description VARCHAR(500),
  description TEXT,
  sku VARCHAR(100) NOT NULL UNIQUE,
  price numeric(12,2) NOT NULL,
  compare_at_price numeric(12,2),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CHECK (char_length(name) > 0),
  CHECK (char_length(slug) > 0),
  CHECK (char_length(sku) > 0),
  CHECK (price > 0),
  CHECK (compare_at_price IS NULL OR compare_at_price > price),
  CHECK (char_length(currency) = 3)
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_active_featured_created ON products(is_active, is_featured, created_at DESC);

-- Product Images
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CHECK (char_length(image_url) > 0),
  CHECK (sort_order >= 0)
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON product_images(is_primary);
CREATE INDEX IF NOT EXISTS idx_product_images_sort_order ON product_images(sort_order);

-- Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  price numeric(12,2) NOT NULL,
  compare_at_price numeric(12,2),
  attributes JSONB NOT NULL DEFAULT '{}'::JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CHECK (char_length(name) > 0),
  CHECK (char_length(sku) > 0),
  CHECK (price > 0),
  CHECK (compare_at_price IS NULL OR compare_at_price > price)
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_is_active ON product_variants(is_active);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints: One of product_id or variant_id must be set, but not both
  CHECK (
    (product_id IS NOT NULL AND variant_id IS NULL) OR
    (product_id IS NULL AND variant_id IS NOT NULL)
  ),
  CHECK (quantity >= 0),
  CHECK (reserved_quantity >= 0),
  CHECK (reserved_quantity <= quantity),
  CHECK (low_stock_threshold >= 0),
  -- Unique constraint ensures one inventory record per product/variant
  UNIQUE (product_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_variant_id ON inventory(variant_id);

-- ============================================================================
-- SECTION 5: CUSTOMER TABLES
-- ============================================================================

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address_line_1 VARCHAR(255) NOT NULL,
  address_line_2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state_or_region VARCHAR(100),
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(2) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CHECK (char_length(full_name) > 0),
  CHECK (char_length(address_line_1) > 0),
  CHECK (char_length(city) > 0),
  CHECK (char_length(postal_code) > 0),
  CHECK (char_length(country) = 2)
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_default ON addresses(user_id, is_default);

-- Carts
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Unique constraint: one active cart per user
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);

-- Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CHECK (quantity > 0),
  -- Prevent duplicate product/variant combinations in the same cart
  UNIQUE (cart_id, product_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_variant_id ON cart_items(variant_id);

-- ============================================================================
-- SECTION 6: ORDER TABLES
-- ============================================================================

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  status order_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  fulfillment_status fulfillment_status NOT NULL DEFAULT 'pending',
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  subtotal numeric(12,2) NOT NULL,
  shipping_amount numeric(12,2) NOT NULL DEFAULT 0,
  discount_amount numeric(12,2) NOT NULL DEFAULT 0,
  tax_amount numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL,
  -- Address snapshots stored as JSONB to preserve historical data
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CHECK (char_length(order_number) > 0),
  CHECK (char_length(currency) = 3),
  CHECK (subtotal >= 0),
  CHECK (shipping_amount >= 0),
  CHECK (discount_amount >= 0),
  CHECK (tax_amount >= 0),
  CHECK (total >= 0),
  CHECK (total = subtotal + shipping_amount - discount_amount + tax_amount)
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name_snapshot VARCHAR(255) NOT NULL,
  variant_name_snapshot VARCHAR(255),
  sku_snapshot VARCHAR(100) NOT NULL,
  unit_price numeric(12,2) NOT NULL,
  quantity INTEGER NOT NULL,
  total numeric(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CHECK (char_length(product_name_snapshot) > 0),
  CHECK (char_length(sku_snapshot) > 0),
  CHECK (unit_price > 0),
  CHECK (quantity > 0),
  CHECK (total = unit_price * quantity)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);

-- ============================================================================
-- SECTION 7: UTILITY FUNCTIONS
-- ============================================================================

-- Function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to verify if the authenticated user is an admin
-- This is used by RLS policies to check admin status server-side
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- SECTION 8: TRIGGERS (Updated_at)
-- ============================================================================

-- Drop existing triggers if they exist (safe for re-runs)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;
DROP TRIGGER IF EXISTS update_carts_updated_at ON carts;
DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;

-- Create triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SECTION 9: ROW LEVEL SECURITY (Enable RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 10: ROW LEVEL SECURITY (Policies)
-- ============================================================================

-- PROFILES POLICIES
-- Users can read and update their own profile
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Users cannot change their own role
    (role = (SELECT role FROM profiles WHERE id = auth.uid())) OR
    -- Allow NULL for new records
    (role IS NULL)
  );

-- Admins can read all profiles
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "profiles_delete_admin" ON profiles;
CREATE POLICY "profiles_delete_admin" ON profiles
  FOR DELETE USING (public.is_admin());

-- Service role can insert (used when creating profiles for new auth users)
DROP POLICY IF EXISTS "profiles_insert_service" ON profiles;
CREATE POLICY "profiles_insert_service" ON profiles
  FOR INSERT WITH CHECK (true); -- Service role not affected by RLS

-- CATEGORIES POLICIES
-- Anyone can read active categories
DROP POLICY IF EXISTS "categories_select_public" ON categories;
CREATE POLICY "categories_select_public" ON categories
  FOR SELECT USING (is_active = true);

-- Admins can read all categories (including inactive)
DROP POLICY IF EXISTS "categories_select_admin" ON categories;
CREATE POLICY "categories_select_admin" ON categories
  FOR SELECT USING (public.is_admin());

-- Admins can insert/update/delete categories
DROP POLICY IF EXISTS "categories_insert_admin" ON categories;
CREATE POLICY "categories_insert_admin" ON categories
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "categories_update_admin" ON categories;
CREATE POLICY "categories_update_admin" ON categories
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "categories_delete_admin" ON categories;
CREATE POLICY "categories_delete_admin" ON categories
  FOR DELETE USING (public.is_admin());

-- PRODUCTS POLICIES
-- Anyone can read active products
DROP POLICY IF EXISTS "products_select_public" ON products;
CREATE POLICY "products_select_public" ON products
  FOR SELECT USING (is_active = true);

-- Admins can read all products
DROP POLICY IF EXISTS "products_select_admin" ON products;
CREATE POLICY "products_select_admin" ON products
  FOR SELECT USING (public.is_admin());

-- Admins can insert/update/delete products
DROP POLICY IF EXISTS "products_insert_admin" ON products;
CREATE POLICY "products_insert_admin" ON products
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "products_update_admin" ON products;
CREATE POLICY "products_update_admin" ON products
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "products_delete_admin" ON products;
CREATE POLICY "products_delete_admin" ON products
  FOR DELETE USING (public.is_admin());

-- PRODUCT_IMAGES POLICIES
-- Anyone can read images for active products
DROP POLICY IF EXISTS "product_images_select_public" ON product_images;
CREATE POLICY "product_images_select_public" ON product_images
  FOR SELECT USING (
    product_id IN (SELECT id FROM products WHERE is_active = true)
  );

-- Admins can read all product images
DROP POLICY IF EXISTS "product_images_select_admin" ON product_images;
CREATE POLICY "product_images_select_admin" ON product_images
  FOR SELECT USING (public.is_admin());

-- Admins can manage product images
DROP POLICY IF EXISTS "product_images_insert_admin" ON product_images;
CREATE POLICY "product_images_insert_admin" ON product_images
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "product_images_update_admin" ON product_images;
CREATE POLICY "product_images_update_admin" ON product_images
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "product_images_delete_admin" ON product_images;
CREATE POLICY "product_images_delete_admin" ON product_images
  FOR DELETE USING (public.is_admin());

-- PRODUCT_VARIANTS POLICIES
-- Anyone can read active variants
DROP POLICY IF EXISTS "product_variants_select_public" ON product_variants;
CREATE POLICY "product_variants_select_public" ON product_variants
  FOR SELECT USING (is_active = true);

-- Admins can read all variants
DROP POLICY IF EXISTS "product_variants_select_admin" ON product_variants;
CREATE POLICY "product_variants_select_admin" ON product_variants
  FOR SELECT USING (public.is_admin());

-- Admins can manage variants
DROP POLICY IF EXISTS "product_variants_insert_admin" ON product_variants;
CREATE POLICY "product_variants_insert_admin" ON product_variants
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "product_variants_update_admin" ON product_variants;
CREATE POLICY "product_variants_update_admin" ON product_variants
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "product_variants_delete_admin" ON product_variants;
CREATE POLICY "product_variants_delete_admin" ON product_variants
  FOR DELETE USING (public.is_admin());

-- INVENTORY POLICIES
-- Anyone can read inventory (for availability checks)
DROP POLICY IF EXISTS "inventory_select_public" ON inventory;
CREATE POLICY "inventory_select_public" ON inventory
  FOR SELECT USING (true);

-- Admins can manage inventory
DROP POLICY IF EXISTS "inventory_insert_admin" ON inventory;
CREATE POLICY "inventory_insert_admin" ON inventory
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "inventory_update_admin" ON inventory;
CREATE POLICY "inventory_update_admin" ON inventory
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "inventory_delete_admin" ON inventory;
CREATE POLICY "inventory_delete_admin" ON inventory
  FOR DELETE USING (public.is_admin());

-- ADDRESSES POLICIES
-- Users can read their own addresses
DROP POLICY IF EXISTS "addresses_select_own" ON addresses;
CREATE POLICY "addresses_select_own" ON addresses
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert/update/delete their own addresses
DROP POLICY IF EXISTS "addresses_insert_own" ON addresses;
CREATE POLICY "addresses_insert_own" ON addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "addresses_update_own" ON addresses;
CREATE POLICY "addresses_update_own" ON addresses
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "addresses_delete_own" ON addresses;
CREATE POLICY "addresses_delete_own" ON addresses
  FOR DELETE USING (auth.uid() = user_id);

-- Admins can read all addresses
DROP POLICY IF EXISTS "addresses_select_admin" ON addresses;
CREATE POLICY "addresses_select_admin" ON addresses
  FOR SELECT USING (public.is_admin());

-- CARTS POLICIES
-- Users can read their own cart
DROP POLICY IF EXISTS "carts_select_own" ON carts;
CREATE POLICY "carts_select_own" ON carts
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert/update their own cart
DROP POLICY IF EXISTS "carts_insert_own" ON carts;
CREATE POLICY "carts_insert_own" ON carts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "carts_update_own" ON carts;
CREATE POLICY "carts_update_own" ON carts
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own cart
DROP POLICY IF EXISTS "carts_delete_own" ON carts;
CREATE POLICY "carts_delete_own" ON carts
  FOR DELETE USING (auth.uid() = user_id);

-- Admins can read all carts
DROP POLICY IF EXISTS "carts_select_admin" ON carts;
CREATE POLICY "carts_select_admin" ON carts
  FOR SELECT USING (public.is_admin());

-- CART_ITEMS POLICIES
-- Users can read items in their own cart
DROP POLICY IF EXISTS "cart_items_select_own" ON cart_items;
CREATE POLICY "cart_items_select_own" ON cart_items
  FOR SELECT USING (
    cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid())
  );

-- Users can insert items into their own cart
DROP POLICY IF EXISTS "cart_items_insert_own" ON cart_items;
CREATE POLICY "cart_items_insert_own" ON cart_items
  FOR INSERT WITH CHECK (
    cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid())
  );

-- Users can update items in their own cart
DROP POLICY IF EXISTS "cart_items_update_own" ON cart_items;
CREATE POLICY "cart_items_update_own" ON cart_items
  FOR UPDATE USING (
    cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid())
  );

-- Users can delete items from their own cart
DROP POLICY IF EXISTS "cart_items_delete_own" ON cart_items;
CREATE POLICY "cart_items_delete_own" ON cart_items
  FOR DELETE USING (
    cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid())
  );

-- Admins can read all cart items
DROP POLICY IF EXISTS "cart_items_select_admin" ON cart_items;
CREATE POLICY "cart_items_select_admin" ON cart_items
  FOR SELECT USING (public.is_admin());

-- ORDERS POLICIES
-- Users can read their own orders
DROP POLICY IF EXISTS "orders_select_own" ON orders;
CREATE POLICY "orders_select_own" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Users cannot modify orders after creation
DROP POLICY IF EXISTS "orders_insert_own" ON orders;
CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can read all orders
DROP POLICY IF EXISTS "orders_select_admin" ON orders;
CREATE POLICY "orders_select_admin" ON orders
  FOR SELECT USING (public.is_admin());

-- Admins can update orders (for status/payment/fulfillment)
DROP POLICY IF EXISTS "orders_update_admin" ON orders;
CREATE POLICY "orders_update_admin" ON orders
  FOR UPDATE USING (public.is_admin());

-- Admins can delete orders
DROP POLICY IF EXISTS "orders_delete_admin" ON orders;
CREATE POLICY "orders_delete_admin" ON orders
  FOR DELETE USING (public.is_admin());

-- ORDER_ITEMS POLICIES
-- Users can read items in their own orders
DROP POLICY IF EXISTS "order_items_select_own" ON order_items;
CREATE POLICY "order_items_select_own" ON order_items
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
  );

-- Users cannot modify order items (immutable)
DROP POLICY IF EXISTS "order_items_insert_own" ON order_items;
CREATE POLICY "order_items_insert_own" ON order_items
  FOR INSERT WITH CHECK (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
  );

-- Admins can read all order items
DROP POLICY IF EXISTS "order_items_select_admin" ON order_items;
CREATE POLICY "order_items_select_admin" ON order_items
  FOR SELECT USING (public.is_admin());

-- Admins can insert order items
DROP POLICY IF EXISTS "order_items_insert_admin" ON order_items;
CREATE POLICY "order_items_insert_admin" ON order_items
  FOR INSERT WITH CHECK (public.is_admin());

-- Admins can delete order items (if needed for order correction)
DROP POLICY IF EXISTS "order_items_delete_admin" ON order_items;
CREATE POLICY "order_items_delete_admin" ON order_items
  FOR DELETE USING (public.is_admin());

-- ============================================================================
-- SECTION 11: PERFORMANCE INDEXES (Additional)
-- ============================================================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_cart_items_unique_constraint ON cart_items(cart_id, product_id, variant_id);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- All tables, functions, triggers, indexes, and RLS policies have been created.
-- The database is now ready for application use.
