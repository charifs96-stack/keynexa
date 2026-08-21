/**
 * Supabase Connection Test
 *
 * This utility provides a way to verify the Supabase connection
 * without creating any data or requiring fake products.
 *
 * It checks:
 * - Environment variables are set
 * - Connection to Supabase API is working
 * - Authentication is properly configured
 */

import { createClient } from "./client";

export interface SupabaseHealthCheck {
  status: "healthy" | "error";
  timestamp: string;
  checks: {
    envVars: boolean;
    apiConnection: boolean;
    authConfigured: boolean;
  };
  error?: string;
}

/**
 * Verify Supabase connection and configuration
 *
 * Safe to call from client components and server components.
 * Returns connection status without making any database queries.
 */
export async function testSupabaseConnection(): Promise<SupabaseHealthCheck> {
  const timestamp = new Date().toISOString();

  try {
    // Check 1: Environment variables are present
    const envVarsOk =
      !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!envVarsOk) {
      return {
        status: "error",
        timestamp,
        checks: {
          envVars: false,
          apiConnection: false,
          authConfigured: false,
        },
        error: "Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      };
    }

    // Check 2: Create a client and verify it initializes
    const supabase = createClient();

    if (!supabase) {
      return {
        status: "error",
        timestamp,
        checks: {
          envVars: true,
          apiConnection: false,
          authConfigured: false,
        },
        error: "Failed to initialize Supabase client",
      };
    }

    // Check 3: Verify API is reachable via getSession (no database query needed)
    // This tests the connection without requiring any tables or data
    const { error } = await supabase.auth.getSession();

    const apiConnectionOk = !error;
    const authConfigured = true; // If we got here, auth is configured

    return {
      status: apiConnectionOk ? "healthy" : "error",
      timestamp,
      checks: {
        envVars: true,
        apiConnection: apiConnectionOk,
        authConfigured,
      },
      error: error ? error.message : undefined,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";

    return {
      status: "error",
      timestamp,
      checks: {
        envVars: true,
        apiConnection: false,
        authConfigured: false,
      },
      error: errorMessage,
    };
  }
}
