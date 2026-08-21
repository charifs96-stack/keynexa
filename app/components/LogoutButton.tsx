/**
 * Logout button component
 */

"use client";

import { handleLogout } from "@/app/actions/auth";

export function LogoutButton() {
  async function onLogout() {
    await handleLogout();
  }

  return (
    <button
      onClick={onLogout}
      className="
        w-full px-4 py-2 rounded-lg font-medium transition-colors
        bg-red-50 dark:bg-red-900/20
        text-red-600 dark:text-red-400
        hover:bg-red-100 dark:hover:bg-red-900/40
      "
    >
      🚪 Logout
    </button>
  );
}
