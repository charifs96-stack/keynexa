/**
 * Protected customer account page
 */

import { getCurrentUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/app/components/LogoutButton";

export default async function AccountPage() {
  // Check if user is authenticated
  const userResult = await getCurrentUser();

  if (!userResult.success || !userResult.user) {
    // Redirect to login if not authenticated
    redirect("/login");
  }

  const user = userResult.user;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Account
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-black to-gray-700 dark:from-white dark:to-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white dark:text-black font-bold text-xl">
                    {user.fullName
                      ? user.fullName.charAt(0).toUpperCase()
                      : user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {user.fullName || "User"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {user.role === "admin" ? "Administrator" : "Customer"}
                </p>
              </div>

              <div className="space-y-2">
                <button className="w-full px-4 py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white font-medium">
                  📋 Orders
                </button>
                <button className="w-full px-4 py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white font-medium">
                  ❤️ Wishlist
                </button>
                <button className="w-full px-4 py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white font-medium">
                  ⚙️ Settings
                </button>
              </div>

              <div className="mt-6">
                <LogoutButton />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Profile Info */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Profile Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Full Name
                  </label>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white">
                    {user.fullName || "Not set"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Email Address
                  </label>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white">
                    {user.email}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Account Type
                  </label>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white">
                    {user.role === "admin" ? "Administrator" : "Customer"}
                  </div>
                </div>
              </div>

              <button className="mt-6 px-6 py-2 rounded-lg font-semibold transition-colors bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
                Edit Profile
              </button>
            </div>

            {/* Quick Links */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Quick Links
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    Orders
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    View your order history
                  </div>
                </button>

                <button className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    Addresses
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Manage shipping addresses
                  </div>
                </button>

                <button className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    Payments
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Manage payment methods
                  </div>
                </button>

                <button className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    Change Password
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Update your password
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
