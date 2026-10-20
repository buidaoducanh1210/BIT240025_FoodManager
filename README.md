# BIT240025_FoodManager — Bài kiểm tra giữa kỳ Mobile

Ứng dụng React Native + Expo, JavaScript, AsyncStorage; có tự đồng bộ MockAPI khi được cấu hình. Không cần backend riêng. Đề cho phép AI hỗ trợ, nhưng sinh viên phải hiểu và giải thích code.

## Chạy project BIT240025_FoodManager

**MSSV BIT240025 đã được cấu hình sẵn** trong tên project, src/config.js, tên resource và các trường dữ liệu lúc lưu. Không cần chạy setup hoặc tạo project Expo mới.

1. Giải nén ZIP, ví dụ vào ổ D để có thư mục `D:\BIT240025_FoodManager`.
2. Mở PowerShell trong thư mục đó và chạy:

```powershell
npm install
npx expo start
```

Nhấn `a` để mở máy ảo Android đã được khởi động. Hoặc quét QR bằng Expo Go tương thích với SDK của project. Có thể chạy `npm run web` để kiểm tra trên trình duyệt, nhưng bài demo cần điện thoại/emulator theo đề.

Yêu cầu Node.js >=22.13.0. App mặc định English, có sẵn 3 loại và 5 món, hoạt động bằng AsyncStorage mà không cần cấu hình API. Phiên bản thư viện được giữ trong package-lock.json. Đọc docs/MOCKAPI.md khi muốn bật tự đồng bộ.

## Chạy ngay bằng dữ liệu local

Lần mở đầu, app lưu thật 3 loại món và 5 món vào AsyncStorage, có cả món ngừng bán, thời gian <=15 và >15 phút, mỗi món mẫu có 2 URL ảnh. Lần sau đọc lại dữ liệu đã lưu, không đè về dữ liệu mẫu. Có thể thêm/sửa/xóa và đóng mở app để kiểm tra dữ liệu tồn tại.

Ảnh dùng URL Unsplash thực tế. Ảnh đã được nền tảng lưu đệm có thể hiển thị offline; nếu ảnh chưa tải hoặc máy chủ không truy cập được, app hiển thị trạng thái thay thế. Không hứa tải một URL ảnh mới khi không có Internet. Các chức năng nhập/lưu dữ liệu vẫn chạy offline.

## Chức năng đã triển khai

- Danh sách, chi tiết, thêm, sửa và xóa món có xác nhận; chọn loại từ dữ liệu local.
- CRUD loại món; chặn xóa loại đang được dùng, kể cả món ngừng bán.
- Tìm một phần tên (hỗ trợ không dấu), lọc đồng thời loại + trạng thái + khoảng giá.
- Sắp xếp giá tăng/giảm hoặc thời gian chế biến tăng; bộ lọc được lưu và giữ khi quay về danh sách, kể cả mở lại app.
- Món ngừng bán có trong danh sách tất cả, bị loại khi chỉ lọc đang bán.
- Thêm nhiều URL ảnh; xem nhiều ảnh; đổi ảnh đại diện ở form hoặc chi tiết; tối đa 1 IsThumbnail=true. Không bắt buộc có ảnh, xử lý trạng thái trống.
- Quick/Nhanh khi PreparationTime <= 15, Regular/Thông thường khi >15; không lưu thêm field phân loại.
- Name không trống; Price và PreparationTime phải là số hữu hạn >0; category hợp lệ; tên không trùng trong cùng loại (bỏ khoảng trắng thừa/khác biệt hoa thường).
- English mặc định; nút Tiếng Việt/English đổi toàn bộ nhãn, nút, trạng thái, validation/lỗi. Dữ liệu do người dùng nhập không tự dịch. Ngôn ngữ được lưu local.
- Lỗi ID không tồn tại, URL ảnh, khoảng giá sai, lưu local, mạng/HTTP được xử lý.
- Thay đổi lưu local trước; nếu có API và Internet, tự đồng bộ. Khi offline, outbox được lưu cùng dữ liệu; khi có mạng trở lại, tự gửi lại; không có nút bắt người dùng tự bấm đồng bộ.

## MSSV và cách đặt tên dữ liệu

`src/config.js` đã chứa MSSV BIT240025. `src/core/domain.js` chứa hàm `codec(studentId)`:

- `table('Dish')` -> `{MSSV}_Dish`.
- `table('DishCategory')` -> `{MSSV}_DishCategory`.
- `encode()` thêm `{MSSV}_` trước **mọi tên field**, kể cả object ảnh, Settings, Filters và Outbox.
- `decode()` chuyển dữ liệu đã lưu về model dễ đọc khi xử lý trong app.

AsyncStorage là kho key-value, không phải CSDL quan hệ. App lưu một snapshot JSON tại key `{MSSV}_Database`. Bên trong có các tập dữ liệu `{MSSV}_DishCategory` và `{MSSV}_Dish`. Mỗi field như Id/Name/Price cũng có tiền tố. Một snapshot duy nhất giúp dữ liệu và hàng đợi ghi cùng lúc; tự kiểm tra quan hệ ở tầng ứng dụng.

