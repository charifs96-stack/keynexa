# KeyNexa Database Architecture

## Overview

This document describes the production PostgreSQL database schema for KeyNexa, a premium ecommerce platform built on Supabase. The schema supports the complete ecommerce workflow including product catalog, shopping carts, customer management, and order processing.

**Key Principles:**
- **Data Integrity**: Foreign keys, constraints, and triggers enforce consistency
- **Security**: Row-Level Security (RLS) policies protect customer data
- **Performance**: Strategic indexes optimize common queries
- **History Preservation**: Order snapshots preserve historical accuracy
- **Extensibility**: JSONB fields allow flexible attribute storage

---

## Database Entities

### 1. Profiles (Customer & Admin Management)

**Table: `profiles`**

Extends Supabase's `auth.users` with application-specific user profile information.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID PK | References auth.users(id) - Foreign key link to authentication |
| full_name | VARCHAR(255) | User's full name |
| phone | VARCHAR(20) | Contact phone number |
| avatar_url | TEXT | URL to profile picture stored in Supabase Storage |
| role | user_role ENUM | 'customer' or 'admin' - Determines access level |
| created_at | TIMESTAMPTZ | Record creation timestamp (auto) |
| updated_at | TIMESTAMPTZ | Last modification timestamp (auto via trigger) |

**Special Features:**
- Primary key references `auth.users(id)` with `ON DELETE RESTRICT` (users cannot be deleted without manual cleanup)
- Role is immutable through client updates (users cannot promote themselves)
- Admin verification uses database-side function `auth.is_admin()` (not client-side)

**Security:**
- RLS: Users can read/update own profile; admins can read all
- Users cannot change their own role to 'admin'
- Role promotion only possible through backend/admin operations

---

### 2. Categories (Product Organization)

**Table: `categories`**

Organizes products into browsable categories.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID PK | Unique identifier |
| name | VARCHAR(255) UNIQUE | Display name (e.g., "Home Decor") |
| slug | VARCHAR(255) UNIQUE | URL-friendly identifier (e.g., "home-decor") |
| description | TEXT | Long description for category pages |
| image_url | TEXT | Hero image for category display |
| is_active | BOOLEAN | Controls visibility (default: true) |
| sort_order | INTEGER | Display order in listings (default: 0) |
| created_at | TIMESTAMPTZ | Record creation timestamp (auto) |
| updated_at | TIMESTAMPTZ | Last modification timestamp (auto via trigger) |

**Indexes:**
- Slug (unique), is_active, sort_order for efficient filtering

**Security:**
- RLS: Public can read active categories; admins have full access

**Deletion Behavior:**
- `ON DELETE CASCADE` from category does NOT affect products (SET NULL instead in foreign key)
- Historical data is preserved if a category is removed

---

### 3. Products (Catalog Items)

**Table: `products`**

Core product information in the catalog.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID PK | Unique identifier |
| category_id | UUID FK | References categories(id) - Optional (SET NULL on category delete) |
| name | VARCHAR(255) | Product display name |
| slug | VARCHAR(255) UNIQUE | URL-friendly identifier |
| short_description | VARCHAR(500) | Brief description for listings |
| description | TEXT | Full description for product pages |
| sku | VARCHAR(100) UNIQUE | Stock Keeping Unit for inventory |
| price | numeric(12,2) | Current selling price (not floating point) |
| compare_at_price | numeric(12,2) | Original/list price (optional) |
| currency | VARCHAR(3) | ISO 4217 code (default: USD) |
| is_active | BOOLEAN | Controls visibility (default: true) |
| is_featured | BOOLEAN | Highlights on homepage (default: false) |
| created_at | TIMESTAMPTZ | Record creation timestamp (auto) |
| updated_at | TIMESTAMPTZ | Last modification timestamp (auto via trigger) |

**Type Choices:**
- **numeric(12,2)**: Decimal type prevents floating-point errors in money calculations
- **Allows values like**: 99.99, 1000.50, 0.01, etc.
- **Constraint**: price > 0, compare_at_price > price (if present)

**Indexes:**
- slug (unique), category_id, is_active, is_featured
- Composite: (is_active, is_featured, created_at DESC) for homepage queries

**Security:**
- RLS: Public can read active products; admins have full access
- Customers cannot modify product prices or availability

---

