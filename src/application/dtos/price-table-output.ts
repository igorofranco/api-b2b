export interface PriceTableItemOutput {
  productId: string;
  priceCents: number;
}

export interface PriceTableOutput {
  id: string;
  name: string;
  currency: string;
  validFrom: string;
  validTo: string | null;
  items: PriceTableItemOutput[];
  createdAt: string;
  updatedAt: string;
}
