'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { UserProfileButton } from '../UserProfileButton';
import { Logo } from '../Logo';

interface TopNavProps {
  children?: ReactNode;
}

export function TopNav({ children }: TopNavProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link className="flex items-center space-x-3" href="/">
           <Logo />
            <span className="text-xl font-bold text-gray-900 dark:text-white">MePassword</span>
          </Link>
         {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
          <UserProfileButton />
          </div>
          {children}
        </div>
      </div>
    </nav>
  );
}
