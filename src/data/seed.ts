import { RestaurantData } from '../types';
import { timestamp } from '../utils/restaurant';

export function seedData(): RestaurantData {
  return {
    version: 1,
    dishes: [
      {
        id: 'd1',
        name: 'Gỏi cuốn tôm thịt',
        category: 'Khai vị',
        price: 45000,
        available: true,
      },
      {
        id: 'd2',
        name: 'Chả giò giòn',
        category: 'Khai vị',
        price: 55000,
        available: true,
      },
      {
        id: 'd3',
        name: 'Cơm gà Hội An',
        category: 'Món chính',
        price: 75000,
        available: true,
      },
      {
        id: 'd4',
        name: 'Bò lúc lắc',
        category: 'Món chính',
        price: 125000,
        available: true,
      },
      {
        id: 'd5',
        name: 'Chè hạt sen',
        category: 'Tráng miệng',
        price: 30000,
        available: true,
      },
      {
        id: 'd6',
        name: 'Bánh flan',
        category: 'Tráng miệng',
        price: 25000,
        available: false,
      },
      {
        id: 'd7',
        name: 'Trà đào cam sả',
        category: 'Đồ uống',
        price: 35000,
        available: true,
      },
      {
        id: 'd8',
        name: 'Nước ép dưa hấu',
        category: 'Đồ uống',
        price: 40000,
        available: true,
      },
    ],
    invoices: [
      {
        id: 'seed-invoice',
        tableNumber: 3,
        items: [
          { dishId: 'd3', quantity: 2 },
          { dishId: 'd7', quantity: 2 },
        ],
        status: 'Đang phục vụ',
        createdAt: timestamp(),
      },
    ],
  };
}
