import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import MainLayout from './components/layout/MainLayout';

import DashboardPage from './pages/DashboardPage';
import AuthorsPage from './pages/AuthorsPage';
import BookDetailPage from './pages/BookDetailPage';
import AuthorDetailPage from './pages/AuthorDetailPage';
import AddEditBookPage from './pages/AddEditBookPage';
import AddEditAuthorPage from './pages/AddEditAuthorPage';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Books & Catalog */}
            <Route index element={<DashboardPage />} />
            <Route path="books/:id" element={<BookDetailPage />} />
            <Route path="add-book" element={<AddEditBookPage />} />
            <Route path="edit-book/:id" element={<AddEditBookPage />} />

            {/* Authors */}
            <Route path="authors" element={<AuthorsPage />} />
            <Route path="authors/:id" element={<AuthorDetailPage />} />
            <Route path="add-author" element={<AddEditAuthorPage />} />
            <Route path="edit-author/:id" element={<AddEditAuthorPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
