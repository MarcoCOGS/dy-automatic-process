import { translation } from '@/app/i18n';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { ability } from '@/lib/abilities';

import { findManyInvoices } from '../lib/api';
import { ViewVerification } from './buttons';

export default async function VerificationList({
  // userId,
  // roleId,
  // organizationId,
}: {
  userId: number;
  roleId: number;
  organizationId: number;
}) {
  const { t } = await translation('es', 'verifications');

  // const abilities = await ability(roleId);

  const invoices = await findManyInvoices();

  return (
    <>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('verificationList.table.header.invoiceId')}</TableHead>
              <TableHead>{t('verificationList.table.header.invoiceCode')}</TableHead>
              <TableHead>{t('verificationList.table.header.createdAt')}</TableHead>
              <TableHead>{t('verificationList.table.header.detail')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.id}</TableCell>
                <TableCell>{invoice.invoiceCode}</TableCell>
                {/* <TableCell>{invoice.legalRepresentativeInfo?.fullName}</TableCell> */}
                <TableCell>{invoice.createdAt.toString()}</TableCell>
                <TableCell align='center'>
                  <ViewVerification code={invoice?.id?.toString()} />
                </TableCell>
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
