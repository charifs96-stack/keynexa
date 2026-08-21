/**
 * Storage-related type definitions
 */

/**
 * Response from a successful image upload operation
 */
export interface UploadProductImageResponse {
  success: true;
  fileName: string;
  publicUrl: string;
  path: string;
}

/**
 * Response from a failed image operation
 */
export interface FailedOperationResponse {
  success: false;
  error: string;
  code?: string;
}

/**
 * Union type for upload responses
 */
export type ProductImageOperationResponse = UploadProductImageResponse | FailedOperationResponse;

/**
 * Validation result for file uploads
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Product image metadata
 */
export interface ProductImageMetadata {
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  productId: string;
}
