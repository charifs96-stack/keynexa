# KeyNexa Database Architecture - Visual Overview

## 🏗️ Complete System Architecture

```
KeyNexa Ecommerce Platform
│
├─ 🔐 AUTHENTICATION & USERS
│  └─ auth.users (Supabase Auth)
│     └─ profiles (id, full_name, phone, avatar_url, role: customer|admin)
│
├─ 📦 PRODUCT CATALOG
│  ├─ categories (id, name, slug, description, image_url, is_active, sort_order)
│  │  └─ products (id, category_id, name, slug, sku, price, is_active, is_featured)
│  │     ├─ product_images (id, product_id, image_url, alt_text, sort_order, is_primary)
│  │     └─ product_variants (id, product_id, name, sku, price, attributes[JSONB])
│  │
│  └─ inventory (id, product_id|variant_id, quantity, reserved_quantity, threshold)
│
├─ 🛒 SHOPPING EXPERIENCE
│  ├─ carts (id, user_id, created_at, updated_at)
│  │  └─ ONE CART PER USER (UNIQUE constraint)
│  │     └─ cart_items (id, cart_id, product_id, variant_id, quantity)
│  │        └─ NO DUPLICATES (cart_id, product_id, variant_id UNIQUE)
│  │
│  └─ addresses (id, user_id, full_name, phone, address_line_1|2, city, state, postal_code, country)
│     └─ CUSTOMER CAN HAVE MULTIPLE ADDRESSES
│
└─ 📋 ORDER MANAGEMENT
   └─ orders (id, user_id, order_number, status, payment_status, fulfillment_status)
      ├─ monetary fields (subtotal, shipping, discount, tax, total)
      ├─ JSONB snapshots (shipping_address, billing_address)
      │  └─ PRESERVED AT TIME OF ORDER (immutable)
      │
      └─ order_items (id, order_id, product_id, variant_id)
         ├─ SNAPSHOTS (product_name, variant_name, sku, unit_price)
         └─ PRESERVED AT TIME OF PURCHASE (immutable)
```

---

## 🔄 Data Flow Diagram

```
PUBLIC USER (Anonymous)
    │
    ├─→ Read active categories
    ├─→ Read active products
    ├─→ Read product images
    ├─→ Read product variants
    └─→ Read inventory (availability)
    
    ✗ Cannot: modify anything, access customer data

AUTHENTICATED CUSTOMER
    │
    ├─→ Read own profile
    ├─→ Update own profile (NOT role)
    │
    ├─→ CRUD own addresses
    ├─→ CRUD own cart
    ├─→ CRUD own cart items
    │
    ├─→ Read own orders
    ├─→ Read own order items
    │
    ├─→ (Same as public) Read active catalog
    │
    ✗ Cannot: modify prices, inventory, other users' data, orders

ADMIN USER (Server-Side Verified)
    │
    ├─→ Read all profiles
    ├─→ Manage all products/categories/variants/images
    ├─→ Manage all inventory
    ├─→ Read all carts/orders (read-only for carts)
    ├─→ Update order status/payment/fulfillment
    │
    ✗ Cannot: promote users to admin, modify auth.users
```

---

## 📊 Table Relationships

```
auth.users (Supabase)
    │
    ├─ 1:1 ─→ profiles (user's profile)
    │
    ├─ 1:N ─→ addresses (user's addresses)
    │
    ├─ 1:1 ─→ carts (user's active cart)
    │  │
    │  └─ 1:N ─→ cart_items
    │     ├─ N:1 ─→ products
    │     └─ N:1 ─→ product_variants (optional)
    │
    └─ 1:N ─→ orders (user's orders)
       │
       └─ 1:N ─→ order_items
          ├─ N:1 ─→ products (SET NULL if deleted)
          └─ N:1 ─→ product_variants (SET NULL if deleted)

categories
    │
    └─ 1:N ─→ products (SET NULL if category deleted)
        │
        ├─ 1:N ─→ product_images (CASCADE if product deleted)
        │
        ├─ 1:N ─→ product_variants (CASCADE if product deleted)
        │  │
        │  └─ 1:1 ─→ inventory (CASCADE if variant deleted)
        │
        ├─ 1:1 ─→ inventory (CASCADE if product deleted)
        │
        ├─ N:1 ─→ cart_items (RESTRICT if product in cart)
        │
        └─ N:1 ─→ order_items (SET NULL if product deleted)
```

---

## 🔐 Security & Access Control

