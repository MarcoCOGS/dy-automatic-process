'use server';

import { auth } from '@/auth';
import { nextDebugLog } from '@/lib/next-debug-log';

export async function getSession() {
  const session = await auth();

  const userId = session?.user?.id;
  const orgId = session?.user?.orgId;

  if (!userId || !orgId) {
    nextDebugLog('session', 'getSession:missing-required-fields', {
      hasSession: Boolean(session),
      hasUserId: Boolean(userId),
      hasOrganizationId: Boolean(orgId),
      hasAccessToken: Boolean(session?.accessToken),
    });
    return undefined;
  }

  nextDebugLog('session', 'getSession:success', {
    userId,
    organizationId: orgId,
    hasAccessToken: Boolean(session?.accessToken),
  });

  return {
    user: { id: userId },
    organization: { id: orgId },
    role: { id: '1' },
  };
}

export async function getBackendAccessToken() {
  const session = await auth();

  nextDebugLog('session', 'getBackendAccessToken:result', {
    hasSession: Boolean(session),
    hasAccessToken: Boolean(session?.accessToken),
    userId: session?.user?.id,
    organizationId: session?.user?.orgId,
  });

  return session?.accessToken;
}
