/**
 * Supabase Client Layer
 *
 * This module provides type-safe access to Supabase across the application.
 *
 * For client-side operations in browser/client components:
 *   import { createClient } from "@/lib/supabase/client"
 *
 * For server-side operations in server components/actions:
 *   import { createServerSupabaseClient } from "@/lib/supabase/server"
 */

export { createClient } from "./client";
export { createServerSupabaseClient } from "./server";
