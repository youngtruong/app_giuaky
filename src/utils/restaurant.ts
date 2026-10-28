import { categories, Dish, Invoice, RestaurantData } from '../types';

export const money = (value: number) =>
  `${Math.round(value).toLocaleString('vi-VN')} đ`;
const pad = (n: number) => String(n).padStart(2, '0');
export function timestamp(date = new Date()) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())} ${pad(
    date.getDate(),
  )}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}
export const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
export const normalizeName = (name: string) =>
  name.trim().normalize('NFC').toLocaleLowerCase('vi-VN');
export const servingInvoice = (data: RestaurantData, table: number) =>
  data.invoices.find(
    i => i.tableNumber === table && i.status === 'Đang phục vụ',
  );

export function validateDish(
  name: string,
  priceText: string,
  dishes: Dish[],
  currentId?: string,
) {
  const price = Number(priceText.trim());
  return {
    name: !name.trim()
      ? 'Vui lòng nhập tên món.'
      : dishes.some(
          d =>
            d.id !== currentId && normalizeName(d.name) === normalizeName(name),
        )
      ? 'Tên món đã tồn tại.'
      : '',
    price:
      !priceText.trim() ||
      !Number.isSafeInteger(price) ||
      price <= 0 ||
      price % 1000 !== 0
        ? 'Giá phải lớn hơn 0 và là bội số của 1.000 đ.'
        : '',
  };
}

export function invoiceLines(invoice: Invoice, dishes: Dish[]) {
  return invoice.items.map(item => {
    const dish = dishes.find(d => d.id === item.dishId);
    const name = item.name ?? dish?.name ?? 'Món đã xoá';
    const unitPrice = item.unitPrice ?? dish?.price ?? 0;
    return { ...item, name, unitPrice, amount: unitPrice * item.quantity };
  });
}
export function totals(invoice: Invoice, dishes: Dish[]) {
  const subtotal = invoiceLines(invoice, dishes).reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const vat = Math.round(subtotal * 0.08);
  return { subtotal, vat, total: subtotal + vat };
}

export function saveDish(
  data: RestaurantData,
  draft: Omit<Dish, 'id'>,
  id = newId(),
): RestaurantData {
  const errors = validateDish(draft.name, String(draft.price), data.dishes, id);
  if (errors.name || errors.price) {
    throw new Error(errors.name || errors.price);
  }
  if (!categories.includes(draft.category)) {
    throw new Error('Loại món không hợp lệ.');
  }
  const dish = { ...draft, name: draft.name.trim(), id };
  return {
    ...data,
    dishes: data.dishes.some(d => d.id === id)
      ? data.dishes.map(d => (d.id === id ? dish : d))
      : [...data.dishes, dish],
  };
}
export function deleteDish(data: RestaurantData, id: string): RestaurantData {
  if (
    data.invoices.some(
      i =>
        i.status === 'Đang phục vụ' && i.items.some(item => item.dishId === id),
    )
  ) {
    throw new Error(
      'Món này đang có trong hoá đơn đang phục vụ. Hãy thanh toán trước khi xoá.',
    );
  }
  return { ...data, dishes: data.dishes.filter(d => d.id !== id) };
}
export function changeQuantity(
  data: RestaurantData,
  table: number,
  dishId: string,
  delta: number,
): RestaurantData {
  if (!Number.isInteger(table) || table < 1 || table > 10) {
    throw new Error('Số bàn không hợp lệ.');
  }
  const dish = data.dishes.find(d => d.id === dishId);
  if (!dish) {
    throw new Error('Món không tồn tại.');
  }
  if (delta > 0 && !dish.available) {
    throw new Error('Món này đã hết, không thể gọi thêm.');
  }
  if (delta !== 1 && delta !== -1) {
    throw new Error('Số lượng không hợp lệ.');
  }
  const existing = servingInvoice(data, table);
  const invoice: Invoice = existing ?? {
    id: newId(),
    tableNumber: table,
    items: [],
    status: 'Đang phục vụ',
    createdAt: timestamp(),
  };
  const current = invoice.items.find(i => i.dishId === dishId);
  const quantity = (current?.quantity ?? 0) + delta;
  if (quantity < 0) {
    return data;
  }
  const items = invoice.items.filter(i => i.dishId !== dishId);
  if (quantity > 0) {
    items.push({ dishId, quantity });
  }
  const others = data.invoices.filter(i => i.id !== invoice.id);
  return {
    ...data,
    invoices: items.length ? [...others, { ...invoice, items }] : others,
  };
}
export function payInvoice(
  data: RestaurantData,
  id: string,
  cash: number,
): RestaurantData {
  const invoice = data.invoices.find(i => i.id === id);
  if (!invoice || invoice.status !== 'Đang phục vụ') {
    throw new Error('Hoá đơn đã thanh toán hoặc không tồn tại.');
  }
  const { total } = totals(invoice, data.dishes);
  if (!invoice.items.length || !Number.isSafeInteger(cash) || cash < total) {
    throw new Error('Tiền khách đưa chưa đủ hoặc hoá đơn chưa có món.');
  }
  const paid: Invoice = {
    ...invoice,
    status: 'Đã thanh toán',
    cash,
    paidAt: timestamp(),
    items: invoiceLines(invoice, data.dishes).map(
      ({ dishId, quantity, name, unitPrice }) => ({
        dishId,
        quantity,
        name,
        unitPrice,
      }),
    ),
  };
  return {
    ...data,
    invoices: data.invoices.map(i => (i.id === id ? paid : i)),
  };
}
