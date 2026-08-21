/**
 * Documentation: Supabase Storage RLS (Row-Level Security) Policies
 *
 * This document describes the RLS policies required for the product-images bucket.
 *
 * BUCKET SETTINGS:
 * - Name: product-images
 * - Privacy: Public (but with RLS policies to control access)
 * - Object ownership: Owner (not BucketOwnerFull)
 *
 * REQUIRED RLS POLICIES:
 *
 * 1. POLICY: "Enable public read access to product images"
 *    - Effect: ALLOW
 *    - Principal: authenticated, anon
 *    - Permissions: SELECT (read)
 *    - Target: paths matching "product-images/*"
 *    - Condition: TRUE (anyone can read)
 *    - Reason: Customers need to view product images publicly
 *
 * 2. POLICY: "Enable authenticated admin insert for product images"
 *    - Effect: ALLOW
 *    - Principal: authenticated
 *    - Permissions: INSERT
 *    - Target: paths matching "product-images/*"
 *    - Condition: (auth.jwt()->>'user_metadata'->>'role' = 'admin')
 *    - Reason: Only admins can upload new product images
 *
 * 3. POLICY: "Enable authenticated admin delete for product images"
 *    - Effect: ALLOW
 *    - Principal: authenticated
 *    - Permissions: DELETE
 *    - Target: paths matching "product-images/*"
 *    - Condition: (auth.jwt()->>'user_metadata'->>'role' = 'admin')
 *    - Reason: Only admins can delete product images
 *
 * 4. POLICY: "Enable authenticated admin update for product images"
 *    - Effect: ALLOW
 *    - Principal: authenticated
 *    - Permissions: UPDATE
 *    - Target: paths matching "product-images/*"
 *    - Condition: (auth.jwt()->>'user_metadata'->>'role' = 'admin')
 *    - Reason: Only admins can replace/update product images
 *
 * HOW TO APPLY THESE POLICIES IN SUPABASE DASHBOARD:
 *
 * 1. Go to Storage > Policies
 * 2. Select the product-images bucket
 * 3. Click "Create policy from template" or "New policy"
 * 4. For each policy above, configure:
 *    - Policy name
 *    - Roles (authenticated for admin policies, public for read)
 *    - Operation (SELECT, INSERT, DELETE, UPDATE)
 *    - Target expression: "(bucket_id = 'product-images')"
 *    - Custom expression with the condition
 *
 * ALTERNATIVE: SQL-based policy creation
 *
 * Create the policies directly using SQL in the Supabase SQL editor:
 *
 * ```sql
 * -- Enable public read access
 * CREATE POLICY "Enable public read access to product images"
 *   ON storage.objects FOR SELECT
 *   USING (bucket_id = 'product-images');
 *
 * -- Enable admin upload
 * CREATE POLICY "Enable authenticated admin insert for product images"
 *   ON storage.objects FOR INSERT
 *   WITH CHECK (
 *     bucket_id = 'product-images'
 *     AND (
 *       SELECT role FROM public.users WHERE id = auth.uid()
 *     ) = 'admin'
 *   );
 *
 * -- Enable admin delete
 * CREATE POLICY "Enable authenticated admin delete for product images"
 *   ON storage.objects FOR DELETE
 *   USING (
 *     bucket_id = 'product-images'
 *     AND (
 *       SELECT role FROM public.users WHERE id = auth.uid()
 *     ) = 'admin'
 *   );
 *
 * -- Enable admin update
 * CREATE POLICY "Enable authenticated admin update for product images"
 *   ON storage.objects FOR UPDATE
 *   WITH CHECK (
 *     bucket_id = 'product-images'
 *     AND (
 *       SELECT role FROM public.users WHERE id = auth.uid()
 *     ) = 'admin'
 *   );
 * ```
 *
 * SECURITY NOTES:
 *
 * - Public read access allows any visitor to download product images
 * - Write/delete access is restricted to authenticated admin users only
 * - The admin role must be stored in the public.users table or in auth.jwt() claims
 * - Client-side code cannot bypass these policies (they are server-enforced)
 * - Service role key can bypass RLS but should NOT be exposed to client
 *
 * TESTING THE POLICIES:
 *
 * 1. Test public read:
 *    - Unauthenticated browser access to:
 *      https://ptasmrsfkzjnjeyqxiem.supabase.co/storage/v1/object/public/product-images/product-123/image.jpg
 *    - Should work (image displays)
 *
 * 2. Test admin insert:
 *    - Call uploadProductImage() from server action with auth token
 *    - Should succeed for admin users
 *    - Should fail for regular users
 *
 * 3. Test admin delete:
 *    - Call deleteProductImage() from server action with auth token
 *    - Should succeed for admin users
 *    - Should fail for regular users
 */

// This file is documentation only - no code to execute
