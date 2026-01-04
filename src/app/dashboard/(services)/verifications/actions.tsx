'use server';

import axios from 'axios';

import { getSession } from '@/lib/session';
import { tryCatch } from '@/lib/try-catch';

import * as api from './lib/api';

type ValidationError = {
  index: number;
  errors: string[];
};

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

export async function requestVerifications(formData: FormData): Promise<{ success: boolean; message: string }> {
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

  const response = await tryCatch(
    api.postSendFilesToN8n({
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
    message: 'Verifications created successfully.',
  };
}
