'use client';

import { Button } from '@/components/ui/button';
import type { InvoiceItem } from '@prisma/client';
import { Invoice } from '../../lib/definitions';

type Props = {
  invoiceDetails: Invoice & { items: InvoiceItem[] };
  label: string;
};

export function DownloadExcelButton({ invoiceDetails, label }: Props) {
  async function handlerDownload() {
    const XLSX = await import('xlsx');

    const emptyRow = () => ({
      A: '', B: '', C: '', D: '', E: '', F: '', G: '', H: '', I: '', J: '', K: '', L: '', M: '', N: '', O: '', P: '', Q: '',
    });

    // Header (sale de lo que ya pintas)
    const headerData = {
      factura: {
        numero_factura: invoiceDetails.invoiceInfo?.invoiceNumber ?? '',
        incoterms: invoiceDetails.invoiceInfo?.incoterms ?? '',
        pais_adquisicion: invoiceDetails.invoiceInfo?.acquisitionCountry ?? 'China',
        moneda: invoiceDetails.invoiceInfo?.currency ?? 'USD',
        lugar_entrega: invoiceDetails.invoiceInfo?.deliveryPlace ?? '',
      },
      proveedor: {
        vinculacion: invoiceDetails.supplierInfo?.affiliation ?? 'NO',
        razon_social: invoiceDetails.supplierInfo?.legalName ?? '',
        domicilio: invoiceDetails.supplierInfo?.address ?? '',
        ciudad_pais: invoiceDetails.supplierInfo?.cityCountry ?? '',
        contacto: invoiceDetails.supplierInfo?.contactName ?? '',
        telefono: invoiceDetails.supplierInfo?.phoneNumber ?? '',
        condicion: invoiceDetails.supplierInfo?.condition ?? 'FABRICANTE',
      },
      transaccion: {
        forma_pago: invoiceDetails.transactionInfo?.paymentMethod ?? 'CONTADO',
        banco: invoiceDetails.transactionInfo?.bank ?? '',
        medio_pago: invoiceDetails.transactionInfo?.paymentChannel ?? 'TRANSFERENCIA',
        numero_comprobante: invoiceDetails.transactionInfo?.receiptNumber ?? '',
      },
      representante: {
        nombre: invoiceDetails.legalRepresentativeInfo?.fullName ?? '',
        cargo: invoiceDetails.legalRepresentativeInfo?.position ?? '',
        dni: invoiceDetails.legalRepresentativeInfo?.nationalId ?? '',
      },
    };

    // Productos: aquí está el FIX => itemCode puede ser null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productosData = (invoiceDetails.items ?? []).map((it: { itemCode: any; brand: any; condition: any; model: any; code: any; commercialName: any; description: any; material: any; mainUse: any; quantity: any; unitType: any; countryOfOrigin: any; countryOfAcquisition: any; unitPrice: any; totalPrice: any; suggestedHsCode: any; }, index: number) => ({
      item: it.itemCode ?? String(index + 1), // ✅ fallback si viene null
      marca: it.brand ?? 'GENERICO',
      estado: it.condition ?? 'NUEVO',
      modelo: it.model ?? 'GENERICO',
      codigo: it.code ?? '',
      nombre_comercial: it.commercialName ?? '',
      descripcion_minima: it.description ?? '',
      material: it.material ?? '',
      uso_funcion: it.mainUse ?? '',
      cantidad: Number(it.quantity ?? 0),
      tipo_unidad: it.unitType ?? 'pcs',
      pais_origen: it.countryOfOrigin ?? 'CHINA',
      pais_adquisicion: it.countryOfAcquisition ?? 'CHINA',
      precio_unitario: Number(it.unitPrice ?? 0),
      precio_total: Number(it.totalPrice ?? 0),
      partida_arancelaria: it.suggestedHsCode ?? '',
    }));

    if (productosData.length === 0) throw new Error('No hay productos para generar Excel');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const excelRows: Record<string, any>[] = [];

    excelRows.push({ ...emptyRow(), A: 'TRADUCCION DE FACTURA' });

    excelRows.push({ ...emptyRow(), A: 'INFORMACION DE FACTURA' });
    excelRows.push({ ...emptyRow(), A: 'Nº FACTURA', B: headerData.factura.numero_factura });
    excelRows.push({ ...emptyRow(), A: 'INCOTERMS', B: headerData.factura.incoterms });
    excelRows.push({ ...emptyRow(), A: 'PAIS ADQUISICION', B: headerData.factura.pais_adquisicion });
    excelRows.push({ ...emptyRow(), A: 'MONEDA', B: headerData.factura.moneda });
    excelRows.push({ ...emptyRow(), A: 'LUGAR DE ENTREGA', B: headerData.factura.lugar_entrega });
    excelRows.push(emptyRow());

    excelRows.push({ ...emptyRow(), A: 'INFORMACION DE PROVEEDOR' });
    excelRows.push({ ...emptyRow(), A: 'VINCULACION', B: `${headerData.proveedor.vinculacion} [X]` });
    excelRows.push({ ...emptyRow(), A: 'RAZON SOCIAL', B: headerData.proveedor.razon_social });
    excelRows.push({ ...emptyRow(), A: 'DOMICILIO', B: headerData.proveedor.domicilio });
    excelRows.push({ ...emptyRow(), A: 'CIUDAD/PAIS', B: headerData.proveedor.ciudad_pais });
    excelRows.push({ ...emptyRow(), A: 'CONTACTO', B: headerData.proveedor.contacto });
    excelRows.push({ ...emptyRow(), A: 'TELEFONO', B: headerData.proveedor.telefono });
    excelRows.push({
      ...emptyRow(),
      A: 'CONDICION',
      B: headerData.proveedor.condicion === 'FABRICANTE' ? 'FABRICANTE [X]' : 'FABRICANTE []',
      C: headerData.proveedor.condicion === 'COMERCIANTE' ? 'COMERCIANTE [X]' : 'COMERCIANTE []',
      D: headerData.proveedor.condicion === 'DISTRIBUIDOR' ? 'DISTRIBUIDOR [X]' : 'DISTRIBUIDOR []',
      E: headerData.proveedor.condicion === 'OTROS' ? 'OTROS [X]' : 'OTROS []',
      F: 'DETALLAR',
    });
    excelRows.push(emptyRow());

    excelRows.push({ ...emptyRow(), A: 'INFORMACION SOBRE LA TRANSACCION' });
    excelRows.push({
      ...emptyRow(),
      A: 'FORMA DE PAGO',
      B: headerData.transaccion.forma_pago === 'CONTADO' ? 'CONTADO [X]' : 'CONTADO []',
      C: headerData.transaccion.forma_pago === 'DIFERIDO' ? 'DIFERIDO [X]' : 'DIFERIDO []',
    });
    excelRows.push({ ...emptyRow(), A: 'BANCO', B: headerData.transaccion.banco });
    excelRows.push({
      ...emptyRow(),
      A: 'MEDIO DE PAGO',
      B: headerData.transaccion.medio_pago === 'TRANSFERENCIA' ? 'TRANSFERENCIA [X]' : 'TRANSFERENCIA []',
      C: headerData.transaccion.medio_pago !== 'TRANSFERENCIA' ? 'OTRO [X]' : 'OTRO []',
    });
    excelRows.push({ ...emptyRow(), A: 'N° DE COMPROBANTE', B: headerData.transaccion.numero_comprobante });
    excelRows.push(emptyRow());

    excelRows.push({ ...emptyRow(), A: 'NOMBRE - REPRESENTANTE LEGAL', B: headerData.representante.nombre });
    excelRows.push({ ...emptyRow(), A: 'CARGO', B: headerData.representante.cargo });
    excelRows.push({ ...emptyRow(), A: 'DNI', B: headerData.representante.dni });
    excelRows.push(emptyRow());
    excelRows.push(emptyRow());

    excelRows.push({
      A: 'ITEM',
      B: 'MARCA',
      C: 'NUEVO/USADO',
      D: 'MODELO',
      E: 'CODIGO',
      F: 'NOMBRE COMERCIAL',
      G: 'DESCRIPCIÓN MÍNIMA',
      H: 'MATERIAL',
      I: 'USO / FUNCIÓN',
      J: 'CANTIDAD',
      K: 'UNIDAD',
      L: 'PAÍS ORIGEN',
      M: 'PAÍS ADQUISICIÓN',
      N: 'UNIT PRICE',
      O: 'TOTAL PRICE',
      P: 'PARTIDA SUGERIDA',
      Q: '',
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    productosData.forEach((p: { item: any; marca: any; estado: any; modelo: any; codigo: any; nombre_comercial: any; descripcion_minima: any; material: any; uso_funcion: any; cantidad: any; tipo_unidad: any; pais_origen: any; pais_adquisicion: any; precio_unitario: any; precio_total: any; partida_arancelaria: any; }) => {
      excelRows.push({
        A: p.item,
        B: p.marca,
        C: String(p.estado).toUpperCase(),
        D: p.modelo,
        E: p.codigo,
        F: p.nombre_comercial,
        G: p.descripcion_minima,
        H: p.material,
        I: p.uso_funcion,
        J: p.cantidad,
        K: p.tipo_unidad,
        L: p.pais_origen,
        M: p.pais_adquisicion,
        N: p.precio_unitario,
        O: p.precio_total,
        P: p.partida_arancelaria,
        Q: '',
      });
    });

    const ws = XLSX.utils.json_to_sheet(excelRows, {
      header: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q'],
      skipHeader: true,
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Factura');

    const fileName = `TRADUCCION_FACTURA_${headerData.factura.numero_factura || 'SIN_NUMERO'}.xlsx`;

    const arrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([arrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = URL.createObjectURL(blob);

    // si quieres sí o sí window.open:
    window.open(url, '_blank');

    // y para forzar descarga:
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  return (
    <Button variant="default" onClick={handlerDownload}>
      {label}
    </Button>
  );
}
