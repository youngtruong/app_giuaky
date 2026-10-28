export const categories = [
  'Khai vị',
  'Món chính',
  'Tráng miệng',
  'Đồ uống',
] as const;
export type Category = (typeof categories)[number];
export type Dish = {
  id: string;
  name: string;
  category: Category;
  price: number;
  available: boolean;
};
export type InvoiceItem = {
  dishId: string;
  quantity: number;
  name?: string;
  unitPrice?: number;
};
export type Invoice = {
  id: string;
  tableNumber: number;
  items: InvoiceItem[];
  status: 'Đang phục vụ' | 'Đã thanh toán';
  createdAt: string;
  paidAt?: string;
  cash?: number;
};
export type RestaurantData = {
  version: 1;
  dishes: Dish[];
  invoices: Invoice[];
};
export type RootStackParams = {
  Home: undefined;
  DishForm: { dishId?: string } | undefined;
  Order: { tableNumber: number };
  Checkout: { invoiceId: string };
};
