# Ảnh món ăn Bếp Nhà

Ảnh `food-atlas.png` được tạo bằng công cụ ImageGen tích hợp, dùng làm hình minh hoạ món ăn trong ứng dụng. Ảnh được đóng gói cục bộ, không gọi máy chủ ảnh khi chạy.

Bố cục: 4 cột × 2 hàng. Theo thứ tự: gỏi cuốn, chả giò, cơm gà, bò lúc lắc, chè hạt sen, bánh flan, trà đào, nước ép dưa hấu. `FoodPhoto` cắt vùng hiển thị bằng View khi render; file ảnh gốc được giữ nguyên.

Prompt đã dùng:

Use case: photorealistic-natural. Asset: food photography sprite atlas for a Vietnamese restaurant mobile app, landscape 2:1 aspect ratio, 2048x1024. Create exactly EIGHT equal square tiles in a precise FOUR COLUMN by TWO ROW grid. Absolutely no gaps, no gutters, no borders, no text, no letters, no watermark. Each square tile is an overhead appetizing editorial food photograph, whole ceramic plate/bowl centered in tile with comfortable margins, consistent warm ivory tabletop background and soft daylight. Tiles left-to-right: TOP ROW 1 Vietnamese fresh shrimp pork rice paper rolls with dipping sauce (goi cuon), 2 golden crispy fried spring rolls with lettuce (cha gio), 3 Hoi An chicken rice with yellow rice shredded chicken herbs, 4 Vietnamese shaking beef cubes with vegetables. BOTTOM ROW left-to-right: 5 lotus seed sweet soup in a bowl, 6 caramel flan dessert on a plate, 7 peach orange lemongrass iced tea in a glass, 8 watermelon juice in a tall glass with a watermelon slice. Every subject confined to its own exact square tile. Rich natural food colors, upscale restaurant photography, restrained tasteful styling.

## Ảnh súp cua

`crab-soup.png` được tạo bằng ImageGen tích hợp, dùng cho món có tên Súp cua (hỗ trợ chữ hoa/thường, có dấu/không dấu và khoảng trắng). Ảnh dùng chung ở thực đơn, gọi món và form sửa món; không thay đổi dữ liệu AsyncStorage.

Prompt:

Use case: photorealistic-natural. Asset type: square food thumbnail for Vietnamese restaurant mobile app. A beautiful bowl of Vietnamese crab soup (súp cua): thick translucent golden broth with delicate egg ribbons, real shredded white crab meat, corn kernels, small shiitake mushroom pieces, quail eggs, topped with a modest garnish of coriander and ground black pepper. Overhead editorial food photography, entire ivory ceramic bowl centered with comfortable margins on a warm ivory stone tabletop. Soft natural daylight, appetizing realistic textures, upscale restaurant styling, matching a warm overhead Vietnamese food photography collection. Square 1024x1024 composition. No text, no logos, no watermark, no hands, no multiple panels.
