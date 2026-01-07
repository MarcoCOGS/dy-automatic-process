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
  batchId: string;
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

export const requestVerifications = async(formData: FormData): Promise<{ success: boolean; message: string, batchId?: string }> =>{
  console.log('aca requestVerifications server')
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
  const extraInfo = (formData.get('extraInfo') as File | null) ?? null

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
  const batchId = uuidv4();

  const response = await tryCatch(
    api.postSendFilesToN8n({
      batchId,
      files: {
        invoiceFile: invoice,
        productPhotosFile: productPhotos,
        extraInfoFile: extraInfo,
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
      message: 'Error creating verifications.',
    };
  }

  return {
    success: true,
    batchId,
    message: 'Verifications created successfully.',
  };
}

export const checkBatchStatusAction = async(
  batchId: string
): Promise<{ success: boolean; message: string; batchId?: string }> => {
  console.log('aca checkBatchStatusAction server')
  const session = await getSession();

  if (!session) {
    return {
      success: false,
      message: 'You must be logged in.',
    };
  }

  const batch = await prisma.classificationBatch.findUnique({
    where: { id: batchId },
    select: { state: true, id: true },
  });

  if (!batch) {
    return { success: false, message: 'Batch not found.' };
  }

  if (batch.state !== 'DONE') {
    return {
      success: false,
      batchId: batch.id,
      message: `Batch still processing (${batch.state}).`,
    };
  }

  return {
    success: true,
    batchId: batch.id,
    message: 'Batch is DONE.',
  };
}
