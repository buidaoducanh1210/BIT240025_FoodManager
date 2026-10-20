# Giải thích để bảo vệ bài

**Tại sao chọn AsyncStorage?** Đề cho phép, dễ chạy trên Expo, lưu được dữ liệu lâu dài trên máy và hỗ trợ offline. Không gọi đây là database quan hệ. DishCategoryId được app kiểm tra, không phải khóa ngoại do AsyncStorage thực thi.

**Dữ liệu ở đâu?** AsyncStorage key `{MSSV}_Database`, nội dung là JSON đã encode. Khác với state trong React, dữ liệu này tồn tại sau khi đóng app. Các mảng tương ứng bảng logic là `{MSSV}_DishCategory` và `{MSSV}_Dish`.

**Tên field trong code không có MSSV thì có sai không?** Đề quy định tên khi lưu. Trong domain dùng Name/Price dễ đọc; trước setItem hoặc gửi API, codec thêm prefix đệ quy cho tất cả keys, gồm ảnh và metadata. Khi đọc thì decode. Phải chứng minh bằng JSON thật khi quay video.

**Tại sao một snapshot?** Nếu ghi món rồi mất điện trước khi ghi queue, món sẽ không được đồng bộ. Snapshot chứa cả hai giúp một lần setItem lưu cùng dữ liệu và outbox. commit tuần tự hóa các thao tác và chỉ publish React state sau khi lưu thành công.

**Kiểm tra trùng tên?** validateDish loại bản ghi đang sửa bằng editingId; so Name sau trim/gộp dấu cách/lowercase, cùng DishCategoryId. Khác loại được phép cùng tên. Món ngừng bán vẫn tham gia ràng buộc.

**Tại sao Quick không phải field?** Có thể tính từ PreparationTime <=15. Không lưu thông tin suy ra để tránh lệch dữ liệu.

**Giữ bộ lọc thế nào?** Settings.Filters chứa Search/Category/Available/Min/Max/Sort, được lưu local. Mở lại màn danh sách vẫn lấy cùng giá trị. selectDishes áp dụng tất cả điều kiện đồng thời rồi mới sort trên bản sao mảng.

**Ảnh đại diện?** DishImage là mảng. Khi chọn ảnh i, đặt IsThumbnail = (index===i) cho mọi ảnh. Khi xóa ảnh đại diện, chọn ảnh đầu còn lại. validateDish vẫn kiểm tra không có quá một true, kể cả dữ liệu không đến từ nút giao diện.

**Vì sao xóa offline dùng Deleted?** Nếu xóa hẳn khỏi local ngay mà chưa có mạng, app có thể quên phải xóa bản server. Tombstone giữ Id/Version cho đến khi DELETE được xác nhận, nhưng không hiển thị trong danh sách.

**Tại sao có Version?** Người dùng có thể sửa khi request đang gửi. Chỉ ack phiên bản đã gửi nếu bản hiện tại vẫn cùng Version; bản mới vẫn giữ queue. Lần kế tiếp gửi dữ liệu mới nhất.

**Vì sao không trùng khi mất response?** Trước POST, remote.list tìm field `{MSSV}_Id`. Nếu request trước đã lưu server nhưng response mất, lần retry tìm thấy bản đó và PUT. Các sync không chạy chồng trong cùng instance.

**Phân biệt Id và RemoteId?** BIT240025_Id là mã ứng dụng ổn định khi offline. BIT240025_RemoteId là dòng Object ID mặc định của MockAPI đã đổi tên để đúng tiền tố; dùng nó trong endpoint PUT/DELETE. Không thay mã ứng dụng theo mã hệ thống. Adapter vẫn hỗ trợ id cũ để tương thích, nhưng schema nộp bài dùng RemoteId có tiền tố.

**Đồng bộ hai chiều?** Push outbox trước, rồi GET hai resources để merge về local. Record local đang có thay đổi chờ luôn được ưu tiên khi pull. Đây là cơ chế đủ cho demo một thiết bị; không thay thế hệ thống multi-user có transaction/conflict resolution đầy đủ.

**Lỗi lưu local?** Không publish dữ liệu mới nếu setItem lỗi; hiển thị storageError theo ngôn ngữ. Lỗi JSON cũ không tự seed đè dữ liệu. Lỗi mạng không làm mất outbox.
