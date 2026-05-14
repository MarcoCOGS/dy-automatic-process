import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { nextDebugError, nextDebugLog } from '@/lib/next-debug-log';

import { authConfig } from './auth.config';

declare module 'next-auth' {
  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    orgId?: string;
    accessToken?: string;
  }

  interface Session {
    accessToken?: string;
    user: {
      orgId?: string;
    } & DefaultSession['user'];
  }
}

type BackendLoginResponse = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: {
    id: string;
    email: string;
    username: string;
    organizationId: string;
  };
};

const buildBackendUrl = (path: string) => {
  const baseUrl = process.env.NEST_API_BASE_URL;

  if (!baseUrl) {
    throw new Error('NEST_API_BASE_URL is not configured');
  }

  return new URL(path.replace(/^\//, ''), `${baseUrl.replace(/\/$/, '')}/`).toString();
};

const readBackendResponse = async (response: Response) => {
  const text = await response.text();

  if (!text) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const loginWithBackend = async (email: string, password: string): Promise<BackendLoginResponse | null> => {
  nextDebugLog('auth.backend-login', 'request:start', {
    email,
    backendPath: '/auth/login',
  });

  const response = await fetch(buildBackendUrl('/auth/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });
  const data = await readBackendResponse(response);

  nextDebugLog('auth.backend-login', 'response:received', {
    email,
    status: response.status,
    ok: response.ok,
  });

  if (response.status === 400 || response.status === 401) {
    nextDebugLog('auth.backend-login', 'response:invalid-credentials', {
      email,
      status: response.status,
    });
    return null;
  }

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && typeof (data as { message?: unknown }).message === 'string'
        ? (data as { message: string }).message
        : `Backend login failed with status ${response.status}`;

    nextDebugError('auth.backend-login', 'response:error', {
      email,
      status: response.status,
      message,
    });
    throw new Error(message);
  }

  nextDebugLog('auth.backend-login', 'response:success', {
    email,
    hasAccessToken: Boolean((data as BackendLoginResponse | undefined)?.accessToken),
  });

  return data as BackendLoginResponse;
};

export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = typeof credentials.email === 'string' ? credentials.email.trim().toLowerCase() : '';
        const password = typeof credentials.password === 'string' ? credentials.password : '';

        nextDebugLog('auth.credentials', 'authorize:start', {
          email,
          hasPassword: Boolean(password),
        });

        if (!email || !password) {
          nextDebugLog('auth.credentials', 'authorize:missing-credentials', {
            hasEmail: Boolean(email),
            hasPassword: Boolean(password),
          });
          return null;
        }

        const login = await loginWithBackend(email, password);

        if (!login) {
          nextDebugLog('auth.credentials', 'authorize:failed', {
            email,
          });
          return null;
        }

        nextDebugLog('auth.credentials', 'authorize:success', {
          userId: login.user.id,
          email: login.user.email,
          organizationId: login.user.organizationId,
          hasAccessToken: Boolean(login.accessToken),
        });

        return {
          id: login.user.id,
          name: login.user.username,
          email: login.user.email,
          orgId: login.user.organizationId,
          accessToken: login.accessToken,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, trigger, user, session }) {
      const authToken = token as {
        id?: string;
        orgId?: string;
        backendAccessToken?: string;
      };

      if (trigger === 'update') {
        const organizationId = (session as { organizationId?: unknown })?.organizationId;

        if (organizationId !== undefined) {
          authToken.orgId = String(organizationId);
          nextDebugLog('auth.jwt', 'callback:update-organization', {
            organizationId: authToken.orgId,
          });
        }
      }

      if (user) {
        authToken.id = user.id;
        authToken.orgId = user.orgId;
        authToken.backendAccessToken = user.accessToken;
        nextDebugLog('auth.jwt', 'callback:user-attached', {
          userId: authToken.id,
          organizationId: authToken.orgId,
          hasBackendAccessToken: Boolean(authToken.backendAccessToken),
        });
      }

      nextDebugLog('auth.jwt', 'callback:complete', {
        trigger: trigger ?? 'default',
        userId: authToken.id,
        organizationId: authToken.orgId,
        hasBackendAccessToken: Boolean(authToken.backendAccessToken),
      });
      return token;
    },
    session({ session, token }) {
      if (!session.user) {
        return session;
      }

      const authToken = token as {
        id?: string;
        orgId?: string;
        backendAccessToken?: string;
      };

      if (authToken.id) {
        session.user.id = authToken.id;
      }
      session.user.orgId = authToken.orgId;
      session.accessToken = authToken.backendAccessToken;

      nextDebugLog('auth.session', 'callback:complete', {
        userId: session.user.id,
        organizationId: session.user.orgId,
        hasAccessToken: Boolean(session.accessToken),
      });

      return session;
    },
  },
});
