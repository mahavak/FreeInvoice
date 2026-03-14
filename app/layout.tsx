import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FreeInvoice | AI-Powered Invoicing for Freelancers",
  description: "Generate professional invoices in seconds with local AI. Supporting freelancers globally through our 1-for-3 impact model.",
  icons: {
    icon: "/favicon.ico",
  }
};

/**
 * Root Layout: FreeInvoice
 * Features: Inter Font, Modern Selections, Polished Foundation.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-white text-gray-900 antialiased selection:bg-indigo-100 selection:text-indigo-900`}>
        {children}
      </body>
    </html>
  );
}
