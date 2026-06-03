import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// This loads a clean, modern font optimized for web
const inter = Inter({ subsets: ["latin"] });

// This sets the browser tab title and metadata for the whole app
export const metadata: Metadata = {
  title: "Rentora | Property OS",
  description: "A comprehensive SaaS platform for property owners and tenants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900`}>
        {/* All your other layouts (Auth, Owner, Tenant) will be injected here */}
        {children}
      </body>
    </html>
  );
}