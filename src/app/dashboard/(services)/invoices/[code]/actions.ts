'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  updateInvoiceInfo,
  updateSupplierInfo,
  updateTransactionInfo,
  updateLegalRepresentativeInfo,
  updateInvoiceItemInfo,
  deleteInvoiceItemInfo
} from '../lib/api'

type State = { ok: boolean; error?: string }

const getOptionalString = (fd: FormData, key: string): string | undefined => {
  const v = fd.get(key)
  if (typeof v !== 'string') return undefined
  const s = v.trim()
  return s === '' ? undefined : s
}

const getOptionalDecimal = (
  fd: FormData,
  key: string
): string | null | undefined => {
  const v = fd.get(key)
  if (typeof v !== 'string') return undefined

  const s = v.trim()
  if (s === '') return undefined

  if (Number.isNaN(Number(s))) return undefined

  return s.toString()
}

// export async function updateInvoiceInfoAction(
//   code: string,
//   formData: FormData
// ) {

//   const data = {
//     invoiceNumber: getOptionalString(formData, 'invoiceNumber'),
//     incoterms: getOptionalString(formData, 'incoterms'),
//     acquisitionCountry: getOptionalString(formData, 'acquisitionCountry'),
//     currency: getOptionalString(formData, 'currency'),
//     deliveryPlace: getOptionalString(formData, 'deliveryPlace'),
//   }
//   await updateInvoiceInfo({
//     code,
//     data: {
//       ...(data.invoiceNumber ? { invoiceNumber: data.invoiceNumber } : {}),
//       ...(data.incoterms ? { incoterms: data.incoterms } : {}),
//       ...(data.acquisitionCountry ? { acquisitionCountry: data.acquisitionCountry } : {}),
//       ...(data.currency ? { currency: data.currency } : {}),
//       ...(data.deliveryPlace ? { deliveryPlace: data.deliveryPlace } : {}),
//     }
//   })

//   revalidatePath(`/dashboard/invoices/${code}`)
//   return { ok: true }
//   // redirect(`/dashboard/invoices/${code}`)
// }

