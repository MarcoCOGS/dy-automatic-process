'use server';

import axios from 'axios';

import { getSession } from '@/lib/session';
import { tryCatch } from '@/lib/try-catch';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';

import * as api from './lib/api';

type ValidationError = {
  index: number;
  errors: string[];
  invoiceId: string;
};

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

function formatErrorMessages(errors: ValidationError[]): string {
  const groupedErrors: Record<number, string[]> = errors.reduce(
    (acc, { index, errors }) => {
      const rowNumber = index + 1; // Ajustamos la numeración a la de Excel
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

export const requestVerifications = async(formData: FormData): Promise<{ success: boolean; message: string, invoiceId?: string }> =>{
  const session = await getSession();

  if (!session) {
    return {
      success: false,
      message: 'You must be logged in to invite a user.',
    };
  }

  const invoice = formData.get('invoice') as File | null;
  if (!invoice) return { success: false, message: 'Debes subir la factura.' };
  const productPhotos = formData.getAll('productPhotos') as File[];
  const extraInfo = formData.getAll('extraInfo') as File[];
  const invoiceNumber = formData.get('invoiceNumber') as string
  console.log({invoiceNumber})
  if (!invoiceNumber) return { success: false, message: 'Debes Ingresar el número de factura.' };

  const invoiceCode = await prisma.invoice.findUnique({
    where: { invoiceCode: invoiceNumber },
    select: { state: true, id: true },
  });

  if (invoiceCode) {
    return { success: false, message: 'Numero de Factura ya existe' };
  }

  // const signedPutUrl = await api.generateSignedPutUrl({
  //   fileName: file.name,
  // });

  // await axios({
  //   url: signedPutUrl.url,
  //   method: 'PUT',
  //   data: file,
  //   headers: {
  //     'Content-Type': signedPutUrl.contentType,
  //   },
  // });
  const invoiceId = uuidv4();

  const response = await tryCatch(
    api.postSendFilesToN8n({
      invoiceId,
      invoiceNumber,
      files: {
        invoiceFile: invoice,
        ...(productPhotos?{productPhotosFile: productPhotos}:{}),
        ...(extraInfo?{extraInfoFile: extraInfo}:{}),
      }
    }),
  );

  if (response.error && axios.isAxiosError(response.error)) {
    if (response.error.response?.data.statusCode === 400) {
      const errors = response.error.response?.data.error as ValidationError[];

      return {
        success: false,
        message: formatErrorMessages(errors),
      };
    }

    return {
      success: false,
      message: 'Error al procesar la Factura.',
    };
  }

  return {
    success: true,
    invoiceId,
    message: 'Factura siendo procesada ...',
  };
}

export const checkInvoiceStatusAction = async(
  invoiceId: string
): Promise<{ success: boolean; message: string; invoiceId?: string }> => {
  const session = await getSession();

  if (!session) {
    return {
      success: false,
      message: 'You must be logged in.',
    };
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { state: true, id: true, invoiceCode: true },
  });

  if (!invoice) {
    return { success: false, message: 'Invoice not found.' };
  }

  if (invoice.state !== 'DONE') {
    return {
      success: false,
      invoiceId: invoice.id,
      message: `Error al procesar la factura: ${invoice.invoiceCode}.`,
    };
  }

  return {
    success: true,
    message: 'Factura procesada correctamente',
  };
}
