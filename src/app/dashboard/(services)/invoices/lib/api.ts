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
  InvoiceInfo,
  Invoice as InvoiceType,
  LegalRepresentativeInfo,
  PostSendFilesToN8nRequest,
  SupplierInfo,
  TransactionInfo,
} from './definitions';
import { ServerConfig } from './server-config';
import { getSession } from '@/lib/session';
import { Invoice, PrismaClient, InvoiceItem } from '@prisma/client';

export type InvoiceItemUi = Omit<
    InvoiceItem,
    | 'createdAt'
    | 'updatedAt'
    | 'invoiceId'
    | 'taxRate'
    | 'taxAmount'
    | 'discountAmount'
    | 'referenceCountry'
    | 'unitPrice'
    | 'totalPrice'
  > & {
    unitPrice?: string
    totalPrice?: string
}

export type InvoiceItemUpdatable = Omit<
    InvoiceItem,
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'invoiceId'
    | 'taxRate'
    | 'taxAmount'
    | 'discountAmount'
    | 'referenceCountry'
    | 'unitPrice'
    | 'totalPrice'
  > & {
    unitPrice?: string
    totalPrice?: string
  }

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

export const findManyInvoices = async (): Promise<InvoiceType[]> => {
  try {
    const data = await prisma.invoice.findMany();

    return data as unknown as InvoiceType[];
  } catch (error) {
    const message = _.get(error, 'response.data.message', (error as Error).message);

    throw new Error(message);
  }
};

export const findInvoiceDetail = async ({ code }: {code: string}): Promise< Invoice & {items: InvoiceItemUi[]} | null> => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: code },
      include: {
        items: true,
      },
    });

    if (!invoice) return null

    const items: InvoiceItemUi[] = invoice.items.map((it) => ({
      ...it,
      quantity: it.quantity === null ? null : Number(it.quantity),
      unitPrice: it.unitPrice?.toString(),
      totalPrice: it.totalPrice?.toString(),
    }))

    return {
      ...invoice,
      items,
    }
  } catch (error) {
    const message = _.get(error, 'response.data.message', (error as Error).message);

    throw new Error(message);
  }
};

export const findInvoiceItemDetail = async ({ itemId }: {itemId: string}): Promise< InvoiceItemUpdatable | null> => {
  try {
    const data = await prisma.invoiceItem.findUnique({
    where: { id: itemId },
  });
    if (!data) {
    throw new Error('ERROR')
  }
    return {
      itemCode: data.itemCode,
      brand: data.brand,
      condition: data.condition,
      model: data.model,
      code: data.code,
      commercialName: data.commercialName,
      description: data.description,
      material: data.material,
      mainUse: data.mainUse,
      quantity: Number(data.quantity),
      unitType: data.unitType,
      countryOfOrigin: data.countryOfOrigin,
      countryOfAcquisition: data.countryOfAcquisition,
      unitPrice: data.unitPrice?.toString(),
      totalPrice: data.totalPrice?.toString(),
      suggestedHsCode: data.suggestedHsCode,
    }
  } catch (error) {
    const message = _.get(error, 'response.data.message', (error as Error).message);

    throw new Error(message);
  }
};

export const updateInvoiceInfo = async ({ code, data }: {code: string, data: InvoiceInfo}): Promise<void> => {
  try {
    await prisma.invoice.update({
      where: { id: code },
      data: {
        invoiceInfo: {
          invoiceNumber: data.invoiceNumber,
          incoterms: data.incoterms,
          acquisitionCountry: data.acquisitionCountry,
          currency: data.currency,
          deliveryPlace: data.deliveryPlace,
        },
      },
    })
  } catch (error) {
    const message = _.get(error, 'response.data.message', (error as Error).message);

    throw new Error(message);
  }
};

export const updateSupplierInfo = async ({ code, data }: {code: string, data: SupplierInfo}): Promise<void> => {
  try {
    await prisma.invoice.update({
      where: { id: code },
      data: {
        supplierInfo: {
          affiliation: data.affiliation,
          legalName: data.legalName,
          address: data.address,
          cityCountry: data.cityCountry,
          contactName: data.contactName,
          phoneNumber: data.phoneNumber,
          condition: data.condition
        },
      },
    })
  } catch (error) {
    const message = _.get(error, 'response.data.message', (error as Error).message);

    throw new Error(message);
  }
};