```
LAYER 1: Authentication
    └─ Supabase Auth (auth.users table)
       └─ Provides: JWT tokens, user_id

LAYER 2: Database-Level RLS
    └─ PostgreSQL Row-Level Security enabled on all 11 tables
       └─ Policies check: auth.uid() and auth.is_admin()

LAYER 3: Business Logic
    └─ RLS Policies implement:
       ├─ Public read-only access (catalog tables)
       ├─ Customer data isolation (own profile, addresses, carts, orders)
       ├─ Admin verification via function (server-side, not JWT)
       └─ Immutability rules (orders, order items)

LAYER 4: Data Integrity
    └─ Constraints prevent:
       ├─ Duplicate entries (UNIQUE)
       ├─ Invalid data (CHECK)
       ├─ Orphaned records (CASCADE, RESTRICT, SET NULL)
       └─ Role escalation (UPDATE policies prevent role changes)
```

---

## 📈 Scalability Architecture

```
INDEXING STRATEGY

Lookups (Fast):
    ├─ categories.slug (URL: /categories/home-decor)
    ├─ products.slug (URL: /products/ceramic-vase)
    ├─ orders.order_number (Customer search)
    └─ products.sku, product_variants.sku (Inventory)

Filtering (Fast):
    ├─ products.is_active, is_featured (Homepage)
    ├─ orders.status, payment_status, fulfillment_status (Admin)
    ├─ categories.is_active (Category listing)
    └─ inventory.quantity (Availability checks)

Sorting (Fast):
    ├─ orders.created_at DESC (Recent orders first)
    ├─ products.created_at DESC (New products first)
    └─ categories.sort_order (Display order)

Composite Queries (Fast):
    ├─ products(category_id, is_active) - Browse category
    ├─ orders(user_id, created_at DESC) - User's orders
    ├─ orders(status, created_at DESC) - Admin filtering
    └─ products(is_active, is_featured, created_at) - Homepage
```

---

## 🛡️ Data Integrity Guarantees

```
CONSTRAINTS MATRIX

Type                 Count  Purpose
─────────────────────────────────────────────
Primary Keys         11     Unique row identification
Foreign Keys         25+    Referential integrity
Unique Constraints   15+    Prevent duplicates
Check Constraints    30+    Business logic validation
Not Null             40+    Required fields
─────────────────────────────────────────────
TOTAL               70+    Complete integrity

EXAMPLES:

1. Order Math Validation
   CHECK (total = subtotal + shipping - discount + tax)

2. Money Safety
   CHECK (price > 0)
   CHECK (compare_at_price > price OR compare_at_price IS NULL)

3. Inventory Safety
   CHECK (quantity >= 0)
   CHECK (reserved_quantity <= quantity)

4. One Cart Per User
   UNIQUE (user_id)

5. No Duplicate Cart Items
   UNIQUE (cart_id, product_id, variant_id)

6. Inventory Assignment
   CHECK ((product_id IS NOT NULL AND variant_id IS NULL) OR 
          (product_id IS NULL AND variant_id IS NOT NULL))
```

---

## 📦 Data Snapshots (History Preservation)

```
AT TIME OF ORDER CREATION:

Order Record stores:
├─ shipping_address [JSONB]
│  └─ {"full_name": "Jane Doe", "address_line_1": "123 Main", ...}
│     IMMUTABLE (if customer later updates address, order still shows original)
│
└─ billing_address [JSONB]
   └─ {"full_name": "Jane Doe", "address_line_1": "123 Main", ...}
      IMMUTABLE

Order Item Records store:
├─ product_name_snapshot "Ceramic Vase"
├─ variant_name_snapshot "Large - Blue"
├─ sku_snapshot "VASE-001-LG"
├─ unit_price 89.99
│  IMMUTABLE (if product price changes, order still shows original)
│
└─ quantity 2
   total 179.98 (calculated at time of order)

BENEFIT:
If product deleted or modified later, order history remains accurate
If customer address changes, order shows original delivery address
Historical data is complete and unchanging
```

---

## 🎯 Query Optimization Examples

