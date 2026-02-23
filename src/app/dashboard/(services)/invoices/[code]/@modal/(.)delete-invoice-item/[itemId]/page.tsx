

import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { findInvoiceItemDetail } from '../../../../lib/api'
import { deleteInvoiceItemAction } from '../../../actions'


export default async function EditInvoiceInfoPage({
  params,
}: {
  params: { itemId: string, code: string }
  }) {
  const itemId = params.itemId
  const code = params.code
  const invoiceItemDetail = await findInvoiceItemDetail({ itemId: params.itemId })

  if (!invoiceItemDetail) notFound()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4 shadow-xl">

        <h2 className="text-lg font-semibold">
          Editar Información de Factura
        </h2>

        <form action={deleteInvoiceItemAction.bind(null, itemId, code)}
              className="space-y-4">

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" asChild>
              <a href={`/dashboard/invoices/${code}`}>
                Cancelar
              </a>
            </Button>

            <Button type="submit">
              Guardar
            </Button>
          </div>

        </form>
      </div>
    </div>
  )
}
