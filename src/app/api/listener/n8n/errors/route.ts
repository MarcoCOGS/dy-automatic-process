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


const PayloadSchema = z.object({
  invoiceId: nonEmptyTrimmed,
  invoiceCode: nonEmptyTrimmed,
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

  const organizationId = 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6';

  try {
    await prisma.invoice.create({
      data: {
        id: body.invoiceId,
        invoiceCode: body.invoiceCode,
        state: 'ERROR',
        organization: {
          connect: { id: organizationId },
        },
      },
    });
    return NextResponse.json({
      ok: true,
      invoiceId: body.invoiceId,
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