### 4. Product Images (Multiple Images Per Product)

**Table: `product_images`**

Supports multiple images per product with primary image selection.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID PK | Unique identifier |
| product_id | UUID FK | References products(id) ON DELETE CASCADE |
| image_url | TEXT | URL in Supabase Storage |
| alt_text | VARCHAR(255) | Accessibility text |
| sort_order | INTEGER | Display order (default: 0) |
| is_primary | BOOLEAN | Marks thumbnail image (default: false) |
| created_at | TIMESTAMPTZ | Record creation timestamp (auto) |

**Deletion Behavior:**
- `ON DELETE CASCADE`: Deleting a product automatically removes all images

**Security:**
- RLS: Public can view images for active products; admins have full access

---

### 5. Product Variants (Size, Color, License, etc.)

**Table: `product_variants`**

Supports flexible product variants with extensible attributes.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID PK | Unique identifier |
| product_id | UUID FK | References products(id) ON DELETE CASCADE |
| name | VARCHAR(255) | Variant display name (e.g., "Large - Blue") |
| sku | VARCHAR(100) UNIQUE | Variant-specific SKU |
| price | numeric(12,2) | Variant-specific price override |
| compare_at_price | numeric(12,2) | Variant compare price (optional) |
| attributes | JSONB | Flexible key-value pairs for variant options |
| is_active | BOOLEAN | Controls availability (default: true) |
| created_at | TIMESTAMPTZ | Record creation timestamp (auto) |
| updated_at | TIMESTAMPTZ | Last modification timestamp (auto via trigger) |

**JSONB Attributes Example:**
```json
{
  "size": "Large",
  "color": "Deep Blue",
  "license": "Professional",
  "edition": "Premium"
}
```

**Deletion Behavior:**
- `ON DELETE CASCADE`: Deleting a product removes all variants
- `ON DELETE RESTRICT`: Cart items cannot reference deleted variants

**Security:**
- RLS: Public can read active variants; admins have full access

---

### 6. Inventory (Stock Tracking)

**Table: `inventory`**

Manages stock levels for products and variants separately.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID PK | Unique identifier |
| product_id | UUID FK | References products(id) (mutually exclusive with variant_id) |
| variant_id | UUID FK | References product_variants(id) (mutually exclusive with product_id) |
| quantity | INTEGER | Available units (default: 0) |
| reserved_quantity | INTEGER | Units in pending orders (default: 0) |
| low_stock_threshold | INTEGER | Alert level for reordering (default: 10) |
| updated_at | TIMESTAMPTZ | Last modification timestamp (auto via trigger) |

**Design Constraint:**
- **CHECK**: Exactly one of `product_id` OR `variant_id` must be set (not both, not neither)
- **UNIQUE**: (product_id, variant_id) prevents duplicate inventory records
- **CHECK**: reserved_quantity <= quantity (prevents overselling)

**Deletion Behavior:**
- `ON DELETE CASCADE`: Deleting product/variant removes inventory

**Security:**
- RLS: Public can read (for availability checks); admins can write

---

### 7. Addresses (Customer Shipping/Billing)

**Table: `addresses`**

Stores customer shipping and billing addresses.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID PK | Unique identifier |
| user_id | UUID FK | References auth.users(id) ON DELETE RESTRICT |
| full_name | VARCHAR(255) | Recipient name |
| phone | VARCHAR(20) | Recipient phone |
| address_line_1 | VARCHAR(255) | Street address |
| address_line_2 | VARCHAR(255) | Apt, suite, etc. (optional) |
| city | VARCHAR(100) | City name |
| state_or_region | VARCHAR(100) | State/province/region (optional) |
| postal_code | VARCHAR(20) | ZIP/postal code |
| country | VARCHAR(2) | ISO 3166-1 alpha-2 (e.g., "US", "CA") |
| is_default | BOOLEAN | Marks default address (default: false) |
| created_at | TIMESTAMPTZ | Record creation timestamp (auto) |
| updated_at | TIMESTAMPTZ | Last modification timestamp (auto via trigger) |

**Indexes:**
- user_id, (user_id, is_default) for efficient default lookup

**Deletion Behavior:**
- `ON DELETE RESTRICT`: Cannot delete user while addresses exist

**Security:**
- RLS: Users can CRUD their own addresses; admins can read all

---

