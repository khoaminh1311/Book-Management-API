# Bối cảnh Dự án — Book & Author REST API

## 1. Tổng quan Dự án

**Dự án:** Book & Author REST API

**Mục tiêu:**

Xây dựng một REST API hoàn chỉnh để quản lý sách và tác giả sử dụng Node.js, Express, MongoDB Atlas, và Mongoose.

Dự án chủ yếu là một dự án học tập tập trung vào:

* Các nguyên lý cơ bản của Node.js
* ES Modules
* Express
* Thiết kế REST API
* MongoDB Atlas
* Mongoose
* Schema và Model
* Mongoose validation
* Các mối quan hệ trong MongoDB sử dụng `ref`
* `populate()`
* Tham số truy vấn (Query parameters)
* Phân trang (Pagination)
* Xử lý lỗi API
* Kiểm thử API bằng Postman
* Quy trình làm việc với Git
* Triển khai lên Render

Dự án nên giữ mức độ đơn giản và mang tính giáo dục. Tránh kiến trúc cấp doanh nghiệp không cần thiết hoặc thiết kế quá mức (over-engineering).

---

# 2. Ngăn xếp Công nghệ (Technology Stack)

* Node.js
* Express
* MongoDB Atlas
* Mongoose
* Postman
* Git / GitHub
* Render

## Hệ thống Module

Dự án sử dụng **ES Modules**, không dùng CommonJS.

Sử dụng:

```js
import ...
export ...

```

Không sử dụng:

```js
require(...)
module.exports

```

trừ khi có yêu cầu rõ ràng.

---

# 3. Kiến trúc

Sử dụng cấu trúc phân tầng đơn giản:

```text
src/
├── config/
├── controllers/
├── models/
├── routes/
├── middlewares/
├── app.js
└── server.js

```

Trách nhiệm dự kiến:

### `config/`

Cấu hình cơ sở dữ liệu và ứng dụng.

### `models/`

Các Mongoose schema và model.

### `controllers/`

Xử lý yêu cầu và logic nghiệp vụ cho từng tài nguyên.

### `routes/`

Định nghĩa các route của Express.

### `middlewares/`

Các middleware Express dùng chung như:

* Xử lý lỗi 404
* Xử lý lỗi toàn cục

### `app.js`

Khởi tạo và cấu hình ứng dụng Express.

Các trách nhiệm có thể bao gồm:

* Khởi tạo Express
* `express.json()`
* Gắn các route (Route mounting)
* Đăng ký middleware

### `server.js`

Điểm khởi đầu (entry point) của ứng dụng.

Trách nhiệm:

* Tải cấu hình môi trường
* Kết nối tới MongoDB
* Khởi động HTTP server

Không đưa vào `services/`, `repositories/`, hoặc các tầng kiến trúc khác trừ khi có yêu cầu rõ ràng.

---

# 4. Các Thực thể trong Dự án

## Author

Các trường:

```text
name
bio
nationality
birthYear
createdAt

```

Xác thực dữ liệu dự kiến:

* `name` là bắt buộc
* `birthYear` phải là một năm hợp lệ
* Các trường khác có thể là tùy chọn trừ khi được yêu cầu rõ ràng bởi các yêu cầu triển khai

---

## Book

Các trường:

```text
title
description
price
publishedYear
genre
coverImage
author (ref: Author)
createdAt

```

Xác thực dữ liệu dự kiến:

* `title` là bắt buộc
* `author` là bắt buộc
* `author` phải tham chiếu tới một Author đã tồn tại
* `price` phải là một số không âm hợp lệ
* `publishedYear` phải là một năm hợp lệ
* Các trường khác có thể là tùy chọn trừ khi có yêu cầu rõ ràng

---

# 5. Mối quan hệ Book → Author

Một Book thuộc về một Author.

Mối quan hệ phải sử dụng MongoDB ObjectId và Mongoose `ref`.

Về mặt khái niệm:

```text
Book
 └── author → Author._id

```

Book schema nên sử dụng:

```text
author: ObjectId
ref: Author

```

Khi lấy thông tin một cuốn sách:

```text
GET /books/:id

```

phản hồi phải chứa đầy đủ thông tin của Author bằng cách sử dụng Mongoose:

```text
populate("author")

```

Ví dụ phản hồi khái niệm:

```json
{
  "data": {
    "title": "Harry Potter",
    "author": {
      "name": "J.K. Rowling",
      "bio": "...",
      "nationality": "British",
      "birthYear": 1965
    }
  }
}

```

Không thêm các loại quan hệ khác trừ khi có yêu cầu rõ ràng.

---

# 6. Các API Endpoint

## Authors

```text
GET    /authors
POST   /authors
PUT    /authors/:id
DELETE /authors/:id

```

## Books

```text
GET    /books
GET    /books/:id
POST   /books
PUT    /books/:id
DELETE /books/:id

```

Không thêm các endpoint khác trừ khi có yêu cầu rõ ràng.

---

# 7. Các Tham số Truy vấn GET /books

`GET /books` phải hỗ trợ:

## Phân trang

```text
GET /books?page=1&limit=10

```

