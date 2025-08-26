import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, context: any) {
  const code = context?.params?.code as string;
  const aff = await prisma.affiliate.findUnique({
    where: { code },
    include: { brand: true }
  });

  if (!aff) return NextResponse.redirect(new URL('/', process.env.WEB_BASE_URL!));

  await prisma.click.create({ data: { affiliateId: aff.id } });

  const target = `https://${aff.brand.shopDomain}/discount/${code}?utm_source=aff&utm_campaign=${aff.code}`;
  return NextResponse.redirect(target);
}
