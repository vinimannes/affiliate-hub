import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  name: z.string(),
  slug: z.string(),
  shopDomain: z.string(),
  apiKey: z.string(),
  apiPassword: z.string(),
  commissionPct: z.number(),
  discountPct: z.number()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const brand = await prisma.brand.create({ data });
    return NextResponse.json({ brand });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Invalid payload' }, { status: 400 });
  }
}
