/**
 * Storage module - Product image management
 *
 * This module provides utilities for managing product images in Supabase Storage.
 *
 * KEY SECURITY PRINCIPLES:
 *
 * 1. Server-side only: All storage operations are server-side functions
 *    to prevent client-side abuse.
 *
 * 2. File validation: Uploaded files are validated for:
 *    - Correct MIME type (jpeg, png, webp, avif only)
 *    - Reasonable file size (max 5MB)
 *    - Safe filename format
 *
 * 3. Path security: All storage paths are validated to prevent:
 *    - Path traversal attempts (..)
 *    - Arbitrary file access
 *    - Cross-product image access
 *
 * 4. Access control: RLS policies on the Supabase Storage bucket ensure:
 *    - Public read access for product images
 *    - Write access restricted to authenticated admins only
 *    - Delete access restricted to authenticated admins only
 *
 * USAGE:
 *
 * In a server action (marked with 'use server'):
 *
 * ```typescript
 * 'use server';
 * import { uploadProductImage } from '@/lib/storage';
 *
 * export async function handleImageUpload(
 *   productId: string,
 *   file: File
 * ) {
 *   // File validation happens automatically
 *   const result = await uploadProductImage(productId, file);
 *
 *   if (!result.success) {
 *     return { error: result.error };
 *   }
 *
 *   return { url: result.publicUrl };
 * }
 * ```
 *
 * STORAGE PATH STRUCTURE:
 *
 * All product images are stored in the "product-images" bucket with this structure:
 *
 *   product-images/
 *   ├── product-123/
 *   │   ├── main-image.jpg
 *   │   ├── product-photo-2.png
 *   │   └── gallery-img.webp
 *   └── product-456/
 *       └── featured-image.jpg
 *
 * This structure allows:
 * - Easy organization of images by product
 * - Bulk operations on all images for a product
 * - Clear authorization boundaries (admin can't access other products)
 */

export {
  // Constants
  PRODUCT_IMAGES_BUCKET,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  MAX_FILENAME_LENGTH,
  MIME_TYPE_EXTENSIONS,
} from "./constants";

export type {
  // Types
  UploadProductImageResponse,
  FailedOperationResponse,
  ProductImageOperationResponse,
  FileValidationResult,
  ProductImageMetadata,
} from "./types";

export {
  // Server-side storage operations
  uploadProductImage,
  replaceProductImage,
  deleteProductImage,
  getProductImagePublicUrl,
  listProductImages,
} from "./server";

export {
  // Validation utilities
  validateMimeType,
  validateFileSize,
  validateFilename,
  validateProductId,
  validateProductImageFile,
} from "./validation";

export {
  // Sanitization utilities
  sanitizeFilename,
  getFileExtension,
  generateStoragePath,
  validateStoragePath,
  extractProductIdFromPath,
} from "./sanitization";
