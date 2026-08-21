/**
 * Application constants
 */

export const APP_NAME = "KeyNexa";
export const APP_DESCRIPTION =
  "Premium online store with curated products for modern living";
export const APP_URL = "https://keynexa.online";

export const NAVIGATION = [
  { label: "Shop", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/#" },
];

export const FOOTER_LINKS = {
  shop: [
    { label: "All Products", href: "/products" },
    { label: "New Arrivals", href: "/products?sort=new" },
    { label: "Sale", href: "/products?filter=sale" },
  ],
  support: [
    { label: "Contact Us", href: "/contact" },
    { label: "Shipping Info", href: "/shipping" },
    { label: "Returns", href: "/returns" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

export const FEATURE_ITEMS = [
  {
    icon: "⚡",
    title: "Fast Shipping",
    description: "Quick delivery to your doorstep with real-time tracking",
  },
  {
    icon: "🔒",
    title: "Secure Checkout",
    description:
      "Your payment information is protected with industry-leading encryption",
  },
  {
    icon: "✓",
    title: "Quality Guaranteed",
    description:
      "Every product meets our high standards for quality and craftsmanship",
  },
  {
    icon: "↩️",
    title: "Easy Returns",
    description: "30-day return policy, no questions asked",
  },
];

export const ITEMS_PER_PAGE = 12;
export const CART_EXPIRY_DAYS = 30;
export const SESSION_TIMEOUT_MINUTES = 60;

export const COLORS = {
  primary: "#000000",
  primaryHover: "#1a1a1a",
  secondary: "#f5f5f5",
  border: "#e5e5e5",
  textMuted: "#666666",
};
