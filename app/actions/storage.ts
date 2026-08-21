/**
 * Server action for product image management
 *
 * This demonstrates how to use the storage utilities in a server action.
 * Server actions allow client components to call server-side functions safely.
 *
 * Usage in a client component:
 * ```tsx
 * 'use client';
 * import { handleProductImageUpload } from '@/app/actions/storage';
 *
 * export default function ImageUploadForm() {
 *   const onSubmit = async (formData: FormData) => {
 *     const result = await handleProductImageUpload(formData);
 *     if (!result.success) {
 *       console.error(result.error);
 *     } else {
 *       console.log('Image uploaded:', result.url);
 *     }
 *   };
 *
 *   return (
 *     <form action={onSubmit}>
 *       <input type="hidden" name="productId" value="product-123" />
 *       <input type="file" name="image" accept="image/*" required />
 *       <button type="submit">Upload</button>
 *     </form>
 *   );
 * }
 * ```
 */

"use server";

import {
  uploadProductImage,
  deleteProductImage,
  replaceProductImage,
  listProductImages,
} from "@/lib/storage";

/**
 * Handle product image upload from form submission
 *
 * SECURITY: In production, add authentication check here
 * to ensure only admins can upload images.
 *
 * @param formData - Form data containing productId and image file
 * @returns Result with public URL or error message
 */
export async function handleProductImageUpload(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const productId = formData.get("productId");
    const imageFile = formData.get("image");

    if (!productId || typeof productId !== "string") {
      return { success: false, error: "Product ID is required" };
    }

    if (!imageFile || !(imageFile instanceof File)) {
      return { success: false, error: "Image file is required" };
    }

    const result = await uploadProductImage(productId, imageFile);

    if (!result.success) {
      // Sanitized error message for client display
      return { success: false, error: result.error };
    }

    return { success: true, url: result.publicUrl };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Handle product image deletion
 *
 * SECURITY: In production, add authentication and authorization checks
 *
 * @param productId - The product ID
 * @param imagePath - The storage path of the image to delete
 * @returns Result status or error message
 */
export async function handleDeleteProductImage(
  productId: string,
  imagePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await deleteProductImage(productId, imagePath);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Handle product image replacement
 *
 * SECURITY: In production, add authentication and authorization checks
 *
 * @param productId - The product ID
 * @param oldImagePath - The storage path of the image to replace
 * @param formData - Form data containing the new image file
 * @returns Result with new public URL or error message
 */
export async function handleReplaceProductImage(
  productId: string,
  oldImagePath: string,
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const imageFile = formData.get("image");

    if (!imageFile || !(imageFile instanceof File)) {
      return { success: false, error: "Image file is required" };
    }

    const result = await replaceProductImage(
      productId,
      oldImagePath,
      imageFile
    );

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, url: result.publicUrl };
  } catch (error) {
    console.error("Replace error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Get list of images for a product
 *
 * @param productId - The product ID
 * @returns Array of image paths or error message
 */
export async function getProductImagesList(
  productId: string
): Promise<{ success: boolean; images?: string[]; error?: string }> {
  try {
    const result = await listProductImages(productId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, images: result.paths };
  } catch (error) {
    console.error("List images error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
