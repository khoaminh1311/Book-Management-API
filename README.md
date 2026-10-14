# Book Management API & BookShelf Client

A robust RESTful API built with Node.js, Express, and MongoDB for managing Books and Authors, paired with a modern **BookShelf** web interface designed in Figma and built with React 19, Vite, and TailwindCSS.
Developed with a focus on strict validation, error handling, robust querying capabilities, and seamless user experience.

## Live Deployment Links

🚀 **Production API (Render):** `https://book-management-api-cuds.onrender.com`  
🌐 **Production Web Client (Vercel):** `https://book-management-api-blond.vercel.app/`

## Features

- **Authors Management**: Full CRUD operations for authors with biography, nationality, and birth year.
- **Books Management**: Full CRUD operations for books with foreign-key references to authors.
- **Advanced Querying & Search**: Search books by title and authors by name (case-insensitive regex) and filter books by genre.
- **Server-Side Sorting**: Dynamic multi-criteria sorting for books (`title`, `price`, `year`, `recent`) and authors (`name`, `year`, `recent`).
- **Cover Artwork Upload**: Multipart/form-data image upload integrated with Cloudinary CDN storage.
- **Catalog Metrics Aggregation**: Real-time aggregation of total catalog monetary value and volumes count via MongoDB pipelines.
- **Pagination**: Efficient server-side pagination for both books and authors collections.
- **Data Integrity & Security**: Strict validation against invalid types, stored XSS sanitization (DOMPurify), and protocol validation.
- **Relationship Protection**: Prevents deletion of authors that are still referenced by existing books.
- **Centralized Error Handling**: Unified and descriptive error responses with custom `AppError` and React `ErrorBoundary`.
- **Editorial Web Interface**: 6 cohesive screens matching Figma design system (Dashboard, Book Detail, Add/Edit Book with live 3D preview, Authors List, Author Detail, Add/Edit Author).

## Technology Stack

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB (Atlas)
- **ODM**: Mongoose
- **File Upload & Cloud Storage**: Multer & Cloudinary SDK
- **Security & Utilities**: CORS, Express Rate Limit

### Frontend (`frontend/`)
- **Core**: React 19, Vite
- **Routing**: React Router 7
- **Styling**: TailwindCSS (Custom Editorial Color Palette & Typography)
- **Security**: DOMPurify

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local installation or MongoDB Atlas URI)
- [Cloudinary](https://cloudinary.com/) account (for book cover uploads)

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/khoaminh1311/Book-Management-API
   cd Book-Management-API
   ```

2. **Backend Setup**
   ```bash
   # Install backend dependencies
   npm install

   # Configure Environment Variables (root directory .env)
   # Refer to .env.example
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Start backend development server (runs on port 5000)
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   # Navigate to frontend folder and install dependencies
   cd frontend
   npm install

   # Start frontend development server (runs on port 5173)
   npm run dev
   ```

## API Reference

### General
- `GET /` - Root endpoint, returns a welcome message and basic documentation link.

### Authors
- `GET /authors` - Get all authors (Supports pagination, search & sort: `?page=1&limit=10&search=Arthur&sort=name-asc`)
- `GET /authors/:id` - Get a specific author and their books
- `POST /authors` - Create a new author
- `PUT /authors/:id` - Update an author
- `DELETE /authors/:id` - Delete an author (Fails if books reference this author)

### Books
- `GET /books` - Get all books (Supports pagination, query & sort: `?page=1&limit=8&search=harry&genre=Fantasy&sort=price-asc`)
- `GET /books/:id` - Get a specific book (Populates author details)
- `POST /books` - Create a new book
- `PUT /books/:id` - Update a book
- `DELETE /books/:id` - Delete a book

### Uploads
- `POST /upload` - Upload a book cover image file (`multipart/form-data`, field: `cover`, max: 5MB). Returns Cloudinary secure asset URL.

## Testing
A Postman collection (`Book-Management-API.postman_collection.json`) is included in the root directory for automated and systematic API testing. Import it into Postman to test all routes.

## Deployment

### 1. Deploy Backend to Render

This project is configured for seamless deployment to **Render**.

1. Create a GitHub repository and push your code to it.
2. Sign up/Log in to [Render](https://render.com).
3. Click on **New +** and select **Web Service**.
4. Select **Build and deploy from a Git repository** and connect your GitHub account.
5. Select this repository.
6. Render will automatically read the `render.yaml` file and configure most settings (Build/Start commands, Node version).
7. Scroll down to **Environment Variables**, click **Add Environment Variable**:
   - `MONGODB_URI`: `your_mongodb_atlas_connection_string`
   - `CLOUDINARY_CLOUD_NAME`: `your_cloudinary_cloud_name`
   - `CLOUDINARY_API_KEY`: `your_cloudinary_api_key`
   - `CLOUDINARY_API_SECRET`: `your_cloudinary_api_secret`
8. Click **Create Web Service** to deploy. Once successful, the API is live!

### 2. Deploy Frontend to Vercel

The frontend is optimized for deployment on **Vercel**:

1. Log in to [Vercel](https://vercel.com) and click **Add New...** $\rightarrow$ **Project**.
2. Select your repository `Book-Management-API`.
3. In **Configure Project**:
   - **Root Directory:** Click **Edit** and select `frontend`.
   - **Framework Preset:** Vite (detected automatically).
   - **Build and Output Settings:** Leave default (`npm run build`, `dist`).
4. In **Environment Variables**, add:
   - **Key:** `VITE_API_URL`
   - **Value:** Your Render backend URL (e.g. `https://book-management-api-cuds.onrender.com` without trailing slash).
5. Click **Deploy**. SPA client-side routing is handled via `frontend/vercel.json`.