export const updateTransactionInfo = async ({ code, data }: {code: string, data: TransactionInfo}): Promise<void> => {
  try {
    await prisma.invoice.update({
      where: { id: code },
      data: {
        transactionInfo: {
          paymentMethod: data.paymentMethod,
          bank: data.bank,
          paymentChannel: data.paymentChannel,
          receiptNumber: data.receiptNumber,
        },
      },
    })
  } catch (error) {
    const message = _.get(error, 'response.data.message', (error as Error).message);

    throw new Error(message);
  }
};

export const updateLegalRepresentativeInfo = async ({ code, data }: {code: string, data: LegalRepresentativeInfo}): Promise<void> => {
  try {
    await prisma.invoice.update({
      where: { id: code },
      data: {
        legalRepresentativeInfo: {
          fullName: data.fullName,
          position: data.position,
          nationalId: data.nationalId,
        },
      },
    })
  } catch (error) {
    const message = _.get(error, 'response.data.message', (error as Error).message);

    throw new Error(message);
  }
};

export const updateInvoiceItemInfo = async ({ itemId, data }: {
  itemId: string,
  data: Partial<InvoiceItemUpdatable>
}): Promise<void> => {
  try {
    await prisma.invoiceItem.update({
    where: { id: itemId },
    data: {
      ...(data.itemCode !== undefined ? { itemCode: data.itemCode } : {}),
      ...(data.brand !== undefined ? { brand: data.brand } : {}),
      ...(data.model !== undefined ? { model: data.model } : {}),
      ...(data.commercialName !== undefined ? { commercialName: data.commercialName } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.code !== undefined ? { code: data.code } : {}),
      ...(data.material !== undefined ? { material: data.material } : {}),
      ...(data.mainUse !== undefined ? { mainUse: data.mainUse } : {}),
      ...(data.unitType !== undefined ? { unitType: data.unitType } : {}),
      ...(data.countryOfOrigin !== undefined ? { countryOfOrigin: data.countryOfOrigin } : {}),
      ...(data.countryOfAcquisition !== undefined ? { countryOfAcquisition: data.countryOfAcquisition } : {}),
      ...(data.condition !== undefined ? { condition: data.condition } : {}),
      ...(data.unitPrice !== undefined ? { unitPrice: data.unitPrice } : {}),
      ...(data.totalPrice !== undefined ? { totalPrice: data.totalPrice } : {}),
      ...(data.suggestedHsCode !== undefined ? { suggestedHsCode: data.suggestedHsCode } : {}),

    },
  })
  } catch (error) {
    const message = _.get(error, 'response.data.message', (error as Error).message);

    throw new Error(message);
  }
};

export const deleteInvoiceItemInfo = async ({ itemId }: {
  itemId: string,
}): Promise<void> => {
  try {
    await prisma.invoiceItem.delete({
    where: { id: itemId }
  })
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

  fd.append('1_invoice', request.files.invoiceFile);

  if (request.files?.productPhotosFile) {
    request.files?.productPhotosFile.forEach((file, index)=>fd.append(`${index}_productPhotos`, file))
    // fd.append('1_productPhotos', request.files.productPhotosFile[0]);
  }

  if (request.files.extraInfoFile) {
    // fd.append('1_extraInfo', request.files.extraInfoFile[0]);
    request.files.extraInfoFile.forEach((file, index)=>fd.append(`${index}_extraInfo`, file))
  }
    const response = await apiVerifications.post(ServerConfig.webhookPath,
  fd,
  {
    headers: {
      'Content-Type': 'multipart/form-data',
      'invoice-id': request.invoiceId,
      'invoice-number': request.invoiceNumber
    },
  }
    );
    return response.data;
};

export const getCheckBatchStatusById = async (request: { invoiceId: string }): Promise<GenerateSignedGetUrlResponse> => {
  try {
    const response = await apiVerifications.post('/v1/secure/verifications/check-batch-status-by-id', {
      invoiceId: request.invoiceId,
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
