# Video 2 — Thuyết minh mã nguồn (hạn 23/10/2026)

Gợi ý 8–12 phút, có lời nói giải thích code.

1. Mở app.json, src/config.js: chỉ rõ MSSV thật, tên `{MSSV}_FoodManager`. Chỉ rõ BIT240025 là MSSV đã cấu hình trong project.
2. Mở src/core/domain.js: hai model DishCategory/Dish, liên kết DishCategoryId; DishImage là danh sách object có ImageUrl/IsThumbnail. Chỉ rõ codec thêm tiền tố cho Table và mọi field lúc lưu.
3. Mở raw AsyncStorage hoặc JSON API: minh họa chính xác `{MSSV}_Dish`, `{MSSV}_Name`, `{MSSV}_ImageUrl`. Giải thích AsyncStorage là key-value, không phải CSDL quan hệ; app kiểm tra logic quan hệ.
4. Mở src/core/store.js: initialize đọc/seed; commit lưu snapshot trước rồi mới cập nhật React; saveDish kiểm tra đầu vào và chuẩn hóa Number; remove chặn loại đang dùng và đánh dấu Deleted.
5. Mở src/screens.js: giải thích từng màn, bộ lọc kết hợp, sắp xếp, giữ bộ lọc trong Settings; nút đổi thumbnail bảo đảm chỉ một true; Quick <=15.
6. Mở src/i18n.js và src/context.js: English mặc định, chọn ngôn ngữ lưu Settings, dịch cả validation/error, không dịch dữ liệu người dùng.
7. Phần nâng cao: context dùng NetInfo.addEventListener, AppState và interval 15s; store lưu Outbox trong cùng snapshot; stable Id, Version, tra Id trước POST; PUT khi đã có; ack không xóa mất chỉnh sửa mới; tombstone nhớ xóa offline; pull ưu tiên dữ liệu đang chờ local.
8. Mở remote.js: GET list, POST/PUT/DELETE, prefix fields qua encode, response.ok/timeout và lỗi. Chỉ rõ BIT240025_RemoteId là Object ID hệ thống đã đổi tên, khác BIT240025_Id là mã ứng dụng ổn định; cả hai đều có tiền tố.
9. Chạy npm test, giới thiệu test dữ liệu tối thiểu, validation, lọc, lưu sau restart và mất response sau POST không tạo trùng.
10. Nêu giới hạn trung thực: đồng bộ khi app đang mở; MockAPI không có transaction hay unique constraint cho cạnh tranh nhiều thiết bị; ảnh chưa tải cần Internet.

Tự quay lời giải thích của bạn. Giảng viên có thể yêu cầu thao tác hoặc sửa code trực tiếp; đọc docs/GIAI_THICH_CODE.md để ôn.
