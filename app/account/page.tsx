import type { Metadata } from "next";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { Button } from "@/app/components/Button";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your KeyNexa account",
};

export default function AccountPage() {
  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
            Account
          </h1>

          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 p-8">
            <div className="text-center py-12">
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Sign in to access your account
              </p>
              <Button variant="primary" size="lg">
                Sign In / Sign Up
              </Button>
            </div>

            <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-12">
              <h2 className="text-xl font-semibold text-black dark:text-white mb-6">
                Account Features
              </h2>
              <ul className="space-y-4 text-gray-600 dark:text-gray-400">
                <li className="flex gap-3">
                  <span>✓</span>
                  <span>View your order history</span>
                </li>
                <li className="flex gap-3">
                  <span>✓</span>
                  <span>Track shipments in real-time</span>
                </li>
                <li className="flex gap-3">
                  <span>✓</span>
                  <span>Save favorite products</span>
                </li>
                <li className="flex gap-3">
                  <span>✓</span>
                  <span>Manage your profile information</span>
                </li>
                <li className="flex gap-3">
                  <span>✓</span>
                  <span>Access exclusive member offers</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
