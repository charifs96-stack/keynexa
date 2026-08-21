/**
 * API route for testing product image storage
 *
 * This is a development/admin endpoint to verify storage functionality.
 * In production, image uploads will be restricted to authenticated admins.
 *
 * Endpoint: POST /api/storage/test-upload
 * Body: multipart/form-data with:
 *   - productId: string
 *   - image: File
 */

import { uploadProductImage } from "@/lib/storage/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Test image upload functionality
 *
 * SECURITY: This is a test endpoint. In production:
 * - Add authentication check (auth middleware)
 * - Add authorization check (admin role)
 * - Log all uploads for audit purposes
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const productId = formData.get("productId");
    const imageFile = formData.get("image");

    // Basic validation
    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    if (!imageFile || !(imageFile instanceof File)) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 }
      );
    }

    // Upload the image
    const result = await uploadProductImage(productId, imageFile);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: 400 }
      );
    }

    // Success
    return NextResponse.json(
      {
        success: true,
        fileName: result.fileName,
        publicUrl: result.publicUrl,
        path: result.path,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
