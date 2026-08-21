"use client";

/**
 * Supabase Connection Test Page
 *
 * Verifies that the KeyNexa application is connected to Supabase.
 * This page:
 * - Does NOT expose Supabase keys or secrets
 * - Does NOT query the database
 * - Does NOT require database tables to exist
 * - Only tests API connectivity and configuration
 *
 * Access: http://localhost:3000/supabase-test
 */

import { useState, useEffect } from "react";
import { testSupabaseConnectionServer } from "@/app/actions/supabase-test";
import type { SupabaseConnectionTest } from "@/app/actions/supabase-test";

export default function SupabaseTestPage() {
  const [result, setResult] = useState<SupabaseConnectionTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const runTest = async () => {
      try {
        setLoading(true);
        setError(null);
        const testResult = await testSupabaseConnectionServer();
        setResult(testResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    runTest();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-2">Supabase Connection Test</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-12">
          Verifying KeyNexa is connected to your Supabase project
        </p>

        {loading && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-8">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-lg">Testing connection...</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-8">
            <h2 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
              Error
            </h2>
            <p className="text-red-800 dark:text-red-200">
              {error}
            </p>
          </div>
        )}

        {!loading && result && (
          <div
            className={`border-2 rounded-lg p-8 ${
              result.connected
                ? "bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700"
                : "bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700"
            }`}
          >
            {/* Main Status */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                {result.connected ? (
                  <>
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-green-900 dark:text-green-100">
                      Supabase connection successful
                    </h2>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-red-900 dark:text-red-100">
                      Connection failed
                    </h2>
                  </>
                )}
              </div>
              <p
                className={`text-lg ${
                  result.connected
                    ? "text-green-800 dark:text-green-200"
                    : "text-red-800 dark:text-red-200"
                }`}
              >
                {result.message}
              </p>
            </div>

            {/* Detailed Checks */}
            <div className="space-y-3 mb-8">
              <h3 className="font-bold text-lg mb-4">Connection Checks:</h3>

              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                <span>Environment Variables</span>
                <span
                  className={`font-mono text-sm font-bold ${
                    result.details.envVarsLoaded
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {result.details.envVarsLoaded ? "✓ Loaded" : "✗ Missing"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                <span>Client Initialization</span>
                <span
                  className={`font-mono text-sm font-bold ${
                    result.details.clientInitialized
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {result.details.clientInitialized ? "✓ OK" : "✗ Failed"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                <span>API Responsive</span>
                <span
                  className={`font-mono text-sm font-bold ${
                    result.details.apiResponsive
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {result.details.apiResponsive ? "✓ Yes" : "✗ No"}
                </span>
              </div>
            </div>

            {/* Error Details */}
            {result.error && (
              <div className="bg-white dark:bg-gray-900 rounded border border-red-200 dark:border-red-700 p-4 mb-8">
                <h4 className="font-bold text-red-900 dark:text-red-100 mb-2">
                  Error Details:
                </h4>
                <p className="text-sm font-mono text-red-800 dark:text-red-200 break-all">
                  {result.error}
                </p>
              </div>
            )}

            {/* Timestamp */}
            <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
              Test run at: {new Date(result.timestamp).toLocaleString()}
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="mt-12 bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="font-bold mb-4">What This Test Does</h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>✓ Checks if environment variables are loaded</li>
            <li>✓ Verifies Supabase client initializes correctly</li>
            <li>✓ Tests connection to Supabase API</li>
            <li>✓ Does NOT query any database tables</li>
            <li>✓ Does NOT expose Supabase keys or secrets</li>
            <li>✓ Does NOT require database schema to exist</li>
          </ul>
        </div>

        {/* Next Steps */}
        {result?.connected && (
          <div className="mt-6 bg-green-50 dark:bg-green-950 rounded-lg p-6 border border-green-200 dark:border-green-800">
            <h3 className="font-bold text-green-900 dark:text-green-100 mb-4">
              ✓ Ready for Next Phase
            </h3>
            <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
              <li>→ Design and create database schema</li>
              <li>→ Define tables: products, categories, orders, users</li>
              <li>→ Set up Row-Level Security (RLS) policies</li>
              <li>→ Implement authentication</li>
              <li>→ Build API layer with server actions</li>
            </ul>
          </div>
        )}

        {!result?.connected && (
          <div className="mt-6 bg-red-50 dark:bg-red-950 rounded-lg p-6 border border-red-200 dark:border-red-800">
            <h3 className="font-bold text-red-900 dark:text-red-100 mb-4">
              ⚠ Troubleshooting
            </h3>
            <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
              {!result?.details.envVarsLoaded && (
                <>
                  <li>
                    <strong>Missing Environment Variables:</strong> Ensure
                    .env.local contains NEXT_PUBLIC_SUPABASE_URL and
                    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
                  </li>
                  <li>
                    Run: <code className="bg-red-100 dark:bg-red-900 px-2 py-1 rounded">npm run dev</code> to reload
                    environment variables
                  </li>
                </>
              )}
              {result?.details.envVarsLoaded &&
                !result?.details.clientInitialized && (
                  <li>
                    <strong>Client Initialization Failed:</strong> Check that
                    environment variables are valid Supabase URLs and keys
                  </li>
                )}
              {result?.details.clientInitialized &&
                !result?.details.apiResponsive && (
                  <>
                    <li>
                      <strong>API Not Responsive:</strong> Check your internet
                      connection or Supabase project status
                    </li>
                    <li>Visit: https://status.supabase.com</li>
                  </>
                )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