### 8. Carts (Shopping Carts)

**Table: `carts`**

One shopping cart per user.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID PK | Unique identifier |
| user_id | UUID FK | References auth.users(id) ON DELETE RESTRICT |
| created_at | TIMESTAMPTZ | Cart creation timestamp (auto) |
| updated_at | TIMESTAMPTZ | Last modification timestamp (auto via trigger) |

**Unique Constraint:**
- `UNIQUE (user_id)`: Ensures only one cart per user

**Deletion Behavior:**
- `ON DELETE RESTRICT`: Cannot delete user while cart exists
- `ON DELETE CASCADE` (cart_items): Deleting cart removes all items

**Security:**
- RLS: Users can CRUD their own cart; admins can read all

---

### 9. Cart Items (Shopping Cart Contents)

**Table: `cart_items`**

Items stored in customer shopping carts.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID PK | Unique identifier |
| cart_id | UUID FK | References carts(id) ON DELETE CASCADE |
| product_id | UUID FK | References products(id) ON DELETE RESTRICT |
| variant_id | UUID FK | References product_variants(id) ON DELETE RESTRICT (optional) |
| quantity | INTEGER | Number of units (default: 1) |
| created_at | TIMESTAMPTZ | Record creation timestamp (auto) |
| updated_at | TIMESTAMPTZ | Last modification timestamp (auto via trigger) |

**Unique Constraint:**
- `UNIQUE (cart_id, product_id, variant_id)`: Prevents duplicate items
- Same product + variant cannot appear twice in one cart

**Deletion Behavior:**
- Product/variant deletion is `RESTRICT`: Cannot delete if in a cart
- Cart deletion cascades: Removes all items

**Security:**
- RLS: Users can CRUD items in their own cart; admins can read all

---

### 10. Orders (Customer Orders)

**Table: `orders`**

Complete order records with payment/fulfillment status.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID PK | Unique identifier |
| user_id | UUID FK | References auth.users(id) ON DELETE RESTRICT |
| order_number | VARCHAR(50) UNIQUE | Human-readable order ID (e.g., "ORD-2026-001234") |
| status | order_status ENUM | pending, confirmed, processing, shipped, delivered, cancelled, refunded |
| payment_status | payment_status ENUM | pending, paid, failed, refunded, partially_refunded |
| fulfillment_status | fulfillment_status ENUM | pending, partially_shipped, shipped, delivered, cancelled |
| currency | VARCHAR(3) | ISO 4217 code (default: USD) |
| subtotal | numeric(12,2) | Sum of item prices before adjustments |
| shipping_amount | numeric(12,2) | Shipping cost (default: 0) |
| discount_amount | numeric(12,2) | Total discounts applied (default: 0) |
| tax_amount | numeric(12,2) | Sales tax (default: 0) |
| total | numeric(12,2) | Final amount (subtotal + shipping - discount + tax) |
| shipping_address | JSONB | Address snapshot (immutable) |
| billing_address | JSONB | Address snapshot (immutable) |
| created_at | TIMESTAMPTZ | Order creation timestamp (auto) |
| updated_at | TIMESTAMPTZ | Last modification timestamp (auto via trigger) |

**Snapshot Fields (JSONB):**
Store complete address information at time of order to preserve history if customer later updates their address.

```json
{
  "full_name": "Jane Doe",
  "phone": "+1-555-0123",
  "address_line_1": "123 Main St",
  "address_line_2": "Apt 4B",
  "city": "Brooklyn",
  "state_or_region": "NY",
  "postal_code": "11201",
  "country": "US"
}
```

**Constraints:**
- CHECK: total = subtotal + shipping_amount - discount_amount + tax_amount
- All monetary values >= 0

**Indexes:**
- user_id, order_number, status, created_at DESC
- Composite: (user_id, created_at DESC), (status, created_at DESC) for efficient filtering

**Deletion Behavior:**
- `ON DELETE RESTRICT`: Cannot delete user while orders exist

**Security:**
- RLS: Users can read their own orders; admins can read all and update statuses
- Users cannot modify orders after creation

---

### 11. Order Items (Individual Line Items)

**Table: `order_items`**

