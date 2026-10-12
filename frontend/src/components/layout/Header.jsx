import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

export default function Header({ isMobileNavOpen = false, onToggleNav }) {
  const location = useLocation();
  const { showToast } = useToast();
  const [isDark, setIsDark] = useState(false);

  const isAuthorSection = location.pathname.includes('/authors') || location.pathname.includes('/add-author');

  const toggleTheme = () => {
    setIsDark(!isDark);
    showToast(`Switched to ${!isDark ? 'Dark' : 'Light'} appearance`, 'info', 2000);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container-lowest border-b border-outline-variant/50 z-50 px-3 sm:px-6 flex items-center justify-between shadow-sm select-none">
      {/* Left: Mobile Drawer Hamburger & Brand Logo (Figma #1:153, #1:155) */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleNav}
          className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors focus:outline-none"
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          <span className="material-symbols-outlined text-[22px] block">
            {isMobileNavOpen ? 'close' : 'menu'}
          </span>
        </button>

        <Link to="/" className="flex items-center gap-2.5 cursor-pointer group">
          <img src="/assets/bookshelf_logo.png" alt="BookShelf Logo" className="w-7 h-7 object-contain" />
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-primary group-hover:text-secondary transition-colors">
              BookShelf
            </span>
            <span className="hidden sm:inline text-[10px] tracking-widest font-semibold uppercase text-secondary">
              Biblioteca
            </span>
          </div>
        </Link>
      </div>

      {/* Right: Theme Switcher, Quick Action CTA, User Profile Avatar (Figma #1:157, #1:160, #1:165) */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Theme Switcher Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
          title="Toggle Theme"
          aria-label="Toggle Theme"
        >
          <span className="material-symbols-outlined text-[20px] block">
            {isDark ? 'dark_mode' : 'light_mode'}
          </span>
        </button>

        {/* Quick Action CTA Button (Figma #1:160) */}
        {isAuthorSection ? (
          <Link
            to="/add-author"
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-lg bg-primary text-on-primary font-medium text-xs shadow-sm hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span className="hidden sm:inline">Add Author</span>
          </Link>
        ) : (
          <Link
            to="/add-book"
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-lg bg-primary text-on-primary font-medium text-xs shadow-sm hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span className="hidden sm:inline">Add Book</span>
          </Link>
        )}

        {/* User Profile Avatar (Figma Frame #1:165, #1:166) */}
        <button
          type="button"
          onClick={() => showToast('Chief Archivist · Master Collection', 'info', 2500)}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden ring-2 ring-outline-variant hover:ring-primary transition-all focus:outline-none shrink-0"
          title="Curator Profile"
        >
          <img src="/assets/user_profile.png" alt="Curator Profile" className="w-full h-full object-cover" />
        </button>
      </div>
    </header>
  );
}
