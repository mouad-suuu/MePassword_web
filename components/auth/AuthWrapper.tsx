"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

export const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user, isSignedIn } = useUser();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {

    if (!isMounted) return;

    if (isSignedIn && user) {
      
      try {
        // Send message to extension with more user data
        window.postMessage({
          type: 'MEPASSWORD_LOGIN_SUCCESS',
          payload: {
            userId: user.id,
            username: user.username || user.firstName || 'User',
            email: user.emailAddresses[0]?.emailAddress || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            imageUrl: user.imageUrl || '',
        
          }
        }, '*');
        
      } catch (error) {
        console.error('AuthWrapper: Error sending login success message:', error);
      }
    }
  }, [isSignedIn, user, isMounted]);

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
};
