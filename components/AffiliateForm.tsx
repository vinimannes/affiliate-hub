'use client';

import { useState } from 'react';

export default function AffiliateForm({ brandSlug }: { brandSlug: string }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [result, setResult] = useState<{ shareUrl: string; discountCode: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setResult(null);

    try {
      const res = await fetch('/api/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, brandSlug }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to create affiliate');

      setResult({ shareUrl: json.shareUrl, discountCode: json.discountCode });
    } catch (e: any) {
      setErr(e?.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <form onSubmit={onSubmit} className="grid gap-3">
        <input
          name="email"
          placeholder="Your email"
          className="border p-2"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          name="name"
          placeholder="Your name (optional)"
          className="border p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button disabled={loading} className="bg-black text-white px-4 py-2">
          {loading ? 'Generating…' : 'Get my link'}
        </button>
      </form>

      {err && <p className="text-red-600 mt-3">{err}</p>}

      {result && (
        <div className="mt-4 border p-3 rounded">
          <p><strong>Your link:</strong> <a href={result.shareUrl}>{result.shareUrl}</a></p>
          <p><strong>Your coupon:</strong> {result.discountCode}</p>
        </div>
      )}
    </div>
  );
}
