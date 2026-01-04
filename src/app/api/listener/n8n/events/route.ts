// app/api/productos/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ✅ singleton Prisma (dev)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

type ConfianzaClasificacion = 'alta' | 'media' | 'baja';
type EstadoProducto = 'nuevo' | 'usado' | 'reacondicionado';

type Producto = {
  item: number;
  marca: string;
  modelo: string;
  nombre_comercial: string;
  descripcion_minima: string;
  material: string;
  uso_funcion: string;
  cantidad: number;
  tipo_unidad: string;
  pais_origen: string;
  pais_adquisicion: string;
  estado: EstadoProducto | string;
  precio_unitario: number;
  precio_total: number;
  partida_arancelaria: string;
  descripcion_partida: string;
  capitulo: string;
  subcapitulo: string;
  confianza_clasificacion: ConfianzaClasificacion | string;
  razonamiento_clasificacion: string;
};

type Resumen = { total_cantidad: number; total_valor: number };

// ✅ TU PAYLOAD REAL (sin items[])
type PayloadBody = {
  productos: Producto[];
  total_productos: number;
  resumen: Resumen;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
function isNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}
function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function validateProducto(p: unknown): p is Producto {
  if (!isObject(p)) return false;

  const requiredNumber = ['item', 'cantidad', 'precio_unitario', 'precio_total'] as const;
  const requiredString = [
    'marca',
    'modelo',
    'nombre_comercial',
    'descripcion_minima',
    'material',
    'uso_funcion',
    'tipo_unidad',
    'pais_origen',
    'pais_adquisicion',
    'estado',
    'partida_arancelaria',
    'descripcion_partida',
    'capitulo',
    'subcapitulo',
    'confianza_clasificacion',
    'razonamiento_clasificacion',
  ] as const;

  for (const k of requiredNumber) if (!isNumber(p[k])) return false;
  for (const k of requiredString) if (!isString(p[k])) return false;

  return true;
}

function validateBody(body: unknown): body is PayloadBody {
  if (!isObject(body)) return false;

  if (!Array.isArray(body.productos) || !body.productos.every(validateProducto)) return false;
  if (!isNumber(body.total_productos)) return false;

  if (!isObject(body.resumen)) return false;
  if (!isNumber(body.resumen.total_cantidad) || !isNumber(body.resumen.total_valor)) return false;

  return true;
}

export async function POST(req: Request) {
  let body: unknown;

  try {
    body = await req.json();
    console.log('aca 123', body)
  } catch {
    return NextResponse.json({ ok: false, error: 'Body inválido: se esperaba JSON.' }, { status: 400 });
  }

  if (!validateBody(body)) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Payload inválido: se esperaba { productos: Producto[], total_productos: number, resumen: {...} }.',
      },
      { status: 422 },
    );
  }

  // ✅ por ahora hardcode
  const organizationId = 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6';

  const batchId = uuidv4();

  // Aplanar productos -> rows
  const rows = body.productos.map((p) => ({
    itemNumber: p.item,
    brand: p.marca,
    model: p.modelo,
    commercialName: p.nombre_comercial,
    description: p.descripcion_minima,
    material: p.material,
    mainUse: p.uso_funcion,
    commercialQuantity: p.cantidad,
    unitType: p.tipo_unidad,
    countryOfOrigin: p.pais_origen,
    countryOfAcquisition: p.pais_adquisicion,
    condition: p.estado,
    unitPrice: p.precio_unitario,
    totalPrice: p.precio_total,
    referenceCountry: p.pais_adquisicion,
    suggestedHsCode: p.partida_arancelaria,
    batchId,
  }));

  try {
    const insertedCount = await prisma.$transaction(async (tx) => {
      // 1) crear batch (ajusta campos si tu schema exige más)
      await tx.classificationBatch.create({
        data: {
          id: batchId,
          groupId: '',
          state: '',
          page: 0,
          totalPage: 0,
          organization: { connect: { id: organizationId } },
          // Si tu batch tiene más campos NOT NULL, agrégalos aquí.
        },
      });

      // 2) insertar items
      const created = await tx.classificationItem.createMany({
        data: rows,
      });

      await tx.classificationBatch.update({
        where: { id: batchId },
        data: { state: 'DONE' },
      });

      return created.count;
    });

    return NextResponse.json({
      ok: true,
      batchId,
      insertedCount,
      // opcional: info del payload
      received: {
        total_productos: body.total_productos,
        resumen: body.resumen,
      },
    });
  } catch (err) {
      await prisma.classificationBatch.update({
        where: { id: batchId },
        data: { state: 'ERROR' },
      }).catch(() => {});
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
