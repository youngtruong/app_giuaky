# Bếp Nhà — Quản lý nhà hàng

Bài Đề 4, xây dựng trên dự án React Native CLI `AppGiuaKy` đã tạo ban đầu. Không dùng Expo hoặc thư viện UI dựng sẵn.

## Chức năng

- Thực đơn nhóm theo 4 loại bằng SectionList; giá tiền Việt; công tắc còn/hết món và thống kê số bàn có khách.
- Dùng chung form thêm/sửa qua Native Stack; chọn loại bằng nút; lỗi tên trống/trùng không phân biệt hoa thường và giá không hợp lệ hiển thị dưới ô nhập.
- Nhấn giữ tên món để xoá, có Alert xác nhận; không xoá được món thuộc hoá đơn đang phục vụ.
- Lưới 10 bàn bằng FlatList; gọi thêm vào cùng hoá đơn; tăng/giảm số lượng, xác nhận khi bỏ phần cuối; món hết không gọi thêm được.
- Chi tiết hoá đơn, VAT 8%, tiền khách đưa, tiền thừa và chặn thanh toán thiếu tiền. Thanh toán xong trả bàn trống.
- Lưu thực đơn và hoá đơn bằng AsyncStorage. Chỉ khởi tạo dữ liệu mẫu khi chưa có dữ liệu lưu: 8 món đủ 4 loại và 1 hoá đơn bàn 3.
- Lịch sử hoá đơn đã thanh toán giữ nguyên tên và giá món tại thời điểm thanh toán.
- Bảng màu chung, card, nút có phản hồi, trạng thái rỗng, safe area và tránh bàn phím.

Khi giảm món cuối cùng về 0 và xác nhận bỏ món, hoá đơn rỗng được bỏ và bàn trở về trống. Bàn trống chỉ tạo hoá đơn khi thêm món đầu tiên.

## Môi trường

- Node.js 24 (`.nvmrc`), npm, Watchman.
- React Native 0.88.1, React 19.3, TypeScript.
- iOS: Xcode và CocoaPods; máy đã chạy thử Xcode 26.3 / iOS Simulator 26.3.1.
- Android: JDK 17, Android SDK/NDK theo `android/build.gradle` (Build Tools 37.0.0, compile SDK 37, NDK 27.1.12297006), emulator hoặc điện thoại.

## Cài đặt và chạy iOS

Tại thư mục dự án:

```sh
source "$HOME/.nvm/nvm.sh"
nvm install
nvm use
npm ci
cd ios
pod install
cd ..
npm start
```

Ở terminal thứ hai tại thư mục dự án:

```sh
source "$HOME/.nvm/nvm.sh"
nvm use
npm run ios -- --simulator "MobileApp-iPhone" --no-packager
```

Trên máy khác, thay tên simulator bằng thiết bị có trong `xcrun simctl list devices available`.
Nếu Xcode dùng sai Node, tạo `ios/.xcode.env.local` với `export NODE_BINARY=` trỏ đến kết quả của `command -v node` sau `nvm use`.

## Chạy Android

Khởi động emulator hoặc kết nối điện thoại có USB debugging. Giữ Metro (`npm start`) chạy trong terminal riêng.

```sh
source "$HOME/.nvm/nvm.sh"
nvm use
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
npm run android
```

Android đã có cấu hình native và xử lý khôi phục màn hình của react-native-screens; chưa build/chạy Android trong lần thực hiện này.

## Cấu trúc

```text
App.tsx                         Điều hướng Stack
src/types.ts                    Mô hình dữ liệu
src/theme.ts                    Bảng màu và kiểu dùng chung
src/data/seed.ts                Dữ liệu lần đầu
src/context/RestaurantContext.tsx Đọc/ghi AsyncStorage tuần tự
src/utils/restaurant.ts          Kiểm tra dữ liệu và nghiệp vụ
src/components/UI.tsx            Nút, nhãn, bộ tăng/giảm, trạng thái rỗng
src/screens/HomeScreen.tsx       Thực đơn, sơ đồ bàn, lịch sử
src/screens/DishFormScreen.tsx   Thêm/sửa món
src/screens/OrderScreen.tsx      Gọi món
src/screens/CheckoutScreen.tsx   Chi tiết và thanh toán
```

## Kiểm thử

```sh
npm run lint
npx tsc --noEmit
npm test -- --runInBand
```

Đã qua lint, TypeScript và 11 kiểm thử về dữ liệu mẫu, kiểm tra tên/giá, thêm/sửa/xoá, gọi món, hết món, VAT, thanh toán, giá lịch sử, lưu và mở lại dữ liệu, lỗi ghi bộ nhớ.

Đã kiểm tra trực tiếp trên iPhone Simulator: thêm/sửa món Súp cua, công tắc hết món; bàn 1 gọi 2 phần gỏi cuốn, tạm tính 90.000 đ, VAT 7.200 đ, tổng 97.200 đ; nhập 90.000 đ bị chặn; đưa 100.000 đ trả 2.800 đ; bàn trở về trống. Tắt/mở lại app vẫn giữ món mới và hoá đơn đã thanh toán. Dữ liệu thử trên máy ảo không nằm trong mã nguồn, máy mới luôn nhận dữ liệu mẫu ban đầu.

## Nộp bài

Bản ZIP nguồn không chứa node_modules, Pods và các thư mục build. Đổi tên ZIP theo `HoTen_MSSV_De4.zip` trước khi nộp. Khi giải nén cần cài lại dependencies theo hướng dẫn trên.

Tài liệu tham khảo: [React Native CLI](https://reactnative.dev/docs/getting-started-without-a-framework), [React Navigation](https://reactnavigation.org/docs/getting-started/), [AsyncStorage](https://github.com/react-native-async-storage/async-storage).

## Giao diện phiên bản mới

Giao diện xanh rừng phối cam ấm, phần giới thiệu và số liệu tổng quan, thanh điều hướng dưới, ảnh món ăn lưu offline, tìm kiếm và lọc nhóm món. Bàn được minh hoạ bằng sơ đồ bàn ghế; gọi món có ảnh, trạng thái chọn và thành tiền từng món; thanh toán dùng bố cục phiếu tính tiền; form thêm/sửa có phần xem trước. Không thêm thư viện UI hoặc thay đổi dữ liệu đã lưu.

Ảnh minh hoạ AI đóng gói ở `src/assets/food-atlas.png`; nguồn và prompt ở `src/assets/README.md`. Tám món mẫu và món Súp cua có ảnh riêng; các món thêm khác dùng hình chữ viết tắt để tránh hiển thị ảnh sai món.