Line items within an order with product snapshots.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID PK | Unique identifier |
| order_id | UUID FK | References orders(id) ON DELETE RESTRICT |
| product_id | UUID FK | References products(id) ON DELETE SET NULL (optional) |
| variant_id | UUID FK | References product_variants(id) ON DELETE SET NULL (optional) |
| product_name_snapshot | VARCHAR(255) | Product name at time of order (immutable) |
| variant_name_snapshot | VARCHAR(255) | Variant name at time of order (immutable, optional) |
| sku_snapshot | VARCHAR(100) | SKU at time of order (immutable) |
| unit_price | numeric(12,2) | Price per unit at time of order (immutable) |
| quantity | INTEGER | Number of units |
| total | numeric(12,2) | Line total (unit_price × quantity) |
| created_at | TIMESTAMPTZ | Record creation timestamp (auto) |

**Snapshot Purpose:**
Preserves exact product information from time of purchase. If product price is later changed, order history remains accurate.

**Constraints:**
- CHECK: total = unit_price × quantity
- unit_price > 0, quantity > 0

**Deletion Behavior:**
- Product/variant deletion: `SET NULL` (preserves order history)
- Order deletion: `RESTRICT` (orders are permanent)

**Security:**
- RLS: Users can read their own order items; admins can read all
- Items are immutable after creation

---

## Relationships & Delete Behavior

### Foreign Key Cascade Strategy

| Parent → Child | Behavior | Reason |
|---|---|---|
| category → product | SET NULL | Preserve order history if category removed |
| product → product_images | CASCADE | Images meaningless without product |
| product → product_variants | CASCADE | Variants meaningless without product |
| product → inventory | CASCADE | Inventory meaningless without product |
| product → order_items | SET NULL | Preserve order history |
| product_variant → cart_items | RESTRICT | Prevent orphaned carts |
| product_variant → order_items | SET NULL | Preserve order history |
| auth.users → profiles | RESTRICT | Require manual cleanup |
| auth.users → addresses | RESTRICT | Require manual cleanup |
| auth.users → carts | RESTRICT | Require manual cleanup |
| auth.users → orders | RESTRICT | Require manual cleanup |
| cart → cart_items | CASCADE | Items only exist in that cart |
| order → order_items | RESTRICT | Orders are permanent records |

---

## Row-Level Security (RLS) Strategy

### Security Model

KeyNexa uses PostgreSQL Row-Level Security to enforce access control at the database level.

### Access Levels

**1. Anonymous/Public Users**
- Can read active catalog (categories, products, variants, images)
- Can read public inventory for availability checks
- Cannot read or modify customer data
- Cannot create orders or access carts

**2. Authenticated Customers**
- Can read/update their own profile
- Can CRUD their own addresses
- Can CRUD their own shopping cart and cart items
- Can read their own orders
- Can read order items from their orders
- Can read active catalog (same as public)

**3. Admins**
- Can read all profiles
- Can read all addresses
- Can read all carts and cart items (read-only)
- Can read all orders
- Can update order statuses (payment/fulfillment)
- Can manage catalog (categories, products, variants, images)
- Can manage inventory
- **Cannot**: Promote other users to admin, modify auth.users directly

### Admin Verification

The `auth.is_admin()` function provides secure server-side admin checking:

```sql
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Key Security Features:**
- Runs with function definer privileges (secure)
- Checks database state, not client-provided claims
- Cannot be spoofed by JWT manipulation
- Used only by RLS policies, never exposed to client

### Policy Examples

**Customer Can Only Access Own Profile:**
```sql
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);
```

**Public Can Read Active Catalog:**
```sql
CREATE POLICY "products_select_public" ON products
  FOR SELECT USING (is_active = true);
```

**Users Cannot Modify Orders:**
```sql
CREATE POLICY "orders_select_own" ON orders
  FOR SELECT USING (auth.uid() = user_id);
