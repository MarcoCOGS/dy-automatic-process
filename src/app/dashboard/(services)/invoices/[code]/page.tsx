// import { DateTime } from 'luxon';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { translation } from '@/app/i18n';
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
import { getSession } from '@/lib/session';

import { findInvoiceDetail } from '../lib/api';
import { InvoiceItem } from '@prisma/client';

import { Invoice as InvoiceType,} from '../lib/definitions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { DownloadExcelButton } from '../ui/components/download-invoice';
import { DownloadExcelButton2 } from '../ui/components/download-invoice2';

// import OpenFile from '../ui/open-file';

// function format(date: string | undefined, timeZone: string) {
//   if (date) {
//     return DateTime.fromISO(date).setZone(timeZone).toLocaleString(DateTime.DATETIME_MED);
//   }

//   return '';
// }

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

  // function Field(props: { name: string; value: string | number }) {
  //   return (
  //     <div className='grid gap-2'>
  //       <div className='flex items-center'>
  //         <Label htmlFor={props.name}>{t(`invoicesDetail.fields.${props.name}`)}</Label>
  //       </div>
  //       <Input
  //         id={props.name}
  //         name={props.name}
  //         type='text'
  //         placeholder={t(`invoicesDetail.fields.${props.name}`)}
  //         autoComplete='off'
  //         autoFocus={false}
  //         disabled={true}
  //         defaultValue={props.value}
  //       />
  //     </div>
  //   );
  // }

  const invoiceDetails = invoiceDetail as unknown as InvoiceType & { items: InvoiceItem[] };

  return (
    <div className="h-full flex-1 flex-col space-y-6 p-6 md:flex w-fit">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('invoicesDetail.title')}</h2>
          <p className="text-muted-foreground">{t('invoicesDetail.description')}</p>
        </div>
        <div className='flex gap-10'>
          {/* <div>
            <DownloadExcelButton
              invoiceDetails={invoiceDetails}
              label={t('buttons.download')}
            />
          </div> */}
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

      {/* Header band */}
      <div className="">
        {/* <div className="bg-emerald-700 text-white px-4 py-2 text-sm font-semibold tracking-wide rounded-t-lg">
          {'TRADUCCIÓN DE FACTURA'}
        </div> */}

        <div className="p-4 space-y-4">
          {/* Top 3 blocks */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Invoice Info */}
            <Card className="rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-emerald-800">
                  {'INFORMACIÓN DE FACTURA'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
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
              </CardContent>
            </Card>

            {/* Supplier Info */}
            <Card className="rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-emerald-800">
                  {'INFORMACIÓN DE PROVEEDOR'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {/* Vinculación */}
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

                {/* Condición */}
                <div className="text-sm">
                  <div className="text-muted-foreground mb-1">{'CONDICIÓN'}</div>
                  <div className="font-medium">{invoiceDetails.supplierInfo?.condition}</div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Info */}
            <Card className="rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-emerald-800">
                  {'INFORMACIÓN SOBRE LA TRANSACCIÓN'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
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

                <Separator />

                {/* <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="text-muted-foreground">{t('invoicesDetail.totalItems') || 'TOTAL ÍTEMS'}</div>
                  <div className="font-medium">{invoiceDetails?.totalItems}</div>

                  <div className="text-muted-foreground">{t('invoicesDetail.totalQuantity') || 'TOTAL CANTIDAD'}</div>
                  <div className="font-medium">{v(totalQty)}</div>

                  <div className="text-muted-foreground">{t('invoicesDetail.totalValue') || 'TOTAL VALOR'}</div>
                  <div className="font-medium">{money(totalVal, currency)}</div>
                </div> */}
              </CardContent>
            </Card>
          </div>

          {/* Legal Representative block */}
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

              {/* <div className="mt-3 rounded-lg border p-4 min-h-[96px]">
                <div className="text-muted-foreground text-sm">
                  {t('legalRepresentativeInfo.signature') || 'FIRMA - REPRESENTANTE LEGAL'}
                </div>
                <div className="mt-2 text-sm">
                  {((legalRep as any).signatureUrl && String((legalRep as any).signatureUrl).trim().length) ? (
                    <a
                      href={String((legalRep as any).signatureUrl)}
                      className="underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t('common.open') || 'Abrir firma'}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div> */}
            </CardContent>
          </Card>

          {/* Items table */}
          <Card className="rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-emerald-800">
                {'DETALLE DE ÍTEMS'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="">
                  <Table className="overflow-x-auto">
                    <TableHeader>
                      <TableRow className="bg-emerald-700/10">
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
