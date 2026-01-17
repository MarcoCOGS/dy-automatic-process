import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const nonEmptyTrimmed = z
  .string()
  .transform((s) => s.trim())
  .refine((s) => s.length >= 0, 'Required');

const zNumberLike = z.union([z.number(), z.string()]).transform((v) => {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) throw new Error('Invalid number');
  return n;
});

const zIntLike = zNumberLike.transform((n) => Math.trunc(n));

const EstadoProducto = z.enum(['nuevo', 'usado', 'reacondicionado']);
const ConfianzaClasificacion = z.enum(['alta', 'media', 'baja']);

const ItemSchema = z.object({
  item: zIntLike,
  marca: nonEmptyTrimmed,
  modelo: nonEmptyTrimmed,
  nombre_comercial: nonEmptyTrimmed,
  descripcion_minima: nonEmptyTrimmed,
  material: nonEmptyTrimmed,
  uso_funcion: nonEmptyTrimmed,
  cantidad: zIntLike,
  tipo_unidad: nonEmptyTrimmed,
  pais_origen: nonEmptyTrimmed,
  pais_adquisicion: nonEmptyTrimmed,
  estado: z.union([EstadoProducto, nonEmptyTrimmed]),
  precio_unitario: zNumberLike,
  precio_total: zNumberLike,
  partida_arancelaria: nonEmptyTrimmed,
  descripcion_partida: nonEmptyTrimmed,
  capitulo: nonEmptyTrimmed,
  subcapitulo: nonEmptyTrimmed,
  confianza_clasificacion: z.union([ConfianzaClasificacion, nonEmptyTrimmed]),
  razonamiento_clasificacion: nonEmptyTrimmed,
});

const PayloadSchema = z.object({
  items: z.array(ItemSchema).min(1),
  invoiceId: nonEmptyTrimmed,
  invoiceCode: nonEmptyTrimmed,
  total_productos: zIntLike,
  resumen: z.object({
    total_cantidad: zIntLike,
    total_valor: zNumberLike,
  }),

  invoiceInfo: z.object({
    numero_factura: nonEmptyTrimmed,
    incoterms: nonEmptyTrimmed,
    pais_adquisicion: nonEmptyTrimmed,
    moneda: nonEmptyTrimmed,
    lugar_entrega: z.string().optional().default('').transform((s) => s.trim()),
  }),

  supplierInfo: z.object({
    vinculacion: nonEmptyTrimmed,
    razon_social: z.string().optional().default('').transform((s) => s.trim()),
    domicilio: z.string().optional().default('').transform((s) => s.trim()),
    ciudad_pais: z.string().optional().default('').transform((s) => s.trim()),
    contacto: z.string().optional().default('').transform((s) => s.trim()),
    telefono: z.string().optional().default('').transform((s) => s.trim()),
    condicion: nonEmptyTrimmed,
  }),

  transactionInfo: z.object({
    forma_pago: nonEmptyTrimmed,
    banco: z.string().optional().default('').transform((s) => s.trim()),
    medio_pago: nonEmptyTrimmed,
    numero_comprobante: z.string().optional().default('').transform((s) => s.trim()),
  }),

  legalRepresentativeInfo: z.object({
    nombre: nonEmptyTrimmed,
    cargo: nonEmptyTrimmed,
    dni: nonEmptyTrimmed,
  }),
});

type PayloadBody = z.infer<typeof PayloadSchema>;

export async function POST(req: Request) {
  let raw: unknown;

  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Body inválido: se esperaba JSON.' }, { status: 400 });
  }

  const parsed = PayloadSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Payload inválido.',
        issues: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      },
      { status: 422 },
    );
  }

  const body: PayloadBody = parsed.data;

  // ✅ por ahora hardcode
  const organizationId = 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6';

  const invoiceInfo = {
    invoiceNumber: body.invoiceInfo.numero_factura,
    incoterms: body.invoiceInfo.incoterms,
    acquisitionCountry: body.invoiceInfo.pais_adquisicion,
    currency: body.invoiceInfo.moneda,
    deliveryPlace: body.invoiceInfo.lugar_entrega || undefined,
  };

  const supplierInfo = {
    affiliation: body.supplierInfo.vinculacion,
    legalName: body.supplierInfo.razon_social || undefined,
    address: body.supplierInfo.domicilio || undefined,
    cityCountry: body.supplierInfo.ciudad_pais || undefined,
    contactName: body.supplierInfo.contacto || undefined,
    phoneNumber: body.supplierInfo.telefono || undefined,
    condition: body.supplierInfo.condicion,
  };

  const transactionInfo = {
    paymentMethod: body.transactionInfo.forma_pago,
    bank: body.transactionInfo.banco || undefined,
    paymentChannel: body.transactionInfo.medio_pago,
    receiptNumber: body.transactionInfo.numero_comprobante || undefined,
  };

  const legalRepresentativeInfo = {
    fullName: body.legalRepresentativeInfo.nombre,
    position: body.legalRepresentativeInfo.cargo,
    nationalId: body.legalRepresentativeInfo.dni,
  };

  const rows = body.items.map((p) => ({
    invoiceId: body.invoiceId,
    itemCode: String(p.item),
    brand: p.marca,
    model: p.modelo,
    commercialName: p.nombre_comercial,
    description: p.descripcion_minima,
    material: p.material,
    mainUse: p.uso_funcion,
    quantity: p.cantidad,
    unitType: p.tipo_unidad,
    countryOfOrigin: p.pais_origen,
    countryOfAcquisition: p.pais_adquisicion,
    condition: String(p.estado).trim(),
    unitPrice: p.precio_unitario,
    totalPrice: p.precio_total,
    referenceCountry: p.pais_adquisicion,
    suggestedHsCode: p.partida_arancelaria,
  }));

  try {
    const insertedCount = await prisma.$transaction(async (tx) => {
      await tx.invoice.upsert({
        where: { id: body.invoiceId },
        create: {
          id: body.invoiceId,
          state: 'PENDING',
          invoiceCode: body.invoiceCode,
          page: 0,
          totalPage: 0,
          invoiceInfo,
          supplierInfo,
          transactionInfo,
          legalRepresentativeInfo,
          organization: { connect: { id: organizationId } },
        },
        update: {
          state: 'PENDING',
          invoiceInfo,
          supplierInfo,
          transactionInfo,
          legalRepresentativeInfo,
        },
      });

      const created = await tx.invoiceItem.createMany({
        data: rows,
      });

      await tx.invoice.update({
        where: { id: body.invoiceId },
        data: { state: 'DONE' },
      });

      return created.count;
    });

    return NextResponse.json({
      ok: true,
      invoiceId: body.invoiceId,
      insertedCount,
      received: {
        total_productos: body.total_productos,
        resumen: body.resumen,
      },
    });
  } catch (err) {
    await prisma.invoice
      .update({
        where: { id: body.invoiceId },
        data: { state: 'ERROR' },
      })
      .catch(() => {});

    return NextResponse.json(
      {
        ok: false,
        error: 'Error guardando en base de datos.',
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
