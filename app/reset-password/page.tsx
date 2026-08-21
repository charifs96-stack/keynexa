/**
 * Reset password page (called from email link)
 */

"use client";

import { useState } from "react";
import { handleResetPassword } from "@/app/actions/auth";
import { FormContainer } from "@/app/components/FormContainer";
import { FormInput } from "@/app/components/FormInput";

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    setIsPending(true);

    try {
      const result = await handleResetPassword(formData);
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
      title="Set New Password"
      subtitle="Enter your new password below"
      onSubmit={onSubmit}
      submitButtonText={isPending ? "Updating..." : "Update Password"}
      isLoading={isPending}
    >
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      <FormInput
        label="New Password"
        name="newPassword"
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
    </FormContainer>
  );
}
