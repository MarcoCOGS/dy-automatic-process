'use server';

import { getSession } from '@/lib/session';

import {
  CreateManyVerificationsRequest,
  GenerateReportResponse,
  GenerateSignedGetUrlRequest,
  GenerateSignedGetUrlResponse,
  GenerateSignedPutUrlRequest,
  GenerateSignedPutUrlResponse,
  InvoiceInfo,
  Invoice as InvoiceType,
  LegalRepresentativeInfo,
  RequestInvoiceProcessingRequest,
  RequestInvoiceProcessingResponse,
  SupplierInfo,
  TransactionInfo,
} from './definitions';
import { ServerConfig } from './server-config';

class BackendApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'BackendApiError';
    this.status = status;
    this.data = data;
  }
}

export type InvoiceItemUi = {
  id: string;
  itemCode: string | null;
  description: string | null;
  quantity: number | null;
  unitType: string | null;
  brand: string | null;
  model: string | null;
  commercialName: string | null;
  material: string | null;
  mainUse: string | null;
  countryOfOrigin: string | null;
  countryOfAcquisition: string | null;
  condition: string | null;
  suggestedHsCode: string | null;
  code: string | null;
  unitPrice?: string | null;
  totalPrice?: string | null;
};

export type InvoiceItemUpdatable = Omit<InvoiceItemUi, 'id'>;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown> | FormData;
  headers?: HeadersInit;
  notFoundAsNull?: boolean;
};

