"use server";

/**
 * Server-side Supabase connection verification
 *
 * This performs a harmless test to verify:
 * 1. Environment variables are loaded
 * 2. Supabase client initializes
 * 3. Connection to Supabase API works
 * 4. Does NOT expose secrets in responses
 * 5. Does NOT query any database tables
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface SupabaseConnectionTest {
  connected: boolean;
  timestamp: string;
  details: {
    envVarsLoaded: boolean;
    clientInitialized: boolean;
    apiResponsive: boolean;
  };
  message: string;
  error?: string;
}

export async function testSupabaseConnectionServer(): Promise<SupabaseConnectionTest> {
  const timestamp = new Date().toISOString();

  try {
    // Check 1: Environment variables are loaded
    const envVarsLoaded =
      !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!envVarsLoaded) {
      return {
        connected: false,
        timestamp,
        details: {
          envVarsLoaded: false,
          clientInitialized: false,
          apiResponsive: false,
        },
        message: "Environment variables not loaded",
        error: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      };
    }

    // Check 2: Create server client
    let supabase;
    try {
      supabase = await createServerSupabaseClient();
    } catch (err) {
      return {
        connected: false,
        timestamp,
        details: {
          envVarsLoaded: true,
          clientInitialized: false,
          apiResponsive: false,
        },
        message: "Failed to initialize Supabase client",
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }

    // Check 3: Test API responsiveness with a safe, read-only call
    // This call does NOT query any tables, just verifies API is accessible
    try {
      // getSession() is a safe call that:
      // - Does NOT require any database tables
      // - Does NOT return any sensitive data
      // - Only verifies authentication service is accessible
      await supabase.auth.getSession();

      // If we get here, API is responsive
    } catch (err) {
      // Network error or API unreachable
      return {
        connected: false,
        timestamp,
        details: {
          envVarsLoaded: true,
          clientInitialized: true,
          apiResponsive: false,
        },
        message: "API request failed - Supabase is not reachable",
        error: err instanceof Error ? err.message : "Network error",
      };
    }

    // All checks passed
    return {
      connected: true,
      timestamp,
      details: {
        envVarsLoaded: true,
        clientInitialized: true,
        apiResponsive: true,
      },
      message: "Supabase connection successful",
    };
  } catch (err) {
    return {
      connected: false,
      timestamp,
      details: {
        envVarsLoaded: false,
        clientInitialized: false,
        apiResponsive: false,
      },
      message: "Unexpected error during connection test",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
