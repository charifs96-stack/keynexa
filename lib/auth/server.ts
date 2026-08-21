/**
 * Authentication utilities for Supabase Auth
 *
 * Provides functions for:
 * - User registration
 * - User login
 * - User logout
 * - Password reset
 * - Session management
 * - Role-based authorization
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Authentication response types
 */
export interface AuthResponse {
  success: boolean;
  error?: string;
  code?: string;
}

export interface AuthUserResponse extends AuthResponse {
  user?: {
    id: string;
    email: string;
    fullName?: string;
    role: string;
  };
}

export interface PasswordResetResponse extends AuthResponse {
  message?: string;
}

/**
 * Register a new customer account
 *
 * Requirements:
 * - Email: Valid email address
 * - Password: Minimum 8 characters
 * - Full Name: Non-empty string
 *
 * Automatically:
 * - Creates auth.users record
 * - Creates public.profiles record with 'customer' role
 *
 * @param email - Customer email
 * @param password - Customer password (min 8 chars)
 * @param fullName - Customer full name
 * @returns Result with user info or error
 */
export async function registerCustomer(
  email: string,
  password: string,
  fullName: string
): Promise<AuthUserResponse> {
  try {
    // Validate inputs
    if (!email || !email.includes("@")) {
      return {
        success: false,
        error: "Please enter a valid email address",
        code: "INVALID_EMAIL",
      };
    }

    if (!password || password.length < 8) {
      return {
        success: false,
        error: "Password must be at least 8 characters",
        code: "WEAK_PASSWORD",
      };
    }

    if (!fullName || fullName.trim().length === 0) {
      return {
        success: false,
        error: "Please enter your full name",
        code: "INVALID_NAME",
      };
    }

    const supabase = await createServerSupabaseClient();

    // Attempt to sign up
    console.log("[registerCustomer] Signing up:", email.toLowerCase().trim());
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      console.error("[registerCustomer] signUp error:", error);
      // Handle specific error cases
      if (error.message.includes("already registered")) {
        return {
          success: false,
          error: "This email is already registered",
          code: "EMAIL_EXISTS",
        };
      }

      // Check for email confirmation required
      if (error.message.includes("Email not confirmed") || error.message.includes("confirm")) {
        return {
          success: false,
          error: "Please check your email to confirm your account before logging in",
          code: "EMAIL_NOT_CONFIRMED",
        };
      }

      return {
        success: false,
        error: `Registration failed: ${error.message || "Please try again."}`,
        code: "SIGNUP_ERROR",
      };
    }

    console.log("[registerCustomer] SignUp success:", data);

    if (!data.user) {
      return {
        success: false,
        error: "Registration failed - no user data returned",
        code: "SIGNUP_ERROR",
      };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email || "",
        fullName,
        role: "customer",
      },
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
      code: "INTERNAL_ERROR",
    };
  }
}

/**
 * Login with email and password
 *
 * @param email - Customer email
 * @param password - Customer password
 * @returns Result with user info or error
 */
export async function loginCustomer(
  email: string,
  password: string
): Promise<AuthUserResponse> {
  try {
    // Validate inputs
    if (!email || !email.includes("@")) {
      return {
        success: false,
        error: "Please enter a valid email address",
        code: "INVALID_EMAIL",
      };
    }

    if (!password) {
      return {
        success: false,
        error: "Please enter your password",
        code: "MISSING_PASSWORD",
      };
    }

    const supabase = await createServerSupabaseClient();

    // Attempt to sign in
    console.log("[loginCustomer] Signing in:", email.toLowerCase().trim());
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) {
      console.error("[loginCustomer] signIn error:", error);
      // Handle specific error cases
      if (
        error.message.includes("Invalid login credentials") ||
        error.message.includes("Email not confirmed")
      ) {
        return {
          success: false,
          error: "Invalid email or password",
          code: "INVALID_CREDENTIALS",
        };
      }

      return {
        success: false,
        error: `Login failed: ${error.message || "Please try again."}`,
        code: "LOGIN_ERROR",
      };
    }

    console.log("[loginCustomer] Login success:", data);

    if (!data.user) {
      return {
        success: false,
        error: "Login failed",
        code: "LOGIN_ERROR",
      };
    }

    // Get user profile to retrieve role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email || "",
        fullName: profile?.full_name,
        role: profile?.role || "customer",
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
      code: "INTERNAL_ERROR",
    };
  }
}

/**
 * Logout the current user
 *
 * @returns Result with success or error
 */
export async function logoutCustomer(): Promise<AuthResponse> {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return {
        success: false,
        error: "Logout failed",
        code: "LOGOUT_ERROR",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
      code: "INTERNAL_ERROR",
    };
  }
}

/**
 * Request password reset email
 *
 * @param email - Customer email
 * @returns Result with message or error
 */
export async function requestPasswordReset(
  email: string
): Promise<PasswordResetResponse> {
  try {
    if (!email || !email.includes("@")) {
      return {
        success: false,
        error: "Please enter a valid email address",
        code: "INVALID_EMAIL",
      };
    }

    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.toLowerCase().trim(),
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      }
    );

    if (error) {
      console.error("Password reset error:", error);
      // Don't reveal if email exists or not (security best practice)
      return {
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent",
      };
    }

    return {
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent",
    };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
      code: "INTERNAL_ERROR",
    };
  }
}

/**
 * Reset password with token from email
 *
 * @param newPassword - New password (min 8 chars)
 * @returns Result with success or error
 */
export async function resetPassword(
  newPassword: string
): Promise<AuthResponse> {
  try {
    if (!newPassword || newPassword.length < 8) {
      return {
        success: false,
        error: "Password must be at least 8 characters",
        code: "WEAK_PASSWORD",
      };
    }

    const supabase = await createServerSupabaseClient();

    // Update password for the current session (user must have valid session from email link)
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      if (error.message.includes("session_not_found")) {
        return {
          success: false,
          error: "Password reset link has expired",
          code: "EXPIRED_RESET_LINK",
        };
      }

      console.error("Password update error:", error);
      return {
        success: false,
        error: "Failed to reset password",
        code: "PASSWORD_UPDATE_ERROR",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
      code: "INTERNAL_ERROR",
    };
  }
}

/**
 * Get current authenticated user
 *
 * @returns Current user or null if not authenticated
 */
export async function getCurrentUser(): Promise<AuthUserResponse> {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Not authenticated",
        code: "NOT_AUTHENTICATED",
      };
    }

    // Get user profile to retrieve role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email || "",
        fullName: profile?.full_name,
        role: profile?.role || "customer",
      },
    };
  } catch (error) {
    console.error("Get user error:", error);
    return {
      success: false,
      error: "Failed to get user",
      code: "GET_USER_ERROR",
    };
  }
}

/**
 * Check if user is authenticated
 *
 * @returns true if user is authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    return !!user;
  } catch {
    return false;
  }
}

/**
 * Check if user has admin role (server-side only)
 *
 * IMPORTANT: This is server-side only. Always verify on server,
 * never trust client-side role claims.
 *
 * @returns true if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Profile fetch error:", error);
      return false;
    }

    return profile?.role === "admin";
  } catch (error) {
    console.error("Admin check error:", error);
    return false;
  }
}
