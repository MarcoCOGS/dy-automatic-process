// import { ability } from '@/lib/abilities';
import { DateTime } from 'luxon';

import { translation } from '@/app/i18n';
import { BackendRequestError, UnauthorizedSessionHandler } from '@/components/custom/backend-request-error';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { findManyInvoices } from '../lib/api';
import { backendApiErrorMessage, isUnauthorizedBackendApiError } from '../lib/backend-error';

const dateFormat = (raw: string): string => {
  const jsDate = new Date(raw);

  if (isNaN(jsDate.getTime())) return 'Fecha inválida';

  return DateTime.fromJSDate(jsDate).setZone('America/Lima').toFormat('dd/LL/yyyy HH:mm');
};

export enum InvoiceState {
  PENDING = 'PENDIENTE',
  DONE = 'PROCESADO',
  ERROR = 'ERROR',
}

export default async function TranscriptionList(
  {
    // userId,
    // roleId,
    // organizationId,
  }: {
    userId: string;
    roleId: string;
    organizationId: string;
  },
) {
  const { t } = await translation('es', 'transcriptions');

  // const abilities = await ability(roleId);

  const invoices = await findManyInvoices().catch((error: unknown) => {
    if (isUnauthorizedBackendApiError(error)) {
      return { kind: 'unauthorized' as const };
    }

    return {
      kind: 'error' as const,
      message: backendApiErrorMessage(error),
    };
  });

  if (!Array.isArray(invoices) && invoices.kind === 'unauthorized') {
    return <UnauthorizedSessionHandler />;
  }

  if (!Array.isArray(invoices) && invoices.kind === 'error') {
    return <BackendRequestError description={invoices.message} />;
  }

  return (
    <>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              {/* <TableHead>{t('verificationList.table.header.invoiceId')}</TableHead> */}
              <TableHead>{t('transcriptionList.table.header.invoiceCode')}</TableHead>
              <TableHead>{t('transcriptionList.table.header.createdAt')}</TableHead>
              <TableHead>{t('transcriptionList.table.header.state')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                {/* <TableCell>{invoice.id}</TableCell> */}
                <TableCell>{invoice.invoiceCode}</TableCell>
                {/* <TableCell>{invoice.legalRepresentativeInfo?.fullName}</TableCell> */}
                <TableCell>{dateFormat(invoice.createdAt)}</TableCell>
                <TableCell>{InvoiceState[invoice.state as keyof typeof InvoiceState]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* <div className='flex items-center justify-end space-x-2 py-4'>
        <div className='space-x-2'>
          <Button variant='outline'>Previous</Button>
          <Button variant='outline'>Next</Button>
        </div>
      </div> */}
    </>
  );
}
