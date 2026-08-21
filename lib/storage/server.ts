/**
 * Server-side storage utilities for product images
 *
 * This module handles all server-side storage operations including:
 * - Uploading product images to Supabase Storage
 * - Generating public URLs
 * - Deleting product images
 * - Replacing product images
 *
 * All operations use the server Supabase client and are protected
 * from client-side abuse through RLS policies.
 *
 * IMPORTANT: These functions must ONLY be called from:
 * - Server components
 * - Server actions (use 'use server')
 * - API routes
 * - Never from client-side code
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PRODUCT_IMAGES_BUCKET } from "./constants";
import {
  validateProductId,
  validateProductImageFile,
} from "./validation";
import {
  sanitizeFilename,
  generateStoragePath,
  validateStoragePath,
  extractProductIdFromPath,
} from "./sanitization";
import type { ProductImageOperationResponse } from "./types";

/**
 * Upload a product image to Supabase Storage
 *
 * This function:
 * - Validates the file (type, size, product ID)
 * - Sanitizes the filename
 * - Uploads to the product-images bucket
 * - Returns the public URL
 *
 * Usage in server action:
 * ```typescript
 * 'use server';
 * import { uploadProductImage } from '@/lib/storage/server';
 *
 * export async function handleImageUpload(
 *   productId: string,
 *   file: File
 * ) {
 *   const result = await uploadProductImage(productId, file);
 *   if (!result.success) {
 *     throw new Error(result.error);
 *   }
 *   return result.publicUrl;
 * }
 * ```
 *
 * @param productId - The product ID (already authenticated/authorized)
 * @param file - The File object from form upload
 * @returns Promise resolving to upload result with public URL or error
 */
export async function uploadProductImage(
  productId: string,
  file: File
): Promise<ProductImageOperationResponse> {
  try {
    // Validate file metadata
    const validation = validateProductImageFile(
      productId,
      file.name,
      file.type,
      file.size
    );

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || "File validation failed",
        code: "VALIDATION_ERROR",
      };
    }

    // Convert File to Buffer for upload
    const buffer = await file.arrayBuffer();

    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(file.name);

    // Generate storage path
    const storagePath = generateStoragePath(productId, sanitizedFilename);

    // Get server client
    const supabase = await createServerSupabaseClient();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(storagePath, new Uint8Array(buffer), {
        contentType: file.type,
        upsert: false, // Don't overwrite existing files with same name
      });

    if (error) {
      console.error("Storage upload error:", error);
      return {
        success: false,
        error: "Failed to upload image. Please try again.",
        code: "UPLOAD_ERROR",
      };
    }

    if (!data?.path) {
      return {
        success: false,
        error: "Upload failed: no path returned",
        code: "UPLOAD_ERROR",
      };
    }

    // Generate public URL
    const { data: publicUrlData } = supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .getPublicUrl(data.path);

    if (!publicUrlData?.publicUrl) {
      return {
        success: false,
        error: "Failed to generate public URL",
        code: "URL_ERROR",
      };
    }

    return {
      success: true,
      fileName: sanitizedFilename,
      publicUrl: publicUrlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during upload",
      code: "INTERNAL_ERROR",
    };
  }
}

/**
 * Replace a product image
 *
 * Deletes the old image and uploads a new one.
 * This is more efficient than separate delete + upload operations.
 *
 * @param productId - The product ID
 * @param oldImagePath - The path of the image to replace
 * @param newFile - The new File object
 * @returns Promise resolving to operation result with new public URL or error
 */
export async function replaceProductImage(
  productId: string,
  oldImagePath: string,
  newFile: File
): Promise<ProductImageOperationResponse> {
  try {
    // Validate old image path belongs to this product
    if (!validateStoragePath(oldImagePath, productId)) {
      return {
        success: false,
        error: "Invalid image path",
        code: "VALIDATION_ERROR",
      };
    }

    // Validate new file
    const validation = validateProductImageFile(
      productId,
      newFile.name,
      newFile.type,
      newFile.size
    );

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || "File validation failed",
        code: "VALIDATION_ERROR",
      };
    }

    const supabase = await createServerSupabaseClient();

    // Delete old image
    const { error: deleteError } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .remove([oldImagePath]);

    if (deleteError) {
      console.error("Error deleting old image:", deleteError);
      // Continue anyway - don't fail the operation
    }

    // Upload new image
    return uploadProductImage(productId, newFile);
  } catch (error) {
    console.error("Replace image error:", error);
    return {
      success: false,
      error: "Failed to replace image",
      code: "INTERNAL_ERROR",
    };
  }
}

/**
 * Delete a product image
 *
 * Safely deletes an image from the storage bucket.
 * Validates that the path belongs to the specified product ID.
 *
 * @param productId - The product ID (for authorization check)
 * @param imagePath - The storage path of the image to delete
 * @returns Promise resolving to success status or error
 */
export async function deleteProductImage(
  productId: string,
  imagePath: string
): Promise<ProductImageOperationResponse> {
  try {
    // Validate product ID
    const productIdValidation = validateProductId(productId);
    if (!productIdValidation.valid) {
      return {
        success: false,
        error: "Invalid product ID",
        code: "VALIDATION_ERROR",
      };
    }

    // Validate that the path belongs to this product
    if (!validateStoragePath(imagePath, productId)) {
      return {
        success: false,
        error: "Invalid image path",
        code: "VALIDATION_ERROR",
      };
    }

    // Validate path format (additional safety check)
    const extractedProductId = extractProductIdFromPath(imagePath);
    if (extractedProductId !== productId) {
      return {
        success: false,
        error: "Image does not belong to this product",
        code: "AUTHORIZATION_ERROR",
      };
    }

    const supabase = await createServerSupabaseClient();

    // Delete the image
    const { error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .remove([imagePath]);

    if (error) {
      console.error("Storage deletion error:", error);
      return {
        success: false,
        error: "Failed to delete image",
        code: "DELETE_ERROR",
      };
    }

    return {
      success: true,
      fileName: imagePath.split("/").pop() || "",
      publicUrl: "",
      path: imagePath,
    };
  } catch (error) {
    console.error("Delete error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during deletion",
      code: "INTERNAL_ERROR",
    };
  }
}

/**
 * Generate a public URL for a stored product image
 *
 * Use this to get the public URL for an already-stored image.
 * Note: The URL returned by uploadProductImage already includes the
 * public URL, so this is mainly useful for previously-stored images.
 *
 * @param imagePath - The storage path of the image
 * @returns The public URL for the image
 */
export async function getProductImagePublicUrl(
  imagePath: string
): Promise<string> {
  const supabase = await createServerSupabaseClient();

  const { data } = supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(imagePath);

  return data?.publicUrl || "";
}

/**
 * List all images for a product
 *
 * Returns all image paths stored under a product's directory.
 *
 * @param productId - The product ID
 * @returns Promise resolving to array of image paths or error
 */
export async function listProductImages(
  productId: string
): Promise<{ success: boolean; paths?: string[]; error?: string }> {
  try {
    const validation = validateProductId(productId);
    if (!validation.valid) {
      return {
        success: false,
        error: "Invalid product ID",
      };
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .list(productId);

    if (error) {
      console.error("Error listing images:", error);
      return {
        success: false,
        error: "Failed to list images",
      };
    }

    // Filter to only files (not directories) and map to full paths
    const paths = (data || [])
      .filter((item) => item.name !== ".emptyFolderPlaceholder")
      .map((item) => `${productId}/${item.name}`);

    return {
      success: true,
      paths,
    };
  } catch (error) {
    console.error("List images error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
