import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <Sidebar />
      <main className="ml-64 pt-16 min-h-screen flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
