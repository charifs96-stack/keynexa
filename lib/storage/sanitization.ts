/**
 * Filename sanitization utilities
 *
 * These functions ensure uploaded filenames are safe and don't contain
 * special characters or path separators that could cause issues.
 */

import { MAX_FILENAME_LENGTH } from "./constants";

/**
 * Generate a safe filename from an original filename
 *
 * This function:
 * - Removes/replaces dangerous characters
 * - Prevents path traversal attempts
 * - Preserves file extension
 * - Ensures reasonable length
 *
 * @param originalFilename - The original filename from upload
 * @returns A sanitized filename safe for storage
 */
export function sanitizeFilename(originalFilename: string): string {
  // Remove path separators and null bytes
  let sanitized = originalFilename
    .replace(/\\/g, "")
    .replace(/\//g, "")
    .replace(/\0/g, "");

  // Remove leading dots (prevent hidden files on Unix)
  sanitized = sanitized.replace(/^\./g, "");

  // Replace spaces with underscores for better compatibility
  sanitized = sanitized.replace(/\s+/g, "_");

  // Remove special characters, keep only alphanumeric, dots, hyphens, underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, "");

  // Remove multiple consecutive dots
  sanitized = sanitized.replace(/\.{2,}/g, ".");

  // Limit overall length, preserving extension
  if (sanitized.length > MAX_FILENAME_LENGTH) {
    const ext = getFileExtension(sanitized);
    const maxNameLength = MAX_FILENAME_LENGTH - (ext ? ext.length + 1 : 0); // -1 for the dot if extension exists
    const baseName = sanitized.substring(0, maxNameLength);
    sanitized = ext ? `${baseName}.${ext}` : baseName;
  }

  return sanitized;
}

/**
 * Extract file extension from filename
 *
 * @param filename - The filename to extract extension from
 * @returns The file extension without the leading dot
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

/**
 * Generate a storage path for a product image
 *
 * Creates a path like: product-images/product-123/image-safe-name.jpg
 * This allows organizing images by product while preventing path traversal
 *
 * @param productId - The product ID (already validated)
 * @param sanitizedFilename - The sanitized filename
 * @returns Safe storage path
 */
export function generateStoragePath(
  productId: string,
  sanitizedFilename: string
): string {
  // Double-check no path separators exist (defense in depth)
  const safePath = sanitizedFilename
    .replace(/\\/g, "")
    .replace(/\//g, "")
    .replace(/\0/g, "");

  return `${productId}/${safePath}`;
}

/**
 * Validate that a storage path matches expected format
 *
 * Prevents storage utilities from accessing arbitrary paths
 *
 * @param fullPath - The full storage path
 * @param productId - The expected product ID
 * @returns True if path is valid and under expected product directory
 */
export function validateStoragePath(fullPath: string, productId: string): boolean {
  // Path should not contain parent directory references
  if (fullPath.includes("..") || fullPath.includes("\\")) {
    return false;
  }

  // Path should start with the product ID
  if (!fullPath.startsWith(`${productId}/`)) {
    return false;
  }

  // Ensure there are no absolute path attempts
  if (fullPath.startsWith("/")) {
    return false;
  }

  return true;
}

/**
 * Extract product ID from a storage path
 *
 * For path "product-123/image.jpg", returns "product-123"
 * Used for validation when reading/deleting files
 *
 * @param storagePath - The storage path
 * @returns The product ID, or null if format is invalid
 */
export function extractProductIdFromPath(storagePath: string): string | null {
  // Reject paths with special characters
  if (storagePath.includes("..") || storagePath.includes("\\")) {
    return null;
  }

  const parts = storagePath.split("/");
  if (parts.length < 2) {
    return null;
  }

  const productId = parts[0];

  // Product ID should be non-empty
  if (!productId || productId.length === 0) {
    return null;
  }

  return productId;
}
