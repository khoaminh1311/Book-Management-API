## 1. Spec & Data Validation ([Issue #14](https://github.com/khoaminh1311/Book-Management-API/issues/14), [Issue #18](https://github.com/khoaminh1311/Book-Management-API/issues/18))

### 1.1 Bài học khi đối chiếu giữa spec.md và Schema (`coverImage`)
- `spec.md` có `coverImage` nhưng schema ban đầu bị thiếu nên Mongoose tự động loại bỏ (strict mode) và controller cũng chặn ở `ALLOWED_FIELDS`.
- Cách khắc phục: Thêm trường `coverImage` vào schema kèm validator kiểm tra URL và giới hạn 500 ký tự (chống DoS/Base64), đồng thời bổ sung vào `ALLOWED_FIELDS` ở controller.
- Bài học: Khi code phần model cần phải tuân theo tài liệu yêu cầu dự án (`spec.md`), không bỏ sót hay thêm các field không liên quan.

### 1.2 Lý do price cần hỗ trợ số thập phân thay vì ép integer (`isValidOptionalInteger`)
- Ban đầu, dự án dùng custom validator `isValidOptionalInteger` ép kiểu `Number.isInteger`. Hiện tại đã xóa validator này và đổi thành kiểu `Number` với `min: 0` để vừa chống số âm, vừa nhận được số thập phân.

---

## 2. Kiến trúc Express & Centralized Error Handling ([Issue #16](https://github.com/khoaminh1311/Book-Management-API/issues/16))

### 2.1 Tại sao mutate res.statusCode trước khi throw là anti-pattern và lợi ích của AppError class
- Việc gọi `res.status(code)` là một side effect tách rời khỏi đối tượng lỗi. Nếu có lỗi khác phát sinh tiếp theo hoặc middleware khác xen vào thì status code trong `res` sẽ bị lệch với bản chất lỗi thật.
- Trách nhiệm gán HTTP status vào đối tượng `res` phải hoàn toàn thuộc về `errorHandler`.
- Lợi ích của `AppError` class: chuẩn hóa cấu trúc lỗi trong dự án. `AppError` đóng gói sẵn `statusCode` bên trong lỗi và có thêm cờ `isOperational: true` để phân biệt lỗi nghiệp vụ dự liệu trước với lỗi lập trình/hệ thống. Controller/Service chỉ cần throw lỗi và không cần thay đổi `res`.

### 2.2 Cách centralized errorHandler bắt và chuẩn hóa các lỗi của Mongoose (CastError, ValidationError, 11000)
- `CastError`: chuyển thành `HTTP 400: Invalid ObjectId format` thay vì crash hay báo lỗi 500 không rõ ràng.
- `ValidationError`: tách mảng `err.errors` thành danh sách chi tiết các trường bị lỗi kèm message rõ ràng.
- `11000`: chuyển lỗi Duplicate Key thành `HTTP 400` với thông điệp chuẩn hóa `'Duplicate field value entered'` thay vì để lộ thông tin database. Dự án chọn 400 thay vì 409 Conflict để thống nhất nhóm lỗi dữ liệu đầu vào phía client.

---

## 3. Tối ưu thao tác Mongoose ODM ([Issue #15](https://github.com/khoaminh1311/Book-Management-API/issues/15), [Issue #17](https://github.com/khoaminh1311/Book-Management-API/issues/17))

### 3.1 Phân tích nguyên nhân redundant query (gọi findById trước findByIdAndUpdate/findByIdAndDelete) và cách khắc phục
- Nguyên nhân: trước đây middleware `checkDocumentExists` luôn truy vấn `findById`. Sau đó, controller chạy thêm truy vấn khác là `findByIdAndUpdate`/`findByIdAndDelete`. Kết quả là 1 request phải truy vấn database 2 lần, làm tăng độ trễ và lãng phí tài nguyên.
- Cách khắc phục: bỏ `checkDocumentExists` ở các route `PUT` và `DELETE`, thực hiện thao tác trực tiếp trong controller. Sau khi bỏ `checkDocumentExists`, controller tự kiểm tra kết quả: nếu `null` thì trả về 404. Với route `PUT` thì kích hoạt thêm `runValidators: true` khi gọi `findByIdAndUpdate`.

### 3.2 Tại sao không nên dùng _doc mà phải dùng toObject() / toJSON()
- `_doc` là thuộc tính nội bộ của Mongoose, chứa dữ liệu thô, không thuộc API chính thức và bỏ qua hoàn toàn virtuals, getters và transform. Việc truy cập vào `_doc` khiến dự án dễ bị ảnh hưởng nếu các phiên bản Mongoose sau này thay đổi cách quản lý.
- `toObject()` và `toJSON()` là các API chính thức của Mongoose để chuyển Document thành object JavaScript thuần và có áp dụng đầy đủ virtuals, getters, transforms.

---

## 4. Defensive Programming & Security ([Issue #19](https://github.com/khoaminh1311/Book-Management-API/issues/19), [Issue #20](https://github.com/khoaminh1311/Book-Management-API/issues/20), [Issue #28](https://github.com/khoaminh1311/Book-Management-API/issues/28), [Issue #29](https://github.com/khoaminh1311/Book-Management-API/issues/29))

### 4.1 Ý nghĩa của Whitelisting (ALLOWED_FIELDS) và Middleware làm sạch body (sanitizeRequestBody) đồng bộ trên cả 2 luồng POST & PUT
- Whitelisting (`ALLOWED_FIELDS`) chỉ cho phép các field hợp lệ được ghi vào database và chống rủi ro mass assignment, khi hacker cố tình gửi đè các field nhạy cảm như `_id`, `createdAt`, phân quyền...
- Cả 2 phương thức `POST` và `PUT` đều nhận dữ liệu từ client để ghi vào database, vì vậy cần sử dụng middleware `sanitizeRequestBody` trên cả 2 luồng, thay vì bỏ qua `PUT` như ban đầu. `sanitizeRequestBody` thực hiện 2 việc: chặn request body dạng array (`Array.isArray`) và tự động xóa bỏ `_id` nếu có.

### 4.2 Xử lý an toàn khi req.body là undefined (req.body || {})
- Nếu client gửi request mà không có body, Express sẽ bỏ qua bước parse, thuộc tính không được gán giá trị sẽ mặc định mang giá trị `undefined` thay vì object rỗng. Khi này hệ thống sẽ báo lỗi `TypeError: Cannot read properties of undefined` và request báo lỗi `HTTP 500 Internal Server Error`, trong khi thực chất lỗi chỉ do client gửi thiếu dữ liệu.
- Sử dụng fallback `const body = req.body || {}` để việc đọc thuộc tính `body.title`, `body.author` không bao giờ gây ra ngoại lệ trên.

### 4.3 Vai trò của middleware cors
- Kiểm soát việc domain frontend nào được phép gọi API của backend hay không.
- Tự động gắn các header HTTP cần thiết để trình duyệt cho phép Frontend gọi vào API.
- Hiện tại dự án dùng `cors()` mặc định (cho phép mọi origin `*` để tiện phát triển), khi lên production thì cần giới hạn domain frontend cụ thể.
- CORS là cơ chế do trình duyệt web thực thi (browser-enforced), không ngăn chặn được các lời gọi trực tiếp từ server-to-server hay Postman.