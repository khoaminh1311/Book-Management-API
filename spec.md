Mô tả: API quản lý sách và tác giả — CRUD đầy đủ với MongoDB. Có quan hệ giữa Book và Author, là nền tảng để học Mongoose relationships.

Entities:
- Author: name, bio, nationality, birthYear
- Book: title, description, price, publishedYear, genre, coverImage, author (ref → Author)

Topics học được:
- Node.js cơ bản, CommonJS vs ESModule
- Express: routing, middleware, request/response
- MongoDB Atlas setup
- Mongoose: Schema, Model, validation, ref & populate
- REST API conventions (status codes, naming)
- Query params: filter theo genre, search theo title
- Postman để test API
- Git: backend project structure
- Deploy lên Render (free tier)

Endpoints:

Method	Endpoint	Mô tả
GET	/authors	Lấy danh sách tác giả
POST	/authors	Tạo tác giả mới
PUT	/authors/:id	Cập nhật tác giả
DELETE	/authors/:id	Xóa tác giả
GET	/books	Lấy danh sách sách (có filter, search)
GET	/books/:id	Xem chi tiết sách (populate author)
POST	/books	Tạo sách mới
PUT	/books/:id	Cập nhật sách
DELETE	/books/:id	Xóa sách
Done Criteria:
- [ ] CRUD đầy đủ cho cả Author và Book
- [ ] GET /books/:id trả về thông tin author đầy đủ (dùng populate)
- [ ] Filter sách theo genre: GET /books?genre=fiction
- [ ] Search sách theo title: GET /books?search=harry
- [ ] Validation dữ liệu đầu vào (title, author required,…)
- [ ] Kết nối MongoDB Atlas thành công
- [ ] Error handling middleware (404, 500,…)
- [ ] Deployed lên Render
- [ ] README có hướng dẫn chạy local và link API