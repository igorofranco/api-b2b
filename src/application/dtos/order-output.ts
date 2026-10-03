export interface OrderItemOutput {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
}

export interface OrderOutput {
  id: string;
  customerId: string;
  status: string;
  totalCents: number;
  idempotencyKey: string;
  items: OrderItemOutput[];
  createdAt: string;
}
