import { PDFDocument } from 'pdf-lib';

export async function splitPdfIntoSinglePages(file: File): Promise<File[]> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const src = await PDFDocument.load(bytes);

  const out: File[] = [];

  for (let i = 0; i < src.getPageCount(); i++) {
    const dst = await PDFDocument.create();
    const [page] = await dst.copyPages(src, [i]);
    dst.addPage(page);

    const singlePdfBytes = await dst.save();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = new Blob([singlePdfBytes as any as ArrayBuffer], { type: 'application/pdf' });

    // nombre: factura_p1.pdf, factura_p2.pdf, ...
    const baseName = file.name.replace(/\.pdf$/i, '');
    out.push(new File([blob], `${baseName}_p${i + 1}.pdf`, { type: 'application/pdf' }));
  }

  return out;
}