-- No UPDATE/DELETE policies for non-admins
```

---

## Performance Indexes

### Automatically Created Indexes
- Primary keys (implicit)
- Unique constraints (implicit)
- Foreign keys (recommended in PostgreSQL)

### Manual Indexes

| Index | Table | Purpose |
|-------|-------|---------|
| (is_active, is_featured, created_at DESC) | products | Homepage featured products |
| (user_id, created_at DESC) | orders | User's order history |
| (status, created_at DESC) | orders | Filter orders by status |
| (category_id, is_active) | products | Browse category products |
| slug | products, categories | URL lookups |
| (is_active, sort_order) | categories | Category listing |

---

## Data Integrity Features

### Automatic Timestamps
The `update_updated_at_column()` trigger automatically updates `updated_at` when rows are modified on these tables:
- profiles, categories, products, product_variants
- inventory, addresses, carts, cart_items
- orders

### Constraints

**Type Constraints:**
- Monetary values: numeric(12,2) prevents rounding errors
- Enums: status fields restricted to valid values
- Strings: lengths validated for all text fields

**Business Logic Constraints:**
- Inventory: reserved_quantity <= quantity
- Orders: total = subtotal + shipping - discount + tax
- Cart Items: Unique (cart_id, product_id, variant_id)
- Carts: Unique (user_id) - one per customer
- Products: price > 0, compare_at_price > price

---

## How to Apply the Migration

### Prerequisites
- Supabase project created and accessible
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` set in `.env.local`

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the entire contents of `001_initial_schema.sql`
5. Paste into the editor
6. Click **RUN**
7. Verify all tables appear in the **Table Editor**

### Using Supabase CLI

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

### Migration Safety

This migration is safe to re-run because:
- All table creations use `IF NOT EXISTS`
- Functions use `CREATE OR REPLACE`
- Indexes use `IF NOT EXISTS`
- Triggers are recreated (existing ones dropped)
- No data is destroyed

---

## Important Security Considerations

### 1. No Client-Side Admin Checks
Never trust `user.role` from the JWT token on the client. Always verify admin status server-side:

```typescript
// ❌ Wrong: trusting JWT
if (user.role === 'admin') { /* allow */ }

// ✅ Correct: using database check
const isAdmin = await supabase.rpc('is_admin');
```

### 2. RLS is Your First Line of Defense
All security-sensitive operations should:
1. Use proper RLS policies at the database level
2. Never bypass RLS in application logic
3. Assume unauthenticated users will try to access data

### 3. Monetary Precision
Always use numeric/decimal types for money, never floating-point:

```typescript
// ❌ Wrong: floating point
const price = 99.99; // May become 99.98999999

// ✅ Correct: store as string and convert
const price = '99.99';
const amount = new Decimal('99.99');
```

### 4. Order Snapshots Are Immutable
Never modify order_items after creation. If corrections needed:
1. Create a refund/credit record
2. Never modify historical order data
3. Keep complete audit trail

### 5. Sensitive Data in JSONB
Address snapshots in orders are public readable by the owning customer. Don't store:
- Passwords
- Credit card numbers
- Social security numbers
- Other PII beyond what's necessary

---

## Future Extensibility

### Adding New Variant Attributes
No schema migration needed. JSONB attributes support new fields:

```json
{
  "size": "Large",
  "color": "Blue",
  "new_attribute": "new_value"
}
```

### Adding New Order Statuses
Extend the enum:
```sql
ALTER TYPE order_status ADD VALUE 'custom_status';
```

### Adding User Preferences
Add to profiles table:
```sql
ALTER TABLE profiles ADD COLUMN preferences JSONB DEFAULT '{}'::JSONB;
```

### Adding Product Tags/Categories
Create new tables and link appropriately without modifying core schema.

---

## Troubleshooting

### Issue: "permission denied for schema public"
**Cause**: RLS policies blocking access
**Solution**: Verify user is authenticated and has valid JWT token

### Issue: "duplicate key value violates unique constraint"
**Cause**: Attempting to insert duplicate cart item or other unique field
**Solution**: Check for existing records before inserting

### Issue: "Cannot delete product - constraint violation"
**Cause**: Product has cart items or other dependencies with RESTRICT
**Solution**: Remove dependent records first, or use CASCADE if appropriate

### Issue: "order total calculation mismatch"
**Cause**: Math error in client before sending
**Solution**: Let database calculate: total = subtotal + shipping - discount + tax

---

## Summary

The KeyNexa database schema provides:

✅ **Complete ecommerce functionality** - Catalog, cart, orders, customers  
✅ **Data integrity** - Constraints, triggers, proper typing  
✅ **Security** - RLS policies, server-side admin checks  
✅ **Performance** - Strategic indexes, efficient queries  
✅ **History preservation** - Snapshots prevent data loss  
✅ **Extensibility** - JSONB for flexible attributes  

The schema is production-ready and follows PostgreSQL best practices.
