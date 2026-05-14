// import { ability } from '@/lib/abilities';
import { DateTime } from 'luxon';

import { translation } from '@/app/i18n';
import { BackendRequestError, UnauthorizedSessionHandler } from '@/components/custom/backend-request-error';
import { ListPagination } from '@/components/custom/list-pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { findManyInvoices } from '../lib/api';
import { backendApiErrorMessage, isUnauthorizedBackendApiError } from '../lib/backend-error';
import { ViewVerification } from './buttons';

const dateFormat = (raw: string): string => {
  const jsDate = new Date(raw);

  if (isNaN(jsDate.getTime())) return 'Fecha inválida';

  return DateTime.fromJSDate(jsDate).setZone('America/Lima').toFormat('dd/LL/yyyy HH:mm');
};

export default async function VerificationList({
  // userId,
  // roleId,
  // organizationId,
  page,
  limit,
}: {
  userId: string;
  roleId: string;
  organizationId: string;
  page: number;
  limit: number;
}) {
  const { t } = await translation('es', 'verifications');

  // const abilities = await ability(roleId);

  const invoicesPage = await findManyInvoices({ page, limit }).catch((error: unknown) => {
    if (isUnauthorizedBackendApiError(error)) {
      return { kind: 'unauthorized' as const };
    }

    return {
      kind: 'error' as const,
      message: backendApiErrorMessage(error),
    };
  });

  if ('kind' in invoicesPage && invoicesPage.kind === 'unauthorized') {
    return <UnauthorizedSessionHandler />;
  }

  if ('kind' in invoicesPage && invoicesPage.kind === 'error') {
    return <BackendRequestError description={invoicesPage.message} />;
  }

  const invoices = invoicesPage.data;

  return (
    <>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              {/* <TableHead>{t('verificationList.table.header.invoiceId')}</TableHead> */}
              <TableHead>{t('verificationList.table.header.invoiceCode')}</TableHead>
              <TableHead>{t('verificationList.table.header.createdAt')}</TableHead>
              <TableHead align='center'>{t('verificationList.table.header.detail')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className='h-24 text-center text-muted-foreground'>
                  No hay facturas comerciales para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  {/* <TableCell>{invoice.id}</TableCell> */}
                  <TableCell>{invoice.invoiceCode}</TableCell>
                  {/* <TableCell>{invoice.legalRepresentativeInfo?.fullName}</TableCell> */}
                  <TableCell>{dateFormat(invoice.createdAt)}</TableCell>
                  <TableCell className='pl-8'>
                    <ViewVerification code={invoice?.id?.toString()} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <ListPagination basePath='/dashboard/invoices' meta={invoicesPage.meta} itemCount={invoices.length} />
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
