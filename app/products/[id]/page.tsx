import type { Metadata } from "next";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  await params;
  return {
    title: "Product Details",
    description: "View product details",
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  await params;

  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="aspect-square bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">Product image placeholder</p>
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Category
              </p>
              <h1 className="mt-2 text-4xl font-bold text-black dark:text-white">
                Product Name
              </h1>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-black dark:text-white">
                $99.99
              </span>
              <span className="text-lg text-gray-500 line-through">
                $129.99
              </span>
            </div>

            <p className="text-lg text-gray-600 dark:text-gray-400">
              Product description will be displayed here once connected to
              Supabase.
            </p>

            <div className="flex gap-4">
              <button className="flex-1 px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-gray-100">
                Add to Cart
              </button>
              <button className="px-6 py-3 border border-gray-300 text-black font-semibold rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-700 dark:text-white dark:hover:bg-gray-900">
                Save
              </button>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <h3 className="font-semibold text-black dark:text-white mb-4">
                Product Details
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>✓ Premium quality materials</li>
                <li>✓ Fast shipping available</li>
                <li>✓ 30-day returns</li>
                <li>✓ Secure checkout</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
