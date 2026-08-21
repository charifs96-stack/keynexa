/**
 * Forgot password page
 */

"use client";

import { useState } from "react";
import { handleForgotPassword } from "@/app/actions/auth";
import { FormContainer } from "@/app/components/FormContainer";
import { FormInput } from "@/app/components/FormInput";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    setMessage(null);
    setIsPending(true);

    try {
      const result = await handleForgotPassword(formData);
      if (result.success && result.message) {
        setMessage(result.message);
      } else if (!result.success && result.error) {
        setError(result.error);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  }

  if (message) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-center">
            <div className="mb-4 text-4xl">📧</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Check Your Email
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We&apos;ve sent a password reset link to your email address. Click the link to set a new password.
            </p>
            <Link
              href="/login"
              className="
                inline-block px-6 py-2 rounded-lg font-semibold
                bg-black dark:bg-white
                text-white dark:text-black
                hover:bg-gray-800 dark:hover:bg-gray-200
                transition-colors
              "
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FormContainer
      title="Reset Password"
      subtitle="Enter your email to receive a password reset link"
      onSubmit={onSubmit}
      submitButtonText={isPending ? "Sending..." : "Send Reset Link"}
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

      <Link
        href="/login"
        className="text-center block text-sm text-gray-600 dark:text-gray-400 hover:underline"
      >
        Remember your password? Back to login
      </Link>
    </FormContainer>
  );
}
