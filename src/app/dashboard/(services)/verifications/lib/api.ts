'use server';

import axios from 'axios';
import _ from 'lodash';

import {
  CreateManyVerificationsRequest,
  GenerateReportResponse,
  GenerateSignedGetUrlRequest,
  GenerateSignedGetUrlResponse,
  GenerateSignedPutUrlRequest,
  GenerateSignedPutUrlResponse,
  PostSendFilesToN8nRequest,
  Verification,
} from './definitions';
import { ServerConfig } from './server-config';
import { getSession } from '@/lib/session';
import { PrismaClient } from '@prisma/client';

const apiVerifications = axios.create({
  baseURL: ServerConfig.apiVerificationsBaseUrl,
  auth: {
    username: ServerConfig.apiVerificationsUsername,
    password: ServerConfig.apiVerificationsPassword,
  },
});

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const findManyVerifications = async (): Promise<Verification[]> => {
  try {
    const data = await prisma.classificationItem.findMany();

    return data;
  } catch (error) {
    const message = _.get(error, 'response.data.message', (error as Error).message);

    throw new Error(message);
  }
};

export const createManyVerifications = async (request: CreateManyVerificationsRequest): Promise<void> => {
  const response = await apiVerifications.post('/v1/secure/verifications/create-many', {
    key: request.key,
    authorId: request.authorId,
    organizationId: request.organizationId,
  });

  return response.data;
};

export const postSendFilesToN8n = async (request: PostSendFilesToN8nRequest): Promise<void> => {
  const fd = new FormData();

  // Deben coincidir con los keys del webhook (Postman)
  fd.append('1_invoice', request.files.invoiceFile);

  if (request.files?.productPhotosFile) {
    fd.append('1_productPhotos', request.files.productPhotosFile[0]); // solo 1
  }

  if (request.files.extraInfoFile) {
    fd.append('1_extraInfo', request.files.extraInfoFile);
  }

  if (request.files.productPhotosFile1) {
    fd.append('1_productPhotos1', request.files.productPhotosFile1); // solo 1
  }
  try {
    const response = await apiVerifications.post(ServerConfig.webhookPath,
  fd,
  {
    headers: {
      'Content-Type': 'multipart/form-data',
      'batch-id': request.batchId
    },
  }
    );
    return response.data;
  } catch (error) {
      console.log(error)
  }
};

export const getCheckBatchStatusById = async (request: { batchId: string }): Promise<GenerateSignedGetUrlResponse> => {
  try {
    const response = await apiVerifications.post('/v1/secure/verifications/check-batch-status-by-id', {
      batchId: request.batchId,
    });

    return response.data;
  } catch (error) {
    const message = _.get(error, 'response.data.message', (error as Error).message);

    throw new Error(message);
  }
};

export const generateSignedGetUrl = async (
  request: GenerateSignedGetUrlRequest,
): Promise<GenerateSignedGetUrlResponse> => {
  try {
    const response = await apiVerifications.post('/v1/secure/verifications/generate-signed-get-url', {
      key: request.key,
      bucket: request.bucket,
    });

    return response.data;
  } catch (error) {
    const message = _.get(error, 'response.data.message', (error as Error).message);

    throw new Error(message);
  }
};

export const generateSignedPutUrl = async (
  request: GenerateSignedPutUrlRequest,
): Promise<GenerateSignedPutUrlResponse> => {
  try {
    const response = await apiVerifications.post('/v1/secure/verifications/generate-signed-put-url', {
      fileName: request.fileName,
      folder: request.folder,
    });

    return response.data;
  } catch (error) {
    const message = _.get(error, 'response.data.message', (error as Error).message);

    throw new Error(message);
  }
};

export const generateDefaultReport = async (): Promise<GenerateReportResponse> => {

  try {
    const session = await getSession();
    const response = await apiVerifications.post(
      '/v1/reports/generate/default',
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'x-report-notification': 'PUSH',
          'x-push-channel': 'reports-channel',
          'x-user-role': 'ROBOT',
          'x-push-event': 'report-generated',
          'x-author-id': session?.user.id,
          'x-organization-id': session?.organization.id,
        },
        auth: {
          username: 'robot',
          password: 'XgK80IkcxtUbzUwHCkUyRVjsTybu',
        },
      }
    );

    return response.data;
  } catch (error) {
    const message = _.get(error, 'response.data.message', (error as Error).message);
    throw new Error(message);
  }
};
