# Book Management RESTful API

A robust RESTful API built with **Node.js**, **Express**, and **MongoDB** for managing Books and Authors collections. Developed with a focus on strict validation, structured error handling, advanced querying capabilities, and secure media storage via Cloudinary.

---

## 🌐 Live Deployment & Repositories

- 🚀 **Production API Server (Render):** `https://book-management-api-cuds.onrender.com`  
- 🌐 **Production Web Client (Vercel):** `https://book-management-frontend-taupe.vercel.app/`  
- 📦 **Frontend Client Repository:** [Book-Management-Frontend](https://github.com/khoaminh1311/Book-Management-Frontend)

---

## ✨ Features

- **Authors Management**: Full CRUD operations for authors with biography, nationality, and birth year.
- **Books Management**: Full CRUD operations for books with foreign-key references to authors.
- **Advanced Querying & Search**: Search books by title and authors by name (case-insensitive regex) and filter books by genre.
- **Server-Side Sorting**: Dynamic multi-criteria sorting for books (`title`, `price`, `year`, `recent`) and authors (`name`, `year`, `recent`).
- **Cover Artwork Upload**: Multipart/form-data image upload integrated with Cloudinary CDN storage via Multer memory storage.
- **Catalog Metrics Aggregation**: Real-time aggregation of total catalog monetary value and volumes count via MongoDB pipelines.
- **Pagination**: Efficient server-side pagination for both books and authors collections (`page`, `limit`).
- **Data Integrity & Security**: Strict Mongoose schema validation, stored XSS prevention, and non-negative price constraints.
- **Relationship Protection**: Prevents deletion of authors that are still referenced by existing books.
- **Centralized Error Handling**: Unified and descriptive error responses with custom `AppError` and async wrapper.

---

## 🛠️ Technology Stack

- **Runtime**: Node.js (ES Modules, v22+)
- **Framework**: Express.js
- **Database**: MongoDB (Atlas Cloud)
- **ODM**: Mongoose
- **File Upload & Cloud Storage**: Multer & Cloudinary SDK
- **Security & Utilities**: CORS, Express Rate Limit, Dotenv

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas Connection URI)
- [Cloudinary](https://cloudinary.com/) Account (for cover image storage)

---

## 🚀 Installation & Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/khoaminh1311/Book-Management-API.git
   cd Book-Management-API
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory (refer to `.env.example`):
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Start Development Server**
   ```bash
   # Development mode with nodemon auto-restart
   npm run dev

   # Production mode
   npm start
   ```
   Server will listen on `http://localhost:5000`.

---

## 📖 API Reference

### General
- `GET /` - Root endpoint, returns welcome message and documentation guide.

### Authors (`/authors`)
- `GET /authors` - Get all authors (Supports pagination, search & sort: `?page=1&limit=10&search=Arthur&sort=name-asc`)
- `GET /authors/:id` - Get a specific author and their associated books
- `POST /authors` - Create a new author
- `PUT /authors/:id` - Update author profile
- `DELETE /authors/:id` - Delete an author (Blocked if author has registered books)

### Books (`/books`)
- `GET /books` - Get all books (Supports pagination, search, genre filter & sort: `?page=1&limit=8&search=harry&genre=Fantasy&sort=price-asc`)
- `GET /books/:id` - Get a specific book with populated author details
- `POST /books` - Create a new book
- `PUT /books/:id` - Update book details
- `DELETE /books/:id` - Delete a book from catalog

### Uploads (`/upload`)
- `POST /upload` - Upload a book cover image (`multipart/form-data`, field: `cover`, max: 5MB). Returns Cloudinary secure asset URL.

---

## 🧪 Testing

A Postman collection (`Book-Management-API.postman_collection.json`) is included in the root directory for automated and systematic API testing. Import it into Postman to test all routes and validation edge cases.

---

## ☁️ Deployment (Render)

This API is configured for continuous deployment on **Render**:

1. Sign up / Log in to [Render](https://render.com).
2. Click **New +** $\rightarrow$ **Web Service**.
3. Connect your GitHub account and select this repository (`Book-Management-API`).
4. Settings:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. In **Environment Variables**, add:
   - `PORT`: `5000`
   - `MONGODB_URI`: `your_mongodb_atlas_connection_string`
   - `CLOUDINARY_CLOUD_NAME`: `your_cloudinary_cloud_name`
   - `CLOUDINARY_API_KEY`: `your_cloudinary_api_key`
   - `CLOUDINARY_API_SECRET`: `your_cloudinary_api_secret`
6. Click **Create Web Service**. Once deployed, your API is live!
