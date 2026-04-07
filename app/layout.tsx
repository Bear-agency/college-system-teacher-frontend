import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToasterClient } from "@/components/toaster-client";
import { Providers } from "@/lib/providers";
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
  title: "HPK Teacher System",
  description: "Admin panel for managing academic hierarchy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <Providers>
          {children}
          <ToasterClient />
        </Providers>
      </body>
    </html>
  );
}
