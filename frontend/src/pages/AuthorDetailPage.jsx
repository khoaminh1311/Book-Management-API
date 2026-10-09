import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import BookCard from '../components/books/BookCard';

function getInitials(name = '') {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Screen 4: AuthorDetailPage (Author Profile & Associated Bibliography)
 * Strict Figma Design System Specs: Frame #1:2 ("Author Detail - Elena Rostova")
 * - Breadcrumbs (#1:5 - #1:11): Authors > {Author Name}
 * - Section 2: Author Profile Card (#1:12 - #1:44):
 *   - Avatar with initials (48x48px, Newsreader Bold 20px, bg #EFEEEC)
 *   - Author Name (Newsreader Regular 32px / 40px -0.025em)
 *   - Quick Actions: Edit Profile (#1:21) & Delete Author (#1:26)
 *   - Demographic Badges (#1:31): Nationality (globe) & Birth Year (calendar)
 *   - Biography block (#1:40): "BIOGRAPHY" label (11px bronze #745939) & bio text
 * - Section 3: "Books by this Author" Catalog Grid (#1:45 - #1:137):
 *   - Header Bar with title, book count pill (#1:50: bg #E9E8E6), and + Add Book CTA (#1:52)
 *   - 4-Column responsive grid using standard BookCard component (#1:58)
 */
export default function AuthorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [author, setAuthor] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Author Deletion Modal State
  const [showDeleteAuthorModal, setShowDeleteAuthorModal] = useState(false);
  const [deletingAuthor, setDeletingAuthor] = useState(false);

  // Book Deletion Modal State
  const [bookToDelete, setBookToDelete] = useState(null);
  const [deletingBook, setDeletingBook] = useState(false);

  useEffect(() => {
    async function fetchAuthorDetail() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getAuthor(id);
        if (res?.data) {
          setAuthor(res.data);
          setBooks(res.data.books || []);
        } else {
          setError('Author profile not found');
        }
      } catch (err) {
        console.error('Error fetching author detail:', err);
        setError(err.message || 'Failed to load author profile');
        showToast(err.message || 'Failed to load author profile', 'error');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchAuthorDetail();
    }
  }, [id, showToast]);

  const handleDeleteAuthor = async () => {
    if (!author) return;
    if (books.length > 0) {
      showToast('Cannot delete author while they have cataloged volumes.', 'error');
      return;
    }

    setDeletingAuthor(true);
    try {
      await api.deleteAuthor(author._id);
      showToast(`Author "${author.name}" was removed from the catalog.`, 'success');
      navigate('/authors');
    } catch (err) {
      console.error('Error deleting author:', err);
      showToast(err.message || 'Failed to delete author', 'error');
    } finally {
      setDeletingAuthor(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!bookToDelete) return;
    setDeletingBook(true);
    try {
      await api.deleteBook(bookToDelete._id);
      setBooks((prev) => prev.filter((b) => b._id !== bookToDelete._id));
      showToast(`Volume "${bookToDelete.title}" was removed from the catalog.`, 'success');
      setBookToDelete(null);
    } catch (err) {
      console.error('Error deleting volume:', err);
      showToast(err.message || 'Failed to delete volume', 'error');
    } finally {
      setDeletingBook(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 lg:p-12 max-w-7xl w-full mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm text-on-surface-variant font-sans">Loading author archival record...</p>
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="p-8 lg:p-12 max-w-7xl w-full mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="material-symbols-outlined text-[48px] text-error">person_off</span>
        <h2 className="font-serif text-2xl text-primary font-medium">Author Not Found</h2>
        <p className="text-sm text-on-surface-variant max-w-md text-center">
          {error || 'The requested author could not be located in the catalog.'}
        </p>
        <Link
          to="/authors"
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold shadow hover:bg-primary/90 transition-colors font-sans"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Authors</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-7xl w-full mx-auto flex flex-col gap-6 lg:gap-8">
      {/* Top Breadcrumb Nav (Figma #1:5 - #1:11) */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-[#45474C] font-sans">
        <Link to="/authors" className="text-[#45474C] hover:text-primary transition-colors">
          Authors
        </Link>
        <span className="material-symbols-outlined text-[14px] text-[#75777D]">chevron_right</span>
        <span className="font-medium text-[#1A1C1B] truncate max-w-md">{author.name}</span>
      </nav>

      {/* Section 2: Author Profile Card (Figma #1:12 - #1:44) */}
      <section className="bg-surface-container-lowest p-6 sm:p-10 rounded-xl border border-outline-variant/40 shadow-sm flex flex-col gap-6">
        {/* Header Row: Avatar, Name & Quick Actions (Figma #1:14 - #1:30) */}
        <div className="flex items-center justify-between gap-4 flex-wrap pb-6 border-b border-[#E9E8E6]">
          {/* Avatar & Author Name (Figma #1:15 - #1:19: gap 16px) */}
          <div className="flex items-center gap-4">
            {/* Avatar Circle (Figma #1:16 - #1:17: fixed 48x48px, fills #EFEEEC, no border, Newsreader Bold 20px) */}
            <div className="w-12 h-12 rounded-full bg-[#EFEEEC] flex items-center justify-center font-serif text-[20px] font-bold text-primary shrink-0 shadow-sm">
              {getInitials(author.name)}
            </div>

            {/* Author Title (Figma #1:18 - #1:19: Newsreader Regular 32px / 40px -0.025em text #091426) */}
            <h1 className="font-serif text-2xl sm:text-[32px] sm:leading-[40px] tracking-[-0.025em] font-normal text-primary">
              {author.name}
            </h1>
          </div>

          {/* Quick Actions (Figma #1:20 - #1:30: style_b29ee016 font 14px / 20px) */}
          <div className="flex items-center gap-2.5">
            {/* Edit Profile Button (Figma #1:21 - #1:25: fills #EFEEEC, text #1A1C1B, text-sm leading-[20px]) */}
            <Link
              to={`/edit-author/${author._id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#EFEEEC] hover:bg-[#E9E8E6] text-[#1A1C1B] font-semibold text-sm leading-[20px] transition-colors shadow-sm font-sans"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>Edit Profile</span>
            </Link>

            {/* Delete Author Button (Figma #1:26 - #1:30: fills rgba(255, 218, 214, 0.6), text #BA1A1A, text-sm leading-[20px]) */}
            <button
              type="button"
              onClick={() => setShowDeleteAuthorModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FFDAD6]/60 hover:bg-[#FFDAD6] text-[#BA1A1A] font-semibold text-sm leading-[20px] transition-colors shadow-sm font-sans"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              <span>Delete Author</span>
            </button>
          </div>
        </div>

        {/* Demographic Badges Row (Figma #1:31 - #1:39) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Nationality Badge (Figma #1:32 - #1:35: rounded-full 9999px, bg #F4F3F1) */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F4F3F1] text-[#45474C] text-xs font-semibold font-sans">
            <span className="material-symbols-outlined text-[15px] text-[#75777D]">public</span>
            <span>{author.nationality || 'Nationality Not Specified'}</span>
          </div>

          {/* Birth Year Badge (Figma #1:36 - #1:39: rounded-full 9999px, bg #F4F3F1) */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F4F3F1] text-[#45474C] text-xs font-semibold font-sans">
            <span className="material-symbols-outlined text-[15px] text-[#75777D]">calendar_today</span>
            <span>{author.birthYear ? `Born ${author.birthYear}` : 'Birth Year Unknown'}</span>
          </div>
        </div>

        {/* Biography Block (Figma #1:40 - #1:44) */}
        <div className="flex flex-col gap-2 pt-1">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#745939] font-sans">
            BIOGRAPHY
          </h2>
          {/* Bio text: style_f40bcfd3 -> Plus Jakarta Sans Regular 16px / 26px */}
          <p className="text-[16px] leading-[26px] text-[#45474C] font-sans whitespace-pre-line max-w-5xl">
            {author.bio || 'No curatorial biography has been recorded for this author.'}
          </p>
        </div>
      </section>

      {/* Section 3: "Books by this Author" Catalog Section (Figma #1:45 - #1:137) */}
      <section className="flex flex-col gap-6">
        {/* Section Header Bar with Title & CTA (Figma #1:46 - #1:56) */}
        <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
          {/* Header & Books Count Pill (Figma #1:47 - #1:51: gap-4 / 16px, rounded-full 9999px) */}
          <div className="flex items-center gap-4">
            <h2 className="font-serif font-medium text-[24px] leading-[32px] tracking-[-0.025em] text-primary">
              Books by {author.name}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E9E8E6] text-[#1A1C1B] text-xs font-semibold font-sans">
              {books.length} {books.length === 1 ? 'Book' : 'Books'}
            </span>
          </div>

          {/* Add Book CTA (Figma #1:52 - #1:56: bg #091426, text white, rounded 8px, text-sm leading-[20px] font-semibold) */}
          <Link
            to={`/add-book?author=${author._id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#091426] text-white hover:bg-[#091426]/90 transition-colors text-sm leading-[20px] font-semibold shadow-sm font-sans"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Add Book</span>
          </Link>
        </div>

        {/* Books Grid Container (Figma #1:57 - #1:137) */}
        {books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard
                key={book._id}
                variant="author"
                book={{
                  ...book,
                  author: {
                    _id: author._id,
                    name: author.name,
                  },
                }}
                onDelete={(b) => setBookToDelete(b)}
              />
            ))}
          </div>
        ) : (
          /* Empty Catalog State for Author */
          <div className="bg-surface-container-lowest rounded-2xl p-12 border border-outline-variant/40 shadow-sm flex flex-col items-center justify-center text-center gap-3">
            <span className="material-symbols-outlined text-[48px] text-outline">menu_book</span>
            <h3 className="font-serif text-xl font-medium text-primary">No Volumes Cataloged</h3>
            <p className="text-sm text-on-surface-variant max-w-sm font-sans">
              No bibliographic volumes have been registered under {author.name} yet.
            </p>
            <Link
              to={`/add-book?author=${author._id}`}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold shadow-sm hover:bg-primary/90 transition-colors font-sans"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Add First Volume</span>
            </Link>
          </div>
        )}
      </section>

      {/* Delete Author Modal */}
      {showDeleteAuthorModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-xl border border-outline-variant/50 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-error mb-3">
              <span className="material-symbols-outlined text-[28px]">warning</span>
              <h3 className="font-serif text-xl font-medium text-primary">Delete Author</h3>
            </div>

            {books.length > 0 ? (
              <div>
                <p className="text-sm text-on-surface-variant leading-relaxed font-sans mb-3">
                  Cannot delete <strong className="text-primary">{author.name}</strong> because they
                  are currently referenced by{' '}
                  <strong className="text-primary">
                    {books.length} {books.length === 1 ? 'book' : 'books'}
                  </strong>{' '}
                  in the catalog.
                </p>
                <p className="text-xs text-on-surface-variant font-sans bg-[#F4F3F1] p-3 rounded-lg border border-outline-variant/30">
                  Please delete or reassign all associated volumes before removing this author from the
                  library database.
                </p>
                <div className="flex items-center justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setShowDeleteAuthorModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-primary bg-[#EFEEEC] hover:bg-[#E9E8E6] transition-colors font-sans"
                  >
                    Understood
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-on-surface-variant leading-relaxed font-sans">
                  Are you sure you want to permanently delete author{' '}
                  <strong className="text-primary">{author.name}</strong> from the library catalog?
                  This action cannot be undone.
                </p>

                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    type="button"
                    disabled={deletingAuthor}
                    onClick={() => setShowDeleteAuthorModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors font-sans"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={deletingAuthor}
                    onClick={handleDeleteAuthor}
                    className="px-4 py-2 bg-error text-on-error rounded-xl text-xs font-semibold hover:bg-error/90 transition-colors flex items-center gap-1.5 shadow-sm font-sans"
                  >
                    {deletingAuthor ? (
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
            )}
          </div>
        </div>
      )}

      {/* Delete Book Confirmation Modal */}
      {bookToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-xl border border-outline-variant/50 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-error mb-3">
              <span className="material-symbols-outlined text-[28px]">warning</span>
              <h3 className="font-serif text-xl font-medium text-primary">Delete Volume</h3>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed font-sans">
              Are you sure you want to permanently remove volume{' '}
              <strong className="text-primary">{bookToDelete.title}</strong> from the catalog? This
              action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                disabled={deletingBook}
                onClick={() => setBookToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors font-sans"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingBook}
                onClick={handleDeleteBook}
                className="px-4 py-2 bg-error text-on-error rounded-xl text-xs font-semibold hover:bg-error/90 transition-colors flex items-center gap-1.5 shadow-sm font-sans"
              >
                {deletingBook ? (
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
