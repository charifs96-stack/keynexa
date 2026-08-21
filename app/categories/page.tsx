import type { Metadata } from "next";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Browse Categories",
  description: "Shop by category to find exactly what you need",
};

export default function CategoriesPage() {
  const categories = [
    {
      name: "Home",
      description: "Furniture, decor, and home essentials",
      icon: "🏠",
    },
    {
      name: "Fashion",
      description: "Clothing, shoes, and accessories",
      icon: "👗",
    },
    {
      name: "Electronics",
      description: "Tech gadgets and devices",
      icon: "⚡",
    },
    {
      name: "Bedding",
      description: "Premium linens and bedding",
      icon: "🛏️",
    },
  ];

  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-black dark:text-white">
            Categories
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Explore our curated collections
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <a
              key={category.name}
              href="#"
              className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-8 hover:border-gray-400 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-black dark:text-white">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {category.description}
                  </p>
                </div>
                <span className="text-4xl">{category.icon}</span>
              </div>
              <p className="mt-4 text-sm font-semibold text-black dark:text-white group-hover:translate-x-1 transition-transform">
                Browse →
              </p>
            </a>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
