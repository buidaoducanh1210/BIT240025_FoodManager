# Kết quả kiểm tra bộ source

- 14/14 test logic PASS: seed, tiền tố mọi field, số dương/URL/ảnh đại diện, trùng tên theo loại, bộ lọc phối hợp, giữ local sau restart, ngôn ngữ/bộ lọc, ràng buộc xóa, lỗi ghi local, đồng bộ khi có mạng, mất response sau POST không trùng, xóa offline sửa trong lúc sync đang gửi và Object ID MockAPI có tiền tố MSSV.
- Bộ cài setup.mjs PASS với fixture BIT240031: đổi đúng tên thư mục/app, tạo config và schema với mọi field có tiền tố. Mã thử này không được đóng gói làm MSSV của người dùng.
- Export web PASS.
- Export Android PASS (bundle JavaScript/Hermes, không phải APK).
- Kiểm tra dependency theo thông tin SDK đóng gói: up to date. Truy vấn metadata online bị timeout, nên kiểm tra này đã chạy ở chế độ offline.
- Chưa chạy demo trên emulator/điện thoại thực tế hoặc tài khoản MockAPI thật của người dùng. Test đồng bộ dùng REST mô phỏng để tạo được lỗi mất response có kiểm soát.
- Kiểm thử UI trình duyệt tự động chưa chạy được vì Chromium trong môi trường kiểm tra chưa có và gói trình duyệt tải về lỗi. Cần chạy checklist trên thiết bị trước khi quay/nộp.

Bản cá nhân hóa đã cấu hình sẵn MSSV BIT240025, tên project BIT240025_FoodManager và schema API đúng tiền tố. Nộp hai video và link Git thật của bạn.
