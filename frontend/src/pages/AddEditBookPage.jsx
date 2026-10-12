import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const GENRE_OPTIONS = [
  'Art & Architecture',
  'Architecture',
  'Art & Design',
  'Philosophy',
  'Essay',
  'Historical Fiction',
  'Science',
  'Epic Fantasy',
  'Fantasy',
  'Literary Fiction',
  'General',
];

export default function AddEditBookPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const isEdit = Boolean(id);
  const preselectedAuthorId = searchParams.get('author') || '';

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    author: preselectedAuthorId,
    publishedYear: new Date().getFullYear(),
    genre: 'Art & Architecture',
    price: '34.50',
    description: '',
    coverImage: '',
  });

  // Auxiliary State
  const [authors, setAuthors] = useState([]);
  const [loadingAuthors, setLoadingAuthors] = useState(true);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [previewMarkdown, setPreviewMarkdown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Fetch Authors List for Dropdown
  useEffect(() => {
    let isMounted = true;
    async function loadAuthors() {
      try {
        setLoadingAuthors(true);
        const res = await api.getAuthors({ page: 1, limit: 100 });
        if (isMounted) {
          const list = res?.data || [];
          setAuthors(list);
          if (!isEdit && !formData.author && list.length > 0 && !preselectedAuthorId) {
            setFormData(prev => ({ ...prev, author: list[0]._id }));
          }
        }
      } catch (err) {
        console.error('Failed to load authors dropdown:', err);
      } finally {
        if (isMounted) setLoadingAuthors(false);
      }
    }
    loadAuthors();
    return () => { isMounted = false; };
  }, [isEdit, preselectedAuthorId]);

  // Fetch Existing Book Data for Edit Mode
  useEffect(() => {
    if (!isEdit) return;
    let isMounted = true;

    async function loadBookData() {
      try {
        setInitialLoading(true);
        const res = await api.getBook(id);
        const book = res?.data;
        if (!book) throw new Error('Volume record could not be found');

        if (isMounted) {
          setFormData({
            title: book.title || '',
            author: book.author?._id || book.author || '',
            publishedYear: book.publishedYear || new Date().getFullYear(),
            genre: book.genre || 'General',
            price: book.price !== undefined && book.price !== null ? String(book.price) : '0',
            description: book.description || '',
            coverImage: book.coverImage || '',
          });
        }
      } catch (err) {
        console.error('Error fetching book for edit:', err);
        showToast(err.message || 'Failed to load volume metadata', 'error');
        navigate('/books');
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    }

    loadBookData();
    return () => { isMounted = false; };
  }, [id, isEdit, navigate, showToast]);

  // Calculate word count for Description
  const wordCount = useMemo(() => {
    if (!formData.description) return 0;
    return formData.description.trim().split(/\s+/).filter(Boolean).length;
  }, [formData.description]);

  // Selected Author Object for Live Preview
  const selectedAuthor = useMemo(() => {
    return authors.find(a => a._id === formData.author) || null;
  }, [authors, formData.author]);

  // Input Change Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Cloudinary File Upload Handler
  const handleFileUpload = useCallback(async (file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Only JPEG, PNG, and WEBP image files are allowed', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds the 5MB limit', 'error');
      return;
    }

    try {
      setUploadingCover(true);
      showToast('Uploading cover artwork to Cloudinary...', 'info', 2000);
      const res = await api.uploadCover(file);
      if (res?.url) {
        setFormData(prev => ({ ...prev, coverImage: res.url }));
        showToast('Cover artwork uploaded successfully to Cloudinary!', 'success');
      } else {
        throw new Error(res?.message || 'Upload did not return an asset URL');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      showToast(err.message || 'Failed to upload cover image', 'error');
    } finally {
      setUploadingCover(false);
    }
  }, [showToast]);

  // Drag and Drop Events
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const editorRef = React.useRef(null);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    strikeThrough: false,
    blockquote: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  });

  // Query formatting state of current text selection
  const updateActiveFormats = useCallback(() => {
    if (!editorRef.current) return;
    try {
      const isBold = document.queryCommandState('bold');
      const isItalic = document.queryCommandState('italic');
      const isStrike = document.queryCommandState('strikeThrough');
      const isUl = document.queryCommandState('insertUnorderedList');
      const isOl = document.queryCommandState('insertOrderedList');

      // Check if selection is within a blockquote
      let isQuote = false;
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let node = selection.anchorNode;
        while (node && node !== editorRef.current && node !== document.body) {
          if (node.nodeName === 'BLOCKQUOTE') {
            isQuote = true;
            break;
          }
          node = node.parentNode;
        }
      }

      setActiveFormats({
        bold: Boolean(isBold),
        italic: Boolean(isItalic),
        strikeThrough: Boolean(isStrike),
        blockquote: isQuote,
        insertUnorderedList: Boolean(isUl),
        insertOrderedList: Boolean(isOl),
      });
    } catch {
      // ignore
    }
  }, []);

  // Listen for selection changes to update active buttons dynamically
  useEffect(() => {
    const handleSelectionChange = () => {
      if (editorRef.current && (document.activeElement === editorRef.current || editorRef.current.contains(document.activeElement))) {
        updateActiveFormats();
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [updateActiveFormats]);

  // Sync editor content on initial load or edit book fetch
  useEffect(() => {
    if (!initialLoading && editorRef.current) {
      if (formData.description && editorRef.current.innerHTML !== formData.description) {
        editorRef.current.innerHTML = formData.description;
      }
    }
  }, [initialLoading]);

  // Sync editor content when toggling back from markdown preview
  useEffect(() => {
    if (!previewMarkdown && editorRef.current) {
      if (editorRef.current.innerHTML !== (formData.description || '')) {
        editorRef.current.innerHTML = formData.description || '';
      }
    }
  }, [previewMarkdown, formData.description]);

  // Handle rich editor input
  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setFormData(prev => ({ ...prev, description: html }));
      if (formErrors.description) {
        setFormErrors(prev => ({ ...prev, description: '' }));
      }
      updateActiveFormats();
    }
  };

  // Execute formatting command on selected text in contentEditable
  const executeFormat = (command, value = null) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    handleEditorInput();
    updateActiveFormats();
  };

  // Toggle Blockquote
  const handleToggleBlockquote = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    if (activeFormats.blockquote) {
      document.execCommand('formatBlock', false, 'p');
    } else {
      document.execCommand('formatBlock', false, 'blockquote');
    }
    handleEditorInput();
    updateActiveFormats();
  };

  // Insert Hyperlink
  const handleInsertLink = () => {
    if (!editorRef.current) return;
    const url = window.prompt('Enter link URL (https://...):', 'https://');
    if (url && url.trim()) {
      executeFormat('createLink', url.trim());
    }
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Book title is required';
    } else if (formData.title.length > 120) {
      errors.title = 'Book title cannot exceed 120 characters';
    }

    if (!formData.author) {
      errors.author = 'Please select a primary author';
    }

    const currentYear = new Date().getFullYear();
    const yearNum = Number(formData.publishedYear);
    if (!yearNum || !Number.isInteger(yearNum) || yearNum <= 0) {
      errors.publishedYear = 'Please provide a valid past year';
    } else if (yearNum > currentYear) {
      errors.publishedYear = `Published year cannot be in the future (max ${currentYear})`;
    }

    const priceNum = Number(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      errors.price = 'Price must be a valid non-negative number';
    }

    if (formData.coverImage && formData.coverImage.trim()) {
      const urlPattern = /^https?:\/\/[^\s$.?#].[^\s]*$/i;
      if (!urlPattern.test(formData.coverImage.trim())) {
        errors.coverImage = 'Cover image must be a valid HTTP or HTTPS URL';
      }
    }

    if (formData.description && formData.description.length > 1000) {
      errors.description = 'Description cannot exceed 1000 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler (POST /books or PUT /books/:id)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please address the highlighted form errors before proceeding', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        author: formData.author,
        publishedYear: Number(formData.publishedYear),
        genre: formData.genre.trim(),
        price: Number(formData.price),
        description: formData.description.trim(),
        coverImage: formData.coverImage.trim() || undefined,
      };

      if (isEdit) {
        const res = await api.updateBook(id, payload);
        showToast('Volume metadata successfully updated in archive!', 'success');
        navigate(`/books/${id}`);
      } else {
        const res = await api.createBook(payload);
        showToast('New volume successfully cataloged in archive!', 'success');
        const createdId = res?.data?._id;
        if (createdId) {
          navigate(`/books/${createdId}`);
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Failed to persist book:', err);
      showToast(err.message || 'Failed to save book record', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="p-8 lg:p-12 max-w-7xl w-full mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm text-on-surface-variant font-sans">Loading volume metadata from archival database...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-[1280px] w-full mx-auto flex flex-col gap-5 sm:gap-6 lg:gap-8">
      {/* Breadcrumb Navigation (Figma #1:918 - #1:925) */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-[#45474C] font-sans">
        <Link to="/" className="text-[#45474C] hover:text-[#091426] transition-colors">
          Books
        </Link>
        <svg className="w-[5px] h-[7px] text-[#C5C6CD] fill-current" viewBox="0 0 5 7">
          <path d="M2.68333 3.5L0 0.816667L0.816667 0L4.31667 3.5L0.816667 7L0 6.18333L2.68333 3.5Z" />
        </svg>
        <span className="font-medium text-[#091426]">
          {isEdit ? 'Edit Volume' : 'Add New Book'}
        </span>
      </nav>

      {/* Page Title & Header Actions (Figma #1:926 - #1:931) */}
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl sm:text-[32px] sm:leading-[40px] tracking-[-0.025em] text-[#091426] font-normal break-words">
          {isEdit ? 'Edit Book Details' : 'Add New Book to Collection'}
        </h1>
        <p className="font-sans text-xs sm:text-[14px] leading-[18px] sm:leading-[22px] text-[#45474C]">
          Enter bibliographic details, physical format specifics, and cataloging parameters.
        </p>
      </div>

      {/* Main Bento Grid: Form Fields (8 cols) + Physical Simulation (4 cols) (Figma #1:933) */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 sm:gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* LEFT 8 COLUMNS: FORM FIELDS (Figma #1:934) */}
          <div className="lg:col-span-8 flex flex-col gap-6 sm:gap-8">
            {/* Section 1: Basic Bibliographic Information (Figma #1:935 - #1:1009) */}
            <section className="bg-white p-5 sm:p-8 rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex flex-col gap-5 sm:gap-6">
              {/* Card Header: Title & "REQUIRED" Badge (Figma #1:936 - #1:947) */}
              <div className="flex items-center justify-between gap-3 sm:gap-4 pb-3.5 sm:pb-4 border-b border-[#E9E8E6]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E9E8E6] flex items-center justify-center shrink-0">
                    <svg className="w-[19px] h-[14px] text-[#091426] fill-current" viewBox="0 0 19 14">
                      <path d="M11.2272 5.09541V3.62724C11.7022 3.42573 12.188 3.27459 12.6845 3.17384C13.1811 3.07308 13.7029 3.0227 14.2499 3.0227C14.6241 3.0227 14.9912 3.05149 15.351 3.10906C15.7108 3.16664 16.0635 3.23861 16.4089 3.32497V4.70678C16.0635 4.57723 15.7144 4.48007 15.3618 4.4153C15.0091 4.35053 14.6385 4.31814 14.2499 4.31814C13.7029 4.31814 13.1775 4.38651 12.6738 4.52326C12.17 4.66 11.6878 4.85071 11.2272 5.09541ZM11.2272 9.84537V8.3772C11.7022 8.17568 12.188 8.02455 12.6845 7.92379C13.1811 7.82304 13.7029 7.77266 14.2499 7.77266C14.6241 7.77266 14.9912 7.80145 15.351 7.85902C15.7108 7.9166 16.0635 7.98857 16.4089 8.07493V9.45673C16.0635 9.32719 15.7144 9.23003 15.3618 9.16526C15.0091 9.10049 14.6385 9.0681 14.2499 9.0681C13.7029 9.0681 13.1775 9.13287 12.6738 9.26242C12.17 9.39196 11.6878 9.58628 11.2272 9.84537ZM11.2272 7.47039V6.00222C11.7022 5.80071 12.188 5.64957 12.6845 5.54881C13.1811 5.44806 13.7029 5.39768 14.2499 5.39768C14.6241 5.39768 14.9912 5.42647 15.351 5.48404C15.7108 5.54162 16.0635 5.61359 16.4089 5.69995V7.08176C16.0635 6.95221 15.7144 6.85505 15.3618 6.79028C15.0091 6.72551 14.6385 6.69312 14.2499 6.69312C13.7029 6.69312 13.1775 6.76149 12.6738 6.89823C12.17 7.03498 11.6878 7.22569 11.2272 7.47039ZM4.74996 10.3635C5.42647 10.3635 6.08498 10.4391 6.72551 10.5902C7.36603 10.7414 8.00296 10.9681 8.63629 11.2704V2.76361C8.04614 2.41816 7.42001 2.15907 6.75789 1.98635C6.09578 1.81362 5.42647 1.72726 4.74996 1.72726C4.23178 1.72726 3.7172 1.77764 3.20622 1.87839C2.69524 1.97915 2.20225 2.13028 1.72726 2.3318V10.8817C2.23104 10.709 2.73123 10.5795 3.22781 10.4931C3.7244 10.4067 4.23178 10.3635 4.74996 10.3635ZM10.3635 11.2704C10.9969 10.9681 11.6338 10.7414 12.2743 10.5902C12.9148 10.4391 13.5734 10.3635 14.2499 10.3635C14.7681 10.3635 15.2754 10.4067 15.772 10.4931C16.2686 10.5795 16.7688 10.709 17.2726 10.8817V2.3318C16.7976 2.13028 16.3046 1.97915 15.7936 1.87839C15.2826 1.77764 14.7681 1.72726 14.2499 1.72726C13.5734 1.72726 12.9041 1.81362 12.2419 1.98635C11.5798 2.15907 10.9537 2.41816 10.3635 2.76361V11.2704ZM9.49992 13.8181C8.80901 13.2711 8.06053 12.8465 7.25448 12.5442C6.44843 12.2419 5.61359 12.0908 4.74996 12.0908C4.14542 12.0908 3.55167 12.17 2.96872 12.3283C2.38577 12.4866 1.82801 12.7097 1.29544 12.9976C0.993173 13.1559 0.701698 13.1487 0.421019 12.976C0.14034 12.8033 0 12.5514 0 12.2203V1.81362C0 1.65529 0.039583 1.50415 0.118749 1.36022C0.197915 1.21628 0.316664 1.10832 0.474996 1.03635C1.13711 0.690903 1.82801 0.431814 2.5477 0.259089C3.2674 0.0863629 4.00148 0 4.74996 0C5.5848 0 6.40165 0.107954 7.2005 0.323861C7.99936 0.539768 8.76583 0.863629 9.49992 1.29544C10.234 0.863629 11.0005 0.539768 11.7993 0.323861C12.5982 0.107954 13.415 0 14.2499 0C14.9984 0 15.7324 0.0863629 16.4521 0.259089C17.1718 0.431814 17.8627 0.690903 18.5248 1.03635C18.6832 1.10832 18.8019 1.21628 18.8811 1.36022C18.9602 1.50415 18.9998 1.65529 18.9998 1.81362V12.2203C18.9998 12.5514 18.8595 12.8033 18.5788 12.976C18.2981 13.1487 18.0067 13.1559 17.7044 12.9976C17.1718 12.7097 16.6141 12.4866 16.0311 12.3283C15.4482 12.17 14.8544 12.0908 14.2499 12.0908C13.3862 12.0908 12.5514 12.2419 11.7453 12.5442C10.9393 12.8465 10.1908 13.2711 9.49992 13.8181Z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-sans font-semibold text-[16px] leading-[24px] tracking-[-0.005em] text-[#091426]">
                      Book Details
                    </h2>
                    <p className="font-sans text-[12px] leading-[18px] text-[#45474C]">
                      Core title, authorship, categorization, and pricing.
                    </p>
                  </div>
                </div>
                <span className="px-[10px] py-[2px] rounded-full bg-[#FFDDB8]/40 text-[#745939] text-[11px] font-semibold leading-[14px] tracking-[0.05em] uppercase font-sans">
                  REQUIRED
                </span>
              </div>

              {/* Input: Book Title (Figma #1:950 - #1:957) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm font-sans">
                  <label htmlFor="book-title" className="font-semibold text-[14px] leading-[20px] text-[#1A1C1B]">
                    Book Title <span className="text-[#BA1A1A] font-normal">*</span>
                  </label>
                  <span className="font-semibold text-[11px] leading-[14px] tracking-[0.05em] text-[#45474C]">
                    {formData.title.length} / 120 chars
                  </span>
                </div>
                <input
                  id="book-title"
                  name="title"
                  type="text"
                  required
                  maxLength={120}
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="The Architecture of Silence"
                  className={`w-full px-4 py-2.5 rounded-lg bg-[#F4F3F1] border ${formErrors.title ? 'border-error ring-1 ring-error' : 'border-transparent'
                    } text-sm text-[#1A1C1B] placeholder:text-[#45474C]/50 focus:outline-none focus:ring-2 focus:ring-[#091426]/20 transition-all font-sans`}
                />
                {formErrors.title && (
                  <p className="text-xs text-error font-sans">{formErrors.title}</p>
                )}
              </div>

              {/* Row 1: Primary Author & Published Year (Figma #1:958 - #1:978) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Author Select */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="book-author" className="font-semibold text-[14px] leading-[20px] text-[#1A1C1B] font-sans">
                    Primary Author <span className="text-[#BA1A1A] font-normal">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="book-author"
                      name="author"
                      required
                      value={formData.author}
                      onChange={handleChange}
                      disabled={loadingAuthors}
                      className={`w-full pl-4 pr-10 py-2.5 rounded-lg bg-[#F4F3F1] border ${formErrors.author ? 'border-error' : 'border-transparent'
                        } text-sm text-[#1A1C1B] focus:outline-none focus:ring-2 focus:ring-[#091426]/20 transition-all appearance-none cursor-pointer font-sans`}
                    >
                      <option value="" disabled>
                        {loadingAuthors ? 'Loading archival authors...' : 'Select an author'}
                      </option>
                      {authors.map((a) => (
                        <option key={a._id} value={a._id}>
                          {a.name} ({a.nationality || 'Archived'})
                        </option>
                      ))}
                    </select>
                    <svg className="w-[10px] h-[7px] text-[#45474C] fill-current absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 10 7">
                      <path d="M5 6.16667L0 1.16667L1.16667 0L5 3.83333L8.83333 0L10 1.16667L5 6.16667Z" />
                    </svg>
                  </div>
                  {formErrors.author && (
                    <p className="text-xs text-error font-sans">{formErrors.author}</p>
                  )}
                </div>

                {/* Published Year */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="book-year" className="font-semibold text-[14px] leading-[20px] text-[#1A1C1B] font-sans">
                    Published Year <span className="text-[#BA1A1A] font-normal">*</span>
                  </label>
                  <input
                    id="book-year"
                    name="publishedYear"
                    type="number"
                    min="1"
                    max={new Date().getFullYear()}
                    required
                    value={formData.publishedYear}
                    onChange={handleChange}
                    placeholder="2023"
                    className={`w-full px-3 py-2.5 rounded-lg bg-[#F4F3F1] border ${formErrors.publishedYear ? 'border-error' : 'border-transparent'
                      } text-sm text-[#1A1C1B] focus:outline-none focus:ring-2 focus:ring-[#091426]/20 transition-all font-sans`}
                  />
                  {formErrors.publishedYear && (
                    <p className="text-xs text-error font-sans">{formErrors.publishedYear}</p>
                  )}
                </div>
              </div>

              {/* Row 2: Genre & Price (Figma #1:979 - #1:1009) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Genre Select */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="book-genre" className="font-semibold text-[14px] leading-[20px] text-[#1A1C1B] font-sans">
                    Genre <span className="text-[#BA1A1A] font-normal">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="book-genre"
                      name="genre"
                      value={formData.genre}
                      onChange={handleChange}
                      className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-[#F4F3F1] border border-transparent text-sm text-[#1A1C1B] focus:outline-none focus:ring-2 focus:ring-[#091426]/20 transition-all appearance-none cursor-pointer font-sans"
                    >
                      {GENRE_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                    <svg className="w-[10px] h-[7px] text-[#45474C] fill-current absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 10 7">
                      <path d="M5 6.16667L0 1.16667L1.16667 0L5 3.83333L8.83333 0L10 1.16667L5 6.16667Z" />
                    </svg>
                  </div>
                </div>

                {/* Price (USD) */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="book-price" className="font-semibold text-[14px] leading-[20px] text-[#1A1C1B] font-sans">
                    Price <span className="text-[#BA1A1A] font-normal">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#45474C] font-semibold text-sm">
                      $
                    </span>
                    <input
                      id="book-price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="34.50"
                      className={`w-full pl-8 pr-16 py-2.5 rounded-lg bg-[#F4F3F1] border ${formErrors.price ? 'border-error' : 'border-transparent'
                        } text-sm text-[#1A1C1B] focus:outline-none focus:ring-2 focus:ring-[#091426]/20 transition-all font-sans font-normal`}
                    />
                    <span className="absolute right-3 font-label-sm text-label-sm text-[#45474C] bg-[#E9E8E6] px-2 py-0.5 rounded">
                      USD
                    </span>
                  </div>
                  {formErrors.price && (
                    <p className="text-xs text-error font-sans">{formErrors.price}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Section 2: Synopsis & Rich Editorial Note (Figma #1:1002 - #1:1051) */}
            <section className="bg-white p-5 sm:p-8 rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex flex-col gap-2">
              {/* Header: Title & Word Count (Figma #1:1003 - #1:1014) */}
              <div className="flex items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-[#E9E8E6]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E9E8E6] flex items-center justify-center shrink-0">
                    <svg className="w-[15px] h-[10px] text-[#091426] fill-current" viewBox="0 0 15 10">
                      <path d="M1.41667 10L3.33333 6.66667C2.41667 6.66667 1.63194 6.34028 0.979167 5.6875C0.326389 5.03472 0 4.25 0 3.33333C0 2.41667 0.326389 1.63194 0.979167 0.979167C1.63194 0.326389 2.41667 0 3.33333 0C4.25 0 5.03472 0.326389 5.6875 0.979167C6.34028 1.63194 6.66667 2.41667 6.66667 3.33333C6.66667 3.65278 6.62847 3.94792 6.55208 4.21875C6.47569 4.48958 6.36111 4.75 6.20833 5L3.33333 10H1.41667ZM8.91667 10L10.8333 6.66667C9.91667 6.66667 9.13194 6.34028 8.47917 5.6875C7.82639 5.03472 7.5 4.25 7.5 3.33333C7.5 2.41667 7.82639 1.63194 8.47917 0.979167C9.13194 0.326389 9.91667 0 10.8333 0C11.75 0 12.5347 0.326389 13.1875 0.979167C13.8403 1.63194 14.1667 2.41667 14.1667 3.33333C14.1667 3.65278 14.1285 3.94792 14.0521 4.21875C13.9757 4.48958 13.8611 4.75 13.7083 5L10.8333 10H8.91667ZM3.33333 4.58333C3.68056 4.58333 3.97569 4.46181 4.21875 4.21875C4.46181 3.97569 4.58333 3.68056 4.58333 3.33333C4.58333 2.98611 4.46181 2.69097 4.21875 2.44792C3.97569 2.20486 3.68056 2.08333 3.33333 2.08333C2.98611 2.08333 2.69097 2.20486 2.44792 2.44792C2.20486 2.69097 2.08333 2.98611 2.08333 3.33333C2.08333 3.68056 2.20486 3.97569 2.44792 4.21875C2.69097 4.46181 2.98611 4.58333 3.33333 4.58333ZM10.8333 4.58333C11.1806 4.58333 11.4757 4.46181 11.7188 4.21875C11.9618 3.97569 12.0833 3.68056 12.0833 3.33333C12.0833 2.98611 11.9618 2.69097 11.7188 2.44792C11.4757 2.20486 11.1806 2.08333 10.8333 2.08333C10.4861 2.08333 10.191 2.20486 9.94792 2.44792C9.70486 2.69097 9.58333 2.98611 9.58333 3.33333C9.58333 3.68056 9.70486 3.97569 9.94792 4.21875C10.191 4.46181 10.4861 4.58333 10.8333 4.58333Z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-sans font-semibold text-[16px] leading-[24px] tracking-[-0.005em] text-[#091426]">
                      Description
                    </h2>
                    <p className="font-sans text-[12px] leading-[18px] text-[#45474C]">
                      Editorial abstract, historical context, or reader review summaries.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold tracking-[0.05em] text-[#45474C] font-sans">
                  {wordCount} words
                </span>
              </div>

              {/* Formatting Toolbar (Figma #1:1015 - #1:1040) */}
              <div className="flex items-center gap-1 p-1 bg-[#F4F3F1] rounded-lg border-0 flex-wrap mt-2">
                {/* 1. Bold (Figma #1:1016 - #1:1018) */}
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    executeFormat('bold');
                  }}
                  className={`w-7 h-7 inline-flex items-center justify-center rounded transition-all cursor-pointer ${activeFormats.bold
                      ? 'bg-[#45474C] text-white shadow-xs'
                      : 'text-[#45474C] hover:bg-white hover:text-primary'
                    }`}
                  title="Bold (Ctrl+B)"
                  aria-pressed={activeFormats.bold}
                >
                  <svg className="w-[8px] h-[11px] fill-current" viewBox="0 0 8 11">
                    <path d="M0 10.7695V0H4.25011C5.08346 0 5.85271 0.256417 6.55786 0.76925C7.263 1.28208 7.61558 1.99364 7.61558 2.90392C7.61558 3.55778 7.46814 4.061 7.17326 4.41357C6.87838 4.76614 6.60273 5.01936 6.34631 5.17321C6.66683 5.31424 7.02261 5.57706 7.41365 5.96169C7.80468 6.34631 8.0002 6.92325 8.0002 7.6925C8.0002 8.83355 7.58352 9.63165 6.75017 10.0868C5.91682 10.5419 5.13474 10.7695 4.40396 10.7695H0ZM2.32698 8.6156H4.32703C4.94243 8.6156 5.31744 8.45854 5.45206 8.14443C5.58668 7.83032 5.65399 7.60275 5.65399 7.46173C5.65399 7.3207 5.58668 7.09313 5.45206 6.77902C5.31744 6.46491 4.9232 6.30785 4.26934 6.30785H2.32698V8.6156ZM2.32698 4.23088H4.11549C4.53857 4.23088 4.84628 4.1219 5.03859 3.90394C5.2309 3.68599 5.32706 3.44239 5.32706 3.17316C5.32706 2.86546 5.21808 2.61545 5.00013 2.42314C4.78217 2.23083 4.50011 2.13467 4.15395 2.13467H2.32698V4.23088Z" />
                  </svg>
                </button>

                {/* 2. Italic (Figma #1:1019 - #1:1021) */}
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    executeFormat('italic');
                  }}
                  className={`w-7 h-7 inline-flex items-center justify-center rounded transition-all cursor-pointer ${activeFormats.italic
                      ? 'bg-[#45474C] text-white shadow-xs'
                      : 'text-[#45474C] hover:bg-white hover:text-primary'
                    }`}
                  title="Italic (Ctrl+I)"
                  aria-pressed={activeFormats.italic}
                >
                  <svg className="w-[10px] h-[11px] fill-current" viewBox="0 0 10 11">
                    <path d="M0 10.7692V8.84615H3.07692L5.38462 1.92308H2.30769V0H10V1.92308H7.30769L5 8.84615H7.69231V10.7692H0Z" />
                  </svg>
                </button>

                {/* 3. Strikethrough (Figma #1:1022 - #1:1024) */}
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    executeFormat('strikeThrough');
                  }}
                  className={`w-7 h-7 inline-flex items-center justify-center rounded transition-all cursor-pointer ${activeFormats.strikeThrough
                      ? 'bg-[#45474C] text-white shadow-xs'
                      : 'text-[#45474C] hover:bg-white hover:text-primary'
                    }`}
                  title="Strikethrough"
                  aria-pressed={activeFormats.strikeThrough}
                >
                  <svg className="w-[15px] h-[12px] fill-current" viewBox="0 0 15 12">
                    <path d="M0 7.5V6H15V7.5H0ZM6.375 4.5V2.25H2.25V0H12.75V2.25H8.625V4.5H6.375ZM6.375 12V9H8.625V12H6.375Z" />
                  </svg>
                </button>

                {/* Divider 1 (Figma #1:1026) */}
                <span className="w-[1px] h-4 bg-[#C5C6CD] mx-1"></span>

                {/* 4. Blockquote (Figma #1:1027 - #1:1029) */}
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleToggleBlockquote();
                  }}
                  className={`w-7 h-7 inline-flex items-center justify-center rounded transition-all cursor-pointer ${activeFormats.blockquote
                      ? 'bg-[#45474C] text-white shadow-xs'
                      : 'text-[#45474C] hover:bg-white hover:text-primary'
                    }`}
                  title="Quote"
                  aria-pressed={activeFormats.blockquote}
                >
                  <svg className="w-[13px] h-[9px] fill-current" viewBox="0 0 13 9">
                    <path d="M1.275 9L3 6C2.175 6 1.46875 5.70625 0.88125 5.11875C0.29375 4.53125 0 3.825 0 3C0 2.175 0.29375 1.46875 0.88125 0.88125C1.46875 0.29375 2.175 0 3 0C3.825 0 4.53125 0.29375 5.11875 0.88125C5.70625 1.46875 6 2.175 6 3C6 3.2875 5.96562 3.55312 5.89687 3.79688C5.82812 4.04063 5.725 4.275 5.5875 4.5L3 9H1.275ZM8.025 9L9.75 6C8.925 6 8.21875 5.70625 7.63125 5.11875C7.04375 4.53125 6.75 3.825 6.75 3C6.75 2.175 7.04375 1.46875 7.63125 0.88125C8.21875 0.29375 8.925 0 9.75 0C10.575 0 11.2812 0.29375 11.8687 0.88125C12.4562 1.46875 12.75 2.175 12.75 3C12.75 3.2875 12.7156 3.55312 12.6469 3.79688C12.5781 4.04063 12.475 4.275 12.3375 4.5L9.75 9H8.025ZM3 4.125C3.3125 4.125 3.57812 4.01562 3.79688 3.79688C4.01562 3.57812 4.125 3.3125 4.125 3C4.125 2.6875 4.01562 2.42188 3.79688 2.20312C3.57812 1.98438 3.3125 1.875 3 1.875C2.6875 1.875 2.42188 1.98438 2.20312 2.20312C1.98438 2.42188 1.875 2.6875 1.875 3C1.875 3.3125 1.98438 3.57812 2.20312 3.79688C2.42188 4.01562 2.6875 4.125 3 4.125ZM9.75 4.125C10.0625 4.125 10.3281 4.01562 10.5469 3.79688C10.7656 3.57812 10.875 3.3125 10.875 3C10.875 2.6875 10.7656 2.42188 10.5469 2.20312C10.3281 1.98438 10.0625 1.875 9.75 1.875C9.4375 1.875 9.17188 1.98438 8.95312 2.20312C8.73438 2.42188 8.625 2.6875 8.625 3C8.625 3.3125 8.73438 3.57812 8.95312 3.79688C9.17188 4.01562 9.4375 4.125 9.75 4.125Z" />
                  </svg>
                </button>

                {/* 5. Bullet List (Figma #1:1030 - #1:1032) */}
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    executeFormat('insertUnorderedList');
                  }}
                  className={`w-7 h-7 inline-flex items-center justify-center rounded transition-all cursor-pointer ${activeFormats.insertUnorderedList
                      ? 'bg-[#45474C] text-white shadow-xs'
                      : 'text-[#45474C] hover:bg-white hover:text-primary'
                    }`}
                  title="Bullet list"
                  aria-pressed={activeFormats.insertUnorderedList}
                >
                  <svg className="w-[14px] h-[12px] fill-current" viewBox="0 0 14 12">
                    <path d="M4.5 11.25V9.75H13.5V11.25H4.5ZM4.5 6.75V5.25H13.5V6.75H4.5ZM4.5 2.25V0.75H13.5V2.25H4.5ZM1.5 12C1.0875 12 0.734375 11.8531 0.440625 11.5594C0.146875 11.2656 0 10.9125 0 10.5C0 10.0875 0.146875 9.73438 0.440625 9.44063C0.734375 9.14688 1.0875 9 1.5 9C1.9125 9 2.26562 9.14688 2.55938 9.44063C2.85313 9.73438 3 10.0875 3 10.5C3 10.9125 2.85313 11.2656 2.55938 11.5594C2.26562 11.8531 1.9125 12 1.5 12ZM1.5 7.5C1.0875 7.5 0.734375 7.35312 0.440625 7.05937C0.146875 6.76562 0 6.4125 0 6C0 5.5875 0.146875 5.23438 0.440625 4.94063C0.734375 4.64688 1.0875 4.5 1.5 4.5C1.9125 4.5 2.26562 4.64688 2.55938 4.94063C2.85313 5.23438 3 5.5875 3 6C3 6.4125 2.85313 6.76562 2.55938 7.05937C2.26562 7.35312 1.9125 7.5 1.5 7.5ZM1.5 3C1.0875 3 0.734375 2.85313 0.440625 2.55938C0.146875 2.26562 0 1.9125 0 1.5C0 1.0875 0.146875 0.734375 0.440625 0.440625C0.734375 0.146875 1.0875 0 1.5 0C1.9125 0 2.26562 0.146875 2.55938 0.440625C2.85313 0.734375 3 1.0875 3 1.5C3 1.9125 2.85313 2.26562 2.55938 2.55938C2.26562 2.85313 1.9125 3 1.5 3Z" />
                  </svg>
                </button>

                {/* 6. Numbered List (Figma #1:1033 - #1:1035) */}
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    executeFormat('insertOrderedList');
                  }}
                  className={`w-7 h-7 inline-flex items-center justify-center rounded transition-all cursor-pointer ${activeFormats.insertOrderedList
                      ? 'bg-[#45474C] text-white shadow-xs'
                      : 'text-[#45474C] hover:bg-white hover:text-primary'
                    }`}
                  title="Numbered list"
                  aria-pressed={activeFormats.insertOrderedList}
                >
                  <svg className="w-[14px] h-[15px] fill-current" viewBox="0 0 14 15">
                    <path d="M0 15V13.875H1.875V13.3125H0.75V12.1875H1.875V11.625H0V10.5H2.25C2.4625 10.5 2.64062 10.5719 2.78437 10.7156C2.92812 10.8594 3 11.0375 3 11.25V12C3 12.2125 2.92812 12.3906 2.78437 12.5344C2.64062 12.6781 2.4625 12.75 2.25 12.75C2.4625 12.75 2.64062 12.8219 2.78437 12.9656C2.92812 13.1094 3 13.2875 3 13.5V14.25C3 14.4625 2.92812 14.6406 2.78437 14.7844C2.64062 14.9281 2.4625 15 2.25 15H0ZM0 9.75V7.6875C0 7.475 0.071875 7.29688 0.215625 7.15312C0.359375 7.00937 0.5375 6.9375 0.75 6.9375H1.875V6.375H0V5.25H2.25C2.4625 5.25 2.64062 5.32187 2.78437 5.46562C2.92812 5.60938 3 5.7875 3 6V7.3125C3 7.525 2.92812 7.70312 2.78437 7.84688C2.64062 7.99063 2.4625 8.0625 2.25 8.0625H1.125V8.625H3V9.75H0ZM1.125 4.5V1.125H0V0H2.25V4.5H1.125ZM4.5 12.75V11.25H13.5V12.75H4.5ZM4.5 8.25V6.75H13.5V8.25H4.5ZM4.5 3.75V2.25H13.5V3.75H4.5Z" />
                  </svg>
                </button>

                {/* Divider 2 (Figma #1:1037) */}
                <span className="w-[1px] h-4 bg-[#C5C6CD] mx-1"></span>

                {/* 7. Hyperlink (Figma #1:1038 - #1:1040) */}
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleInsertLink();
                  }}
                  className="w-7 h-7 inline-flex items-center justify-center rounded transition-all cursor-pointer text-[#45474C] hover:bg-white hover:text-primary"
                  title="Hyperlink"
                >
                  <svg className="w-[15px] h-[8px] fill-current" viewBox="0 0 15 8">
                    <path d="M6.75 7.5H3.75C2.7125 7.5 1.82812 7.13437 1.09687 6.40312C0.365625 5.67188 0 4.7875 0 3.75C0 2.7125 0.365625 1.82812 1.09687 1.09687C1.82812 0.365625 2.7125 0 3.75 0H6.75V1.5H3.75C3.125 1.5 2.59375 1.71875 2.15625 2.15625C1.71875 2.59375 1.5 3.125 1.5 3.75C1.5 4.375 1.71875 4.90625 2.15625 5.34375C2.59375 5.78125 3.125 6 3.75 6H6.75V7.5ZM4.5 4.5V3H10.5V4.5H4.5ZM8.25 7.5V6H11.25C11.875 6 12.4062 5.78125 12.8438 5.34375C13.2812 4.90625 13.5 4.375 13.5 3.75C13.5 3.125 13.2812 2.59375 12.8438 2.15625C12.4062 1.71875 11.875 1.5 11.25 1.5H8.25V0H11.25C12.2875 0 13.1719 0.365625 13.9031 1.09687C14.6344 1.82812 15 2.7125 15 3.75C15 4.7875 14.6344 5.67188 13.9031 6.40312C13.1719 7.13437 12.2875 7.5 11.25 7.5H8.25Z" />
                  </svg>
                </button>
              </div>

              {/* Rich Visual Editor or Markdown Preview (Figma #1:1041 - #1:1043) */}
              {previewMarkdown ? (
                <div
                  className="w-full min-h-[160px] p-4 rounded-lg bg-[#F4F3F1] border-0 text-sm text-[#1A1C1B] font-sans leading-[22.75px] overflow-y-auto prose prose-stone max-w-none [&_blockquote]:border-l-2 [&_blockquote]:border-[#745939] [&_blockquote]:pl-3 [&_blockquote]:my-2 [&_blockquote]:italic [&_blockquote]:text-[#45474C] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1.5 [&_a]:text-[#745939] [&_a]:underline [&_strike]:line-through [&_s]:line-through [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic mt-2"
                  dangerouslySetInnerHTML={{
                    __html: formData.description || '<p class="text-[#75777D] italic">No description entered yet.</p>',
                  }}
                />
              ) : (
                <div
                  ref={editorRef}
                  contentEditable={true}
                  onInput={handleEditorInput}
                  onBlur={handleEditorInput}
                  onKeyUp={updateActiveFormats}
                  onMouseUp={updateActiveFormats}
                  onSelect={updateActiveFormats}
                  role="textbox"
                  aria-multiline="true"
                  data-placeholder="Provide a critical introduction or dust-jacket synopsis for catalog readers..."
                  className="w-full min-h-[160px] p-4 rounded-lg bg-[#F4F3F1] border-0 text-sm text-[#1A1C1B] focus:outline-none focus:ring-2 focus:ring-[#091426]/20 transition-all font-sans leading-[22.75px] outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-[#45474C]/40 [&_blockquote]:border-l-2 [&_blockquote]:border-[#745939] [&_blockquote]:pl-3 [&_blockquote]:my-2 [&_blockquote]:italic [&_blockquote]:text-[#45474C] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1.5 [&_a]:text-[#745939] [&_a]:underline [&_strike]:line-through [&_s]:line-through [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic mt-2"
                />
              )}

              {/* Editor Footer: Formatting status & Markdown Preview (Figma #1:1044 - #1:1051) */}
              <div className="flex items-center justify-between text-xs font-sans text-[#45474C] pt-3">
                {/* Left: Icon + "Markdown syntax enabled" (Figma #1:1045 - #1:1049) */}
                <div className="flex items-center gap-1.5 text-[#45474C]">
                  <svg className="w-[14px] h-[11px] text-[#45474C] fill-current shrink-0" viewBox="0 0 14 11">
                    <path d="M9.62504 7.56253L11.6875 5.50002L10.9657 4.76096L10.1407 5.58596V3.43751H9.10941V5.58596L8.28441 4.76096L7.56253 5.50002L9.62504 7.56253ZM1.37501 11C0.996879 11 0.67318 10.8654 0.403908 10.5961C0.134636 10.3269 0 10.0032 0 9.62504V1.37501C0 0.996879 0.134636 0.67318 0.403908 0.403908C0.67318 0.134636 0.996879 0 1.37501 0H12.375C12.7532 0 13.0769 0.134636 13.3461 0.403908C13.6154 0.67318 13.7501 0.996879 13.7501 1.37501V9.62504C13.7501 10.0032 13.6154 10.3269 13.3461 10.5961C13.0769 10.8654 12.7532 11 12.375 11H1.37501ZM1.37501 9.62504H12.375V1.37501H1.37501V9.62504ZM1.37501 9.62504V1.37501V9.62504ZM2.40626 7.56253H3.43751V4.46877H4.12502V6.53128H5.15627V4.46877H5.84377V7.56253H6.87503V4.12502C6.87503 3.93022 6.80914 3.76694 6.67737 3.63517C6.5456 3.5034 6.38232 3.43751 6.18752 3.43751H3.09376C2.89897 3.43751 2.73569 3.5034 2.60392 3.63517C2.47214 3.76694 2.40626 3.93022 2.40626 4.12502V7.56253Z" />
                  </svg>
                  <span className="text-[12px] leading-[18px]">Markdown syntax enabled</span>
                </div>

                {/* Right: "Preview Markdown" button (Figma #1:1050 - #1:1051) */}
                <button
                  type="button"
                  onClick={() => setPreviewMarkdown(prev => !prev)}
                  className="text-sm font-semibold text-[#745939] hover:underline transition-colors font-sans cursor-pointer"
                >
                  {previewMarkdown ? 'Edit Description' : 'Preview Markdown'}
                </button>
              </div>
            </section>
          </div>

          {/* RIGHT 4 COLUMNS: PHYSICAL SIMULATION & CLOUDINARY UPLOAD (Figma #1:1052) */}
          <div className="lg:col-span-4 flex flex-col gap-6 sm:gap-8">
            {/* Live 3D Physical Book Simulation (Figma #1:1053 - #1:1076) */}
            <div className="bg-white p-4 sm:p-6 rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex flex-col items-center gap-4">
              {/* Header: LIVE VOLUME PREVIEW & Proportion Badge (Figma #1:1054 - #1:1059) */}
              <div className="w-full flex items-center justify-between pb-3.5 sm:pb-4 border-b border-[#E9E8E6]">
                <div className="text-[11px] font-semibold leading-[14px] tracking-[0.05em] text-[#45474C] uppercase font-sans">
                  LIVE VOLUME<br />PREVIEW
                </div>
                <div className="px-2 py-0.5 rounded bg-[#FFDDB8]/40 text-[#745939] text-[11px] font-semibold leading-[14px] tracking-[0.05em] font-sans text-right">
                  Proportion 1 :<br />1.5
                </div>
              </div>

              {/* Simulated 3D Physical Book Spine & Cover Mockup (Figma #1:1061 - #1:1076) */}
              <div className="relative w-44 sm:w-48 h-64 sm:h-72 rounded-r-[6px] overflow-hidden shadow-2xl shadow-black/25 flex flex-col justify-between p-4 sm:p-5 bg-[#091426] text-white">
                {/* Background Artwork */}
                {formData.coverImage ? (
                  <img
                    src={formData.coverImage}
                    alt="Cover preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1B2A4A] to-[#091426]" />
                )}

                {/* Left Spine Ridge Highlight Gradient (Figma #1:1063) */}
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/40 via-white/10 to-transparent pointer-events-none" />
                {/* Vertical Spine Groove Divider (Figma #1:1064) */}
                <div className="absolute left-[10px] top-0 bottom-0 w-[1px] bg-white/20 pointer-events-none" />

                {/* Front Cover Typography Stack (Figma #1:1065 - #1:1076) */}
                <div className="relative z-10 flex flex-col gap-1">
                  <span className="text-[10px] sm:text-[11px] font-semibold leading-[14px] tracking-[0.1em] text-white/75 uppercase font-sans">
                    ARCHIVAL EDITION
                  </span>
                  <h3 className="font-serif font-medium text-[20px] sm:text-[24px] leading-[28px] sm:leading-[33px] tracking-[-0.025em] text-white line-clamp-3">
                    {formData.title || 'The\nArchitecture of\nSilence'}
                  </h3>
                </div>

                <div className="relative z-10 flex flex-col gap-1 sm:gap-1.5 pt-3 sm:pt-4">
                  <div className="w-6 h-[2px] bg-[#745939]" />
                  <span className="font-sans font-medium text-xs sm:text-[14px] leading-[18px] sm:leading-[22px] tracking-[0.025em] text-white truncate pt-1">
                    {selectedAuthor ? selectedAuthor.name : 'Elena Rostova'}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-semibold leading-[14px] tracking-[0.05em] text-white/60 font-sans">
                    EST. {formData.publishedYear || '2023'} · FOLIO
                  </span>
                </div>
              </div>
            </div>

            {/* Cover Source & Drag-Drop Box (Figma #1:1078 - #1:1089) */}
            <div className="bg-white p-4 sm:p-6 rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex flex-col gap-3">
              <label htmlFor="cover-url" className="text-xs sm:text-[14px] font-semibold leading-[20px] text-[#1A1C1B] font-sans">
                Cover Asset URL
              </label>

              {/* Direct URL Input (Figma #1:1081 - #1:1083) */}
              <input
                id="cover-url"
                name="coverImage"
                type="url"
                value={formData.coverImage}
                onChange={handleChange}
                placeholder="https://assets.bookshelf.internal/covers/arch-silence-hq.webp"
                className="w-full px-3 py-2 rounded-lg bg-[#F4F3F1] border-0 text-xs text-[#1A1C1B] focus:outline-none focus:ring-2 focus:ring-[#091426]/20 transition-all font-sans"
              />

              {/* Drag-and-Drop Cloudinary Box (Figma #1:1084 - #1:1089) */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('cover-file-input')?.click()}
                className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${isDragging
                    ? 'border-[#091426] bg-[#091426]/5'
                    : 'border-[#C5C6CD] hover:border-[#091426]'
                  } ${uploadingCover ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <input
                  id="cover-file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />

                {uploadingCover ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <span className="text-xs font-semibold text-primary font-sans">
                      Uploading to Cloudinary...
                    </span>
                  </div>
                ) : (
                  <>
                    <svg className="w-[22px] h-[16px] text-[#45474C] fill-current" viewBox="0 0 22 16">
                      <path d="M5.5 16C3.98333 16 2.6875 15.475 1.6125 14.425C0.5375 13.375 0 12.0917 0 10.575C0 9.275 0.391667 8.11667 1.175 7.1C1.95833 6.08333 2.98333 5.43333 4.25 5.15C4.66667 3.61667 5.5 2.375 6.75 1.425C8 0.475 9.41667 0 11 0C12.95 0 14.6042 0.679167 15.9625 2.0375C17.3208 3.39583 18 5.05 18 7C19.15 7.13333 20.1042 7.62917 20.8625 8.4875C21.6208 9.34583 22 10.35 22 11.5C22 12.75 21.5625 13.8125 20.6875 14.6875C19.8125 15.5625 18.75 16 17.5 16H12C11.45 16 10.9792 15.8042 10.5875 15.4125C10.1958 15.0208 10 14.55 10 14V8.85L8.4 10.4L7 9L11 5L15 9L13.6 10.4L12 8.85V14H17.5C18.2 14 18.7917 13.7583 19.275 13.275C19.7583 12.7917 20 12.2 20 11.5C20 10.8 19.7583 10.2083 19.275 9.725C18.7917 9.24167 18.2 9 17.5 9H16V7C16 5.61667 15.5125 4.4375 14.5375 3.4625C13.5625 2.4875 12.3833 2 11 2C9.61667 2 8.4375 2.4875 7.4625 3.4625C6.4875 4.4375 6 5.61667 6 7H5.5C4.53333 7 3.70833 7.34167 3.025 8.025C2.34167 8.70833 2 9.53333 2 10.5C2 11.4667 2.34167 12.2917 3.025 12.975C3.70833 13.6583 4.53333 14 5.5 14H8V16H5.5Z" />
                    </svg>
                    <div className="text-center font-sans">
                      <p className="text-xs sm:text-[14px] font-semibold leading-[20px] text-[#091426]">
                        Drop image or <span className="underline text-[#745939]">browse</span>
                      </p>
                      <p className="text-[11px] sm:text-[12px] leading-[18px] text-[#45474C] mt-0.5">
                        JPEG, PNG, WEBP
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FORM ACTION FOOTER: STATIC BAR AT BOTTOM OF FORM (Figma #1:1090 - #1:1109) */}
        <div className="bg-white p-4 sm:p-6 rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          {/* Left Validation Readiness Indicator (Figma #1:1092 - #1:1098) */}
          <div className="flex items-center gap-3">
            <span className="w-[10px] h-[10px] rounded-full bg-[#745939] shrink-0" />
            <div>
              <p className="font-sans font-semibold text-[13px] sm:text-[14px] leading-[20px] text-[#1A1C1B]">
                Ready to Catalog
              </p>
              <p className="font-sans font-normal text-[12px] leading-[18px] text-[#45474C] hidden sm:block">
                All mandatory bibliographic identifiers provided.
              </p>
            </div>
          </div>

          {/* Right Action CTAs: Cancel & Save (Figma #1:1100 - #1:1109) */}
          <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial justify-center px-4 sm:px-5 py-2.5 rounded-lg border border-[#C5C6CD] hover:bg-[#F4F3F1] text-xs sm:text-sm font-semibold text-[#1A1C1B] transition-colors flex items-center gap-2 font-sans cursor-pointer"
            >
              <svg className="w-[11px] h-[11px] text-[#1A1C1B] fill-current" viewBox="0 0 11 11">
                <path d="M1.1 11L0 9.9L4.4 5.5L0 1.1L1.1 0L5.5 4.4L9.9 0L11 1.1L6.6 5.5L11 9.9L9.9 11L5.5 6.6L1.1 11Z" />
              </svg>
              <span>Cancel</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting || uploadingCover}
              className="flex-1 sm:flex-initial justify-center px-5 sm:px-6 py-2.5 rounded-lg bg-[#091426] hover:bg-[#091426]/90 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors flex items-center gap-2 font-sans disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-[15px] h-[15px] text-white fill-current" viewBox="0 0 15 15">
                    <path d="M6.45 10.95L11.7375 5.6625L10.6875 4.6125L6.45 8.85L4.3125 6.7125L3.2625 7.7625L6.45 10.95ZM7.5 15C6.4625 15 5.4875 14.8031 4.575 14.4094C3.6625 14.0156 2.86875 13.4812 2.19375 12.8062C1.51875 12.1312 0.984375 11.3375 0.590625 10.425C0.196875 9.5125 0 8.5375 0 7.5C0 6.4625 0.196875 5.4875 0.590625 4.575C0.984375 3.6625 1.51875 2.86875 2.19375 2.19375C2.86875 1.51875 3.6625 0.984375 4.575 0.590625C5.4875 0.196875 6.4625 0 7.5 0C8.5375 0 9.5125 0.196875 10.425 0.590625C11.3375 0.984375 12.1312 1.51875 12.8062 2.19375C13.4812 2.86875 14.0156 3.6625 14.4094 4.575C14.8031 5.4875 15 6.4625 15 7.5C15 8.5375 14.8031 9.5125 14.4094 10.425C14.0156 11.3375 13.4812 12.1312 12.8062 12.8062C12.1312 13.4812 11.3375 14.0156 10.425 14.4094C9.5125 14.8031 8.5375 15 7.5 15ZM7.5 13.5C9.175 13.5 10.5938 12.9188 11.7563 11.7563C12.9188 10.5938 13.5 9.175 13.5 7.5C13.5 5.825 12.9188 4.40625 11.7563 3.24375C10.5938 2.08125 9.175 1.5 7.5 1.5C5.825 1.5 4.40625 2.08125 3.24375 3.24375C2.08125 4.40625 1.5 5.825 1.5 7.5C1.5 9.175 2.08125 10.5938 3.24375 11.7563C4.40625 12.9188 5.825 13.5 7.5 13.5Z" />
                  </svg>
                  <span>{isEdit ? 'Update Book' : 'Save Book'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
