

// import { notFound } from 'next/navigation'
// import { Button } from '@/components/ui/button'
// import { findInvoiceItemDetail } from '../../../../lib/api'
// import { deleteInvoiceItemAction } from '../../../actions'


// export default async function EditInvoiceInfoPage({
//   params,
// }: {
//   params: { itemId: string, code: string }
//   }) {
//   const itemId = params.itemId
//   const code = params.code
//   const invoiceItemDetail = await findInvoiceItemDetail({ itemId: params.itemId })

//   if (!invoiceItemDetail) notFound()

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//       <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4 shadow-xl">

//         <h2 className="text-lg font-semibold">
//           Editar Información de Factura
//         </h2>

//         <form action={deleteInvoiceItemAction.bind(null, itemId, code)}
//               className="space-y-4">

//           <div className="flex justify-end gap-3 pt-4">
//             <Button variant="secondary" asChild>
//               <a href={`/dashboard/invoices/${code}`}>
//                 Cancelar
//               </a>
//             </Button>

//             <Button type="submit">
//               Guardar
//             </Button>
//           </div>

//         </form>
//       </div>
//     </div>
//   )
// }


import { notFound } from 'next/navigation'
import { findInvoiceItemDetail, InvoiceItemUpdatable } from '../../../../lib/api';
import { SubmitAndClose } from '../../../../ui/components/edit-invoice-item/SubmitAndClose';


export default async function EditInvoiceInfoPage({
  params,
}: {
  params: Promise<{ itemId: string, code: string }>
  }) {
  const params2 = await params
  const code = params2.code
  const itemId = params2.itemId
  const invoiceItemDetail = await findInvoiceItemDetail({ itemId: itemId })

  if (!invoiceItemDetail) notFound()

  const item: InvoiceItemUpdatable = invoiceItemDetail as InvoiceItemUpdatable

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 ">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4 shadow-xl h-[90vh] max-h-[90vh] overflow-y-auto">

        <h2 className="text-lg font-semibold">
          Editar Información de Factura
        </h2>

        <form
              className="space-y-4">

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

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Marca
            </label>
            <input
              name="brand"
              defaultValue={item?.brand ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Nuevo/Usado
            </label>
            <input
              name="condition"
              defaultValue={item?.condition ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Modelo
            </label>
            <input
              name="model"
              defaultValue={item?.model ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Código
            </label>
            <input
              name="code"
              defaultValue={item?.code ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Nombre Comercial
            </label>
            <input
              name="commercialName"
              defaultValue={item?.commercialName ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Descripción Mínima
            </label>
            <input
              name="description"
              defaultValue={item?.description ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Material
            </label>
            <input
              name="material"
              defaultValue={item?.material ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Uso / Función
            </label>
            <input
              name="mainUse"
              defaultValue={item?.mainUse ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Cantidad
            </label>
            <input
              name="quantity"
              defaultValue={item?.quantity ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Unidad
            </label>
            <input
              name="unitType"
              defaultValue={item?.unitType ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              País Origen
            </label>
            <input
              name="countryOfOrigin"
              defaultValue={item?.countryOfOrigin ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              País Adquisición
            </label>
            <input
              name="countryOfAcquisition"
              defaultValue={item?.countryOfAcquisition ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Unit Price
            </label>
            <input
              name="unitPrice"
              defaultValue={item?.unitPrice ? item?.unitPrice.toString() : ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Total Price
            </label>
            <input
              name="totalPrice"
              defaultValue={item?.totalPrice ? item?.totalPrice.toString() : ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Partida sugerida
            </label>
            <input
              name="suggestedHsCode"
              defaultValue={item?.suggestedHsCode ?? ''}
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
            <SubmitAndClose code={code} itemId={itemId}/>
          </div>

        </form>
      </div>
    </div>
  )
}
