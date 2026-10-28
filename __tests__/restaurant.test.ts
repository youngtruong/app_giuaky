import { seedData } from '../src/data/seed';
import {
  changeQuantity,
  deleteDish,
  invoiceLines,
  payInvoice,
  saveDish,
  servingInvoice,
  timestamp,
  totals,
  validateDish,
} from '../src/utils/restaurant';

test('first launch has eight dishes across all four categories and one open bill', () => {
  const data = seedData();
  expect(data.dishes).toHaveLength(8);
  expect(new Set(data.dishes.map(d => d.category)).size).toBe(4);
  expect(data.invoices[0].status).toBe('Đang phục vụ');
  expect(timestamp(new Date(2026, 9, 28, 9, 5))).toBe('09:05 28/10/2026');
});
test('dish form rejects blank names, case-insensitive duplicates and invalid prices', () => {
  const { dishes } = seedData();
  expect(validateDish(' ', '45000', dishes).name).toBeTruthy();
  expect(
    validateDish('  GỎI CUỐN TÔM THỊT  ', '45000', dishes).name,
  ).toBeTruthy();
  for (const value of ['', '0', '-1000', '45001', 'abc', '1000.5']) {
    expect(validateDish('Món mới', value, dishes).price).toBeTruthy();
  }
  expect(validateDish(dishes[0].name, '45000', dishes, dishes[0].id)).toEqual({
    name: '',
    price: '',
  });
});
test('adding and editing share validation without duplicating a dish', () => {
  let data = saveDish(
    seedData(),
    { name: 'Súp cua', price: 35000, category: 'Khai vị', available: true },
    'new',
  );
  expect(data.dishes).toHaveLength(9);
  data = saveDish(
    data,
    {
      name: 'Súp cua nóng',
      price: 40000,
      category: 'Khai vị',
      available: false,
    },
    'new',
  );
  expect(data.dishes).toHaveLength(9);
  expect(data.dishes.find(d => d.id === 'new')?.price).toBe(40000);
});
test('cannot delete a dish in an open invoice', () => {
  expect(() => deleteDish(seedData(), 'd3')).toThrow('đang phục vụ');
  expect(deleteDish(seedData(), 'd1').dishes.some(d => d.id === 'd1')).toBe(
    false,
  );
});
test('additional orders reuse the same table invoice and update quantity immediately', () => {
  let data = changeQuantity(seedData(), 3, 'd3', 1);
  data = changeQuantity(data, 3, 'd1', 1);
  expect(data.invoices.filter(i => i.tableNumber === 3)).toHaveLength(1);
  expect(servingInvoice(data, 3)?.id).toBe('seed-invoice');
  expect(
    servingInvoice(data, 3)?.items.find(i => i.dishId === 'd3')?.quantity,
  ).toBe(3);
  expect(totals(servingInvoice(data, 3)!, data.dishes).subtotal).toBe(340000);
});
test('sold-out dishes cannot be added, but existing quantities may be reduced', () => {
  expect(() => changeQuantity(seedData(), 1, 'd6', 1)).toThrow('đã hết');
  const data = seedData();
  data.dishes.find(d => d.id === 'd3')!.available = false;
  expect(
    servingInvoice(changeQuantity(data, 3, 'd3', -1), 3)?.items[1].quantity,
  ).toBe(1);
});
test('removing the last portion removes the item and releases an empty table', () => {
  let data = changeQuantity(seedData(), 1, 'd1', 1);
  data = changeQuantity(data, 1, 'd1', -1);
  expect(servingInvoice(data, 1)).toBeUndefined();
});
test('payment calculates eight percent VAT and rejects insufficient cash and empty bills', () => {
  const data = seedData();
  expect(totals(data.invoices[0], data.dishes)).toEqual({
    subtotal: 220000,
    vat: 17600,
    total: 237600,
  });
  expect(() => payInvoice(data, 'seed-invoice', 237599)).toThrow();
  expect(() => payInvoice(data, 'seed-invoice', NaN)).toThrow();
  const empty = seedData();
  empty.invoices[0].items = [];
  expect(() => payInvoice(empty, 'seed-invoice', 100000)).toThrow();
});
test('payment releases table, prevents double payment and keeps immutable price and name snapshots', () => {
  let data = payInvoice(seedData(), 'seed-invoice', 300000);
  expect(servingInvoice(data, 3)).toBeUndefined();
  expect(() => payInvoice(data, 'seed-invoice', 300000)).toThrow();
  data = deleteDish(data, 'd3');
  data.dishes.find(d => d.id === 'd7')!.price = 99000;
  expect(invoiceLines(data.invoices[0], data.dishes)[0].name).toBe(
    'Cơm gà Hội An',
  );
  expect(totals(data.invoices[0], data.dishes).total).toBe(237600);
  expect(
    data.invoices[0].cash! - totals(data.invoices[0], data.dishes).total,
  ).toBe(62400);
  data = changeQuantity(data, 3, 'd1', 1);
  expect(data.invoices).toHaveLength(2);
  expect(servingInvoice(data, 3)?.id).not.toBe('seed-invoice');
});
