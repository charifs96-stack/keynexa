"use server";

/**
 * Server action to test Supabase connection
 *
 * This can be called from client components via:
 *   import { testConnection } from "@/app/actions/supabase"
 *   const result = await testConnection()
 */

import { testSupabaseConnection } from "@/lib/supabase/health";

export async function testConnection() {
  return testSupabaseConnection();
}
