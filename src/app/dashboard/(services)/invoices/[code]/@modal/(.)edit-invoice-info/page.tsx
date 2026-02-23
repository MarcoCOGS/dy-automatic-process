

import { notFound } from 'next/navigation'
import { findInvoiceDetail } from '../../../lib/api'
import { InvoiceInfo } from '../../../lib/definitions'
import { SubmitAndClose } from '../../../ui/components/edit-invoice-info/SubmitAndClose'


export default async function EditInvoiceInfoPage({
  params,
}: {
  params: Promise<{ code: string }>
  }) {
  const params2 = await params
  const code = params2.code
  const invoiceDetail = await findInvoiceDetail({ code: code })

  if (!invoiceDetail) notFound()

  const info: InvoiceInfo = invoiceDetail.invoiceInfo as InvoiceInfo

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4 shadow-xl">

        <h2 className="text-lg font-semibold">
          Editar Información de Factura
        </h2>

        <form
              className="space-y-4">

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              N° Factura
            </label>
            <input
              name="invoiceNumber"
              defaultValue={info?.invoiceNumber ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Incoterms
            </label>
            <input
              name="incoterms"
              defaultValue={info?.incoterms ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              País Adquisición
            </label>
            <input
              name="acquisitionCountry"
              defaultValue={info?.acquisitionCountry ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Moneda
            </label>
            <input
              name="currency"
              defaultValue={info?.currency ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Lugar de Entrega
            </label>
            <input
              name="deliveryPlace"
              defaultValue={info?.deliveryPlace ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <SubmitAndClose code={code} />
          </div>

        </form>
      </div>
    </div>
  )
}
