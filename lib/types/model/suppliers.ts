export type Supplier = {
  id: number;
  name: string;
  address: string;
  phone: string;
  /** Display date of the most recent purchase order, or "—". */
  lastOrder: string;
};
