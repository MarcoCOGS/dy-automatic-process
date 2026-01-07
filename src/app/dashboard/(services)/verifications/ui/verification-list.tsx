import { translation } from '@/app/i18n';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { ability } from '@/lib/abilities';

import { findManyVerifications } from '../lib/api';
// import { ViewVerification } from './buttons';

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

  const verifications = await findManyVerifications();

  return (
    <>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('verificationList.table.header.itemNumber')}</TableHead>
              <TableHead>{t('verificationList.table.header.brand')}</TableHead>
              <TableHead>{t('verificationList.table.header.model')}</TableHead>
              <TableHead>{t('verificationList.table.header.commercialName')}</TableHead>
              <TableHead>{t('verificationList.table.header.description')}</TableHead>
              <TableHead>{t('verificationList.table.header.material')}</TableHead>
              <TableHead>{t('verificationList.table.header.mainUse')}</TableHead>
              <TableHead>{t('verificationList.table.header.commercialQuantity')}</TableHead>
              <TableHead>{t('verificationList.table.header.unitType')}</TableHead>
              <TableHead>{t('verificationList.table.header.countryOfOrigin')}</TableHead>
              <TableHead>{t('verificationList.table.header.countryOfAcquisition')}</TableHead>
              <TableHead>{t('verificationList.table.header.condition')}</TableHead>
              <TableHead>{t('verificationList.table.header.unitPrice')}</TableHead>
              <TableHead>{t('verificationList.table.header.totalPrice')}</TableHead>
              <TableHead>{t('verificationList.table.header.referenceCountry')}</TableHead>
              <TableHead>{t('verificationList.table.header.suggestedHsCode')}</TableHead>
              <TableHead>&nbsp;</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {verifications.map((verification) => (
              <TableRow key={verification.itemNumber}>
                <TableCell>{verification.itemNumber}</TableCell>
                <TableCell>{verification.brand}</TableCell>
                <TableCell>{verification.model}</TableCell>
                <TableCell>{verification.commercialName}</TableCell>
                <TableCell>{verification.description}</TableCell>
                <TableCell>{verification.material}</TableCell>
                <TableCell>{verification.mainUse}</TableCell>
                <TableCell>{verification.commercialQuantity}</TableCell>
                <TableCell>{verification.unitType}</TableCell>
                <TableCell>{verification.countryOfOrigin}</TableCell>
                <TableCell>{verification.countryOfAcquisition}</TableCell>
                <TableCell>{verification.condition}</TableCell>
                <TableCell>{verification.unitPrice}</TableCell>
                <TableCell>{verification.totalPrice}</TableCell>
                <TableCell>{verification.referenceCountry}</TableCell>
                <TableCell>{verification.suggestedHsCode}</TableCell>
                {/* <TableCell>
                  <ViewVerification code={verification.code} />
                </TableCell> */}
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
