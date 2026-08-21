import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Content */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-black dark:text-white">
                Premium Products,
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-400">
                  Elevated Experience
                </span>
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md">
              Discover carefully curated products designed for those who appreciate quality,
              craftsmanship, and style. Fast shipping, secure checkout, exceptional service.
            </p>
            <div className="flex gap-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-gray-100"
              >
                Shop Now
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-black font-semibold rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-700 dark:text-white dark:hover:bg-gray-900"
              >
                Browse Categories
              </Link>
            </div>
          </div>

          {/* Image Placeholder */}
          <div className="relative h-96 bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl flex items-center justify-center overflow-hidden">
            <div className="text-center">
              <div className="text-6xl mb-4">◆</div>
              <p className="text-gray-500 dark:text-gray-400">Premium Collection</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
