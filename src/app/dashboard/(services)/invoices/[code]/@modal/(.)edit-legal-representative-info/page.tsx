

import { notFound } from 'next/navigation'
import { findInvoiceDetail } from '../../../lib/api'
import { LegalRepresentativeInfo } from '../../../lib/definitions'
import { SubmitAndClose } from '../../../ui/components/edit-legal-representative-info/SubmitAndClose'


export default async function EditLegalRepresentativeInfoPage({
  params,
}: {
  params: { code: string }
  }) {
  const params2 = await params
  const code = params2.code
  const invoiceDetail = await findInvoiceDetail({ code: code })

  if (!invoiceDetail) notFound()

  const info: LegalRepresentativeInfo = invoiceDetail.legalRepresentativeInfo as LegalRepresentativeInfo

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4 shadow-xl">

        <h2 className="text-lg font-semibold">
          Editar Información de Representante Legal
        </h2>

        <form
              className="space-y-4">

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Nombre
            </label>
            <input
              name="fullName"
              defaultValue={info?.fullName ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Cargo
            </label>
            <input
              name="position"
              defaultValue={info?.position ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Dni
            </label>
            <input
              name="nationalId"
              defaultValue={info?.nationalId ?? ''}
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
