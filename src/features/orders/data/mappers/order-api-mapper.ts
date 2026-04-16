import type { DashboardOrderLine, DashboardOrderRecord, Money } from "@/src/core/types/dashboard";

type ApiMoney = {
  amount: number;
  currency: string;
  formatted: string;
};

type ApiOrderLine = {
  id: string;
  product_id: string;
  variant_id: string;
  title: string;
  variant_label: string;
  quantity: number;
  unit_price: ApiMoney;
};

export type ApiOrderRecord = {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  status: DashboardOrderRecord["status"];
  payment_provider: DashboardOrderRecord["paymentProvider"];
  total: ApiMoney;
  created_at: string;
  shipping_address: string;
  fulfillment_note: string;
  internal_note: string;
  lines: ApiOrderLine[];
};

export type ApiPaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function mapMoney(api: ApiMoney): Money {
  return {
    amount: api.amount,
    currency: api.currency as Money["currency"],
    formatted: api.formatted,
  };
}

function mapLine(api: ApiOrderLine): DashboardOrderLine {
  return {
    id: api.id,
    productId: api.product_id,
    variantId: api.variant_id,
    title: api.title,
    variantLabel: api.variant_label,
    quantity: api.quantity,
    unitPrice: mapMoney(api.unit_price),
  };
}

export function mapApiOrderToRecord(api: ApiOrderRecord): DashboardOrderRecord {
  return {
    id: api.id,
    orderNumber: api.order_number,
    customerId: api.customer_id,
    customerName: api.customer_name,
    customerEmail: api.customer_email,
    status: api.status,
    paymentProvider: api.payment_provider,
    total: mapMoney(api.total),
    createdAt: api.created_at,
    shippingAddress: api.shipping_address,
    fulfillmentNote: api.fulfillment_note,
    internalNote: api.internal_note,
    lines: api.lines.map(mapLine),
  };
}

