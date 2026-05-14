import { notFound } from 'next/navigation';

import { BackendRequestError, UnauthorizedSessionHandler } from '@/components/custom/backend-request-error';

import { InvoiceItemUpdatable, findInvoiceItemDetail } from '../../../../lib/api';
import { backendApiErrorMessage, isUnauthorizedBackendApiError } from '../../../../lib/backend-error';
import { SubmitAndClose } from '../../../../ui/components/edit-invoice-item/SubmitAndClose';

export default async function EditInvoiceInfoPage({ params }: { params: Promise<{ itemId: string; code: string }> }) {
  const params2 = await params;
  const code = params2.code;
  const itemId = params2.itemId;
  const invoiceItemDetail = await findInvoiceItemDetail({ itemId: itemId }).catch((error: unknown) => {
    if (isUnauthorizedBackendApiError(error)) {
      return { kind: 'unauthorized' as const };
    }

    return {
      kind: 'error' as const,
      message: backendApiErrorMessage(error),
    };
  });

  if (invoiceItemDetail && 'kind' in invoiceItemDetail && invoiceItemDetail.kind === 'unauthorized') {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
        <div className='w-full max-w-lg rounded-xl bg-white p-6 shadow-xl'>
          <UnauthorizedSessionHandler />
        </div>
      </div>
    );
  }

  if (invoiceItemDetail && 'kind' in invoiceItemDetail && invoiceItemDetail.kind === 'error') {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
        <div className='w-full max-w-lg rounded-xl bg-white p-6 shadow-xl'>
          <BackendRequestError description={invoiceItemDetail.message} />
        </div>
      </div>
    );
  }

  if (!invoiceItemDetail) notFound();

  const item: InvoiceItemUpdatable = invoiceItemDetail as InvoiceItemUpdatable;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='h-[90vh] max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-xl bg-white p-6 shadow-xl'>
        <h2 className='text-lg font-semibold'>Editar Información de Factura</h2>

        <form className='space-y-4'>
          {/* <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              N° Factura
            </label>
            <input
              name="itemCode"
              defaultValue={item?.itemCode ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div> */}

          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Marca</label>
            <input
              name='brand'
              defaultValue={item?.brand ?? ''}
              className='w-full rounded-md border px-3 py-2 text-sm'
            />
          </div>

          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Nuevo/Usado</label>
            <input
              name='condition'
              defaultValue={item?.condition ?? ''}
              className='w-full rounded-md border px-3 py-2 text-sm'
            />
          </div>

          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Modelo</label>
            <input
              name='model'
              defaultValue={item?.model ?? ''}
              className='w-full rounded-md border px-3 py-2 text-sm'
            />
          </div>

          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Código</label>
            <input name='code' defaultValue={item?.code ?? ''} className='w-full rounded-md border px-3 py-2 text-sm' />
          </div>

          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Nombre Comercial</label>
            <input
              name='commercialName'
              defaultValue={item?.commercialName ?? ''}
              className='w-full rounded-md border px-3 py-2 text-sm'
            />
          </div>

          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Descripción Mínima</label>
            <input
              name='description'
              defaultValue={item?.description ?? ''}
              className='w-full rounded-md border px-3 py-2 text-sm'
            />
          </div>

          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Material</label>
            <input
              name='material'
              defaultValue={item?.material ?? ''}
              className='w-full rounded-md border px-3 py-2 text-sm'
            />
          </div>

          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Uso / Función</label>
            <input
              name='mainUse'
              defaultValue={item?.mainUse ?? ''}
              className='w-full rounded-md border px-3 py-2 text-sm'
            />
          </div>

          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Cantidad</label>
            <input
              name='quantity'
              defaultValue={item?.quantity ?? ''}
              className='w-full rounded-md border px-3 py-2 text-sm'
            />
          </div>

          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Unidad</label>
            <input
              name='unitType'
              defaultValue={item?.unitType ?? ''}
              className='w-full rounded-md border px-3 py-2 text-sm'
            />
          </div>
          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>País Origen</label>
            <input
              name='countryOfOrigin'
              defaultValue={item?.countryOfOrigin ?? ''}
              className='w-full rounded-md border px-3 py-2 text-sm'
            />
          </div>
          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>País Adquisición</label>
            <input
              name='countryOfAcquisition'
              defaultValue={item?.countryOfAcquisition ?? ''}
              className='w-full rounded-md border px-3 py-2 text-sm'
            />
          </div>
          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Unit Price</label>
            <input
              name='unitPrice'
              defaultValue={item?.unitPrice ? item?.unitPrice.toString() : ''}
              className='w-full rounded-md border px-3 py-2 text-sm'
            />
          </div>
          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Total Price</label>
            <input
              name='totalPrice'
              defaultValue={item?.totalPrice ? item?.totalPrice.toString() : ''}
              className='w-full rounded-md border px-3 py-2 text-sm'
            />
          </div>
          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Partida sugerida</label>
            <input
              name='suggestedHsCode'
              defaultValue={item?.suggestedHsCode ?? ''}
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
            <SubmitAndClose code={code} itemId={itemId} />
          </div>
        </form>
      </div>
    </div>
  );
}
