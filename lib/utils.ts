/**
 * Utility functions for KeyNexa application
 */

/**
 * Format price as currency
 */
export function formatPrice(price: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price);
}

/**
 * Format date to readable format
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

/**
 * Slugify text for URLs
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .trim();
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(original: number, current: number): number {
  if (original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
}

/**
 * Debounce function for search/input
 */
export function debounce<T extends (...args: Parameters<T>[]) => ReturnType<T>>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

/**
 * Check if value is mobile viewport
 */
export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}
