/**
 * Authentication module - Main export
 *
 * Provides all authentication functions for the application.
 *
 * Server-side functions (use in server actions/components):
 * - registerCustomer()
 * - loginCustomer()
 * - logoutCustomer()
 * - requestPasswordReset()
 * - resetPassword()
 * - getCurrentUser()
 * - isAuthenticated()
 * - isAdmin()
 */

export {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  requestPasswordReset,
  resetPassword,
  getCurrentUser,
  isAuthenticated,
  isAdmin,
  type AuthResponse,
  type AuthUserResponse,
  type PasswordResetResponse,
} from "./server";
