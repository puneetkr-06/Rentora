"use client";

import { useEffect } from 'react';

export default function FetchInterceptor() {
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async function (...args) {
      const response = await originalFetch.apply(this, args);

      // If any authenticated API returns 401 Unauthorized, the token has expired
      if (response.status === 401) {
        // Prevent redirect loops if they are already on the login page
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/signup')) {
          console.warn("Session expired. Redirecting to login...");
          sessionStorage.removeItem('rentora_token');
          sessionStorage.removeItem('rentora_user');
          window.location.href = '/login?expired=true';
        }
      }

      return response;
    };

    // Cleanup isn't strictly necessary for a global root interceptor, 
    // but good practice in case React hot reloads.
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
