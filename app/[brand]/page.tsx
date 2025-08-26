import { prisma } from '@/lib/prisma';
import AffiliateForm from '@/components/AffiliateForm';

export default async function BrandPage({ params }: { params: any }) {
  const brand = await prisma.brand.findUnique({ where: { slug: params.brand } });
  if (!brand) return <main className="mx-auto max-w-2xl p-6">Brand not found</main>;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Become an affiliate of {brand.name}</h1>
      <p className="mt-2">Earn {brand.commissionPct}% commission. Your friends get {brand.discountPct}% off.</p>
      <AffiliateForm brandSlug={brand.slug} />
    </main>
  );
}
