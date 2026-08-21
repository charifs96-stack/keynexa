import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "KeyNexa - Premium Online Store",
    template: "%s | KeyNexa",
  },
  description:
    "Discover premium products curated for modern living. Fast, secure, and elegant shopping experience.",
  keywords: [
    "online store",
    "premium products",
    "ecommerce",
    "shopping",
    "KeyNexa",
  ],
  authors: [{ name: "KeyNexa" }],
  creator: "KeyNexa",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://keynexa.online",
    title: "KeyNexa - Premium Online Store",
    description:
      "Discover premium products curated for modern living. Fast, secure, and elegant shopping experience.",
    siteName: "KeyNexa",
  },
  twitter: {
    card: "summary_large_image",
    title: "KeyNexa - Premium Online Store",
    description:
      "Discover premium products curated for modern living. Fast, secure, and elegant shopping experience.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-black dark:bg-black dark:text-white">
        {children}
      </body>
    </html>
  );
}
