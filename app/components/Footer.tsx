export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold">Shop</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white">
                  All Products
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white">
                  New Arrivals
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white">
                  Sale
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Support</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white">
                  Shipping
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white">
                  Returns
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white">
                  Press
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white">
                  Cookies
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} KeyNexa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
