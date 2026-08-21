import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser/client-side Supabase client
 *
 * This client is safe to use in the browser and client components.
 * It uses the publishable (anon) key, which has limited permissions.
 *
 * Usage:
 * - Client components (with 'use client')
 * - Browser-side operations (queries, subscriptions)
 * - NOT for sensitive operations (those should use server client)
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
