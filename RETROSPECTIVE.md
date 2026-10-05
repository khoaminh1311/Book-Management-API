1. Spec & Data Validation (Issue #14, #18)

1.1 Bài học khi đối chiếu giữa spec.md và Schema (coverImage)
- Khi code phần model cần phải tuân theo tài liệu yêu cầu dự án (spec.md), không bỏ sót hay thêm các field không liên quan

1.2 Lý do price cần hỗ trợ số thập phân thay vì ép integer (isValidOptionalInteger)
- Trong thực tế, giá tiền sách thường là số thập phân. Việc dùng hàm kiểm tra Number.isInteger là một ràng buộc kỹ thuật sai lệch với thực tế. Chỉ dùng hàm này khi tài liệu yêu cầu dự án có giá tiền là số tự nhiên

2. Kiến trúc Express & Centralized Error Handling (Issue #16)

2.1 Tại sao mutate res.statusCode trước khi throw là anti-pattern và lợi ích của AppError class
- Việc gọi res.status(code) rải rác khắp nơi khiến mã nguồn phụ thuộc vào trạng thái toàn cục của res, dễ bị các middleware khác ghi đè
- Trách nhiệm gán HTTP status vào đối tượng res phải hoàn toàn thuộc về errorHandler
- Lợi ích của AppError class: chuẩn hóa cấu trúc lỗi trong dự án. Controller/Service chỉ cần throw lỗi và không cần thay đổi res.

2.2 Cách centralized errorHandler bắt và chuẩn hóa các lỗi của Mongoose (CastError, ValidationError, 11000)
- CastError: chuyển thành HTTP 400: Invalid ObjectId format thay vì crash hay 
- ValidationError: tách mảng err.errors thành danh sách chi tiết các trường bị lỗi kèm message rõ ràng
- 11000: chuyển lỗi Duplicate Key thành  HTTP 400 với thông điệp chuẩn hóa 'Duplicate field value entered' thay vì để lộ thông tin database

3. Tối ưu thao tác Mongoose ODM (Issue #15, #17)

3.1 Phân tích nguyên nhân redundant query (gọi findById trước findByIdAndUpdate/findByIdAndDelete) và cách khắc phục
- Nguyên nhân: trước đây middleware checkDocumentExists luôn truy vấn findById. Sau đó, controller chạy thêm truy vấn khác là findByIdAndUpdate/findByIdAndDelete. Kết quả là 1 request phải truy vấn database 2 lần, làm tăng độ trễ và lãng phí tài nguyên
- Cách khắc phục: bỏ checkDocumentExists ở các route PUT và DELETE, thực hiện thao tác trực tiếp trong controller

3.2 Tại sao không nên dùng _doc mà phải dùng toObject() / toJSON()
- _doc là thuộc tính nội bộ của Mongoose, chứa dữ liệu thô và không thuộc API chính thức. Việc truy cập vào _doc khiến dự án dễ bị ảnh hưởng nếu các phiên bản Mongoose sau này thay đổi cách quản lý
- toObject() và toJSON() là các API chính thức của Mongoose để chuyển Document thành object/JSON thuần, dùng để chuyển  Mongoose Document thành object JavaScript thuần

4. Defensive Programming & Security (Issue #19, #20, #28, #29)

4.1 Ý nghĩa của Whitelisting (ALLOWED_FIELDS) và Middleware làm sạch body (sanitizeRequestBody) đồng bộ trên cả 2 luồng POST & PUT
- Whitelisting (ALLOWED_FIELDS) chỉ cho phép các trường hợp lệ được ghi vào database, chống việc hacker cố tình gửi các trường dữ liệu nhạy cảm trong body
- Cả 2 phương thức POST và PUT đều nhận dữ liệu từ client để ghi vào database, vì vậy cần sử dụng middleware sanitizeRequestBody trên cả 2 luồng, thay vì bỏ qua PUT như ban đầu

4.2 Xử lý an toàn khi req.body là undefined (req.body || {})
- Nếu client gửi request mà không có body, Express sẽ bỏ qua bước parse, thuộc tính không được gán giá trị sẽ mặc định mang giá trị undefined thay vì object rỗng. Khi này hệ thống sẽ báo lỗi TypeError: Cannot read properties of undefined và request báo lỗi HTTP 500 Internal Server Error, trong khi thực chất lỗi chỉ do client gửi thiếu dữ liệu
- Sử dụng fallback const body = req.body || {} để việc đọc thuộc tính body.title, body.author không bao giờ gây ra ngoại lệ trên

4.3 Vai trò của middleware cors
- Kiểm soát việc domain frontend nào được phép gọi API của backend hay không
- Tự động gắn các header HTTP cần thiết để trình duyệt cho phép Frontend gọi vào API