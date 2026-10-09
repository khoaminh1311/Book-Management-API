import React from 'react';
import { Link } from 'react-router-dom';

export default function SearchFilterBar({
  search,
  onSearchChange,
  genre,
  onGenreChange,
}) {
  const genres = [
    'All Genres',
    'Art & Design',
    'Architecture',
    'Philosophy',
    'Essay',
    'Historical Fiction',
    'Fantasy',
    'Epic Fantasy',
    'General',
  ];

  return (
    <section className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/40 shadow-sm flex flex-col sm:flex-row items-center gap-3">
      {/* Live Search Input */}
      <div className="relative flex-1 w-full">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search books by title..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-outline-variant/60 text-sm text-primary placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Genre Filter Dropdown */}
      <div className="w-full sm:w-56 shrink-0">
        <select
          value={genre}
          onChange={(e) => onGenreChange(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/60 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
        >
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* Quick navigation link */}
      <Link
        to="/authors"
        className="hidden md:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-outline-variant hover:bg-surface text-sm font-medium text-on-surface transition-colors shrink-0"
      >
        <span className="material-symbols-outlined text-[18px]">group</span>
        <span>View Authors</span>
      </Link>
    </section>
  );
}
