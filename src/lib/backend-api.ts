'use server';

export type BackendUser = {
  id: string;
  email: string;
  username: string;
  phone: string | null;
  organizationId: string;
};

const buildBackendUrl = (path: string) => {
  const baseUrl = process.env.NEST_API_BASE_URL;

  if (!baseUrl) {
    throw new Error('NEST_API_BASE_URL is not configured');
  }

  return new URL(path.replace(/^\//, ''), `${baseUrl.replace(/\/$/, '')}/`).toString();
};

const readResponse = async (response: Response) => {
  const text = await response.text();

  if (!text) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

export const backendFetch = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(buildBackendUrl(path), {
    ...options,
    cache: 'no-store',
  });
  const data = await readResponse(response);

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && typeof (data as { message?: unknown }).message === 'string'
        ? (data as { message: string }).message
        : `Backend request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data as T;
};

export const findUserByEmail = async (email: string): Promise<BackendUser | null> => {
  return backendFetch<BackendUser | null>(`/users/by-email?email=${encodeURIComponent(email)}`);
};
