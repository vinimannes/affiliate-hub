import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createShopifyDiscount } from '@/lib/shopify';
import { nanoid } from 'nanoid';

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  brandSlug: z.string()
});

export async function POST(req: Request) {
  try {
    const { email, name, brandSlug } = schema.parse(await req.json());
    const brand = await prisma.brand.findUnique({ where: { slug: brandSlug } });
    if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 });

    const prefix = (name?.split(' ')[0] || 'AFF').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const code = `${prefix}-${nanoid(6).toUpperCase()}`;

    const affiliate = await prisma.affiliate.create({ data: { email, name, code, brandId: brand.id } });

    const discountCode = await createShopifyDiscount({
      shopDomain: brand.shopDomain,
      apiKey: brand.apiKey,
      apiPassword: brand.apiPassword,
      code: affiliate.code,
      discountPct: brand.discountPct,
    });

    await prisma.coupon.create({ data: { code: discountCode, brandId: brand.id, affiliateId: affiliate.id } });

    return NextResponse.json({
      affiliate,
      discountCode,
      shareUrl: `${process.env.WEB_BASE_URL}/r/${affiliate.code}`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Invalid payload' }, { status: 400 });
  }
}
