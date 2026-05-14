import type { NextAuthConfig } from 'next-auth';

import { nextDebugLog } from '@/lib/next-debug-log';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request }) {
      const { nextUrl } = request;
      const isServerAction = request.headers.has('next-action');
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isPublic = nextUrl.pathname.startsWith('/invite');

      nextDebugLog('auth.middleware', 'authorized:start', {
        pathname: nextUrl.pathname,
        method: request.method,
        isServerAction,
        isLoggedIn,
        isOnDashboard,
        isPublic,
      });

      if (isServerAction) {
        nextDebugLog('auth.middleware', 'authorized:allow-server-action', {
          pathname: nextUrl.pathname,
          method: request.method,
        });
        return true;
      }

      if (isPublic) {
        nextDebugLog('auth.middleware', 'authorized:allow-public', {
          pathname: nextUrl.pathname,
        });
        return true;
      }

      if (isOnDashboard) {
        if (isLoggedIn) {
          nextDebugLog('auth.middleware', 'authorized:allow-dashboard', {
            pathname: nextUrl.pathname,
          });
          return true;
        }

        nextDebugLog('auth.middleware', 'authorized:deny-dashboard', {
          pathname: nextUrl.pathname,
        });
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        nextDebugLog('auth.middleware', 'authorized:redirect-logged-user', {
          pathname: nextUrl.pathname,
          redirectTo: '/dashboard',
        });
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      nextDebugLog('auth.middleware', 'authorized:allow-default', {
        pathname: nextUrl.pathname,
      });
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
  trustHost: true,
} satisfies NextAuthConfig;
