/**
 * Login page
 */

"use client";

import { useState } from "react";
import { handleLogin } from "@/app/actions/auth";
import { FormContainer } from "@/app/components/FormContainer";
import { FormInput } from "@/app/components/FormInput";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    setIsPending(true);

    try {
      const result = await handleLogin(formData);
      if (!result.success && result.error) {
        setError(result.error);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <FormContainer
      title="Welcome Back"
      subtitle="Sign in to your KeyNexa account"
      onSubmit={onSubmit}
      submitButtonText={isPending ? "Signing In..." : "Login"}
      isLoading={isPending}
    >
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      <FormInput
        label="Email Address"
        name="email"
        type="email"
        placeholder="you@example.com"
        required
        disabled={isPending}
      />

      <FormInput
        label="Password"
        name="password"
        type="password"
        placeholder="Your password"
        required
        disabled={isPending}
      />

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-black dark:text-white font-semibold hover:underline">
            Register here
          </Link>
        </div>
        <Link
          href="/forgot-password"
          className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
        >
          Forgot password?
        </Link>
      </div>
    </FormContainer>
  );
}
