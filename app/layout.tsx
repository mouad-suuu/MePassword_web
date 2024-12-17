import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "../components/Navbar";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "MePassword - Secure Password Manager",
  description: "A secure, user-friendly password manager that helps you store and manage your passwords safely across all your devices.",
  keywords: ["password manager", "security", "password storage", "encryption", "password protection"],
  authors: [{ name: "MePassword Team" }],
  creator: "MePassword",
  publisher: "MePassword",
  applicationName: "MePassword",
  generator: "Next.js",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mepassword.vercel.app",
    title: "MePassword - Secure Password Manager",
    description: "A secure, user-friendly password manager that helps you store and manage your passwords safely across all your devices.",
    siteName: "MePassword",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MePassword Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MePassword - Secure Password Manager",
    description: "A secure, user-friendly password manager that helps you store and manage your passwords safely across all your devices.",
    images: ["/og-image.png"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: "#000000",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} ${inter.className} antialiased`}>
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
