import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const DEFAULT_COVER = '/assets/book_cover_architecture.png';

function getInitials(name = '') {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Screen 3: BookDetailPage (Volume Overview & Technical Specs)
 * Strict Figma Specs: Frame #1:798 ("Book Detail - The Architecture of Silence")
 * - Top Breadcrumbs (#1:801): Books > {Title}
 * - Main 12-Column Editorial Split (#1:808):
 *   - LEFT COLUMN (5 Cols - #1:809): Physical Volume Mockup, ambient light gradients, archival seal tag, Quick Actions (Edit / Delete)
 *   - RIGHT COLUMN (7 Cols - #1:832):
 *     - Header Banner (#1:833): Genre badge, published year badge, Monumental title (Newsreader 48px), Author byline, Value badge
 *     - Description Card (#1:851): Icon menu_book, heading Description, curatorial text
 *     - Interactive Author Mini-Card (#1:867): Avatar circle initials, Demographics & bio, View Author Profile button
 */
export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchBookDetail() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getBook(id);
        if (res?.data) {
          setBook(res.data);
        } else {
          setError('Volume not found');
        }
      } catch (err) {
        console.error('Error fetching book detail:', err);
        setError(err.message || 'Failed to load volume details');
        showToast(err.message || 'Failed to load volume details', 'error');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchBookDetail();
    }
  }, [id, showToast]);

  const handleDeleteBook = async () => {
    if (!book) return;
    setDeleting(true);
    try {
      await api.deleteBook(book._id);
      showToast(`Volume "${book.title}" was deleted from catalog`, 'success');
      navigate('/');
    } catch (err) {
      console.error('Error deleting book:', err);
      showToast(err.message || 'Failed to delete volume', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 lg:p-12 max-w-7xl w-full mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm text-on-surface-variant font-sans">Loading volume archival details...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="p-8 lg:p-12 max-w-7xl w-full mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="material-symbols-outlined text-[48px] text-error">menu_book</span>
        <h2 className="font-serif text-2xl text-primary font-medium">Volume Not Found</h2>
        <p className="text-sm text-on-surface-variant max-w-md text-center">
          {error || 'The requested volume could not be located in the library catalog.'}
        </p>
        <Link
          to="/"
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold shadow hover:bg-primary-container transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  const author = book.author && typeof book.author === 'object' ? book.author : null;
  const authorName = author?.name || (typeof book.author === 'string' ? 'Referenced Author' : 'Unknown Author');
  const authorId = author?._id || (typeof book.author === 'string' ? book.author : '');
  const coverUrl = book.coverImage || DEFAULT_COVER;
  const priceFormatted = book.price !== undefined && book.price !== null ? `$${Number(book.price).toFixed(2)}` : 'Free';
  const archivalNo = book._id ? `ARCHIVAL NO. ${book._id.slice(-4).toUpperCase()}` : 'ARCHIVAL NO. 492';

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-7xl w-full mx-auto flex flex-col gap-6 lg:gap-8">
      {/* Top Breadcrumbs (Figma #1:801 - #1:807) */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-[#45474C] font-sans">
        <Link to="/" className="text-[#45474C] hover:text-primary transition-colors">
          Books
        </Link>
        <span className="material-symbols-outlined text-[14px] text-[#75777D]">chevron_right</span>
        <span className="font-medium text-[#1A1C1B] truncate max-w-md">{book.title}</span>
      </nav>

      {/* Main Editorial Two-Column Split Canvas (Figma #1:808) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* LEFT COLUMN: Physical Volume Presentation (5 Columns - Figma #1:809: borderRadius 12px, padding 48px) */}
        <section className="lg:col-span-5 bg-[#F4F3F1] rounded-xl p-8 lg:p-12 relative overflow-hidden flex flex-col items-center shadow-sm border border-outline-variant/40">
          {/* Ambient subtle light gradients (Figma #1:810, #1:811) */}
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-[rgba(255,221,184,0.35)] blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-[rgba(216,227,251,0.45)] blur-3xl pointer-events-none" />

          {/* Physical Book Presentation Mockup (Figma #1:812 - #1:819) */}
          <div className="relative group max-w-[272px] w-full aspect-[2/3] z-10">
            {/* Spine shadow simulation (Figma #1:813) */}
            <div className="absolute -inset-1.5 rounded-xl bg-gradient-to-r from-primary/30 via-transparent to-primary/10 blur-md pointer-events-none" />

            {/* Book Cover Container (Figma #1:814: borderRadius 8px) */}
            <div className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl bg-[#EFEEEC] border border-black/5">
              <img
                src={coverUrl}
                alt={book.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = DEFAULT_COVER;
                }}
              />

              {/* Subtle spine ridge overlay (Figma #1:817) */}
              <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-primary/25 via-primary/5 to-transparent pointer-events-none" />

              {/* Archival Seal Tag Floating on Cover (Figma #1:818 - #1:819) */}
              <div className="absolute top-4 right-4 bg-[#091426]/85 backdrop-blur px-2.5 py-1 rounded text-white text-[11px] font-semibold tracking-wider uppercase shadow-md font-sans">
                {archivalNo}
              </div>
            </div>
          </div>

          {/* Quick Action Micro Bar under Cover (Figma #1:820 - #1:831: padding 10px 20px, borderRadius 8px, 14px font) */}
          <div className="mt-8 flex items-center justify-center gap-3 w-full z-10">
            {/* Edit Book Button (Figma #1:822) */}
            <Link
              to={`/edit-book/${book._id}`}
              className="flex-1 max-w-[136px] flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-lg bg-white border border-outline-variant/40 text-[#1A1C1B] font-semibold text-sm shadow-sm hover:bg-surface-container transition-colors font-sans"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              <span className="leading-tight text-center">Edit<br />Book</span>
            </Link>

            {/* Delete Book Button (Figma #1:827) */}
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="flex-1 max-w-[136px] flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-lg bg-[#FFDAD6] text-[#BA1A1A] font-semibold text-sm shadow-sm hover:bg-[#FFDAD6]/80 transition-colors font-sans"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              <span className="leading-tight text-center">Delete<br />Book</span>
            </button>
          </div>
        </section>

        {/* RIGHT COLUMN: Catalog Content, Curatorial Summary & Author Card (7 Columns - Figma #1:832) */}
        <section className="lg:col-span-7 flex flex-col gap-6 lg:gap-8">
          {/* Header Banner & Taxonomic Indicators (Figma #1:833 - #1:850) */}
          <div className="flex flex-col gap-3">
            {/* Badges Row (Figma #1:834 - #1:838) */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {book.genre && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[rgba(255,221,184,0.5)] text-[#745939] font-sans">
                  {book.genre}
                </span>
              )}
              {book.publishedYear && (
                <span className="inline-block px-2.5 py-1 rounded text-xs font-semibold bg-[#EFEEEC] text-[#45474C] font-sans">
                  Published {book.publishedYear}
                </span>
              )}
            </div>

            {/* Monumental Work Title (Figma #1:839 - #1:840: Newsreader Regular 48px/60px -0.02em) */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[48px] lg:leading-[60px] tracking-[-0.02em] font-normal text-primary mt-1">
              {book.title}
            </h1>

            {/* Author Byline & Core Evaluation Metrics (Figma #1:841 - #1:850) */}
            <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
              <div className="flex items-baseline gap-1.5 text-base text-[#45474C] font-sans">
                <span>by</span>
                {authorId ? (
                  <Link
                    to={`/authors/${authorId}`}
                    className="font-serif font-medium text-xl text-primary hover:text-secondary underline decoration-1 underline-offset-4 transition-colors"
                  >
                    {authorName}
                  </Link>
                ) : (
                  <span className="font-serif font-medium text-xl text-primary">{authorName}</span>
                )}
              </div>

              {/* Quantitative Appraisal Badge (Figma #1:847 - #1:850: style_9f155e5b: Newsreader Medium 500 20px) */}
              <div className="bg-[#F4F3F1] px-4 py-2 rounded-xl flex items-baseline gap-2 border border-outline-variant/30 font-sans">
                <span className="text-[11px] font-semibold tracking-wider text-[#45474C] uppercase">VALUE</span>
                <span className="font-serif font-medium text-[20px] leading-[28px] text-[#1A1C1B]">{priceFormatted}</span>
              </div>
            </div>
          </div>

          {/* Curatorial Overview & Thematic Description (Figma #1:851 - #1:866) */}
          <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-xl border border-outline-variant/40 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-[22px] text-[#745939]">menu_book</span>
              <h2 className="font-serif font-medium text-[20px] leading-[28px]">Description</h2>
            </div>

            <div className="text-sm sm:text-[16px] leading-[26px] text-[#1A1C1B] font-sans whitespace-pre-line">
              {book.description || 'No detailed curatorial description has been recorded for this volume yet.'}
            </div>
          </div>

          {/* Interactive Author Mini-Card (Figma #1:867 - #1:885) */}
          {author && (
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 shadow-sm flex items-center gap-5">
              {/* Author Avatar circle (Figma #1:869 - #1:870: 48x48px, fill #E9E8E6, border #C5C6CD, text Newsreader 16px) */}
              <div className="w-12 h-12 rounded-full bg-[#E9E8E6] flex items-center justify-center font-serif text-[16px] leading-[24px] tracking-[0.05em] font-medium text-primary shrink-0 border border-[#C5C6CD] shadow-sm">
                {getInitials(author.name)}
              </div>

              {/* Author Demographics, Link & Bio Stack (Figma #1:871 - #1:885) */}
              <div className="min-w-0 flex-1 flex flex-col gap-2">
                <div className="flex flex-col gap-0.5">
                  {/* Author Name (Figma #1:875: Newsreader Medium 500 20px) */}
                  <Link
                    to={`/authors/${author._id}`}
                    className="font-serif font-medium text-[20px] leading-[28px] text-primary hover:text-secondary hover:underline transition-colors block"
                  >
                    {author.name}
                  </Link>
                  {/* Demographics (Figma #1:877) */}
                  <p className="text-xs text-[#45474C] font-sans">
                    {[
                      author.nationality,
                      author.birthYear ? `Born ${author.birthYear}` : null,
                    ]
                      .filter(Boolean)
                      .join(' • ') || 'Catalog Author'}
                  </p>
                </div>

                {/* View Author Profile link (Figma #1:878 - #1:882: inline text link gap 4px directly under demographics) */}
                <Link
                  to={`/authors/${author._id}`}
                  className="inline-flex items-center gap-1 text-[#745939] hover:underline font-semibold text-[14px] leading-[20px] transition-colors w-fit font-sans"
                >
                  <span>View Author Profile</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>

                {/* Author Bio (Figma #1:883 - #1:885: 14px / 22px text #1A1C1B) */}
                {author.bio && (
                  <p className="text-[14px] leading-[22px] text-[#1A1C1B] line-clamp-2 pt-1 font-sans">
                    {author.bio}
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-xl border border-outline-variant/50 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-error mb-3">
              <span className="material-symbols-outlined text-[28px]">warning</span>
              <h3 className="font-serif text-xl font-medium text-primary">Delete Volume</h3>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed font-sans">
              Are you sure you want to permanently delete{' '}
              <strong className="text-primary">{book.title}</strong> from the catalog? This action
              cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors font-sans"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteBook}
                className="px-4 py-2 bg-error text-on-error rounded-xl text-xs font-semibold hover:bg-error/90 transition-colors flex items-center gap-1.5 shadow-sm font-sans"
              >
                {deleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Volume</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
