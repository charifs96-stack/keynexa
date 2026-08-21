import Link from "next/link";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-gray-800 dark:bg-black/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden md:flex gap-8">
          <Link
            href="/products"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
          >
            Shop
          </Link>
          <Link
            href="/categories"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
          >
            Categories
          </Link>
          <Link
            href="/#"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
          >
            About
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
          <Link
            href="/account"
            className="p-2 text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </Link>
          <Link
            href="/cart"
            className="p-2 text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
