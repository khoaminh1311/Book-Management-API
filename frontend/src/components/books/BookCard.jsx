import React from 'react';
import { Link } from 'react-router-dom';

const DEFAULT_COVER = '/assets/book_cover_architecture.png';

/**
 * BookCard Component
 * Strict Figma Design System Specs (Frame #1:599 / EL-cd277d04):
 * - Card: p-4 (16px), rounded-2xl (16px), bg-surface-container-lowest, border border-outline-variant/40, shadow-sm
 * - Cover Container: 2/3 aspect ratio, rounded-xl (12px), overflow-hidden, relative
 * - Genre Pill: top-2.5 right-2.5, px-2.5 py-1, rounded-full, bg-white/90 backdrop-blur, text-[#45474C], Plus Jakarta Sans 600 11px
 * - Floating Overlay: backdrop-blur-[1px] bg-primary/20, pill bg-white/95 backdrop-blur-md rounded-full shadow-lg p-1.5 gap-1.5
 * - Author & Year Row: Plus Jakarta Sans SemiBold 600, 11px, tracking 0.05em, text-[#45474C]
 * - Title: Newsreader Medium 500, 20px, leading 28px, text-primary, line-clamp-1 (style_90f8f5d7)
 * - Price: Plus Jakarta Sans SemiBold 600, 16px, leading 24px, tracking -0.005em, text-primary (style_75ddd075)
 */
export default function BookCard({ book, onDelete, variant = 'default' }) {
  const authorName = book.author?.name || (typeof book.author === 'string' ? 'Referenced Author' : 'Unknown Author');
  const authorId = book.author?._id || (typeof book.author === 'string' ? book.author : '');
  const coverUrl = book.coverImage || DEFAULT_COVER;
  const priceFormatted = book.price !== undefined && book.price !== null ? `$${Number(book.price).toFixed(2)}` : 'Free';
  const genre = book.genre || 'General';
  const year = book.publishedYear || '—';
  const isAuthorCatalog = variant === 'author';

  return (
    <div className={`group relative bg-surface-container-lowest ${isAuthorCatalog ? 'rounded-xl' : 'rounded-2xl'} p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-outline-variant/40`}>
      {/* Book Cover Artwork (2:3 Ratio) - Figma #1:60 / EL-af3a1dd2 has borderRadius: 8px */}
      <div className={`relative w-full aspect-[2/3] ${isAuthorCatalog ? 'rounded-lg' : 'rounded-xl'} overflow-hidden bg-surface-container mb-3.5`}>
        {isAuthorCatalog ? (
          <Link to={`/books/${book._id}`} className="block w-full h-full overflow-hidden group/cover">
            <img
              src={coverUrl}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover/cover:scale-105"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_COVER;
              }}
            />
          </Link>
        ) : (
          <img
            src={coverUrl}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_COVER;
            }}
          />
        )}

        {/* Top-Right Badge: Published Year on Author Detail (Figma #1:62 - #1:64), Genre on Dashboard (Figma #1:616)
            Figma template EL-9470983c: padding 1.5px 8px, borderRadius: 4px (rounded), bg-white/90, backdrop-blur-[2px], shadow-sm */}
        <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
          {isAuthorCatalog ? (
            <span className="px-2 py-0.5 rounded bg-white/90 backdrop-blur-[2px] text-[#091426] text-[11px] font-semibold tracking-[0.05em] shadow-sm font-sans">
              {year}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-white/90 backdrop-blur-[2px] text-[#1A1C1B] text-[11px] font-semibold tracking-[0.05em] shadow-sm uppercase font-sans">
              {genre}
            </span>
          )}
        </div>

        {/* Glassmorphism Floating Action Overlay (only on Dashboard, NOT on Author Detail) */}
        {!isAuthorCatalog && (
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3">
            <div className="flex items-center gap-1.5 p-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-lg">
              <Link
                to={`/books/${book._id}`}
                className="p-2 rounded-full text-[#45474C] hover:text-primary hover:bg-surface-container transition-colors"
                title="View details"
                aria-label="View details"
              >
                <span className="material-symbols-outlined text-[18px] block">visibility</span>
              </Link>
              <Link
                to={`/edit-book/${book._id}`}
                className="p-2 rounded-full text-[#45474C] hover:text-primary hover:bg-surface-container transition-colors"
                title="Edit volume"
                aria-label="Edit volume"
              >
                <span className="material-symbols-outlined text-[18px] block">edit</span>
              </Link>
              <button
                type="button"
                onClick={() => onDelete(book)}
                className="p-2 rounded-full text-error hover:bg-error-container hover:text-on-error-container transition-colors"
                title="Delete volume"
                aria-label="Delete volume"
              >
                <span className="material-symbols-outlined text-[18px] block">delete</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Book Metadata (Figma #1:65 - #1:77 / EL-1519dabc) */}
      <div className="flex flex-col gap-1.5 flex-1 justify-between">
        <div>
          {/* Top Metadata Line:
              - Author Detail (Figma #1:68 - #1:69 / EL-98571c4a): Pill with fill rgba(255, 217, 176, 0.4), text #745939, rounded-full
              - Dashboard (Figma #1:620): Author & Year */}
          {isAuthorCatalog ? (
            <div className="mb-1">
              <span className="inline-block px-2 py-0.5 rounded-full bg-[rgba(255,217,176,0.4)] text-[#745939] text-[11px] font-semibold tracking-[0.05em] uppercase font-sans">
                {genre}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[#45474C] text-[11px] font-semibold tracking-[0.05em] mb-1 font-sans">
              <span className="truncate pr-2">
                {authorId ? (
                  <Link to={`/authors/${authorId}`} className="hover:text-primary hover:underline transition-colors">
                    {authorName}
                  </Link>
                ) : (
                  authorName
                )}
              </span>
              <span className="shrink-0 font-medium">{year}</span>
            </div>
          )}

          {/* Monumental Title: Newsreader Medium 500 20px (Figma #1:71 / #1:623) */}
          <h2 className="font-serif font-medium text-[20px] leading-[28px] text-primary line-clamp-1">
            <Link to={`/books/${book._id}`} className="hover:text-secondary transition-colors" title={book.title}>
              {book.title}
            </Link>
          </h2>
        </div>

        {/* Price Row: Plus Jakarta Sans Bold 700 16px (Figma #1:74 / #1:625) + Action Arrow Icon (Figma #1:75 / EL-1448f550) */}
        <div className="pt-2 flex items-center justify-between mt-auto">
          <span className="font-sans font-bold text-[16px] leading-[24px] tracking-[-0.005em] text-primary">
            {priceFormatted}
          </span>
          {isAuthorCatalog && (
            <Link
              to={`/books/${book._id}`}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[#091426] hover:bg-[#EFEEEC] transition-colors"
              title="View volume details"
              aria-label="View volume details"
            >
              <span className="material-symbols-outlined text-[20px] block leading-none">arrow_forward</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
