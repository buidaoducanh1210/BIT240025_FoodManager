# Cấu hình MockAPI cho tự đồng bộ

1. MSSV BIT240025 đã được cấu hình. Mở docs/MOCKAPI_SCHEMA.json để biết tên chính xác.
2. Đăng nhập https://mockapi.io/, tạo một project riêng.
3. Tạo hai resources cùng cấp: `BIT240025_DishCategory` và `BIT240025_Dish`. Giữ nguyên hoa/thường và dấu gạch dưới.
4. Khai báo các fields đúng kiểu theo schema. Không tạo Name/Price không có tiền tố. Đổi tên dòng Object ID mặc định từ `id` thành `BIT240025_RemoteId`; tạo riêng `BIT240025_Id` kiểu String cho mã ứng dụng.
5. Với `{MSSV}_DishImage`, chọn Array; mỗi phần tử là object có `{MSSV}_ImageUrl` (String), `{MSSV}_IsThumbnail` (Boolean). Giữ nguyên object JSON, không chuyển thành chuỗi JSON.
6. Để cả hai resources rỗng. Tắt/xóa dữ liệu Faker tự sinh trước khi nối app, vì dữ liệu tự sinh có thể sai mã liên kết hoặc kiểu ảnh.
7. API list phải trả mảng JSON mặc định, không tự bọc trong object.
8. Sao chép Base URL thật, không thêm tên resource ở cuối. Ví dụ cấu trúc: `https://PROJECT_ID.mockapi.io/api/v1` (thay PROJECT_ID và prefix bằng đúng dự án).
9. Trong app mở Connection/Kết nối, nhập Base URL và Save connection/Lưu kết nối. 3 loại + 5 món local sẽ tự gửi lên API khi có mạng.
10. Mở hai endpoint bằng trình duyệt để chứng minh dữ liệu có tiền tố MSSV. Không dùng URL mẫu làm API thật.

## Demo offline

- Khi đang có mạng và app đã đồng bộ hết, tắt Internet/Wi-Fi của emulator, hoặc dùng chế độ máy bay.
- Tạo món mới hoặc sửa giá món cũ. Thao tác vẫn lưu, app hiển thị offline; đóng/mở màn hình kiểm tra.
- Bật mạng lại và giữ ứng dụng mở. Không bấm nút đồng bộ; chờ callback NetInfo hoặc lần thử lại trong 15 giây (chưa tính timeout mạng nếu request trước đó đang chờ).
- Mở MockAPI để chứng minh món đã tạo/sửa. Chờ đồng bộ thêm một lần và kiểm tra không có bản trùng cùng `{MSSV}_Id`.
- Khi không kết nối được server, app giữ dữ liệu local/outbox và hiện lỗi được dịch. Không xóa local để cố kết nối.

Một request có timeout 12 giây. NetInfo có thể báo kết nối Wi-Fi nhưng chưa xác định được Internet; app vẫn xử lý lỗi HTTP và tự thử lại, không coi có Wi-Fi là server chắc chắn truy cập được.
