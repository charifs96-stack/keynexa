import { testSupabaseConnection } from "@/lib/supabase/health";
import { NextResponse } from "next/server";

/**
 * API route: GET /api/health/supabase
 *
 * Returns a JSON response indicating Supabase connection status.
 * Useful for monitoring and debugging.
 *
 * Response:
 * {
 *   "status": "healthy" | "error",
 *   "timestamp": "2024-01-01T00:00:00Z",
 *   "checks": {
 *     "envVars": boolean,
 *     "apiConnection": boolean,
 *     "authConfigured": boolean
 *   },
 *   "error": string | undefined
 * }
 */
export async function GET() {
  try {
    const healthCheck = await testSupabaseConnection();

    return NextResponse.json(healthCheck, {
      status: healthCheck.status === "healthy" ? 200 : 503,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        checks: {
          envVars: false,
          apiConnection: false,
          authConfigured: false,
        },
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