export async function updateInvoiceInfoAction(
  code: string,
  prevState: State,
  formData: FormData
): Promise<State> {
  try {
    const getOptionalString = (key: string) => {
      const v = formData.get(key)
      if (typeof v !== 'string') return undefined
      const s = v.trim()
      return s === '' ? undefined : s
    }

    const data = {
      invoiceNumber: getOptionalString('invoiceNumber'),
      incoterms: getOptionalString('incoterms'),
      acquisitionCountry: getOptionalString('acquisitionCountry'),
      currency: getOptionalString('currency'),
      deliveryPlace: getOptionalString('deliveryPlace'),
    }

    await updateInvoiceInfo({
      code,
      data: {
        ...(data.invoiceNumber ? { invoiceNumber: data.invoiceNumber } : {}),
        ...(data.incoterms ? { incoterms: data.incoterms } : {}),
        ...(data.acquisitionCountry ? { acquisitionCountry: data.acquisitionCountry } : {}),
        ...(data.currency ? { currency: data.currency } : {}),
        ...(data.deliveryPlace ? { deliveryPlace: data.deliveryPlace } : {}),
      },
    })

    revalidatePath(`/dashboard/invoices/${code}`)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function updateSupplierInfoAction(
  code: string,
  prevState: State,
  formData: FormData
): Promise<State> {
  try {
    const data = {
      affiliation: getOptionalString(formData, 'affiliation'),
      legalName: getOptionalString(formData, 'legalName'),
      address: getOptionalString(formData, 'address'),
      cityCountry: getOptionalString(formData, 'cityCountry'),
      contactName: getOptionalString(formData, 'contactName'),
      phoneNumber: getOptionalString(formData, 'phoneNumber'),
      condition: getOptionalString(formData, 'condition'),
    }
    await updateSupplierInfo({
      code,
      data: {
        ...(data.affiliation ? { affiliation: data.affiliation } : {}),
        ...(data.legalName ? { legalName: data.legalName } : {}),
        ...(data.address ? { address: data.address } : {}),
        ...(data.cityCountry ? { cityCountry: data.cityCountry } : {}),
        ...(data.contactName ? { contactName: data.contactName } : {}),
        ...(data.phoneNumber ? { phoneNumber: data.phoneNumber } : {}),
        ...(data.condition ? { condition: data.condition } : {}),
      }
    })

    revalidatePath(`/dashboard/invoices/${code}`)
    // redirect(`/dashboard/invoices/${code}`)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}


export async function updateTransactionInfoAction(
  code: string,
  prevState: State,
  formData: FormData
): Promise<State> {
  try {
    const data = {
      paymentMethod: getOptionalString(formData, 'paymentMethod'),
      bank: getOptionalString(formData, 'bank'),
      paymentChannel: getOptionalString(formData, 'apaymentChannels'),
      receiptNumber: getOptionalString(formData, 'receiptNumber'),
    }
    await updateTransactionInfo({
      code,
      data: {
        ...(data.paymentMethod ? { paymentMethod: data.paymentMethod } : {}),
        ...(data.bank ? { bank: data.bank } : {}),
        ...(data.paymentChannel ? { paymentChannel: data.paymentChannel } : {}),
        ...(data.receiptNumber ? { receiptNumber: data.receiptNumber } : {}),
      }
    })

    revalidatePath(`/dashboard/invoices/${code}`)
    // redirect(`/dashboard/invoices/${code}`)
      return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function updateLegalRepresentativeInfoAction(
  code: string,
  prevState: State,
  formData: FormData
): Promise<State> {
  try {

    const data = {
      fullName: getOptionalString(formData, 'fullName'),
      position: getOptionalString(formData, 'position'),
      nationalId: getOptionalString(formData, 'nationalId'),
    }
    console.log('aca44', data)
    await updateLegalRepresentativeInfo({
      code,
      data: {
        ...(data.fullName ? { fullName: data.fullName } : {}),
        ...(data.position ? { position: data.position } : {}),
        ...(data.nationalId ? { nationalId: data.nationalId } : {}),
      }
    })

    revalidatePath(`/dashboard/invoices/${code}`)
    // redirect(`/dashboard/invoices/${code}`)
        return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function updateInvoiceItemAction(
  code: string,
  itemId: string,
  prevState: State,
  formData: FormData
): Promise<State> {
  try {
    const data = {
      itemCode: getOptionalString(formData, 'itemCode'),
      brand: getOptionalString(formData, 'brand'),
      condition: getOptionalString(formData, 'condition'),
      model: getOptionalString(formData, 'model'),
      code: getOptionalString(formData, 'code'),
      commercialName: getOptionalString(formData, 'commercialName'),
      description: getOptionalString(formData, 'description'),
      material: getOptionalString(formData, 'material'),
      mainUse: getOptionalString(formData, 'mainUse'),
      unitType: getOptionalString(formData, 'unitType '),
      countryOfOrigin: getOptionalString(formData, 'countryOfOrigin'),
      quantity: getOptionalString(formData, 'quantity '),
      countryOfAcquisition: getOptionalString(formData, 'countryOfAcquisition'),
      unitPrice: getOptionalDecimal(formData, 'unitPrice'),
      totalPrice: getOptionalDecimal(formData, 'totalPrice'),
      suggestedHsCode: getOptionalString(formData, 'suggestedHsCode'),
    }
    await updateInvoiceItemInfo({
      itemId,
      data: {
        ...(data.itemCode ? { itemCode: data.itemCode } : {}),
        ...(data.brand ? { brand: data.brand } : {}),
        ...(data.condition ? { condition: data.condition } : {}),
        ...(data.model ? { model: data.model } : {}),
        ...(data.code ? { code: data.code } : {}),
        ...(data.commercialName ? { commercialName: data.commercialName } : {}),
        ...(data.description ? { description: data.description } : {}),
        ...(data.material ? { material: data.material } : {}),
        ...(data.mainUse ? { mainUse: data.mainUse } : {}),
        ...(data.quantity ? { quantity: Number(data.quantity) } : {}),
        ...(data.unitType ? { unitType: data.unitType } : {}),
        ...(data.countryOfOrigin ? { countryOfOrigin: data.countryOfOrigin } : {}),
        ...(data.countryOfAcquisition ? { countryOfAcquisition: data.countryOfAcquisition } : {}),
        ...(data.unitPrice !== undefined ? { unitPrice: data.unitPrice?.toString() } : {}),
        ...(data.totalPrice !== undefined ? { totalPrice: data.totalPrice?.toString() } : {}),
        ...(data.suggestedHsCode ? { suggestedHsCode: data.suggestedHsCode } : {}),
      }
    })

    revalidatePath(`/dashboard/invoices/${code}`)
    // redirect(`/dashboard/invoices/${code}`)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function deleteInvoiceItemAction(
  itemId: string,
  code: string,
) {
  await deleteInvoiceItemInfo({ itemId })

  revalidatePath(`/dashboard/invoices/${code}`)
  redirect(`/dashboard/invoices/${code}`)
}
