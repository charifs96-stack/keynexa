/**
 * Server actions for authentication forms
 *
 * These actions handle:
 * - Registration form submissions
 * - Login form submissions
 * - Logout
 * - Password reset requests
 * - Password reset confirmations
 *
 * All operations execute server-side and never expose sensitive data to client.
 */

"use server";

import {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  requestPasswordReset,
  resetPassword,
} from "@/lib/auth/server";
import { redirect } from "next/navigation";

/**
 * Handle registration form submission
 */
export async function handleRegister(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  const fullName = formData.get("fullName");

  // Validate form data
  if (!email || typeof email !== "string") {
    return { success: false, error: "Email is required" };
  }

  if (!password || typeof password !== "string") {
    return { success: false, error: "Password is required" };
  }

  if (!confirmPassword || typeof confirmPassword !== "string") {
    return { success: false, error: "Please confirm your password" };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match" };
  }

  if (!fullName || typeof fullName !== "string") {
    return { success: false, error: "Full name is required" };
  }

  // Call authentication function
  const result = await registerCustomer(email, password, fullName);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  // Redirect to login on success
  redirect("/login");
}

/**
 * Handle login form submission
 */
export async function handleLogin(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  // Validate form data
  if (!email || typeof email !== "string") {
    return { success: false, error: "Email is required" };
  }

  if (!password || typeof password !== "string") {
    return { success: false, error: "Password is required" };
  }

  // Call authentication function
  const result = await loginCustomer(email, password);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  // Redirect to account page on success
  redirect("/account");
}

/**
 * Handle logout
 */
export async function handleLogout() {
  const result = await logoutCustomer();

  if (!result.success) {
    return { success: false, error: result.error };
  }

  // Redirect to home page
  redirect("/");
}

/**
 * Handle forgot password form submission
 */
export async function handleForgotPassword(formData: FormData) {
  const email = formData.get("email");

  if (!email || typeof email !== "string") {
    return { success: false, error: "Email is required" };
  }

  const result = await requestPasswordReset(email);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return {
    success: true,
    message: result.message || "Password reset email sent",
  };
}

/**
 * Handle password reset form submission
 */
export async function handleResetPassword(formData: FormData) {
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  if (!newPassword || typeof newPassword !== "string") {
    return { success: false, error: "Password is required" };
  }

  if (!confirmPassword || typeof confirmPassword !== "string") {
    return { success: false, error: "Please confirm your password" };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "Passwords do not match" };
  }

  const result = await resetPassword(newPassword);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  // Redirect to login on success
  redirect("/login");
}
