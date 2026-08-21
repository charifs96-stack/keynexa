import type { Metadata } from "next";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Shop Products",
  description: "Browse our collection of premium products",
};

export default function ProductsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-black dark:text-white">
            All Products
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Browse our complete collection of premium items
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="aspect-square bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">Product placeholder</p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Products will be loaded from Supabase in the next phase
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
