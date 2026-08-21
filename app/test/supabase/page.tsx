"use client";

/**
 * Supabase Connection Test Page
 *
 * This page provides a simple interface to test the Supabase connection.
 * It verifies:
 * - Environment variables are configured
 * - API connection is working
 * - Authentication is properly set up
 *
 * Access at: http://localhost:3000/test/supabase
 */

import { useState } from "react";
import { testConnection } from "@/app/actions/supabase";
import type { SupabaseHealthCheck } from "@/lib/supabase/health";

export default function SupabaseTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SupabaseHealthCheck | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await testConnection();
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleApiTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/health/supabase");
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Supabase Connection Test</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          This page verifies that your Supabase configuration is working correctly.
        </p>

        <div className="space-y-4 mb-8">
          <button
            onClick={handleTest}
            disabled={loading}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors dark:bg-white dark:text-black dark:hover:bg-gray-100"
          >
            {loading ? "Testing..." : "Test via Server Action"}
          </button>

          <button
            onClick={handleApiTest}
            disabled={loading}
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-colors dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300"
          >
            {loading ? "Testing..." : "Test via API Route"}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
              Error
            </h3>
            <p className="text-red-800 dark:text-red-200 font-mono text-sm">
              {error}
            </p>
          </div>
        )}

        {result && (
          <div
            className={`p-4 border rounded-lg ${
              result.status === "healthy"
                ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                : "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800"
            }`}
          >
            <h3
              className={`font-semibold mb-4 ${
                result.status === "healthy"
                  ? "text-green-900 dark:text-green-100"
                  : "text-yellow-900 dark:text-yellow-100"
              }`}
            >
              Status: <span className="uppercase">{result.status}</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  Environment Variables:
                </span>
                <span
                  className={`font-mono text-sm ${
                    result.checks.envVars
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {result.checks.envVars ? "✓ OK" : "✗ Missing"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  API Connection:
                </span>
                <span
                  className={`font-mono text-sm ${
                    result.checks.apiConnection
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {result.checks.apiConnection ? "✓ OK" : "✗ Failed"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  Auth Configured:
                </span>
                <span
                  className={`font-mono text-sm ${
                    result.checks.authConfigured
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {result.checks.authConfigured ? "✓ Yes" : "✗ No"}
                </span>
              </div>

              {result.error && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 rounded border border-red-300 dark:border-red-700">
                  <p className="text-sm font-mono text-red-900 dark:text-red-100">
                    Error: {result.error}
                  </p>
                </div>
              )}

              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                Timestamp: {result.timestamp}
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h3 className="font-semibold mb-2">Next Steps</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>✓ Supabase packages installed (@supabase/supabase-js, @supabase/ssr)</li>
            <li>✓ Client and server Supabase clients configured</li>
            <li>✓ Environment variables set in .env.local</li>
            <li>→ Next: Design and create the ecommerce database schema</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
