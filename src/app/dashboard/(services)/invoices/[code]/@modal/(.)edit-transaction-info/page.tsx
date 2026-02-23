

import { notFound } from 'next/navigation'
import { findInvoiceDetail } from '../../../lib/api'
import { TransactionInfo } from '../../../lib/definitions'
import { SubmitAndClose } from '../../../ui/components/edit-transaction-info/SubmitAndClose'


export default async function EditTransactionInfoPage({
  params,
}: {
  params: Promise<{ code: string }>
  }) {
  const params2 = await params
  const code = params2.code
  const invoiceDetail = await findInvoiceDetail({ code: code })

  if (!invoiceDetail) notFound()

  const info: TransactionInfo = invoiceDetail.transactionInfo as TransactionInfo

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4 shadow-xl">

        <h2 className="text-lg font-semibold">
          Editar Información sobre la Transacción
        </h2>

        <form
              className="space-y-4">

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Forma de Pago
            </label>
            <input
              name="paymentMethod"
              defaultValue={info?.paymentMethod ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Banco
            </label>
            <input
              name="bank"
              defaultValue={info?.bank ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Medio de Pago
            </label>
            <input
              name="paymentChannel"
              defaultValue={info?.paymentChannel ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              N° De Comprobante
            </label>
            <input
              name="receiptNumber"
              defaultValue={info?.receiptNumber ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
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
  )
}
