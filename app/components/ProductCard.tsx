"use client";

import Image from "next/image";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  badge?: string | null;
}

export function ProductCard({
  id,
  name,
  price,
  image,
  category,
  badge,
}: ProductCardProps) {
  return (
    <a
      href={`/products/${id}`}
      className="group flex flex-col rounded-lg border border-gray-200 bg-white transition-all hover:border-gray-400 hover:shadow-md dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700"
    >
      <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-900 aspect-square rounded-t-lg">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}
        {badge && (
          <div className="absolute top-3 right-3 bg-black px-2 py-1 text-white text-xs font-semibold rounded dark:bg-white dark:text-black">
            {badge}
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4">
        {category && (
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {category}
          </p>
        )}
        <h3 className="mt-2 font-semibold text-gray-900 dark:text-white line-clamp-2">
          {name}
        </h3>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-black dark:text-white">
            ${price.toFixed(2)}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
            }}
            className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
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
          </button>
        </div>
      </div>
    </a>
  );
}
