import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  ctx: { params: { slug: string } }
) {
  try {
    const brand = await prisma.brand.findUnique({ where: { slug: ctx.params.slug } });
    return NextResponse.json({ ok: true, brand });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}