'use server';

import { getSession } from '@/lib/session';
import { tryCatch } from '@/lib/try-catch';

import * as api from './lib/api';
import { backendApiErrorMessage, isUnauthorizedBackendApiError } from './lib/backend-error';

type ValidationError = {
  index: number;
  errors: string[];
  invoiceId: string;
};

function formatErrorMessages(errors: ValidationError[]): string {
  const groupedErrors: Record<number, string[]> = errors.reduce(
    (acc, { index, errors }) => {
      const rowNumber = index + 1;
      acc[rowNumber] = acc[rowNumber] || [];
      errors.forEach((error) => {
        acc[rowNumber].push(error);
      });

      return acc;
    },
    {} as Record<number, string[]>,
  );

  return Object.entries(groupedErrors)
    .map(([row, messages]) => `Fila ${row}:\n  - ${messages.join('\n  - ')}`)
    .join('\n\n');
}

function getValidationErrors(error: unknown): ValidationError[] | null {
  if (!error || typeof error !== 'object') return null;

  const data = (error as { data?: unknown }).data;
  if (!data || typeof data !== 'object') return null;

  const record = data as Record<string, unknown>;
  return Array.isArray(record.error) ? (record.error as ValidationError[]) : null;
}

function toBackendFailure(
  error: unknown,
  fallback: string,
): { success: false; message: string; unauthorized?: boolean } {
  if (isUnauthorizedBackendApiError(error)) {
    return {
      success: false,
      unauthorized: true,
      message: 'Sesion expirada. Vuelve a iniciar sesion.',
    };
  }

  return {
    success: false,
    message: backendApiErrorMessage(error) || fallback,
  };
}

export const requestVerifications = async (
  formData: FormData,
): Promise<{ success: boolean; message: string; invoiceId?: string; unauthorized?: boolean }> => {
  const session = await getSession();

  if (!session) {
    return {
      success: false,
      unauthorized: true,
      message: 'Sesion expirada. Vuelve a iniciar sesion.',
    };
  }

  const invoice = formData.get('invoice') as File | null;
  if (!invoice) return { success: false, message: 'Debes subir la factura.' };

  const invoiceNumber = formData.get('invoiceNumber') as string;
  if (!invoiceNumber) {
    return { success: false, message: 'Debes ingresar el numero de factura.' };
  }

  const productPhotos = formData.getAll('productPhotos') as File[];
  const extraInfo = formData.getAll('extraInfo') as File[];

  const response = await tryCatch(
    api.requestInvoiceProcessing({
      invoiceNumber,
      files: {
        invoiceFile: invoice,
        ...(productPhotos.length ? { productPhotosFile: productPhotos } : {}),
        ...(extraInfo.length ? { extraInfoFile: extraInfo } : {}),
      },
    }),
  );

  if (response.error) {
    if (isUnauthorizedBackendApiError(response.error)) {
      return toBackendFailure(response.error, 'Error al procesar la Factura.');
    }

    const validationErrors = getValidationErrors(response.error);

    if (validationErrors) {
      return {
        success: false,
        message: formatErrorMessages(validationErrors),
      };
    }

    return {
      success: false,
      message: response.error.message || 'Error al procesar la Factura.',
    };
  }

  return {
    success: true,
    invoiceId: response.data.invoiceId,
    message: response.data.message,
  };
};

export const checkInvoiceStatusAction = async (
  invoiceId: string,
): Promise<{ success: boolean; message: string; invoiceId?: string; unauthorized?: boolean }> => {
  const session = await getSession();

  if (!session) {
    return {
      success: false,
      unauthorized: true,
      message: 'Sesion expirada. Vuelve a iniciar sesion.',
    };
  }

  const response = await tryCatch(api.findInvoiceStatus({ invoiceId }));

  if (response.error) {
    if (isUnauthorizedBackendApiError(response.error)) {
      return toBackendFailure(response.error, 'Error al consultar el estado de la factura.');
    }

    return {
      success: false,
      message: response.error.message || 'Error al consultar el estado de la factura.',
    };
  }

  const invoice = response.data;

  if (!invoice) {
    return { success: false, message: 'Invoice not found.' };
  }

  if (invoice.state === 'ERROR') {
    return {
      success: false,
      invoiceId: invoice.id,
      message: `Error al procesar la factura: ${invoice.invoiceCode}.`,
    };
  }

  if (invoice.state !== 'DONE') {
    return {
      success: false,
      message: 'Factura aun en procesamiento.',
    };
  }

  return {
    success: true,
    message: 'Factura procesada correctamente',
  };
};

export const generateDefaultReportAction = async (): Promise<{
  success: boolean;
  message: string;
  unauthorized?: boolean;
}> => {
  const response = await tryCatch(api.generateDefaultReport());

  if (response.error) {
    return toBackendFailure(response.error, 'Error al generar el reporte.');
  }

  return {
    success: true,
    message: 'Reporte generado correctamente.',
  };
};

export const generateSignedGetUrlAction = async (request: {
  key: string;
  bucket: string;
}): Promise<{ success: boolean; message: string; url?: string; unauthorized?: boolean }> => {
  const response = await tryCatch(api.generateSignedGetUrl(request));

  if (response.error) {
    return toBackendFailure(response.error, 'Error al abrir el archivo.');
  }

  return {
    success: true,
    message: 'Archivo listo para abrir.',
    url: response.data.url,
  };
};