Ví dụ field thật sau khi cài với BIT240031: BIT240031_Id, BIT240031_Name, BIT240031_DishImage; mỗi ảnh có BIT240031_ImageUrl, BIT240031_IsThumbnail. Tên thuộc tính trong code xử lý không bắt buộc có tiền tố; **dữ liệu lúc lưu** đã được encode.

Trên MockAPI, đổi tên dòng **Object ID mặc định** thành `BIT240025_RemoteId`. Tạo thêm `BIT240025_Id` kiểu String cho mã ứng dụng ổn định. RemoteId dùng để tạo đường dẫn REST khi PUT/DELETE, còn Id dùng nhận diện món/loại qua các lần thử lại. Nhờ vậy mọi field trên MockAPI cũng có tiền tố MSSV. Adapter vẫn đọc được API cũ dùng field `id`, nhưng khi nộp bài hãy dùng tên có tiền tố theo schema mới.

## Cấu trúc mã nguồn

| File | Nhiệm vụ |
|---|---|
| App.js | Header MSSV, đổi ngôn ngữ, điều hướng và nút Back Android |
| src/config.js | MSSV và URL mặc định, được bộ cài sinh |
| src/screens.js | DishList, DishDetail, DishForm, CategoryScreen, SettingsScreen |
| src/ui.js | Form field, picker, ảnh, nút, thông báo và xác nhận xóa |
| src/i18n.js | Từ điển en/vi và thay tham số thông báo |
| src/context.js | Context/React state, NetInfo, timer retry, AppState |
| src/core/domain.js | Model helpers, validation, lọc/sắp xếp và codec MSSV |
| src/core/store.js | Đọc/ghi local, outbox, CRUD, đồng bộ và merge |
| src/core/remote.js | Fetch REST, encode/decode, timeout và lỗi HTTP |
| src/core/seed.js | Dữ liệu mẫu, chỉ khởi tạo khi kho chưa tồn tại |
| tests/food.test.mjs | Kiểm tra nghiệp vụ, lưu offline và retry đồng bộ |

## Phần nâng cao: tự đồng bộ

Đọc `docs/MOCKAPI.md`. Sau khi tạo đủ hai resources đúng schema, mở Connection/Kết nối trong app và nhập Base URL, bấm Save connection/Lưu kết nối. Từ đây việc đồng bộ tự chạy khi phát hiện có Internet, khi mở app lại, khi app trở về foreground và mỗi 15 giây khi app đang mở. Không cần bấm Đồng bộ.

- Dữ liệu + Outbox được lưu trước bằng một setItem; lỗi ghi local không báo lưu thành công.
- Outbox gom theo Entity + Id, nên sửa cùng món nhiều lần offline chỉ giữ phiên bản mới nhất.
- Mỗi bản ghi có Id ổn định và Version. Trước POST luôn tìm Id trên server, nếu đã tồn tại thì PUT.
- Nếu server đã POST thành công nhưng mất response, lần thử lại tìm bản đã có và không POST trùng.
- Version mới phát sinh trong lúc mạng đang gửi không bị xác nhận nhầm; giữ trong outbox cho lần tiếp theo.
- Gửi loại món trước món; xóa món trước loại. Dùng tombstone Deleted local để nhớ thao tác xóa offline.
- Sau push, kéo dữ liệu server; thay đổi local còn chờ luôn được ưu tiên, tránh bị dữ liệu cũ từ server đè mất.

Đồng bộ chạy khi **ứng dụng đang mở/foreground**; không quảng cáo tự chạy nền khi đã force-stop. MockAPI không cung cấp transaction/unique constraint/idempotency server, nên bài này bảo đảm retry tuần tự trên một app; không bảo đảm chống đua tạo trùng hoặc giải quyết mọi xung đột giữa nhiều thiết bị cùng sửa. Demo dùng một thiết bị/emulator như yêu cầu đề.

## Kiểm tra

```powershell
npm test
npm run check
npm run export:web
npm run export:android
```

Test dùng local storage/REST mô phỏng, không ghi vào tài khoản MockAPI thật. Bản export Android kiểm tra bundle JavaScript, **không phải file APK** và không thay thế demo trên emulator. Chạy checklist trong docs/CHECKLIST.md trước khi quay.

## Nộp bài và video

- Trong ca: link Git source code + Video 1 demo app lên LMS.
- Chậm nhất 23/10/2026: Video 2 thuyết minh code có lời nói lên LMS.
- Kịch bản: docs/VIDEO_1.md, docs/VIDEO_2.md; giải thích code: docs/GIAI_THICH_CODE.md.
- docs/THONG_TIN_NOP_BAI.md đã có MSSV BIT240025; tự điền tên, link Git, URL API và hai video.
- Không có video quay sẵn hoặc link Git giả trong bộ source. Hai video phải thể hiện thao tác/thuyết minh của chính bạn.

Tạo repository Git trống của bạn, sau đó chạy trong project:

```powershell
git init
git add .
git commit -m "Complete Food Manager midterm"
git branch -M main
```

Sau đó thêm remote bằng URL repository thật của bạn và push theo hướng dẫn GitHub. Không commit node_modules, .expo, dist hoặc thông tin bí mật.

Tài liệu chính thức: https://docs.expo.dev/ ; https://react-native-async-storage.github.io/async-storage/ ; https://github.com/react-native-netinfo/react-native-netinfo ; https://mockapi.io/
