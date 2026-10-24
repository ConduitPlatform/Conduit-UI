import type {
  Customer,
  Product,
  Subscription,
  Transaction,
} from '@/lib/models/payments';

export function subscriptionUserId(s: Subscription): string {
  if (s.userId) return s.userId;
  const c = s.customer as Customer | string | undefined;
  if (c && typeof c === 'object') {
    const u = c.user;
    if (typeof u === 'string') return u;
    if (u && typeof u === 'object' && '_id' in u) {
      return String((u as { _id: string })._id);
    }
  }
  return '—';
}

export function subscriptionCustomerId(s: Subscription): string {
  if (s.customerId) return s.customerId;
  if (typeof s.customer === 'string') return s.customer;
  if (s.customer && typeof s.customer === 'object' && '_id' in s.customer) {
    return String((s.customer as { _id: string })._id);
  }
  return '—';
}

export function subscriptionCustomerLabel(s: Subscription): string {
  const c = s.customer;
  if (c && typeof c === 'object' && 'email' in c) {
    const email = (c as Customer).email;
    if (email) return email;
  }
  return subscriptionCustomerId(s);
}

export function entityProductName(entity: unknown): string {
  if (
    entity &&
    typeof entity === 'object' &&
    'name' in entity &&
    typeof (entity as Product).name === 'string'
  ) {
    return (entity as Product).name;
  }
  if (typeof entity === 'string') return entity;
  return '—';
}

export function subscriptionProductLabel(s: Subscription): string {
  return entityProductName(s.product);
}

export function formatTransactionProducts(tx: Transaction): string {
  if (tx.products?.length) {
    const names = tx.products.map(line => entityProductName(line.product));
    const first = names[0] ?? '—';
    if (names.length === 1) return first;
    return `${first} (+${names.length - 1})`;
  }
  return entityProductName(tx.product);
}

export function transactionDisplayCurrency(tx: Transaction): string {
  const line = tx.products?.[0]?.product;
  if (line && typeof line === 'object' && 'currency' in line) {
    return (line as Product).currency;
  }
  const p = tx.product;
  if (p && typeof p === 'object' && 'currency' in p) {
    return (p as Product).currency;
  }
  return 'USD';
}

export function toDatetimeLocalValue(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDatetimeLocalValue(s: string): string | undefined {
  if (!s.trim()) return undefined;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}
