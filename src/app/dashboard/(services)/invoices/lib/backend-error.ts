export class BackendApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'BackendApiError';
    this.status = status;
    this.data = data;
  }
}

export const isBackendApiError = (error: unknown): error is BackendApiError => {
  return error instanceof BackendApiError;
};

export const isUnauthorizedBackendApiError = (error: unknown): boolean => {
  return isBackendApiError(error) && error.status === 401;
};

export const backendApiErrorMessage = (error: unknown): string => {
  if (isBackendApiError(error)) return error.message;
  if (error instanceof Error) return error.message;

  return 'No se pudo completar la solicitud.';
};
