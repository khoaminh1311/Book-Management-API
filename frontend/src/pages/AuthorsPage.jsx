import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

// Color palette for author avatar initials matching Figma #1:226, #1:251, #1:276, etc.
const AVATAR_BG_COLORS = [
  'bg-[#D5E3FC] text-[#091426]',
  'bg-[#FFD9B0] text-[#745939]',
  'bg-[#BCC7DE] text-[#091426]',
  'bg-[#E4C099] text-[#745939]',
  'bg-[#E9E8E6] text-[#091426]',
  'bg-[#C5E8D8] text-[#1E523A]',
];

function getInitials(name = '') {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(id = '') {
  if (!id) return AVATAR_BG_COLORS[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
  }
  const idx = Math.abs(hash) % AVATAR_BG_COLORS.length;
  return AVATAR_BG_COLORS[idx];
}

const SORT_OPTIONS = [
  { value: 'recent', label: 'Last Updated' },
  { value: 'name-asc', label: 'Name (A - Z)' },
  { value: 'name-desc', label: 'Name (Z - A)' },
  { value: 'year-asc', label: 'Birth Year (Oldest)' },
  { value: 'year-desc', label: 'Birth Year (Youngest)' },
];

/**
 * Screen 2: AuthorsPage (Author Management)
 * Strict Figma Specs: Frame #1:167 ("Author Management - BookShelf")
 * - Editorial Header Section (#1:170): Breadcrumbs Dashboard > Authors, Title Newsreader 32px, Subtitle 14px, Button + Add Author
 * - Search & Filter Card (#1:191): bg-surface-container-lowest, inner input bg-[#F4F3F1] with exact 15x15 SVG magnifying glass
 * - Author Data Table Card (#1:198):
 *   - Table Subheader Bar (#1:199): All Catalog Authors, badge Showing X authors, inline text Sort by (NO rectangular box!)
 *   - Table Header (#1:214): AUTHOR, NATIONALITY, BIRTH YEAR, ACTIONS (Plus Jakarta Sans SemiBold 11px uppercase tracking 0.05em)
 *   - Table Body (#1:223): Avatar initials 12px bold, Author name 14px bold, bio 12px, nationality badge, birth year 14px, 3 action buttons
 *   - Table Footer / Pagination Controls (#1:474): Showing 1 to X of Y entries, Prev, Page numbers, Next
 */
export default function AuthorsPage() {
  const { showToast } = useToast();

  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(1);
  const limit = 10;
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAuthors = useCallback(async (targetPage = page) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.getAuthors({ page: targetPage, limit });
      const fetched = res?.data || [];
      setAuthors(fetched);
      if (res?.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Error fetching authors:', err);
      setError(err.message || 'Failed to connect to backend server');
      showToast(err.message || 'Failed to load authors', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, showToast]);

  useEffect(() => {
    fetchAuthors(page);
  }, [page, fetchAuthors]);

  const handleDeleteAuthor = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await api.deleteAuthor(deleteTarget._id);
      showToast(`Author "${deleteTarget.name}" deleted successfully`, 'success');
      setDeleteTarget(null);
      fetchAuthors(page);
    } catch (err) {
      console.error('Error deleting author:', err);
      showToast(err.message || 'Failed to delete author', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Filter and Sort in-memory
  const filteredAuthors = authors.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const nameMatch = (a.name || '').toLowerCase().includes(q);
    const bioMatch = (a.bio || '').toLowerCase().includes(q);
    const natMatch = (a.nationality || '').toLowerCase().includes(q);
    return nameMatch || bioMatch || natMatch;
  });

  const sortedAuthors = [...filteredAuthors].sort((a, b) => {
    if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
    if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '');
    if (sortBy === 'year-asc') return (Number(a.birthYear) || 0) - (Number(b.birthYear) || 0);
    if (sortBy === 'year-desc') return (Number(b.birthYear) || 0) - (Number(a.birthYear) || 0);
    return 0; // 'recent'
  });

  const totalAuthorsCount = pagination.total || authors.length;
  const startEntry = totalAuthorsCount === 0 ? 0 : (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, totalAuthorsCount);

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto flex flex-col gap-6 md:gap-8">
      {/* SECTION 1: EDITORIAL HEADER (Figma #1:170) */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          {/* Breadcrumbs (Figma #1:173) */}
          <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant mb-1">
            <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors">
              Dashboard
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold">Authors</span>
          </div>

          {/* Heading 1 (Figma #1:181 - style_8c587107: Newsreader Regular 32px/40px) */}
          <h1 className="font-serif text-3xl md:text-4xl text-primary font-normal tracking-tight">
            Author Management
          </h1>

          {/* Subtitle (Figma #1:183 - style_46e80e82: Plus Jakarta Sans 14px/22px) */}
          <p className="text-sm text-on-surface-variant mt-1 max-w-xl font-sans">
            Manage authors, biographies, and bibliographic affiliations.
          </p>
        </div>

        {/* Header Quick Actions: + Add Author (Figma #1:185 - #1:186) */}
        <Link
          to="/add-author"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold shadow-sm hover:bg-primary-container transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Add Author</span>
        </Link>
      </section>

      {/* SECTION 2: SEARCH & FILTER CARD (Figma #1:191 - #1:197) */}
      <section className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm">
        {/* Inner Input container (template EL-d1c6c56a: fills #F4F3F1, rounded-lg, padding 10px 16px 10px 44px) */}
        <div className="relative w-full bg-[#F4F3F1] rounded-lg flex items-center">
          {/* Exact Figma 15x15 SVG Magnifying Glass (Node #1:197 / EL-9b631dbf / layout_8049ca3c: 15x15px, #75777D) */}
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#75777D] flex items-center">
            <svg
              className="w-[15px] h-[15px]"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="6.5"
                cy="6.5"
                r="4.75"
                stroke="#75777D"
                strokeWidth="1.5"
              />
              <line
                x1="10.25"
                y1="10.25"
                x2="13.75"
                y2="13.75"
                stroke="#75777D"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search authors by name..."
            className="w-full pl-11 pr-4 py-2.5 bg-transparent border-none text-sm text-[#1A1C1B] placeholder:text-[#75777D] focus:outline-none focus:ring-0 font-sans"
          />
        </div>
      </section>

      {/* SECTION 3: AUTHOR DATA TABLE CARD (Figma #1:198) */}
      <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden flex flex-col">
        {/* Table Subheader Bar (Figma #1:199 - template EL-10ebdc0c: padding 16px 24px) */}
        <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/30">
          {/* Left: Heading & Badge (Figma #1:200 - #1:204) */}
          <div className="flex items-center gap-2.5">
            <h2 className="font-sans font-semibold text-sm text-primary">All Catalog Authors</h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E9E8E6] text-[#45474C] font-sans tracking-[0.05em]">
              Showing {sortedAuthors.length} authors
            </span>
          </div>

          {/* Right: Inline Sort by (Figma #1:205 - #1:212: gap 4px between text and caret!) */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#45474C] font-sans">Sort by:</span>
            <div className="relative inline-flex items-center cursor-pointer group">
              <div className="flex items-center gap-1 text-sm font-semibold text-primary select-none">
                <span>{SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Last Updated'}</span>
                {/* Exact downward triangle caret matching Figma #1:212 (width 6.67, height 3.33, color #091426) */}
                <svg className="w-[7px] h-[4px] fill-current shrink-0 text-primary" viewBox="0 0 7 4">
                  <path d="M0 0L3.5 3.5L7 0H0Z" />
                </svg>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer font-sans"
                aria-label="Sort authors by"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Responsive Table (Figma #1:213 - template EL-8d44cd4d) */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-xs text-on-surface-variant font-sans">Loading authors catalog...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center flex flex-col items-center justify-center gap-2 p-6">
              <span className="material-symbols-outlined text-[36px] text-error">cloud_off</span>
              <p className="text-sm font-medium text-primary font-sans">Failed to load authors</p>
              <p className="text-xs text-on-surface-variant max-w-sm font-sans">{error}</p>
              <button
                type="button"
                onClick={() => fetchAuthors(page)}
                className="mt-2 px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold font-sans"
              >
                Retry
              </button>
            </div>
          ) : sortedAuthors.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center gap-2 p-6">
              <span className="material-symbols-outlined text-[40px] text-outline-variant">person_off</span>
              <p className="text-sm font-medium text-primary font-sans">No authors found</p>
              <p className="text-xs text-on-surface-variant font-sans">
                {search ? 'Try adjusting your search criteria.' : 'Start adding authors to your catalog.'}
              </p>
              <Link
                to="/add-author"
                className="mt-2 inline-flex items-center gap-1 px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold font-sans"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                <span>Add First Author</span>
              </Link>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              {/* Table Header (Figma #1:214: bg rgba(244, 243, 241, 0.7), Plus Jakarta Sans SemiBold 11px uppercase tracking 0.05em) */}
              <thead>
                <tr className="bg-[rgba(244,243,241,0.7)] border-b border-outline-variant/30 text-[11px] font-semibold tracking-[0.05em] text-[#45474C] uppercase font-sans">
                  <th scope="col" className="px-6 py-3.5 w-5/12 font-semibold">
                    AUTHOR
                  </th>
                  <th scope="col" className="px-4 py-3.5 w-3/12 font-semibold">
                    NATIONALITY
                  </th>
                  <th scope="col" className="px-4 py-3.5 w-2/12 font-semibold">
                    BIRTH YEAR
                  </th>
                  <th scope="col" className="px-6 py-3.5 w-2/12 font-semibold text-right">
                    ACTIONS
                  </th>
                </tr>
              </thead>

              {/* Table Body (Figma #1:223) */}
              <tbody className="divide-y divide-outline-variant/20">
                {sortedAuthors.map((author) => {
                  const avatarColor = getAvatarColor(author._id);
                  const initials = getInitials(author.name);

                  return (
                    <tr
                      key={author._id}
                      className="hover:bg-surface-container/30 transition-colors group"
                    >
                      {/* Author Column (Figma #1:225 - #1:232) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          {/* Circular Avatar Pill with initials (Figma #1:226: style_5481847a: Plus Jakarta Sans Bold 12px) */}
                          <div
                            className={`w-[38px] h-[38px] rounded-full flex items-center justify-center text-[12px] font-bold tracking-[-0.025em] shrink-0 shadow-sm border border-outline-variant/30 font-sans ${avatarColor}`}
                          >
                            {initials}
                          </div>

                          <div className="min-w-0">
                            {/* Author Name: style_f7b50b4b (Plus Jakarta Sans Bold 14px/20px) */}
                            <Link
                              to={`/authors/${author._id}`}
                              className="font-sans font-bold text-[14px] leading-[20px] text-primary hover:text-secondary hover:underline transition-colors block truncate"
                            >
                              {author.name}
                            </Link>

                            {/* Author Bio: style_adc113b5 (Plus Jakarta Sans Regular 12px/18px) */}
                            {author.bio ? (
                              <p className="text-[12px] leading-[18px] text-[#45474C] line-clamp-1 max-w-md mt-0.5 font-sans">
                                {author.bio}
                              </p>
                            ) : (
                              <p className="text-[12px] text-on-surface-variant/50 italic mt-0.5 font-sans">
                                No bio provided
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Nationality Column (Figma #1:233 - #1:235: template EL-fe02f149, style_20059e61) */}
                      <td className="px-4 py-4">
                        {author.nationality ? (
                          <span className="inline-block px-2 py-0.5 rounded bg-[#F4F3F1] text-[11px] font-semibold tracking-[0.05em] text-[#45474C] font-sans">
                            {author.nationality}
                          </span>
                        ) : (
                          <span className="text-xs text-on-surface-variant/40">—</span>
                        )}
                      </td>

                      {/* Birth Year Column (Figma #1:236 - #1:237: style_46e80e82: Plus Jakarta Sans Regular 14px/22px) */}
                      <td className="px-4 py-4 text-[14px] leading-[22px] text-[#1A1C1B] font-sans">
                        {author.birthYear || '—'}
                      </td>

                      {/* Actions Column (Figma #1:238 - #1:248) */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* View details (#1:240) */}
                          <Link
                            to={`/authors/${author._id}`}
                            className="w-8 h-8 rounded-lg text-[#45474C] hover:text-primary hover:bg-[#F4F3F1] transition-colors inline-flex items-center justify-center"
                            title="View author profile"
                            aria-label={`View ${author.name}`}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              visibility
                            </span>
                          </Link>

                          {/* Edit author (#1:243) */}
                          <Link
                            to={`/edit-author/${author._id}`}
                            className="w-8 h-8 rounded-lg text-[#45474C] hover:text-primary hover:bg-[#F4F3F1] transition-colors inline-flex items-center justify-center"
                            title="Edit author"
                            aria-label={`Edit ${author.name}`}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              edit
                            </span>
                          </Link>

                          {/* Delete author (#1:246) */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(author)}
                            className="w-8 h-8 rounded-lg text-[#BA1A1A] hover:bg-error-container/60 hover:text-on-error-container transition-colors inline-flex items-center justify-center"
                            title="Delete author"
                            aria-label={`Delete ${author.name}`}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Table Footer / Pagination Controls (Figma #1:474 - template EL-10ebdc0c: padding 16px 24px) */}
        {!loading && !error && (
          <div className="px-6 py-4 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-lowest">
            {/* Entries counter (#1:476: style_adc113b5: Plus Jakarta Sans Regular 12px) */}
            <div className="text-[12px] leading-[18px] text-[#45474C] font-sans">
              Showing <span className="font-semibold text-primary">{startEntry}</span> to{' '}
              <span className="font-semibold text-primary">{endEntry}</span> of{' '}
              <span className="font-semibold text-primary">{totalAuthorsCount.toLocaleString()}</span> entries
            </div>

            {/* Pagination Navigation (#1:477) */}
            <nav aria-label="Pagination Navigation" className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#45474C] hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>

              <button
                type="button"
                className="w-8 h-8 rounded-lg bg-primary text-white text-[12px] font-semibold tracking-[0.04em] flex items-center justify-center shadow-sm font-sans"
                aria-current="page"
              >
                {page}
              </button>

              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#45474C] hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </nav>
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-xl border border-outline-variant/50 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-error mb-3">
              <span className="material-symbols-outlined text-[28px]">warning</span>
              <h3 className="font-serif text-xl font-medium text-primary">Delete Author</h3>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed font-sans">
              Are you sure you want to remove{' '}
              <strong className="text-primary">{deleteTarget.name}</strong> from the catalog? This action
              cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors font-sans"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteAuthor}
                className="px-4 py-2 bg-error text-on-error rounded-xl text-xs font-semibold hover:bg-error/90 transition-colors flex items-center gap-1.5 shadow-sm font-sans"
              >
                {deleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Author</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
