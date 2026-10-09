import React from 'react';

/**
 * SearchFilterBar Component
 * Strict Figma Design System Specs (Frame #1:577 - SECTION 2: SEARCH & FILTER BAR):
 * - Container (#1:577): bg-surface-container-lowest, rounded-2xl (16px), p-4 (16px), shadow-sm, border border-outline-variant/40
 * - Search Input (#1:579 - #1:584): flex-1, icon search (#1:584), placeholder "Search books by title..." (Plus Jakarta Sans 14px, #75777D)
 * - Filter Dropdowns (#1:585):
 *   - Genre Dropdown (#1:586 - #1:591): Options "All Genres", icon expand_more (#1:591, #75777D), text #1A1C1B
 *   - Sort Dropdown (#1:592 - #1:597): Options "Sort by: Recently Added", icon unfold_more (#1:597, #75777D), text #1A1C1B
 * (NO spurious "View Authors" button - strictly adhering to Figma specs)
 */
export default function SearchFilterBar({
  search,
  onSearchChange,
  genre,
  onGenreChange,
  sortBy = 'recent',
  onSortChange,
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

  const sortOptions = [
    { value: 'recent', label: 'Sort by: Recently Added' },
    { value: 'title-asc', label: 'Sort by: Title (A - Z)' },
    { value: 'title-desc', label: 'Sort by: Title (Z - A)' },
    { value: 'price-asc', label: 'Sort by: Price (Low to High)' },
    { value: 'price-desc', label: 'Sort by: Price (High to Low)' },
    { value: 'year-desc', label: 'Sort by: Published Year' },
  ];

  return (
    <section className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/40 shadow-sm flex flex-col md:flex-row items-center gap-3">
      {/* Live Search Input (#1:579) */}
      <div className="relative flex-1 w-full">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search books by title..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-outline-variant/60 text-sm text-[#1A1C1B] placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        {/* Genre Filter Dropdown (#1:586) */}
        <div className="relative w-full sm:w-auto shrink-0">
          <select
            value={genre}
            onChange={(e) => onGenreChange(e.target.value)}
            className="w-full sm:w-44 appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-surface border border-outline-variant/60 text-sm text-[#1A1C1B] font-sans focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
          >
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-[#75777D]">
            expand_more
          </span>
        </div>

        {/* Sort by Dropdown (#1:592) */}
        <div className="relative w-full sm:w-auto shrink-0">
          <select
            value={sortBy}
            onChange={(e) => onSortChange && onSortChange(e.target.value)}
            className="w-full sm:w-56 appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-surface border border-outline-variant/60 text-sm text-[#1A1C1B] font-sans focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-[#75777D]">
            unfold_more
          </span>
        </div>
      </div>
    </section>
  );
}
