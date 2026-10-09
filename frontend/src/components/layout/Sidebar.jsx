import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="fixed top-16 left-0 bottom-0 w-64 bg-surface border-r border-outline-variant/50 z-40 p-4 select-none">
      <nav className="flex flex-col gap-1.5" aria-label="Catalog Navigation">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-colors ${
              isActive
                ? 'bg-surface-container text-primary font-semibold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-primary font-medium'
            }`
          }
        >
          <span className="material-symbols-outlined text-[20px]">auto_stories</span>
          <span>Books</span>
        </NavLink>

        <NavLink
          to="/authors"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-colors ${
              isActive
                ? 'bg-surface-container text-primary font-semibold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-primary font-medium'
            }`
          }
        >
          <span className="material-symbols-outlined text-[20px]">group</span>
          <span>Authors</span>
        </NavLink>
      </nav>
    </aside>
  );
}
