

import { notFound } from 'next/navigation'
import { findInvoiceDetail } from '../../../lib/api'
import { SupplierInfo } from '../../../lib/definitions'
import { SubmitAndClose } from '../../../ui/components/edit-supplier-info/SubmitAndClose'


export default async function EditSupplierInfoPage({
  params,
}: {
  params: Promise<{ code: string }>
  }) {
  const params2 = await params
  const code = params2.code
  const invoiceDetail = await findInvoiceDetail({ code: code })

  if (!invoiceDetail) notFound()

  const info: SupplierInfo = invoiceDetail.supplierInfo as SupplierInfo

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4 shadow-xl">

        <h2 className="text-lg font-semibold">
          Editar Información de proveedor
        </h2>

        <form
              className="space-y-4">

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Vinculación
            </label>
            <input
              name="affiliation"
              defaultValue={info?.affiliation ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Razón Social
            </label>
            <input
              name="legalName"
              defaultValue={info?.legalName ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Domicilio
            </label>
            <input
              name="address"
              defaultValue={info?.address ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Ciudad / País
            </label>
            <input
              name="cityCountry"
              defaultValue={info?.cityCountry ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Contacto
            </label>
            <input
              name="contactName"
              defaultValue={info?.contactName ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Teléfono
            </label>
            <input
              name="phoneNumber"
              defaultValue={info?.phoneNumber ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Condición
            </label>
            <input
              name="condition"
              defaultValue={info?.condition ?? ''}
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
