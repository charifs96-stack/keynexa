/**
 * File validation utilities for product image uploads
 *
 * This module provides validation functions to ensure uploaded files
 * meet security and format requirements before being stored.
 */

import {
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  MAX_FILENAME_LENGTH,
} from "./constants";
import type { FileValidationResult } from "./types";

/**
 * Validate file MIME type
 *
 * @param mimeType - The MIME type to validate
 * @returns Validation result with error message if invalid
 */
export function validateMimeType(mimeType: string): FileValidationResult {
  if (!mimeType) {
    return {
      valid: false,
      error: "File type is required",
    };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Validate file size
 *
 * @param size - File size in bytes
 * @returns Validation result with error message if invalid
 */
export function validateFileSize(size: number): FileValidationResult {
  if (size <= 0) {
    return {
      valid: false,
      error: "File is empty",
    };
  }

  if (size > MAX_FILE_SIZE) {
    const maxMB = MAX_FILE_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Validate filename format and length
 *
 * @param filename - The filename to validate
 * @returns Validation result with error message if invalid
 */
export function validateFilename(filename: string): FileValidationResult {
  if (!filename || filename.trim().length === 0) {
    return {
      valid: false,
      error: "Filename is required",
    };
  }

  if (filename.length > MAX_FILENAME_LENGTH) {
    return {
      valid: false,
      error: `Filename exceeds maximum length of ${MAX_FILENAME_LENGTH} characters`,
    };
  }

  return { valid: true };
}

/**
 * Validate product ID format
 *
 * Product IDs should be non-empty strings without path separators
 *
 * @param productId - The product ID to validate
 * @returns Validation result with error message if invalid
 */
export function validateProductId(productId: string): FileValidationResult {
  if (!productId || productId.trim().length === 0) {
    return {
      valid: false,
      error: "Product ID is required",
    };
  }

  // Prevent path traversal attempts
  if (productId.includes("/") || productId.includes("\\")) {
    return {
      valid: false,
      error: "Invalid product ID format",
    };
  }

  if (productId.includes("..")) {
    return {
      valid: false,
      error: "Invalid product ID format",
    };
  }

  return { valid: true };
}

/**
 * Comprehensive file validation
 *
 * Validates all aspects of a file upload:
 * - Product ID format
 * - Filename format
 * - MIME type
 * - File size
 *
 * @param productId - The product ID this image belongs to
 * @param filename - The original filename
 * @param mimeType - The file MIME type
 * @param size - The file size in bytes
 * @returns Validation result with error message if any validation fails
 */
export function validateProductImageFile(
  productId: string,
  filename: string,
  mimeType: string,
  size: number
): FileValidationResult {
  // Validate product ID
  const productIdValidation = validateProductId(productId);
  if (!productIdValidation.valid) {
    return productIdValidation;
  }

  // Validate filename
  const filenameValidation = validateFilename(filename);
  if (!filenameValidation.valid) {
    return filenameValidation;
  }

  // Validate MIME type
  const mimeTypeValidation = validateMimeType(mimeType);
  if (!mimeTypeValidation.valid) {
    return mimeTypeValidation;
  }

  // Validate file size
  const sizeValidation = validateFileSize(size);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  return { valid: true };
}
