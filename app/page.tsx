import Link from "next/link";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { ProductCard } from "./components/ProductCard";

export default function Home() {
  // Sample featured products (no database yet - just component structure)
  const featuredProducts = [
    {
      id: "1",
      name: "Premium Ceramic Vase",
      price: 89.99,
      category: "Home",
      badge: "New",
    },
    {
      id: "2",
      name: "Minimalist Watch",
      price: 149.99,
      category: "Accessories",
      badge: null,
    },
    {
      id: "3",
      name: "Handcrafted Leather Bag",
      price: 249.99,
      category: "Fashion",
      badge: "Featured",
    },
    {
      id: "4",
      name: "Organic Cotton Bedding Set",
      price: 129.99,
      category: "Bedding",
      badge: null,
    },
  ];

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />

        {/* Featured Products Section */}
        <section className="bg-gray-50 dark:bg-gray-950 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold text-black dark:text-white">
                  Featured Products
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Hand-picked items for your collection
                </p>
              </div>
              <Link
                href="/products"
                className="text-sm font-semibold text-black hover:text-gray-600 dark:text-white dark:hover:text-gray-400 transition-colors"
              >
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-black text-white dark:bg-white dark:text-black py-16 sm:py-24">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold">Stay Updated</h2>
            <p className="mt-4 text-lg opacity-80">
              Subscribe to get early access to new collections and exclusive offers
            </p>
            <form className="mt-8 flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-lg bg-black text-white hover:bg-gray-800 font-semibold transition-colors dark:bg-white dark:text-black dark:hover:bg-gray-100"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
