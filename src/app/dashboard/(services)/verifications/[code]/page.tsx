import { DateTime } from 'luxon';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { translation } from '@/app/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ability } from '@/lib/abilities';
import { getSession } from '@/lib/session';

import { findManyVerifications } from '../lib/api';
import OpenFile from '../ui/open-file';

function format(date: string | undefined, timeZone: string) {
  if (date) {
    return DateTime.fromISO(date).setZone(timeZone).toLocaleString(DateTime.DATETIME_MED);
  }

  return '';
}

export default async function Page(props: { params: Promise<{ code: string }> }) {
  const { t } = await translation('es', 'verifications');
  const { code } = await props.params;

  const session = await getSession();

  if (!session) {
    return <div>Empty</div>;
  }

  const abilities = await ability(session.role.id);

  const verifications = await findManyVerifications({
    cursorTake: 10,
    code,
    authorId: abilities.can('view-all', 'verifications') ? undefined : session.user.id.toString(),
    organizationId: session.organization.id.toString(),
  });

  if (!verifications.length) {
    notFound();
  }

  function Field(props: { name: string; value: string | number }) {
    return (
      <div className='grid gap-2'>
        <div className='flex items-center'>
          <Label htmlFor={props.name}>{t(`verificationDetail.fields.${props.name}`)}</Label>
        </div>
        <Input
          id={props.name}
          name={props.name}
          type='text'
          placeholder={t(`verificationDetail.fields.${props.name}`)}
          autoComplete='off'
          autoFocus={false}
          disabled={true}
          defaultValue={props.value}
        />
      </div>
    );
  }

  const [verification] = verifications;

  return (
    <div className='h-full flex-1 flex-col space-y-8 p-8 md:flex'>
      <div className='flex items-center justify-between space-y-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>{t('verificationDetail.title')}</h2>
          <p className='text-muted-foreground'>{t('verificationDetail.description')}</p>
        </div>
      </div>
      <div className='space-y-4'>
        <div className='space-y-8'>
          <div className='grid grid-cols-1 gap-4 py-4 md:grid-cols-2 lg:grid-cols-3'>
            <Field name='code' value={verification.code} />
            <Field
              name='fullName'
              value={`${verification.names} ${verification.paternalLastName} ${verification.maternalLastName}`}
            />
            <Field name='documentType' value={verification.documentType} />
            <Field name='documentNumber' value={verification.documentNumber} />
            <Field name='streetAddress' value={verification.streetAddress} />
            <Field name='urbanization' value={verification.urbanization} />
            <Field name='references' value={verification.references} />
            <Field name='district' value={verification.district} />
            <Field name='province' value={verification.province} />
            <Field name='region' value={verification.region} />
            <Field name='ubigeo' value={verification.ubigeo} />
            <Field name='phoneNumber' value={verification.phoneNumber} />
            <Field name='email' value={verification.email} />
            <Field name='state' value={t(`verificationStates.${verification.state}`)} />
            <Field name='view' value={t(`verificationViews.${verification.view}`)} />
            <Field name='createdAt' value={format(verification.createdAt, verification.timeZone)} />
            <Field name='expirationDate' value={format(verification.expirationDate, verification.timeZone)} />
            <Field name='openedAt' value={format(verification.openedAt, verification.timeZone)} />
            <Field
              name='expirationFromOpenDate'
              value={format(verification.expirationFromOpenDate, verification.timeZone)}
            />
            <Field
              name='propertyStatus'
              value={verification.propertyStatus ? t(`verificationPropertyStatus.${verification.propertyStatus}`) : ''}
            />
            <Field
              name='livesAtAddress'
              value={verification.livesAtAddress ? t(`verificationLivesAtAddress.${verification.livesAtAddress}`) : ''}
            />
            <Field
              name='residenceType'
              value={verification.residenceType ? t(`verificationResidenceType.${verification.residenceType}`) : ''}
            />
            <Field
              name='residenceDuration'
              value={
                verification.residenceDuration
                  ? t(`verificationResidenceDuration.${verification.residenceDuration}`)
                  : ''
              }
            />
            <Field name='coordinateDistance' value={verification.coordinateDistance ?? ''} />
          </div>
          <h3 className='text-xl font-bold tracking-tight'>{t('verificationDetail.sections.files.title')}</h3>
          <div className='grid grid-cols-1 gap-4 py-4 md:grid-cols-2 lg:grid-cols-3'>
            {verification.files.map(async (file) => (
              <OpenFile
                key={file.key}
                label={t(`verificationFiles.${file.alias}`)}
                fileKey={file.key}
                bucket={file.bucket}
              />
            ))}
          </div>
          <div className='space-x-2'>
            <Button variant='secondary' asChild>
              <Link href='/dashboard/verifications'>{t('buttons.back')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
