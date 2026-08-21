/**
 * Registration page
 */

"use client";

import { useState } from "react";
import { handleRegister } from "@/app/actions/auth";
import { FormContainer } from "@/app/components/FormContainer";
import { FormInput } from "@/app/components/FormInput";
import Link from "next/link";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    setIsPending(true);

    try {
      const result = await handleRegister(formData);
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
      title="Create Account"
      subtitle="Join KeyNexa for exclusive products and fast checkout"
      onSubmit={onSubmit}
      submitButtonText={isPending ? "Creating Account..." : "Register"}
      isLoading={isPending}
    >
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      <FormInput
        label="Full Name"
        name="fullName"
        type="text"
        placeholder="John Doe"
        required
        disabled={isPending}
      />

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
        placeholder="At least 8 characters"
        required
        disabled={isPending}
      />

      <FormInput
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        placeholder="Re-enter your password"
        required
        disabled={isPending}
      />

      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link href="/login" className="text-black dark:text-white font-semibold hover:underline">
          Login here
        </Link>
      </div>
    </FormContainer>
  );
}
