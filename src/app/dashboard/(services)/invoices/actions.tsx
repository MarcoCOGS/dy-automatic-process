'use server';

import { getSession } from '@/lib/session';
import { tryCatch } from '@/lib/try-catch';

import * as api from './lib/api';

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

export const requestVerifications = async (
  formData: FormData,
): Promise<{ success: boolean; message: string; invoiceId?: string }> => {
  const session = await getSession();

  if (!session) {
    return {
      success: false,
      message: 'You must be logged in to invite a user.',
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
): Promise<{ success: boolean; message: string; invoiceId?: string }> => {
  const session = await getSession();

  if (!session) {
    return {
      success: false,
      message: 'You must be logged in.',
    };
  }

  const invoice = await api.findInvoiceStatus({ invoiceId });

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