const buildBackendUrl = (path: string) => {
  if (!ServerConfig.nestApiBaseUrl) {
    throw new Error('NEST_API_BASE_URL is not configured');
  }

  return new URL(path.replace(/^\//, ''), `${ServerConfig.nestApiBaseUrl.replace(/\/$/, '')}/`).toString();
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

const getErrorMessage = (data: unknown, fallback: string) => {
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const message = record.message;
    const error = record.error;

    if (typeof message === 'string') return message;
    if (typeof error === 'string') return error;
    if (Array.isArray(message)) return message.join(', ');
  }

  if (typeof data === 'string') return data;

  return fallback;
};

const backendFetch = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const headers = new Headers(options.headers);
  const init: RequestInit = {
    method: options.method ?? 'GET',
    headers,
    cache: 'no-store',
  };

  if (options.body instanceof FormData) {
    init.body = options.body;
  } else if (options.body) {
    headers.set('Content-Type', 'application/json');
    init.body = JSON.stringify(options.body);
  }

  const response = await fetch(buildBackendUrl(path), init);
  const data = await readResponse(response);

  if (response.status === 404 && options.notFoundAsNull) {
    return null as T;
  }

  if (!response.ok) {
    throw new BackendApiError(
      getErrorMessage(data, `Backend request failed with status ${response.status}`),
      response.status,
      data,
    );
  }

  return data as T;
};

export const findManyInvoices = async (): Promise<InvoiceType[]> => {
  return backendFetch<InvoiceType[]>('/invoices');
};

export const findInvoiceDetail = async ({
  code,
}: {
  code: string;
}): Promise<(InvoiceType & { items: InvoiceItemUi[] }) | null> => {
  return backendFetch<InvoiceType & { items: InvoiceItemUi[] }>(`/invoices/${code}`, {
    notFoundAsNull: true,
  });
};

export const findInvoiceStatus = async ({
  invoiceId,
}: {
  invoiceId: string;
}): Promise<{ id: string; state: string; invoiceCode: string } | null> => {
  return backendFetch<{ id: string; state: string; invoiceCode: string } | null>(`/invoices/${invoiceId}/status`);
};

export const findInvoiceItemDetail = async ({ itemId }: { itemId: string }): Promise<InvoiceItemUpdatable | null> => {
  return backendFetch<InvoiceItemUpdatable>(`/invoice-items/${itemId}`, {
    notFoundAsNull: true,
  });
};

export const updateInvoiceInfo = async ({ code, data }: { code: string; data: InvoiceInfo }): Promise<void> => {
  await backendFetch<void>(`/invoices/${code}/invoice-info`, {
    method: 'PATCH',
    body: data as Record<string, unknown>,
  });
};

export const updateSupplierInfo = async ({ code, data }: { code: string; data: SupplierInfo }): Promise<void> => {
  await backendFetch<void>(`/invoices/${code}/supplier-info`, {
    method: 'PATCH',
    body: data as Record<string, unknown>,
  });
};

export const updateTransactionInfo = async ({ code, data }: { code: string; data: TransactionInfo }): Promise<void> => {
  await backendFetch<void>(`/invoices/${code}/transaction-info`, {
    method: 'PATCH',
    body: data as Record<string, unknown>,
  });
};

export const updateLegalRepresentativeInfo = async ({
  code,
  data,
}: {
  code: string;
  data: LegalRepresentativeInfo;
}): Promise<void> => {
  await backendFetch<void>(`/invoices/${code}/legal-representative-info`, {
    method: 'PATCH',
    body: data as Record<string, unknown>,
  });
};

export const updateInvoiceItemInfo = async ({
  itemId,
  data,
}: {
  itemId: string;
  data: Partial<InvoiceItemUpdatable>;
}): Promise<void> => {
  await backendFetch<void>(`/invoice-items/${itemId}`, {
    method: 'PATCH',
    body: data as Record<string, unknown>,
  });
};

export const deleteInvoiceItemInfo = async ({ itemId }: { itemId: string }): Promise<void> => {
  await backendFetch<void>(`/invoice-items/${itemId}`, {
    method: 'DELETE',
  });
};

export const createManyVerifications = async (request: CreateManyVerificationsRequest): Promise<void> => {
  await backendFetch<void>('/verifications/create-many', {
    method: 'POST',
    body: {
      key: request.key,
      authorId: request.authorId,
      organizationId: request.organizationId,
    },
  });
};

export const requestInvoiceProcessing = async (
  request: RequestInvoiceProcessingRequest,
): Promise<RequestInvoiceProcessingResponse> => {
  const formData = new FormData();

  formData.append('invoiceNumber', request.invoiceNumber);
  formData.append('invoice', request.files.invoiceFile);

  request.files.productPhotosFile?.forEach((file) => {
    formData.append('productPhotos', file);
  });

  request.files.extraInfoFile?.forEach((file) => {
    formData.append('extraInfo', file);
  });

  return backendFetch<RequestInvoiceProcessingResponse>('/invoices/request-verifications', {
    method: 'POST',
    body: formData,
  });
};

export const getCheckBatchStatusById = async (request: {
  invoiceId: string;
}): Promise<GenerateSignedGetUrlResponse> => {
  return backendFetch<GenerateSignedGetUrlResponse>('/verifications/check-batch-status-by-id', {
    method: 'POST',
    body: {
      invoiceId: request.invoiceId,
    },
  });
};

export const generateSignedGetUrl = async (
  request: GenerateSignedGetUrlRequest,
): Promise<GenerateSignedGetUrlResponse> => {
  return backendFetch<GenerateSignedGetUrlResponse>('/verifications/generate-signed-get-url', {
    method: 'POST',
    body: {
      key: request.key,
      bucket: request.bucket,
    },
  });
};

export const generateSignedPutUrl = async (
  request: GenerateSignedPutUrlRequest,
): Promise<GenerateSignedPutUrlResponse> => {
  return backendFetch<GenerateSignedPutUrlResponse>('/verifications/generate-signed-put-url', {
    method: 'POST',
    body: {
      fileName: request.fileName,
      folder: request.folder,
    },
  });
};

export const generateDefaultReport = async (): Promise<GenerateReportResponse> => {
  const session = await getSession();

  return backendFetch<GenerateReportResponse>('/reports/generate/default', {
    method: 'POST',
    body: {
      authorId: session?.user.id,
      organizationId: session?.organization.id,
    },
  });
};
