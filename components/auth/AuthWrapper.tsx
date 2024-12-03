"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

export const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user, isSignedIn } = useUser();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    console.log('AuthWrapper: Component mounted');
    setIsMounted(true);
  }, []);

  useEffect(() => {
    console.log('AuthWrapper: User signed in status changed:', isSignedIn);
    console.log('AuthWrapper: Current user:', user);

    if (!isMounted) return;

    if (isSignedIn && user) {
      console.log('AuthWrapper: User authenticated, preparing login success message');
      
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
        
        console.log('AuthWrapper: Login success message sent to extension');
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
