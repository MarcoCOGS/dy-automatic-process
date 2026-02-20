'use client';

import { Button } from '@/components/ui/button';
import type { InvoiceItem } from '@prisma/client';
import { Invoice } from '../../lib/definitions';
import * as ExcelJS from 'exceljs';

type Props = {
  invoiceDetails: Invoice & { items: InvoiceItem[] };
  label: string;
};

export function DownloadExcelButton2({ invoiceDetails, label }: Props) {
  async function handleDownload() {
    try {
      const ExcelJS = (await import('exceljs')).default;

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('FORMATO DE TRADUCCION');

      // ─── Column widths (matching template) ───
      ws.columns = [
        { key: 'A', width: 2.43 },   // A
        { key: 'B', width: 8.0 },    // B
        { key: 'C', width: 17.43 },  // C
        { key: 'D', width: 9.14 },   // D
        { key: 'E', width: 23.14 },  // E
        { key: 'F', width: 40.86 },  // F
        { key: 'G', width: 29.71 },  // G
        { key: 'H', width: 26.0 },   // H
        { key: 'I', width: 41.14 },  // I
        { key: 'J', width: 17.71 },  // J
        { key: 'K', width: 13.43 },  // K
        { key: 'L', width: 11.14 },  // L
        { key: 'M', width: 14.71 },  // M
        { key: 'N', width: 14.86 },  // N
        { key: 'O', width: 13.29 },  // O
        { key: 'P', width: 13.14 },  // P
        { key: 'Q', width: 13.43 },  // Q
        { key: 'R', width: 10.0 },   // R
      ];

      // ─── Extract data from invoiceDetails ───
      const h = {
        factura: {
          numero: invoiceDetails.invoiceInfo?.invoiceNumber ?? '',
          incoterms: invoiceDetails.invoiceInfo?.incoterms ?? 'FOB',
          paisAdquisicion: invoiceDetails.invoiceInfo?.acquisitionCountry ?? 'CHINA',
          moneda: invoiceDetails.invoiceInfo?.currency ?? 'USD',
          lugarEntrega: invoiceDetails.invoiceInfo?.deliveryPlace ?? 'CALLAO',
        },
        proveedor: {
          vinculacion: invoiceDetails.supplierInfo?.affiliation ?? 'NO',
          razonSocial: invoiceDetails.supplierInfo?.legalName ?? '',
          domicilio: invoiceDetails.supplierInfo?.address ?? '',
          ciudadPais: invoiceDetails.supplierInfo?.cityCountry ?? '',
          contacto: invoiceDetails.supplierInfo?.contactName ?? '',
          telefono: invoiceDetails.supplierInfo?.phoneNumber ?? '',
          condicion: invoiceDetails.supplierInfo?.condition ?? 'FABRICANTE',
        },
        transaccion: {
          formaPago: invoiceDetails.transactionInfo?.paymentMethod ?? 'CONTADO',
          banco: invoiceDetails.transactionInfo?.bank ?? '',
          medioPago: invoiceDetails.transactionInfo?.paymentChannel ?? 'TRANSFERENCIA',
          comprobante: invoiceDetails.transactionInfo?.receiptNumber ?? '',
        },
        representante: {
          nombre: invoiceDetails.legalRepresentativeInfo?.fullName ?? '',
          cargo: invoiceDetails.legalRepresentativeInfo?.position ?? '',
          dni: invoiceDetails.legalRepresentativeInfo?.nationalId ?? '',
        },
      };

      const items = (invoiceDetails.items ?? []).map((it, index) => ({
        item: it.itemCode ?? String(index + 1),
        marca: it.brand ?? 'GENERICO',
        estado: it.condition ?? 'NUEVO',
        modelo: it.model ?? 'GENERICO',
        codigo: it.code ?? '',
        nombreComercial: it.commercialName ?? '',
        descripcion: it.description ?? '',
        material: it.material ?? '',
        usoFuncion: it.mainUse ?? '',
        cantidad: Number(it.quantity ?? 0),
        tipoUnidad: it.unitType ?? 'pcs',
        paisOrigen: it.countryOfOrigin ?? 'CHINA',
        paisAdquisicion: it.countryOfAcquisition ?? 'CHINA',
        precioUnitario: Number(it.unitPrice ?? 0),
        precioTotal: Number(it.totalPrice ?? 0),
        partidaArancelaria: it.suggestedHsCode ?? '',
      }));

      if (items.length === 0) {
        alert('No hay productos para generar el Excel.');
        return;
      }

      // ─── Style constants ───
      const GREEN_FILL: ExcelJS.FillPattern = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF339966' },
      };

      const WHITE_FILL: ExcelJS.FillPattern = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFFFF' },
      };

      const FONT_TITLE: Partial<ExcelJS.Font> = {
        name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' },
      };

      const FONT_SECTION: Partial<ExcelJS.Font> = {
        name: 'Calibri', size: 9, bold: true, color: { argb: 'FFFFFFFF' },
      };

      const FONT_LABEL: Partial<ExcelJS.Font> = {
        name: 'Calibri', size: 8, bold: true, color: { argb: 'FF000000' },
      };

      const FONT_VALUE: Partial<ExcelJS.Font> = {
        name: 'Calibri', size: 8, bold: true, color: { argb: 'FF000000' },
      };

      const FONT_VALUE_ARIAL: Partial<ExcelJS.Font> = {
        name: 'Arial', size: 8, bold: true,
      };

      const FONT_HEADER: Partial<ExcelJS.Font> = {
        name: 'Calibri', size: 8, bold: true, color: { argb: 'FFFFFFFF' },
      };

      const FONT_HEADER_9: Partial<ExcelJS.Font> = {
        name: 'Calibri', size: 9, bold: true, color: { argb: 'FFFFFFFF' },
      };

      const FONT_OPTION: Partial<ExcelJS.Font> = {
        name: 'Calibri', size: 9, bold: true, color: { argb: 'FF000000' },
      };

      const FONT_OPTION_8: Partial<ExcelJS.Font> = {
        name: 'Calibri', size: 8, bold: true, color: { argb: 'FF000000' },
      };

      const THIN_BORDER: Partial<ExcelJS.Borders> = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };

      const ALIGN_CENTER: Partial<ExcelJS.Alignment> = {
        horizontal: 'center', vertical: 'middle', wrapText: true,
      };

      const ALIGN_LEFT: Partial<ExcelJS.Alignment> = {
        horizontal: 'left', vertical: 'middle', wrapText: true,
      };

      // Helper to mark (X) or ( ) for checkbox-style fields
      const check = (value: string, option: string) =>
        value.toUpperCase() === option.toUpperCase() ? `${option}  (X)` : `${option} ()`;

      const checkSiNo = (value: string) => {
        const isYes = value.toUpperCase() === 'SI' || value.toUpperCase() === 'YES';
        return {
          si: isYes ? 'SI (X)' : 'SI (  )',
          no: !isYes ? 'NO (X)' : 'NO (  )',
        };
      };

      // ─── Row 1: spacer ───
      ws.getRow(1).height = 9.75;

      // ─── Row 2: TITLE "TRADUCCION DE FACTURA" ───
      ws.mergeCells('B2:N2');
      const titleCell = ws.getCell('B2');
      titleCell.value = 'TRADUCCION DE FACTURA';
      titleCell.font = FONT_TITLE;
      titleCell.fill = GREEN_FILL;
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      titleCell.border = { left: { style: 'thin' }, right: { style: 'thin' }, top: { style: 'thin' } };
      ws.getRow(2).height = 16.5;

      // ─── Row 3: spacer ───
      ws.getRow(3).height = 9.75;

      // ─── Rows 4-8: INFORMACION DE FACTURA ───
      ws.mergeCells('B4:C8');
      const secFactura = ws.getCell('B4');
      secFactura.value = 'INFORMACION DE FACTURA';
      secFactura.font = FONT_SECTION;
      secFactura.fill = GREEN_FILL;
      secFactura.alignment = ALIGN_CENTER;
      secFactura.border = THIN_BORDER;

      // Row 4: Nº FACTURA
      ws.getCell('E4').value = 'Nº FACTURA';
      ws.getCell('E4').font = FONT_LABEL;
      ws.getCell('E4').alignment = ALIGN_LEFT;
      ws.getCell('E4').border = { right: { style: 'thin' }, top: { style: 'thin' }, bottom: { style: 'thin' } };
      ws.mergeCells('F4:G4');
      ws.getCell('F4').value = h.factura.numero;
      ws.getCell('F4').font = FONT_VALUE;
      ws.getCell('F4').border = THIN_BORDER;
      ws.getCell('F4').alignment = { horizontal: 'left', vertical: 'middle' };
      ws.getRow(4).height = 12.75;

      // Row 5: INCOTERMS
      ws.getCell('E5').value = 'INCOTERMS  ';
      ws.getCell('E5').font = FONT_LABEL;
      ws.getCell('E5').alignment = ALIGN_LEFT;
      ws.getCell('E5').border = { right: { style: 'thin' }, top: { style: 'thin' }, bottom: { style: 'thin' } };
      ws.mergeCells('F5:G5');
      ws.getCell('F5').value = h.factura.incoterms;
      ws.getCell('F5').font = FONT_VALUE;
      ws.getCell('F5').border = THIN_BORDER;
      ws.getCell('F5').alignment = { horizontal: 'left' };
      ws.getRow(5).height = 12.75;

      // Row 6: PAIS ADQUISICION
      ws.getCell('E6').value = 'PAIS ADQUISICION ';
      ws.getCell('E6').font = FONT_LABEL;
      ws.getCell('E6').alignment = ALIGN_LEFT;
      ws.getCell('E6').border = { right: { style: 'thin' }, top: { style: 'thin' }, bottom: { style: 'thin' } };
      ws.mergeCells('F6:G6');
      ws.getCell('F6').value = h.factura.paisAdquisicion;
      ws.getCell('F6').font = FONT_VALUE;
      ws.getCell('F6').border = THIN_BORDER;
      ws.getCell('F6').alignment = { horizontal: 'left' };
      ws.getRow(6).height = 27.75;

      // Row 7: MONEDA
      ws.getCell('E7').value = 'MONEDA ';
      ws.getCell('E7').font = FONT_LABEL;
      ws.getCell('E7').alignment = ALIGN_LEFT;
      ws.getCell('E7').border = { right: { style: 'thin' }, top: { style: 'thin' }, bottom: { style: 'thin' } };
      ws.mergeCells('F7:G7');
      ws.getCell('F7').value = h.factura.moneda;
      ws.getCell('F7').font = FONT_VALUE;
      ws.getCell('F7').border = THIN_BORDER;
      ws.getCell('F7').alignment = { horizontal: 'left' };
      ws.getRow(7).height = 12.75;

      // Row 8: LUGAR DE ENTREGA
      ws.getCell('E8').value = 'LUGAR DE ENTREGA ';
      ws.getCell('E8').font = FONT_LABEL;
      ws.getCell('E8').alignment = ALIGN_LEFT;
      ws.getCell('E8').border = { right: { style: 'thin' }, top: { style: 'thin' }, bottom: { style: 'thin' } };
      ws.mergeCells('F8:G8');
      ws.getCell('F8').value = h.factura.lugarEntrega;
      ws.getCell('F8').font = FONT_VALUE;
      ws.getCell('F8').border = THIN_BORDER;
      ws.getCell('F8').alignment = { horizontal: 'left' };
      ws.getRow(8).height = 27.75;

      // ─── Row 9: spacer ───
      ws.getRow(9).height = 9.75;

      // ─── Rows 10-17: INFORMACION DE PROVEEDOR ───
      ws.mergeCells('B10:C17');
      const secProveedor = ws.getCell('B10');
      secProveedor.value = 'INFORMACION DE PROVEEDOR';
      secProveedor.font = FONT_SECTION;
      secProveedor.fill = GREEN_FILL;
      secProveedor.alignment = ALIGN_CENTER;
      secProveedor.border = THIN_BORDER;

      // Row 10: VINCULACIÓN
      ws.getCell('E10').value = 'VINCULACIÓN';
      ws.getCell('E10').font = FONT_LABEL;
      ws.getCell('E10').alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
      ws.getCell('E10').border = { left: { style: 'thin' }, right: { style: 'thin' }, top: { style: 'thin' } };
      const vinc = checkSiNo(h.proveedor.vinculacion);
      ws.getCell('F10').value = vinc.si;
      ws.getCell('F10').font = FONT_OPTION;
      ws.getCell('F10').border = THIN_BORDER;
      ws.getCell('F10').alignment = { horizontal: 'left', vertical: 'middle' };
      ws.getCell('G10').value = vinc.no;
      ws.getCell('G10').font = FONT_OPTION_8;
      ws.getCell('G10').border = THIN_BORDER;
      ws.getCell('G10').alignment = { horizontal: 'left', vertical: 'middle' };
      ws.getRow(10).height = 12;

      // Row 11: RAZON SOCIAL
      ws.getCell('E11').value = 'RAZON SOCIAL';
      ws.getCell('E11').font = FONT_LABEL;
      ws.getCell('E11').alignment = ALIGN_LEFT;
      ws.getCell('E11').border = { right: { style: 'thin' }, top: { style: 'thin' }, bottom: { style: 'thin' } };
      ws.mergeCells('F11:G11');
      ws.getCell('F11').value = h.proveedor.razonSocial;
      ws.getCell('F11').font = FONT_VALUE;
      ws.getCell('F11').border = THIN_BORDER;
      ws.getCell('F11').alignment = { horizontal: 'left' };
      ws.getRow(11).height = 11.25;

      // Row 12: DOMICILIO
      ws.getCell('E12').value = 'DOMICILIO                             ';
      ws.getCell('E12').font = FONT_LABEL;
      ws.getCell('E12').alignment = ALIGN_LEFT;
      ws.getCell('E12').border = { right: { style: 'thin' }, top: { style: 'thin' }, bottom: { style: 'thin' } };
      ws.mergeCells('F12:G12');
      ws.getCell('F12').value = h.proveedor.domicilio;
      ws.getCell('F12').font = FONT_VALUE;
      ws.getCell('F12').border = THIN_BORDER;
      ws.getCell('F12').alignment = { horizontal: 'left' };
      ws.getRow(12).height = 37.5;

      // Row 13: CIUDAD / PAIS
      ws.getCell('E13').value = 'CIUDAD / PAIS              ';
      ws.getCell('E13').font = FONT_LABEL;
      ws.getCell('E13').alignment = ALIGN_LEFT;
      ws.getCell('E13').border = { right: { style: 'thin' }, top: { style: 'thin' }, bottom: { style: 'thin' } };
      ws.mergeCells('F13:G13');
      ws.getCell('F13').value = h.proveedor.ciudadPais;
      ws.getCell('F13').font = FONT_VALUE;
      ws.getCell('F13').border = THIN_BORDER;
      ws.getCell('F13').alignment = { horizontal: 'left' };
      ws.getRow(13).height = 12;

      // Row 14: CONTACTO
      ws.getCell('E14').value = 'CONTACTO';
      ws.getCell('E14').font = FONT_LABEL;
      ws.getCell('E14').alignment = ALIGN_LEFT;
      ws.getCell('E14').border = { right: { style: 'thin' }, top: { style: 'thin' }, bottom: { style: 'thin' } };
      ws.mergeCells('F14:G14');
      ws.getCell('F14').value = h.proveedor.contacto;
      ws.getCell('F14').font = FONT_VALUE;
      ws.getCell('F14').border = THIN_BORDER;
      ws.getCell('F14').alignment = { horizontal: 'left' };
      ws.getRow(14).height = 12;

      // Row 15: TELEFONO
      ws.getCell('E15').value = 'TELEFONO ';
      ws.getCell('E15').font = FONT_LABEL;
      ws.getCell('E15').alignment = ALIGN_LEFT;
      ws.getCell('E15').border = { right: { style: 'thin' }, top: { style: 'thin' }, bottom: { style: 'thin' } };
      ws.mergeCells('F15:G15');
      ws.getCell('F15').value = h.proveedor.telefono;
      ws.getCell('F15').font = FONT_VALUE;
      ws.getCell('F15').border = THIN_BORDER;
      ws.getCell('F15').alignment = { horizontal: 'left' };
      ws.getRow(15).height = 12;

      // Rows 16-17: CONDICIÓN
      ws.mergeCells('E16:E17');
      ws.getCell('E16').value = 'CONDICIÓN';
      ws.getCell('E16').font = FONT_LABEL;
      ws.getCell('E16').alignment = ALIGN_LEFT;
      ws.getCell('E16').border = THIN_BORDER;

      const cond = h.proveedor.condicion.toUpperCase();
      ws.getCell('F16').value = check('FABRICANTE', cond === 'FABRICANTE' ? 'FABRICANTE' : '').replace('()', '()') || 'FABRICANTE  ()';
      ws.getCell('F16').value = cond === 'FABRICANTE' ? 'FABRICANTE  (X)' : 'FABRICANTE  ()';
      ws.getCell('F16').font = FONT_OPTION;
      ws.getCell('F16').border = THIN_BORDER;
      ws.getCell('F16').alignment = { horizontal: 'left' };

      ws.getCell('G16').value = cond === 'COMERCIANTE' ? 'COMERCIANTE (X)' : 'COMERCIANTE ()';
      ws.getCell('G16').font = FONT_OPTION_8;
      ws.getCell('G16').fill = WHITE_FILL;
      ws.getCell('G16').border = THIN_BORDER;
      ws.getCell('G16').alignment = { horizontal: 'left' };

      ws.getCell('F17').value = cond === 'DISTRIBUIDOR' ? 'DISTRIBUIDOR (X)' : 'DISTRIBUIDOR ()';
      ws.getCell('F17').font = FONT_OPTION;
      ws.getCell('F17').border = THIN_BORDER;
      ws.getCell('F17').alignment = { horizontal: 'left' };

      ws.getCell('G17').value = cond === 'OTROS' ? 'OTROS (X) DETALLAR' : 'OTROS (  ) DETALLAR';
      ws.getCell('G17').font = FONT_OPTION_8;
      ws.getCell('G17').border = THIN_BORDER;
      ws.getCell('G17').alignment = { horizontal: 'left' };

      ws.getRow(16).height = 12;
      ws.getRow(17).height = 12;

      // ─── Row 18: spacer ───
      ws.getRow(18).height = 9.75;

      // ─── Rows 19-23: INFORMACION SOBRE LA TRANSACCIÓN ───
      ws.mergeCells('B19:C23');
      const secTransaccion = ws.getCell('B19');
      secTransaccion.value = 'INFORMACION SOBRE LA TRANSACCIÓN';
      secTransaccion.font = FONT_SECTION;
      secTransaccion.fill = GREEN_FILL;
      secTransaccion.alignment = ALIGN_CENTER;
      secTransaccion.border = THIN_BORDER;

      // Rows 19-20: FORMA DE PAGO
      ws.mergeCells('E19:E20');
      ws.getCell('E19').value = 'FORMA DE PAGO           ';
      ws.getCell('E19').font = FONT_LABEL;
      ws.getCell('E19').alignment = ALIGN_LEFT;
      ws.getCell('E19').border = { right: { style: 'thin' }, top: { style: 'thin' }, bottom: { style: 'thin' } };

      const fp = h.transaccion.formaPago.toUpperCase();
      ws.getCell('F19').value = fp === 'CONTADO' ? 'CONTADO  (x) ' : 'CONTADO  ( ) ';
      ws.getCell('F19').font = FONT_OPTION;
      ws.getCell('F19').border = THIN_BORDER;
      ws.getCell('F19').alignment = { horizontal: 'left' };

      ws.getCell('G19').value = fp === 'DIFERIDO' ? 'DIFERIDO (X)' : 'DIFERIDO ( )';
      ws.getCell('G19').font = FONT_OPTION_8;
      ws.getCell('G19').border = THIN_BORDER;
      ws.getCell('G19').alignment = { horizontal: 'left' };

      ws.mergeCells('F20:G20');
      ws.getCell('F20').value = fp !== 'CONTADO' && fp !== 'DIFERIDO' ? 'OTRAS FORMAS DE PAGO (X)' : 'OTRAS FORMAS DE PAGO (  )';
      ws.getCell('F20').font = FONT_OPTION_8;
      ws.getCell('F20').border = THIN_BORDER;
      ws.getCell('F20').alignment = { horizontal: 'left' };

      ws.getRow(19).height = 12;
      ws.getRow(20).height = 12;

      // Row 21: BANCO
      ws.getCell('E21').value = 'BANCO          ';
      ws.getCell('E21').font = FONT_LABEL;
      ws.getCell('E21').alignment = ALIGN_LEFT;
      ws.getCell('E21').border = { right: { style: 'thin' }, top: { style: 'thin' }, bottom: { style: 'thin' } };
      ws.mergeCells('F21:G21');
      ws.getCell('F21').value = h.transaccion.banco;
      ws.getCell('F21').font = FONT_VALUE;
      ws.getCell('F21').border = THIN_BORDER;
      ws.getCell('F21').alignment = { horizontal: 'left' };
      ws.getRow(21).height = 12;

      // Row 22: MEDIO DE PAGO
      ws.getCell('E22').value = 'MEDIO DE PAGO       ';
      ws.getCell('E22').font = FONT_LABEL;
      ws.getCell('E22').alignment = { vertical: 'middle', wrapText: true };
      ws.getCell('E22').border = { left: { style: 'thin' }, right: { style: 'thin' }, top: { style: 'thin' } };

      const mp = h.transaccion.medioPago.toUpperCase();
      ws.getCell('F22').value = mp === 'TRANSFERENCIA' ? 'TRANSFERENCIA (X)' : 'TRANSFERENCIA ( )';
      ws.getCell('F22').font = FONT_OPTION;
      ws.getCell('F22').border = THIN_BORDER;
      ws.getCell('F22').alignment = { horizontal: 'left' };

      ws.getCell('G22').value = mp !== 'TRANSFERENCIA' ? 'OTRO (X)' : 'OTRO ( )';
      ws.getCell('G22').font = FONT_OPTION_8;
      ws.getCell('G22').border = THIN_BORDER;
      ws.getCell('G22').alignment = { horizontal: 'left' };

      ws.getRow(22).height = 12;

      // Row 23: N° DE COMPROBANTE
      ws.getCell('E23').value = 'N° DE COMPROBANTE  ';
      ws.getCell('E23').font = FONT_LABEL;
      ws.getCell('E23').alignment = ALIGN_LEFT;
      ws.getCell('E23').border = { right: { style: 'thin' }, top: { style: 'thin' }, bottom: { style: 'thin' } };
      ws.mergeCells('F23:G23');
      ws.getCell('F23').value = h.transaccion.comprobante;
      ws.getCell('F23').font = FONT_VALUE;
      ws.getCell('F23').border = THIN_BORDER;
      ws.getCell('F23').alignment = { horizontal: 'left' };
      ws.getRow(23).height = 48;

      // ─── Row 24: spacer ───
      ws.getRow(24).height = 10.5;

      // ─── Rows 25-28: REPRESENTANTE LEGAL ───
      ws.mergeCells('B25:E25');
      ws.getCell('B25').value = 'NOMBRE -REPRESENTANTE LEGAL';
      ws.getCell('B25').font = FONT_SECTION;
      ws.getCell('B25').fill = GREEN_FILL;
      ws.getCell('B25').alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getCell('B25').border = THIN_BORDER;
      ws.mergeCells('F25:H25');
      ws.getCell('F25').value = h.representante.nombre;
      ws.getCell('F25').font = FONT_VALUE_ARIAL;
      ws.getCell('F25').border = THIN_BORDER;
      ws.getCell('F25').alignment = { horizontal: 'left' };
      ws.getRow(25).height = 13.5;

      ws.mergeCells('B26:E26');
      ws.getCell('B26').value = 'CARGO';
      ws.getCell('B26').font = FONT_SECTION;
      ws.getCell('B26').fill = GREEN_FILL;
      ws.getCell('B26').alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getCell('B26').border = THIN_BORDER;
      ws.getCell('F26').value = h.representante.cargo;
      ws.getCell('F26').font = FONT_VALUE_ARIAL;
      ws.getCell('F26').border = { left: { style: 'thin' }, top: { style: 'thin' }, bottom: { style: 'thin' } };
      ws.getCell('F26').alignment = { horizontal: 'left' };
      ws.getRow(26).height = 13.5;

      ws.mergeCells('B27:E27');
      ws.getCell('B27').value = 'DNI';
      ws.getCell('B27').font = FONT_SECTION;
      ws.getCell('B27').fill = GREEN_FILL;
      ws.getCell('B27').alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getCell('B27').border = THIN_BORDER;
      ws.getCell('F27').value = h.representante.dni;
      ws.getCell('F27').font = FONT_VALUE_ARIAL;
      ws.getCell('F27').border = { left: { style: 'thin' }, top: { style: 'thin' }, bottom: { style: 'thin' } };
      ws.getCell('F27').alignment = { horizontal: 'left' };
      ws.getRow(27).height = 13.5;

      ws.mergeCells('B28:E28');
      ws.getCell('B28').value = 'FIRMA-REPRESENTANTE LEGAL';
      ws.getCell('B28').font = FONT_SECTION;
      ws.getCell('B28').fill = GREEN_FILL;
      ws.getCell('B28').alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getCell('B28').border = THIN_BORDER;
      ws.mergeCells('F28:G28');
      ws.getCell('F28').border = THIN_BORDER;
      ws.getRow(28).height = 71.25;

      // ─── Row 29: spacer ───
      ws.getRow(29).height = 15;

      // ─── Row 30: TABLE HEADERS ───
      const headers = [
        { col: 'B', text: 'ITEM', font: FONT_HEADER },
        { col: 'C', text: 'MARCA', font: FONT_HEADER },
        { col: 'D', text: 'NUEVO O USADO', font: FONT_HEADER },
        { col: 'E', text: 'MODELO', font: FONT_HEADER },
        { col: 'F', text: 'NOMBRE COMERCIAL (PRODUCTO)', font: FONT_HEADER_9 },
        { col: 'G', text: 'DESCRIPCIONES MINIMAS', font: FONT_HEADER },
        { col: 'H', text: 'MATERIAL', font: FONT_HEADER },
        { col: 'I', text: 'USO O FUNCION PRINCIPAL', font: FONT_HEADER },
        { col: 'J', text: 'CANTIDAD COMERCIAL', font: FONT_HEADER },
        { col: 'K', text: 'TIPO DE UNIDAD', font: FONT_HEADER },
        { col: 'L', text: 'PAIS DE ORIGEN', font: FONT_HEADER },
        { col: 'M', text: 'PAIS DE ADQUISICIÓN', font: FONT_HEADER },
        { col: 'N', text: 'ESTADO', font: FONT_HEADER },
        { col: 'O', text: 'UNIT PRICE', font: FONT_HEADER },
        { col: 'P', text: 'TOTAL PRICE', font: FONT_HEADER },
        { col: 'Q', text: 'PARTIDA SUGERIDA', font: FONT_HEADER },
      ];

      headers.forEach(({ col, text, font }) => {
        const cell = ws.getCell(`${col}30`);
        cell.value = text;
        cell.font = font;
        cell.fill = GREEN_FILL;
        cell.alignment = ALIGN_CENTER;
        cell.border = THIN_BORDER;
      });
      ws.getRow(30).height = 20.25;

      // ─── Rows 31+: PRODUCT DATA ───
      const DATA_FONT: Partial<ExcelJS.Font> = {
        name: 'Calibri', size: 8,
      };

      const DATA_ALIGN_CENTER: Partial<ExcelJS.Alignment> = {
        horizontal: 'center', vertical: 'middle', wrapText: true,
      };

      const DATA_ALIGN_LEFT: Partial<ExcelJS.Alignment> = {
        horizontal: 'left', vertical: 'middle', wrapText: true,
      };

      items.forEach((item, index) => {
        const rowNum = 31 + index;
        const row = ws.getRow(rowNum);
        row.height = 19.5;

        const values: { col: string; value: string | number; align?: Partial<ExcelJS.Alignment> }[] = [
          { col: 'B', value: item.item, align: DATA_ALIGN_CENTER },
          { col: 'C', value: item.marca, align: DATA_ALIGN_CENTER },
          { col: 'D', value: String(item.estado).toUpperCase(), align: DATA_ALIGN_CENTER },
          { col: 'E', value: item.modelo, align: DATA_ALIGN_LEFT },
          { col: 'F', value: item.nombreComercial, align: DATA_ALIGN_LEFT },
          { col: 'G', value: item.descripcion, align: DATA_ALIGN_LEFT },
          { col: 'H', value: item.material, align: DATA_ALIGN_LEFT },
          { col: 'I', value: item.usoFuncion, align: DATA_ALIGN_LEFT },
          { col: 'J', value: item.cantidad, align: DATA_ALIGN_CENTER },
          { col: 'K', value: item.tipoUnidad, align: DATA_ALIGN_CENTER },
          { col: 'L', value: item.paisOrigen, align: DATA_ALIGN_CENTER },
          { col: 'M', value: item.paisAdquisicion, align: DATA_ALIGN_CENTER },
          { col: 'N', value: String(item.estado).toUpperCase(), align: DATA_ALIGN_CENTER },
          { col: 'O', value: item.precioUnitario, align: DATA_ALIGN_CENTER },
          { col: 'P', value: item.precioTotal, align: DATA_ALIGN_CENTER },
          { col: 'Q', value: item.partidaArancelaria, align: DATA_ALIGN_CENTER },
        ];

        values.forEach(({ col, value, align }) => {
          const cell = ws.getCell(`${col}${rowNum}`);
          cell.value = value;
          cell.font = DATA_FONT;
          cell.alignment = align ?? DATA_ALIGN_CENTER;
          cell.border = THIN_BORDER;
        });
      });

      // ─── Generate and download ───
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const fileName = `TRADUCCION_FACTURA_${h.factura.numero || 'SIN_NUMERO'}.xlsx`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      console.error('Error generando Excel:', error);
      alert('Error al generar el archivo Excel. Revisa la consola para más detalles.');
    }
  }

  return (
    <Button variant="default" onClick={handleDownload}>
      {label}
    </Button>
  );
}
