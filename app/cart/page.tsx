import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { Button } from "@/app/components/Button";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review and checkout your items",
};

export default function CartPage() {
  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-black dark:text-white mb-12">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 p-6">
              <p className="text-gray-600 dark:text-gray-400 text-center py-12">
                Your cart is empty
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 p-6 h-fit sticky top-20">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 border-t border-gray-200 dark:border-gray-800 pt-6">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tax</span>
                <span>$0.00</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 flex justify-between font-semibold text-black dark:text-white">
                <span>Total</span>
                <span>$0.00</span>
              </div>
            </div>

            <Button variant="primary" size="lg" className="w-full mt-6" disabled>
              Proceed to Checkout
            </Button>
            <Link href="/products" className="block text-center mt-4 text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
