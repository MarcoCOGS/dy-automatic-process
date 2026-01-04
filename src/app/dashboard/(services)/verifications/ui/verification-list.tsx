import { translation } from '@/app/i18n';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { ability } from '@/lib/abilities';

// import { findManyVerifications } from '../lib/api';
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

  // const verifications = await findManyVerifications({
  //   cursorTake: 50,
  //   authorId: abilities.can('view-all', 'verifications') ? undefined : userId.toString(),
  //   organizationId: organizationId.toString(),
  // });

  const verifications = [
    {
      id: 1,
      code: '123456789',
      names: 'Juan',
      paternalLastName: 'Perez',
      maternalLastName: 'Garcia',
      documentType: 'DNI',
      documentNumber: '123456789',
      streetAddress: 'Calle 123',
      district: 'Distrito 1',
      phoneNumber: '+34 678 987 654',
      email: 'juan.perez@gmail.com',
      state: 'PENDING',
      view: 'START',
    },
  ];

  return (
    <>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('verificationList.table.header.code')}</TableHead>
              <TableHead>{t('verificationList.table.header.fullName')}</TableHead>
              <TableHead>{t('verificationList.table.header.documentType')}</TableHead>
              <TableHead>{t('verificationList.table.header.documentNumber')}</TableHead>
              <TableHead>{t('verificationList.table.header.streetAddress')}</TableHead>
              <TableHead>{t('verificationList.table.header.district')}</TableHead>
              <TableHead>{t('verificationList.table.header.phoneNumber')}</TableHead>
              <TableHead>{t('verificationList.table.header.email')}</TableHead>
              <TableHead>{t('verificationList.table.header.state')}</TableHead>
              <TableHead>{t('verificationList.table.header.view')}</TableHead>
              <TableHead>&nbsp;</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {verifications.map((verification) => (
              <TableRow key={verification.id}>
                <TableCell>{verification.code}</TableCell>
                <TableCell>
                  {verification.names} {verification.paternalLastName} {verification.maternalLastName}
                </TableCell>
                <TableCell>{verification.documentType}</TableCell>
                <TableCell>{verification.documentNumber}</TableCell>
                <TableCell>{verification.streetAddress}</TableCell>
                <TableCell>{verification.district}</TableCell>
                <TableCell>{verification.phoneNumber}</TableCell>
                <TableCell>{verification.email}</TableCell>
                <TableCell>
                  <Badge variant='secondary'>{t(`verificationStates.${verification.state}`)}</Badge>
                </TableCell>
                <TableCell>{t(`verificationViews.${verification.view}`)}</TableCell>
                <TableCell>
                  <ViewVerification code={verification.code} />
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
