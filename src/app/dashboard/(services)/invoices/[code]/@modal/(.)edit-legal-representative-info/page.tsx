import { notFound } from 'next/navigation';

import { BackendRequestError, UnauthorizedSessionHandler } from '@/components/custom/backend-request-error';

import { findInvoiceDetail } from '../../../lib/api';
import { backendApiErrorMessage, isUnauthorizedBackendApiError } from '../../../lib/backend-error';
import { LegalRepresentativeInfo } from '../../../lib/definitions';
import { SubmitAndClose } from '../../../ui/components/edit-legal-representative-info/SubmitAndClose';

export default async function EditLegalRepresentativeInfoPage({ params }: { params: Promise<{ code: string }> }) {
  const params2 = await params;
  const code = params2.code;
  const invoiceDetail = await findInvoiceDetail({ code: code }).catch((error: unknown) => {
    if (isUnauthorizedBackendApiError(error)) {
      return { kind: 'unauthorized' as const };
    }

    return {
      kind: 'error' as const,
      message: backendApiErrorMessage(error),
    };
  });

  if (invoiceDetail && 'kind' in invoiceDetail && invoiceDetail.kind === 'unauthorized') {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
        <div className='w-full max-w-lg rounded-xl bg-white p-6 shadow-xl'>
          <UnauthorizedSessionHandler />
        </div>
      </div>
    );
  }

  if (invoiceDetail && 'kind' in invoiceDetail && invoiceDetail.kind === 'error') {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
        <div className='w-full max-w-lg rounded-xl bg-white p-6 shadow-xl'>
          <BackendRequestError description={invoiceDetail.message} />
        </div>
      </div>
    );
  }

  if (!invoiceDetail) notFound();

  const info: LegalRepresentativeInfo = invoiceDetail.legalRepresentativeInfo as LegalRepresentativeInfo;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='w-full max-w-lg space-y-4 rounded-xl bg-white p-6 shadow-xl'>
        <h2 className='text-lg font-semibold'>Editar Información de Representante Legal</h2>

        <form className='space-y-4'>
          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Nombre</label>
            <input
              name='fullName'
              defaultValue={info?.fullName ?? ''}
              className='w-full rounded-md border px-3 py-2 text-sm'
            />
          </div>

          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Cargo</label>
            <input
              name='position'
              defaultValue={info?.position ?? ''}
              className='w-full rounded-md border px-3 py-2 text-sm'
            />
          </div>

          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Dni</label>
            <input
              name='nationalId'
              defaultValue={info?.nationalId ?? ''}
              className='w-full rounded-md border px-3 py-2 text-sm'
            />
          </div>

          <div className='flex justify-end gap-3 pt-4'>
            {/* <Button variant="secondary" asChild>
              <a href={`/dashboard/invoices/${code}`}>
                Cancelar
              </a>
            </Button>

            <Button type="submit">
              Guardar
            </Button> */}
            <SubmitAndClose code={code} />
          </div>
        </form>
      </div>
    </div>
  );
}