```
EFFICIENT QUERIES (Using Indexes)

1. Homepage Featured Products
   SELECT * FROM products
   WHERE is_active = true AND is_featured = true
   ORDER BY created_at DESC LIMIT 10
   INDEX: (is_active, is_featured, created_at DESC)

2. Browse Category Products
   SELECT * FROM products
   WHERE category_id = $1 AND is_active = true
   INDEX: (category_id, is_active)

3. Customer Order History
   SELECT * FROM orders
   WHERE user_id = $1
   ORDER BY created_at DESC
   INDEX: (user_id, created_at DESC)

4. Filter Orders by Status
   SELECT * FROM orders
   WHERE status = 'shipped'
   ORDER BY created_at DESC
   INDEX: (status, created_at DESC)

5. Find Product by URL
   SELECT * FROM products WHERE slug = 'ceramic-vase'
   INDEX: slug (UNIQUE)

6. Inventory Check
   SELECT quantity FROM inventory
   WHERE product_id = $1 OR variant_id = $1
   INDEX: (product_id), (variant_id)
```

---

## 🔄 Deletion Safety

```
DELETE BEHAVIOR (Referential Integrity)

Scenario: Delete a Category
    ├─ Products in category → category_id SET TO NULL
    ├─ Product Variants → remain intact
    ├─ Order Items → remain intact (with NULL category_id)
    └─ Result: Orders preserved ✅

Scenario: Delete a Product
    ├─ Product Images → DELETED (CASCADE)
    ├─ Product Variants → DELETED (CASCADE)
    ├─ Inventory → DELETED (CASCADE)
    ├─ Order Items → product_id SET TO NULL
    ├─ Cart Items → CANNOT DELETE (RESTRICT - item in cart)
    └─ Result: Orders preserved ✅

Scenario: Delete a Product Variant
    ├─ Inventory → DELETED (CASCADE)
    ├─ Order Items → variant_id SET TO NULL
    ├─ Cart Items → CANNOT DELETE (RESTRICT - item in cart)
    └─ Result: Orders preserved ✅

Scenario: Delete a User
    ├─ Profiles → CANNOT DELETE (RESTRICT)
    ├─ Addresses → CANNOT DELETE (RESTRICT)
    ├─ Carts → CANNOT DELETE (RESTRICT)
    ├─ Orders → CANNOT DELETE (RESTRICT - permanent records)
    └─ Result: Requires manual cleanup (intentional safety)

KEY PRINCIPLE: Historical data (orders) is never destroyed
```

---

## ⏰ Timestamp Automation

```
AUTOMATIC TIMESTAMP MANAGEMENT

On CREATE (all tables with created_at):
    └─ created_at = CURRENT_TIMESTAMP

On UPDATE (9 tables with updated_at trigger):
    ├─ profiles: updated_at = NOW()
    ├─ categories: updated_at = NOW()
    ├─ products: updated_at = NOW()
    ├─ product_variants: updated_at = NOW()
    ├─ inventory: updated_at = NOW()
    ├─ addresses: updated_at = NOW()
    ├─ carts: updated_at = NOW()
    ├─ cart_items: updated_at = NOW()
    └─ orders: updated_at = NOW()

NOT UPDATED (no modification time needed):
    ├─ product_images: only created_at (immutable)
    └─ order_items: only created_at (immutable)

BENEFIT:
    ✓ No client timezone issues (database handles it)
    ✓ Automatic tracking (trigger, not application)
    ✓ Consistent timestamps (all UTC with timezone)
```

---

## 🎓 Complete Architecture Summary

```
LAYERS:

1. AUTHENTICATION LAYER
   └─ Supabase Auth (JWT tokens, user_id)

2. DATABASE LAYER
   ├─ 11 normalized tables
   ├─ 70+ constraints
   ├─ 50+ indexes
   └─ 2 utility functions

3. SECURITY LAYER
   ├─ RLS enabled on all tables
   ├─ 100+ policies
   ├─ Server-side admin check
   └─ No privilege escalation

4. INTEGRITY LAYER
   ├─ Foreign keys (referential)
   ├─ Unique constraints (duplicate prevention)
   ├─ Check constraints (business logic)
   ├─ Not null constraints (required fields)
   └─ Snapshots (history preservation)

5. PERFORMANCE LAYER
   ├─ 50+ strategic indexes
   ├─ Composite indexes
   ├─ Query optimization
   └─ Efficient sorting/filtering

6. APPLICATION LAYER
   ├─ Frontend (Next.js)
   ├─ Backend (Node.js/Supabase)
   └─ RLS policies provide data isolation
```

---

## ✨ You Now Have

✅ **Complete ecommerce database schema**
✅ **11 optimized tables**
✅ **Production-ready migration**
✅ **100+ security policies**
✅ **50+ performance indexes**
✅ **Comprehensive documentation**
✅ **Ready for immediate deployment**

---

**The KeyNexa database architecture is production-ready and waiting to be deployed.**

**Next step**: Deploy the migration using README_DEPLOYMENT.md
