# Book Management API

A robust RESTful API built with Node.js, Express, and MongoDB for managing Books and Authors. 
Developed with a focus on strict validation, error handling, and robust querying capabilities.

## Live API URL (Production)

🚀 **Production API:** `https://book-management-api-cuds.onrender.com`

## Features

- **Authors Management**: Full CRUD operations for authors.
- **Books Management**: Full CRUD operations for books with foreign-key references to authors.
- **Advanced Querying**: Search books by title (case-insensitive regex) and filter by genre.
- **Pagination**: Efficient server-side pagination for collections.
- **Data Integrity**: Strict validation against negative numbers, future dates, and invalid types.
- **Relationship Protection**: Prevents deletion of authors that are still referenced by existing books.
- **Centralized Error Handling**: Unified and descriptive error responses.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Atlas)
- **ODM**: Mongoose

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local installation or MongoDB Atlas URI)

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/khoaminh1311/Book-Management-API
   cd Book-Management-API
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
   ```

4. **Start the Development Server**
   ```bash
   # For live-reloading during development
   npm run dev

   # Or for standard startup
   npm start
   ```

## API Reference

### General
- `GET /` - Root endpoint, returns a welcome message and basic documentation link.

### Authors
- `GET /authors` - Get all authors (Supports pagination: `?page=1&limit=10`)
- `GET /authors/:id` - Get a specific author and their books
- `POST /authors` - Create a new author
- `PUT /authors/:id` - Update an author
- `DELETE /authors/:id` - Delete an author (Fails if books reference this author)

### Books
- `GET /books` - Get all books (Supports pagination & query: `?page=1&limit=10&search=harry&genre=fantasy`)
- `GET /books/:id` - Get a specific book (Populates author details)
- `POST /books` - Create a new book
- `PUT /books/:id` - Update a book
- `DELETE /books/:id` - Delete a book

## Testing
A Postman collection (`Book-Management-API.postman_collection.json`) is included in the root directory for automated and systematic API testing. Import it into Postman to test all routes.

## Deployment to Render

This project is configured for seamless deployment to **Render**.

1. Create a GitHub repository and push your code to it.
2. Sign up/Log in to [Render](https://render.com).
3. Click on **New +** and select **Web Service**.
4. Select **Build and deploy from a Git repository** and connect your GitHub account.
5. Select this repository.
6. Render will automatically read the `render.yaml` file and configure most settings (Build/Start commands, Node version).
7. Scroll down to **Environment Variables**, click **Add Environment Variable**:
   - **Key:** `MONGODB_URI`
   - **Value:** `your_mongodb_atlas_connection_string`
8. Click **Create Web Service** to deploy. Once successful, the API is live!