Thông tin phân trang dự kiến:

```json
{
  "page": 1,
  "limit": 10,
  "total": 25,
  "totalPages": 3
}

```

## Lọc theo thể loại

```text
GET /books?genre=fiction

```

## Tìm kiếm theo tiêu đề

```text
GET /books?search=harry

```

Tìm kiếm phải không phân biệt chữ hoa chữ thường.

## Truy vấn kết hợp

API phải hỗ trợ kết hợp các tham số:

```text
GET /books?genre=fiction&search=harry&page=1&limit=10

```

Hệ thống truy vấn nên được thiết kế sao cho việc lọc, tìm kiếm và phân trang hoạt động cùng nhau.

---

# 8. Quy ước Phản hồi API

Sử dụng cấu trúc phản hồi JSON nhất quán.

## Một tài nguyên đơn lẻ

```json
{
  "data": {
    "...": "..."
  }
}

```

## Tập hợp tài nguyên (Collection)

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}

```

## Lỗi

```json
{
  "message": "Resource not found"
}

```

## Lỗi xác thực dữ liệu

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}

```

## DELETE

DELETE thành công có thể trả về:

```text
204 No Content

```

Không đưa vào nhiều định dạng phản hồi cho cùng một loại thao tác mà không có lý do rõ ràng.

---

# 9. Quy tắc Nghiệp vụ

## Xóa tác giả

Một Author **không được phép** bị xóa nếu vẫn còn một hoặc nhiều Books tham chiếu đến Author đó.

Ví dụ:

```text
Author A
 ├── Book 1
 └── Book 2

```

Thao tác:

```text
DELETE /authors/:id

```

phải thất bại khi Book 1 hoặc Book 2 vẫn còn tham chiếu đến Author đó.

Không tự động xóa các Book khi xóa một Author.

---

# 10. Xác thực Dữ liệu (Validation)

Sử dụng **Mongoose Schema validation**.

Không đưa vào Joi, Zod, express-validator, hoặc thư viện xác thực khác trừ khi có yêu cầu rõ ràng.

Việc xác thực dữ liệu tối thiểu phải bao gồm:

* Các trường bắt buộc
* Đúng kiểu dữ liệu
* Giá không âm
* Giá trị năm hợp lệ
* ObjectId hợp lệ
* Sự tồn tại của Author khi tạo/cập nhật một Book

Các lỗi xác thực phải được chuyển đổi thành các phản hồi API rõ ràng.

---

# 11. Xử lý Lỗi

Ứng dụng nên sử dụng cơ chế xử lý lỗi tập trung của Express.

Middleware dự kiến:

```text
src/middlewares/notFound.js
src/middlewares/errorHandler.js

```

API tối thiểu phải xử lý đúng:

```text
400 Bad Request
404 Not Found
500 Internal Server Error

```

Đồng thời xử lý các lỗi Mongoose phổ biến như:

* ValidationError
* CastError / ObjectId không hợp lệ

Máy chủ không được gặp sự cố (crash) do dữ liệu đầu vào API thông thường không hợp lệ.

---

# 12. MongoDB Atlas

Dự án sử dụng MongoDB Atlas làm cơ sở dữ liệu.

Thông tin kết nối phải được lưu trữ trong các biến môi trường.

Ví dụ:

```text
MONGODB_URI=...
PORT=5000

```

Không bao giờ commit file `.env`.

File `.env.example` nên được commit và chỉ chứa các giá trị giữ chỗ (placeholders).

Ví dụ:

```text
MONGODB_URI=your_mongodb_connection_string
PORT=5000

```

---

# 13. Môi trường và Bảo mật

Những mục sau đây tuyệt đối không được commit:

```text
.env
node_modules/

```

Thông tin xác thực nhạy cảm không bao giờ được hard-code vào mã nguồn.

Không để lộ thông tin xác thực MongoDB trong các phản hồi API, README, lịch sử Git, hoặc các file mã nguồn.

---

# 14. Quy trình Git

Quy trình làm việc với Git là bắt buộc trong suốt dự án.

Không phát triển trực tiếp trên nhánh `main`.

## Bắt đầu một tính năng

```bash
git checkout -b feat/feature-name

```

Ví dụ:

```bash
git checkout -b feat/author-crud

```

## Commit thường xuyên

Sử dụng phong cách Conventional Commit:

```bash
git add .
git commit -m "feat: add author CRUD"

```

Ví dụ:

```text
feat: add author model
feat: implement author CRUD
feat: add book relationship
fix: handle invalid author id
test: verify book search
docs: update API documentation

```

## Push

```bash
git push origin feat/feature-name

```

Sau đó:

```text
Tạo Pull Request
       ↓
Review (Đánh giá)
       ↓
Merge vào main

```

Không tự động merge Pull Request trừ khi có chỉ dẫn rõ ràng từ người dùng.

---

# 15. Quy tắc Phát triển cho AI Agent

AI Agent phải tuân thủ các quy tắc sau.

## Trước khi chỉnh sửa code

1. Kiểm tra dự án hiện có.
2. Hiểu kiến trúc hiện tại.
3. Kiểm tra nhánh Git hiện tại.
4. Kiểm tra những gì đã được triển khai.
5. Không giả định rằng các file hoặc tính năng đã tồn tại.

