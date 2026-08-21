# Storage Setup Guide - Required Supabase Configuration

## Prerequisites

Before images can be uploaded, you must configure the Supabase Storage bucket and RLS policies.

**Already done:**
- ✅ Storage module created (`lib/storage/`)
- ✅ Server actions and API routes ready
- ✅ TypeScript types defined
- ✅ Build verified and linting passed

**Now do:**
1. Create `product-images` bucket in Supabase
2. Apply RLS policies for access control
3. (Optional) Test the upload endpoint

## Step 1: Create the Storage Bucket

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your KeyNexa project
3. Navigate to **Storage** (left sidebar)
4. Click **Create a new bucket**
5. Configure:
   - **Bucket name:** `product-images`
   - **Privacy:** Public
   - Click **Create bucket**

## Step 2: Apply RLS Policies

RLS (Row-Level Security) policies control who can read, write, and delete files.

### Option A: Via Supabase Dashboard (UI)

1. In Storage section, select **product-images** bucket
2. Go to **Policies** tab
3. Create four policies:

**Policy 1: Public Read**
- Click **New policy** → **For SELECT**
- Name: `Enable public read access`
- Check all roles (or leave default)
- Target expression: `bucket_id = 'product-images'`
- With expression: (leave empty - anyone can read)
- Click **Create policy**

**Policy 2: Admin Upload**
- Click **New policy** → **For INSERT**
- Name: `Enable authenticated admin insert`
- Roles: Select **authenticated**
- Target expression: `bucket_id = 'product-images'`
- With expression: `(SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'`
- Click **Create policy**

**Policy 3: Admin Delete**
- Click **New policy** → **For DELETE**
- Name: `Enable authenticated admin delete`
- Roles: Select **authenticated**
- Target expression: `bucket_id = 'product-images'`
- Using expression: `(SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'`
- Click **Create policy**

**Policy 4: Admin Update**
- Click **New policy** → **For UPDATE**
- Name: `Enable authenticated admin update`
- Roles: Select **authenticated**
- Target expression: `bucket_id = 'product-images'`
- With expression: `(SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'`
- Click **Create policy**

### Option B: Via SQL (Faster)

1. Go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Paste this SQL:

```sql
-- Public read access (customers can view images)
CREATE POLICY "Enable public read access to product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Admin upload (only admins can add images)
CREATE POLICY "Enable authenticated admin insert for product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Admin delete (only admins can remove images)
CREATE POLICY "Enable authenticated admin delete for product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Admin update (only admins can replace images)
CREATE POLICY "Enable authenticated admin update for product images"
  ON storage.objects FOR UPDATE
  WITH CHECK (
    bucket_id = 'product-images'
    AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );
```

4. Click **Run** (play button)
5. Verify: You should see "Success" message

## Step 3: Test the Setup

### Test Public Read Access

Open this URL in a browser (should show 404 or not found, which is correct since we haven't uploaded images yet):

```
https://ptasmrsfkzjnjeyqxiem.supabase.co/storage/v1/object/public/product-images/product-123/test.jpg
```

If you see an error about bucket not found, go back and verify the bucket was created.

### Test Upload Endpoint

Use curl to test the upload API:

```bash
# Create a test image (1x1 pixel JPEG)
echo -e '\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xFF\xDB\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0C\x14\r\x0C\x0B\x0B\x0C\x19\x12\x13\x0F\x14\x1D\x1A\x1F\x1E\x1D\x1A\x1C\x1C $.\' ",#\x1C\x1C(7),01444\x1F\'9=82<.342\xFF\xC0\x00\x0B\x08\x00\x01\x00\x01\x01\x11\x00\xFF\xC4\x00\x1F\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0B\xFF\xDA\x00\x08\x01\x01\x00\x00?\x00\xFE\xFE\x10\x00\xFF\xD9' > test.jpg

# Upload
curl -X POST http://localhost:3000/api/storage/test-upload \
  -F "productId=product-test-123" \
  -F "image=@test.jpg"
```

Expected response on success:
```json
{
  "success": true,
  "fileName": "test.jpg",
  "publicUrl": "https://ptasmrsfkzjnjeyqxiem.supabase.co/storage/v1/object/public/product-images/product-test-123/test.jpg",
  "path": "product-test-123/test.jpg"
}
```

Expected response on failure (e.g., without bucket setup):
```json
{
  "error": "Failed to upload image. Please try again.",
  "code": "UPLOAD_ERROR"
}
```

## Verification Checklist

After setup, verify:

- [ ] Bucket `product-images` exists in Supabase Storage
- [ ] Four RLS policies created (or SQL executed successfully)
- [ ] Can access public URL (shows 404 if no image exists - OK)
- [ ] Can upload via API endpoint (no errors)
- [ ] Uploaded image URL is publicly accessible
- [ ] Linting passes: `npm run lint`
- [ ] Build succeeds: `npm run build`

## Troubleshooting

### "Failed to upload image" Error

1. Verify bucket was created:
   - Go to Supabase Dashboard > Storage
   - Look for `product-images` bucket
   - If missing, create it (see Step 1)

2. Verify RLS policies exist:
   - Select the bucket
   - Go to Policies tab
   - Should see 4 policies listed
   - If missing, apply them (see Step 2)

3. Check environment variables:
   - Verify `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - Both should be set (not empty)

### 403 Forbidden on Upload

1. Check authentication:
   - Uploading requires Supabase project to have auth enabled
   - Users must have role set in `public.users` table

2. Verify RLS policy syntax:
   - Go to Supabase SQL Editor
   - Check for policy errors in console
   - May need to adjust role column name if different in your schema

### 404 Not Found on Public URL

1. Image may not have uploaded successfully
2. Try uploading again with test endpoint
3. Check upload response for errors

## Integration with Admin Dashboard

When building the admin dashboard (Step 5+), use these functions:

```typescript
// Upload image
import { uploadProductImage } from '@/lib/storage';
const result = await uploadProductImage(productId, file);

// Delete image  
import { deleteProductImage } from '@/lib/storage';
const result = await deleteProductImage(productId, imagePath);

// Replace image
import { replaceProductImage } from '@/lib/storage';
const result = await replaceProductImage(productId, oldPath, newFile);

// List images
import { listProductImages } from '@/lib/storage';
const result = await listProductImages(productId);
```

All functions handle validation and error reporting automatically.

## What's Next

After storage is configured:

- ✅ Storage foundation complete
- Next: Admin dashboard implementation (Step 5+)
- Then: Product management UI with image uploads
- Then: Integration with product display pages

---

**Questions?** Check `STORAGE_IMPLEMENTATION_GUIDE.md` for detailed documentation.
