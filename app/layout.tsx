import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

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
  title: "MePassword",
  description: "Secure Password Management",
  icons: {
    icon: [
      { url: '/MePassword.png', sizes: '32x32', type: 'image/png' },
      { url: '/MePassword.png', sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: dark)' }
    ],
    apple: [
      { url: '/MePassword.png', sizes: '180x180', type: 'image/png' }
    ],
    shortcut: ['/MePassword.png'],
    other: [
      {
        rel: 'mask-icon',
        url: '/MePassword.png',
        color: '#000000'
      }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ClerkProvider>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body></ClerkProvider>
    </html>
  );
}
