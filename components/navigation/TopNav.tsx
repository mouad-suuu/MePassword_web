'use client';

import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';
import { ReactNode } from 'react';
import { UserProfileButton } from '../UserProfileButton';
import { Logo } from '../Logo';

interface TopNavProps {
  children?: ReactNode;
}

const navigation = [
  { name: 'Home', href: '#home' },
  { name: 'How It Works', href: '#about' },
  { name: 'Features', href: '#features' },
  { name: 'Open Source', href: '#open-source' },
];

export function TopNav({ children }: TopNavProps) {
  const { isSignedIn } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
           <Logo />
            <span className="text-xl font-bold text-gray-900 dark:text-white">MePassword</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline" className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                    Dashboard
                  </Button>
                </Link>
                <UserProfileButton />
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
          {children}
        </div>
      </div>
    </nav>
  );
}
