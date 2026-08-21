/**
 * Storage constants and configuration
 */

/**
 * Supabase Storage bucket name for product images
 */
export const PRODUCT_IMAGES_BUCKET = "product-images";

/**
 * Allowed MIME types for product images
 */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

/**
 * Maximum file size for product images (in bytes)
 * 5 MB limit
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Maximum filename length after sanitization
 */
export const MAX_FILENAME_LENGTH = 255;

/**
 * File extension map for common image types
 */
export const MIME_TYPE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
