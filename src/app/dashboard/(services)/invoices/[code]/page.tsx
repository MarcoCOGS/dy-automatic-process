import Link from 'next/link';
import { notFound } from 'next/navigation';

import { translation } from '@/app/i18n';
import { Button } from '@/components/ui/button';
import { getSession } from '@/lib/session';

import { findInvoiceDetail, InvoiceItemUi } from '../lib/api';

import { Invoice as InvoiceType,} from '../lib/definitions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DownloadExcelButton2 } from '../ui/components/download-invoice2';

function money(value?: unknown, currency?: string) {
  if (value === null || value === undefined) return '—';
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return '—';
  return `$${currency ? currency + ' ' : ''}${n.toFixed(2)}`;
}

export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const { t } = await translation('es', 'verifications');

  const session = await getSession();

  if (!session) {
    return <div>Empty</div>;
  }


  const invoiceDetail = await findInvoiceDetail({ code });

  if (!invoiceDetail) {
    notFound();
  }

  const invoiceDetails = invoiceDetail as unknown as InvoiceType & { items: InvoiceItemUi[] };

  return (
    <div className="h-full flex-1 flex-col space-y-6 p-6 md:flex">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('invoicesDetail.title')}</h2>
          <p className="text-muted-foreground">{t('invoicesDetail.description')}</p>
        </div>
        <div className='flex gap-10'>
          <div>
            <DownloadExcelButton2
              invoiceDetails={invoiceDetails}
              label={t('buttons.download')}
            />
          </div>
          <div>
            <Button variant="secondary" asChild>
              <Link href="/dashboard/invoices">{t('buttons.back')}</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="">
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="rounded-xl flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-emerald-800">
                  {'INFORMACIÓN DE FACTURA'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex flex-col flex-1">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="text-muted-foreground">{'N° FACTURA'}</div>
                  <div className="font-medium">{invoiceDetails.invoiceInfo?.invoiceNumber}</div>

                  <div className="text-muted-foreground">{'INCOTERMS'}</div>
                  <div className="font-medium">{invoiceDetails.invoiceInfo?.incoterms}</div>

                  <div className="text-muted-foreground">{'PAÍS ADQUISICIÓN'}</div>
                  <div className="font-medium">{invoiceDetails.invoiceInfo?.acquisitionCountry}</div>

                  <div className="text-muted-foreground">{'MONEDA'}</div>
                  <div className="font-medium">{invoiceDetails.invoiceInfo?.currency}</div>

                  <div className="text-muted-foreground">{'LUGAR DE ENTREGA'}</div>
                  <div className="font-medium">{invoiceDetails.invoiceInfo?.deliveryPlace}</div>
                </div>
                <div className='h-full flex flex-col justify-end'>
                  {/* <div className='flex justify-end'>
                    <Button size="sm" variant="outline" onClick={handlerEditInvoiceInfo}>Editar</Button>
                  </div> */}
                  <div className='flex justify-end'>
                    <Button size="sm" variant="outline" asChild>
                      <Link scroll={false} href={`/dashboard/invoices/${code}/edit-invoice-info`}>Editar</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-emerald-800">
                  {'INFORMACIÓN DE PROVEEDOR'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="text-sm">
                  <div className="text-muted-foreground mb-1">{'VINCULACIÓN'}</div>
                   <div className="font-medium">{invoiceDetails.supplierInfo?.affiliation}</div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="text-muted-foreground">{'RAZÓN SOCIAL'}</div>
                  <div className="font-medium">{invoiceDetails.supplierInfo?.legalName}</div>

                  <div className="text-muted-foreground">{'DOMICILIO'}</div>
                  <div className="font-medium">{invoiceDetails.supplierInfo?.address}</div>

                  <div className="text-muted-foreground">{'CIUDAD / PAÍS'}</div>
                  <div className="font-medium">{invoiceDetails.supplierInfo?.cityCountry}</div>

                  <div className="text-muted-foreground">{'CONTACTO'}</div>
                  <div className="font-medium">{invoiceDetails.supplierInfo?.contactName}</div>

                  <div className="text-muted-foreground">{'TELÉFONO'}</div>
                  <div className="font-medium">{invoiceDetails.supplierInfo?.phoneNumber}</div>
                </div>

                <Separator />

                <div className="text-sm">
                  <div className="text-muted-foreground mb-1">{'CONDICIÓN'}</div>
                  <div className="font-medium">{invoiceDetails.supplierInfo?.condition}</div>
                </div>
                <div className='h-full flex flex-col justify-end'>
                  {/* <div className='flex justify-end'>
                    <Button size="sm" variant="outline" onClick={handlerEditSupplierInfo}>Editar</Button>
                  </div> */}
                  <div className='flex justify-end'>
                    <Button size="sm" variant="outline" asChild>
                      <Link scroll={false} href={`/dashboard/invoices/${code}/edit-supplier-info`}>Editar</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl  flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-emerald-800">
                  {'INFORMACIÓN SOBRE LA TRANSACCIÓN'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3 flex flex-col flex-1">
                <div className="text-sm">
                  <div className="text-muted-foreground mb-1">{'FORMA DE PAGO'}</div>
                  <div className="font-medium">{invoiceDetails.transactionInfo?.paymentMethod}</div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="text-muted-foreground">{'BANCO'}</div>
                  <div className="font-medium">{invoiceDetails.transactionInfo?.bank}</div>

                  <div className="text-muted-foreground">{'MEDIO DE PAGO'}</div>
                  <div className="font-medium">{invoiceDetails.transactionInfo?.paymentChannel}</div>

                  <div className="text-muted-foreground">{'N° DE COMPROBANTE'}</div>
                  <div className="font-medium">{invoiceDetails.transactionInfo?.receiptNumber}</div>
                </div>

                <div className='h-full flex flex-col justify-end flex-1'>
                  {/* <div className='flex justify-end'>
                    <Button size="sm" variant="outline" onClick={handlerEditTransactionInfo}>Editar</Button>
                  </div> */}
                  <div className='flex justify-end'>
                    <Button size="sm" variant="outline" asChild>
                      <Link scroll={false} href={`/dashboard/invoices/${code}/edit-transaction-info`}>Editar</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-emerald-800">
                {'REPRESENTANTE LEGAL'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3 text-sm">
                <div className="rounded-lg border p-3">
                  <div className="text-muted-foreground">{'NOMBRE'}</div>
                  <div className="font-medium">{invoiceDetails.legalRepresentativeInfo?.fullName}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-muted-foreground">{'CARGO'}</div>
                  <div className="font-medium">{invoiceDetails.legalRepresentativeInfo?.position}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-muted-foreground">{'DNI'}</div>
                  <div className="font-medium">{invoiceDetails.legalRepresentativeInfo?.nationalId}</div>
                </div>
              </div>
              <div className='h-full flex flex-col justify-end flex-1 mt-6'>
                {/* <div className='flex justify-end'>
                  <Button size="sm" variant="outline" onClick={handlerEditLegalRepresentativeInfo}>Editar</Button>
                </div> */}
                <div className='flex justify-end'>
                  <Button size="sm" variant="outline" asChild>
                    <Link scroll={false} href={`/dashboard/invoices/${code}/edit-legal-representative-info`}>Editar</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-emerald-800">
                {'DETALLE DE ÍTEMS'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="w-full min-w-0">
                  <div className="w-full overflow-x-auto">
                    <Table className="overflow-x-auto min-w-max">
                      <TableHeader>
                        <TableRow className="bg-[#e6f2ee]">
                          <TableHead className="whitespace-nowrap text-center">{'ITEM'}</TableHead>
                          <TableHead className="whitespace-nowrap text-center">{'MARCA'}</TableHead>
                          <TableHead className="whitespace-nowrap text-center">{'NUEVO/USADO'}</TableHead>
                          <TableHead className="whitespace-nowrap text-center">{'MODELO'}</TableHead>
                          <TableHead className="whitespace-nowrap text-center">{'CODIGO'}</TableHead>
                          <TableHead className="whitespace-nowrap text-center">{'NOMBRE COMERCIAL'}</TableHead>
                          <TableHead className="whitespace-nowrap text-center">{'DESCRIPCIÓN MÍNIMA'}</TableHead>
                          <TableHead className="whitespace-nowrap text-center">{'MATERIAL'}</TableHead>
                          <TableHead className="whitespace-nowrap text-center">{'USO / FUNCIÓN'}</TableHead>
                          <TableHead className="whitespace-nowrap text-center">{'CANTIDAD'}</TableHead>
                          <TableHead className="whitespace-nowrap text-center">{'UNIDAD'}</TableHead>
                          <TableHead className="whitespace-nowrap">{'PAÍS ORIGEN'}</TableHead>
                          <TableHead className="whitespace-nowrap text-center">{'PAÍS ADQUISICIÓN'}</TableHead>
                          <TableHead className="whitespace-nowrap text-center">{'UNIT PRICE'}</TableHead>
                          <TableHead className="whitespace-nowrap text-center">{'TOTAL PRICE'}</TableHead>
                          <TableHead className="whitespace-nowrap text-center">{'PARTIDA SUGERIDA'}</TableHead>
                          <TableHead
                            className="
                                sticky right-0 z-30
                                min-w-[140px]
                                whitespace-nowrap text-center
                                bg-[inherit]
                              "
                            >
                            <span className="relative">ACCIONES</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {invoiceDetails.items.map((it) => (
                          <TableRow key={it.id}>
                            <TableCell className="whitespace-nowrap  text-center">{it.itemCode}</TableCell>
                            <TableCell className="whitespace-nowrap  text-center">{it.brand}</TableCell>
                            <TableCell className="whitespace-nowrap  text-center">{it.condition}</TableCell>
                            <TableCell className="whitespace-nowrap  text-center">{it.model}</TableCell>
                            <TableCell className="min-w-[220px] text-center">{it.code}</TableCell>
                            <TableCell className="min-w-[220px] text-center">{it.commercialName}</TableCell>
                            <TableCell className="min-w-[240px] text-center">{it.description}</TableCell>
                            <TableCell className="whitespace-nowrap text-center">{it.material}</TableCell>
                            <TableCell className="min-w-[220px] text-center">{it.mainUse}</TableCell>
                            <TableCell className="whitespace-nowrap text-center">{it.quantity}</TableCell>
                            <TableCell className="whitespace-nowrap text-center">{it.unitType}</TableCell>
                            <TableCell className="whitespace-nowrap text-center">{it.countryOfOrigin}</TableCell>
                            <TableCell className="whitespace-nowrap text-center">{it.countryOfAcquisition}</TableCell>
                            <TableCell className="whitespace-nowrap text-center">{money(it.unitPrice)}</TableCell>
                            <TableCell className="whitespace-nowrap text-center">{money(it.totalPrice)}</TableCell>
                            <TableCell className="whitespace-nowrap text-center">{it.suggestedHsCode}</TableCell>
                            <TableCell
                              className="
                                sticky right-0 z-10
                                bg-background
                                group-hover:bg-muted/50
                                min-w-[140px]
                                px-2
                              "
                            >
                              {/* Fade continuo (no shadow por fila) */}
                              <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-l from-background to-transparent group-hover:from-muted/50" />

                              <div className="relative flex justify-center">
                                {/* <Button size="sm" variant="outline" onClick={handlerEditInvoiceItem}>Editar</Button>
                                <Button size="sm" variant="outline" onClick={handlerDeleteInvoiceItem}>Eliminar</Button> */}
                                <Button size="sm" className='flex w-24 min-w-24' variant="outline" asChild>
                                  <Link scroll={false} className='w-24' href={`/dashboard/invoices/${code}/edit-invoice-item/${it.id}`}>Editar</Link>
                                </Button>
                                {/* <Button size="sm" variant="outline" asChild>
                                  <Link scroll={false} href={`/dashboard/invoices/${code}/delete-invoice-item/${it.id}`}>Eliminar</Link>
                                </Button> */}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button variant="secondary" asChild>
              <Link href="/dashboard/invoices">{t('buttons.back')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