## Trong quá trình triển khai

* Chỉ triển khai giai đoạn được yêu cầu.
* Không tự động chuyển sang giai đoạn tiếp theo.
* Không viết lại mã không liên quan.
* Không thay đổi hợp đồng API (API contract) nếu không có sự cho phép.
* Không đưa vào các dependency không cần thiết.
* Không đưa vào các tầng kiến trúc không cần thiết.
* Duy trì các chức năng đang hoạt động từ các giai đoạn trước.
* Ưu tiên code đơn giản và dễ đọc.
* Tuân theo cấu trúc dự án hiện có.
* Sử dụng ES Modules.

## Nếu một yêu cầu mơ hồ

Không tự ý đưa ra quyết định lớn về kiến trúc hoặc API.

Hỏi người dùng trước khi tiến hành.

Các chi tiết triển khai nhỏ đã được xác định bởi tài liệu này có thể do Agent tự quyết định.

---

# 16. Quy trình Giai đoạn (Phase Workflow)

Dự án sẽ được phát triển theo từng giai đoạn.

Quy trình dự kiến:

```text
Giai đoạn
    ↓
Triển khai
    ↓
Kiểm thử nội bộ (Local testing)
    ↓
QA
    ↓
Git commit
    ↓
Push nhánh tính năng
    ↓
Pull Request
    ↓
Review (Đánh giá)
    ↓
Merge vào main
    ↓
Giai đoạn tiếp theo

```

Agent không được triển khai các giai đoạn tương lai trừ khi có hướng dẫn rõ ràng.

---

# 17. Các Giai đoạn Hiện đang Lên kế hoạch

```text
Phase 1  — Cài đặt Dự án & ES Modules
Phase 2  — Express Server & Routing
Phase 3  — MongoDB Atlas & Mongoose
Phase 4  — Author CRUD
Phase 5  — Book CRUD
Phase 6  — Mối quan hệ Book ↔ Author & Populate
Phase 7  — Phân trang, Lọc & Tìm kiếm
Phase 8  — Xác thực dữ liệu & Xử lý lỗi
Phase 9  — Postman QA & Kiểm tra API
Phase 10 — Git / README / Tài liệu hướng dẫn
Phase 11 — Triển khai lên Render
Phase 12 — QA Cuối cùng & Tiêu chí Hoàn thành
Phase 13 — Swagger/OpenAPI Tùy chọn

```

Phase 13 là tùy chọn và chỉ được bắt đầu sau khi dự án cốt lõi đã hoàn thành.

---

# 18. Yêu cầu QA

Mỗi giai đoạn nên có điểm kiểm tra (checkpoint) QA riêng.

Sau khi triển khai, Agent nên báo cáo:

```text
1. Những gì đã được triển khai
2. Các file đã tạo/chỉnh sửa
3. Các bài kiểm tra đã thực hiện
4. Kết quả kiểm tra
5. Các trường hợp biên (edge cases) đã kiểm tra
6. Các vấn đề tiềm ẩn
7. Trạng thái Git

```

Không khẳng định một tính năng hoạt động mà không thực sự kiểm tra nó.

---

# 19. Tiêu chí Hoàn thành Cuối cùng (Final Done Criteria)

Dự án chỉ được coi là hoàn thành khi thỏa mãn tất cả các điều kiện sau:

```text
[ ] Đầy đủ CRUD cho Author
[ ] Đầy đủ CRUD cho Book
[ ] GET /books/:id populate đầy đủ thông tin Author
[ ] Bộ lọc thể loại hoạt động
[ ] Tìm kiếm tiêu đề hoạt động
[ ] Phân trang hoạt động
[ ] Lọc + tìm kiếm + phân trang có thể kết hợp với nhau
[ ] Mongoose validation hoạt động
[ ] Xử lý ObjectId không hợp lệ
[ ] Tài nguyên không tồn tại trả về lỗi thích hợp
[ ] Author không thể bị xóa khi vẫn còn được Books tham chiếu
[ ] Tồn tại cơ chế xử lý lỗi tập trung
[ ] Kết nối MongoDB Atlas hoạt động
[ ] Các bài kiểm thử Postman đều đạt
[ ] .env không bị commit
[ ] Quy trình Git được tuân thủ
[ ] README hoàn chỉnh
[ ] Hướng dẫn cài đặt nội bộ hoạt động
[ ] Triển khai lên Render hoạt động
[ ] URL API đã triển khai được ghi lại trong tài liệu
[ ] QA cuối cùng đạt

```

---

# 20. Nâng cấp Tùy chọn trong Tương lai

Sau khi dự án cốt lõi đã hoàn thành và được xác minh, Swagger/OpenAPI có thể được bổ sung.

Các tính năng tiềm năng trong tương lai:

* Đặc tả OpenAPI
* Giao diện Swagger UI
* Tài liệu endpoint
* Các request schema
* Các response schema
* Kiểm thử API tương tác

Những điều này **không thuộc Tiêu chí Hoàn thành cốt lõi**.