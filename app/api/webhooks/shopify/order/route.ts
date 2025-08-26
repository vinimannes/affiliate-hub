import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const shopifyOrderId = String(payload.id);
    const existing = await prisma.order.findUnique({ where: { shopifyOrderId } });
    if (existing) return NextResponse.json({ ok: true });

    const discounts = (payload.discount_codes as { code: string }[] | undefined) || [];
    const code = discounts[0]?.code;
    const coupon = code ? await prisma.coupon.findUnique({ where: { code } }) : null;

    let brandId = coupon?.brandId || null;
    if (!brandId && typeof payload.order_status_url === 'string') {
      try {
        const u = new URL(payload.order_status_url);
        const host = u.host;
        const brand = await prisma.brand.findFirst({ where: { shopDomain: host } });
        if (brand) brandId = brand.id;
      } catch {}
    }

    await prisma.order.create({
      data: {
        brandId: brandId || (coupon?.brandId ?? ''),
        affiliateId: coupon?.affiliateId || null,
        shopifyOrderId,
        subtotal: Number(payload.current_subtotal_price_set?.shop_money?.amount ||
          payload.subtotal_price || 0),
        discountCode: code || null,
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Bad webhook' }, { status: 400 });
  }
}
