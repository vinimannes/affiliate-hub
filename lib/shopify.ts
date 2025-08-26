// lib/shopify.ts
import axios from 'axios';

type Params = {
  shopDomain: string;      // ex: c0aj3b-46.myshopify.com
  apiKey: string;          // não usado no fluxo REST moderno, pode deixar salvo
  apiPassword: string;     // Admin API access token (use no header)
  code: string;            // ex: AFF-ABC123
  discountPct: number;     // ex: 10
};

export async function createShopifyDiscount({ shopDomain, apiKey, apiPassword, code, discountPct }: Params) {
  const base = `https://${shopDomain}/admin/api/${process.env.SHOPIFY_API_VERSION}`;

  const headers = {
    'X-Shopify-Access-Token': apiPassword,  // << autenticação correta
    'Content-Type': 'application/json',
  };

  // 1) Cria a Price Rule
  const ruleRes = await axios.post(
    `${base}/price_rules.json`,
    {
      price_rule: {
        title: `AFF-${code}`,
        target_type: 'line_item',
        target_selection: 'all',
        allocation_method: 'across',
        value_type: 'percentage',
        value: `-${discountPct}`,
        customer_selection: 'all',
        starts_at: new Date().toISOString()
      }
    },
    { headers }
  );

  const ruleId = ruleRes.data?.price_rule?.id;

  // 2) Cria o Discount Code vinculado à rule
  const codeRes = await axios.post(
    `${base}/price_rules/${ruleId}/discount_codes.json`,
    { discount_code: { code } },
    { headers }
  );

  return codeRes.data.discount_code.code as string;
}
