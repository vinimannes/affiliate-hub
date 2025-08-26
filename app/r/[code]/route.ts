import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: { code: string } }) {
  const aff = await prisma.affiliate.findUnique({ where: { code: params.code }, include: { brand: true } });
  if (!aff) return NextResponse.redirect(new URL('/', process.env.WEB_BASE_URL!));
  await prisma.click.create({ data: { affiliateId: aff.id } });
  const target = `https://${aff.brand.shopDomain}/discount/${params.code}?utm_source=aff&utm_campaign=${aff.code}`;
  return NextResponse.redirect(target);
}
