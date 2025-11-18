import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Download,
  Upload,
  BarChart2,
  BookOpen,
  Users,
  User,
  DollarSign,
  Star,
  Clock,
  Bookmark,
  Check,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Flag
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  Legend
} from "recharts";
import { format, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Constants
const PAGE_SIZE = 10;
const STORAGE_BUCKET = 'book-storage';
const DEFAULT_COVER_IMAGE = 'https://placehold.co/300x450?text=No+Cover';

// ToastContainer rendered in component tree below

// Book genres for consistent filtering
const BOOK_GENRES = [
  'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 
  'Thriller', 'Romance', 'Biography', 'History', 'Science',
  'Self-Help', 'Business', 'Technology', 'Art', 'Cooking'
];

// Book languages
const BOOK_LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Other'];

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.2 }
  }
};

// Custom hook for fetching paginated books with advanced filtering
function usePaginatedBooks({ search, genre, language, sort, reloadFlag }) {
  const [books, setBooks] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from("books")
        .select("*", { count: "exact" });

      // Apply search filters
      if (search) {
        const term = `%${search}%`;
        query = query.or(`title.ilike.${term},author.ilike.${term}`);
      }
      
      if (genre && genre !== 'All') {
        // Filter by simple genre field
        query = query.eq('genre', genre);
      }
      
      if (language && language !== 'All') {
        query = query.eq("language", language);
      }

      // Apply sorting
      if (sort) {
        const lastUnderscore = sort.lastIndexOf('_');
        const field = lastUnderscore > -1 ? sort.substring(0, lastUnderscore) : sort;
        const direction = lastUnderscore > -1 ? sort.substring(lastUnderscore + 1) : 'desc';
        query = query.order(field, { ascending: direction === 'asc' });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      // Calculate pagination
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, count, error: queryError } = await query;

      if (queryError) throw queryError;

      setBooks(data || []);
      setCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));
    } catch (err) {
      console.error("Error fetching books:", err);
      setError(err.message);
      toast.error(`Failed to load books: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [search, genre, language, sort, page, reloadFlag]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const refresh = useCallback(() => {
    fetchBooks();
  }, [fetchBooks]);

  return { 
    books, 
    count, 
    loading, 
    error,
    page, 
    totalPages,
    setPage, 
    PAGE_SIZE,
    refresh
  };
}

// Custom hook for dashboard metrics
function useDashboardMetrics() {
  const [metrics, setMetrics] = useState({
    totalBooks: 0,
    totalUsers: 0,
    activeUsers: 0,
    revenue: 0,
    monthlyGrowth: 0,
    topGenres: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        
        // Fetch book count
        const { count: bookCount } = await supabase
          .from('books')
          .select('*', { count: 'exact', head: true });

        // Fetch user metrics (example - adjust based on your auth setup)
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch revenue data (example - adjust based on your payment system)
        const { data: revenueData } = await supabase
          .from('transactions')
          .select('amount')
          .eq('status', 'completed');

        // Calculate total revenue
        const totalRevenue = revenueData?.reduce((sum, txn) => sum + (parseFloat(txn.amount) || 0), 0) || 0;

        // Fetch genre distribution
        const { data: genreData } = await supabase
          .from('books')
          .select('genre, count:count()', { head: false })
          .order('count', { ascending: false })
          .limit(5);

        // Fetch recent activity
        const { data: recentActivity } = await supabase
          .from('user_activity')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        setMetrics({
          totalBooks: bookCount || 0,
          totalUsers: userCount || 0,
          activeUsers: Math.floor((userCount || 0) * 0.65), // Example calculation
          revenue: totalRevenue,
          monthlyGrowth: 12.5, // Example growth percentage
          topGenres: genreData || [],
          recentActivity: recentActivity || []
        });
      } catch (err) {
        console.error("Error fetching metrics:", err);
        setError(err.message);
        toast.error(`Failed to load dashboard metrics: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    
    // Set up real-time subscription for metrics
    const subscription = supabase
      .channel('dashboard-metrics')
      .on('postgres_changes', { event: '*', schema: 'public' }, payload => {
        fetchMetrics(); // Refresh metrics on any data change
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { metrics, loading, error };
}

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    genre: '',
    language: '',
    sort: 'created_at_desc',
    status: 'all',
    featured: 'all',
    dateRange: 'all'
  });
  const [reloadFlag, setReloadFlag] = useState(0);
  const formRef = useRef(null);
  // Using metrics from useDashboardMetrics hook instead of local state
  // Remove the duplicate stats state
  
  // Use custom hooks for data fetching
  const { metrics, loading: metricsLoading } = useDashboardMetrics();
  
  const {
    books,
    count: totalBooks,
    loading: booksLoading,
    page,
    totalPages,
    setPage,
    refresh: refreshBooks
  } = usePaginatedBooks({
    search: debouncedSearchTerm,
    genre: filters.genre,
    language: filters.language,
    sort: filters.sort,
    reloadFlag
  });

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    author: '',
    description: '',
    genre: '',
    language: 'English',
    isbn: '',
    published_date: '',
    page_count: '',
    publisher: '',
    price: '',
    is_featured: false,
    is_bestseller: false,
    subjects: '',
    cover_image: DEFAULT_COVER_IMAGE,
    pdf_file: null,
    cover_file: null,
    downloads: 0,
    status: 'active'
  });

  // Format currency
  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
    
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      genre: '',
      language: '',
      sort: 'created_at_desc',
      status: 'all',
      featured: 'all',
      dateRange: 'all'
    });
    setSearchTerm('');
    setPage(1);
  };

  // Dashboard stats data
  const statsData = [
    { 
      label: "Total Books", 
      value: metrics.totalBooks?.toLocaleString("en-US") || '0',
      icon: <BookOpen className="w-6 h-6 text-blue-500" />,
      change: metrics.monthlyGrowth ? `+${metrics.monthlyGrowth}%` : '0%',
      changeType: metrics.monthlyGrowth > 0 ? 'increase' : 'decrease'
    },
    { 
      label: "Paid Users", 
      value: metrics.paidUsers?.toLocaleString("en-US") || '1,245',
      icon: <Users className="w-6 h-6 text-green-500" />,
      change: '+12.1%',
      changeType: 'increase'
    },
    { 
      label: "Revenue", 
      value: formatCurrency(metrics.revenue),
      icon: <DollarSign className="w-6 h-6 text-yellow-500" />,
      change: '+8.7%',
      changeType: 'increase'
    },
    { 
      label: "New Reviews", 
      value: metrics.newReviews?.toLocaleString() || '42',
      icon: <Star className="w-6 h-6 text-purple-500" />,
      change: '+15.3%',
      changeType: 'increase'
    },
    { 
      label: "User Retention", 
      value: `${metrics.userRetention || '78'}%`,
      icon: <Users className="w-6 h-6 text-pink-500" />,
      change: '+2.4%',
      changeType: 'increase'
    }
  ];

  // Generate sample data for charts
  const generateMonthlyData = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      months.push({
        month: format(date, 'MMM yyyy'),
        revenue: Math.floor(Math.random() * 10000) + 5000,
        users: Math.floor(Math.random() * 500) + 200,
        subscriptions: Math.floor(Math.random() * 400) + 150,
        books: Math.floor(Math.random() * 100) + 50
      });
    }
    return months;
  };

  const monthlyData = useMemo(() => generateMonthlyData(), []);

  // Top genres data
  const genreColors = ["#2563EB", "#7C3AED", "#10B981", "#F59E0B", "#EF4444"];
  const topGenres = metrics.topGenres.length > 0 
    ? metrics.topGenres 
    : [
      { genre: 'Fiction', count: 120 },
      { genre: 'Science Fiction', count: 85 },
      { genre: 'Mystery', count: 76 },
      { genre: 'Romance', count: 64 },
      { genre: 'Non-Fiction', count: 55 }
    ];

  // Recent activity data
  const recentActivity = metrics.recentActivity.length > 0
    ? metrics.recentActivity
    : [
      { id: 1, user: 'John Doe', action: 'added a new book', target: 'The Midnight Library', time: '2 hours ago' },
      { id: 2, user: 'Jane Smith', action: 'updated profile', target: 'Profile Information', time: '5 hours ago' },
      { id: 3, user: 'Admin', action: 'processed order', target: 'Order #12345', time: '1 day ago' },
      { id: 4, user: 'System', action: 'completed backup', target: 'Database', time: '2 days ago' },
      { id: 5, user: 'Alex Johnson', action: 'left a review', target: '5 stars - Atomic Habits', time: '3 days ago' }
    ];


  // Debounce the actual search term used for fetching
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // Reset to first page when search term changes
  useEffect(() => {
    const id = setTimeout(() => setPage(1), 500);
    return () => clearTimeout(id);
  }, [searchTerm]);
  
  // Removed duplicate stats fetching effect (metrics are provided by useDashboardMetrics)

  // Reset form when editing book changes
  useEffect(() => {
    if (editingBook) {
      setFormData({
        id: editingBook.id,
        title: editingBook.title || '',
        author: editingBook.author || '',
        description: editingBook.description || '',
        genre: editingBook.genre || '',
        language: editingBook.language || 'English',
        isbn: editingBook.isbn || '',
        published_date: editingBook.published_date || '',
        page_count: editingBook.page_count || '',
        publisher: editingBook.publisher || '',
        price: editingBook.price || '',
        is_featured: editingBook.is_featured || false,
        is_bestseller: editingBook.is_bestseller || false,
        subjects: Array.isArray(editingBook.subjects) 
          ? editingBook.subjects.join(', ') 
          : editingBook.subjects || '',
        cover_image: editingBook.cover_image || DEFAULT_COVER_IMAGE,
        pdf_file: editingBook.pdf_file || null,
        downloads: editingBook.downloads || 0,
        status: editingBook.status || 'active'
      });
      setShowForm(true);
    }
  }, [editingBook]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle file uploads
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      // For cover image, create a preview URL
      if (name === 'cover_file') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            cover_image: reader.result,
            cover_file: files[0]
          }));
        };
        reader.readAsDataURL(files[0]);
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: files[0]
        }));
      }
    }
  };

  // Upload file to storage
  const uploadFile = async (file, path) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${path}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let pdfUrl = formData.pdf_file;
      let coverImageUrl = formData.cover_image;

      // Upload PDF if a new file is selected
      if (formData.pdf_file instanceof File) {
        pdfUrl = await uploadFile(formData.pdf_file, 'books');
      }

      // Upload cover image if a new file is selected
      if (formData.cover_file instanceof File) {
        coverImageUrl = await uploadFile(formData.cover_file, 'covers');
      }

      // Prepare book data
      const bookData = {
        title: formData.title,
        author: formData.author,
        description: formData.description || null,
        genre: formData.genre || null,
        language: formData.language || 'English',
        isbn: formData.isbn || null,
        published_date: formData.published_date || null,
        page_count: formData.page_count ? parseInt(formData.page_count) : null,
        publisher: formData.publisher || null,
        price: formData.price ? parseFloat(formData.price) : null,
        is_featured: formData.is_featured || false,
        is_bestseller: formData.is_bestseller || false,
        subjects: formData.subjects 
          ? formData.subjects.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        cover_image: coverImageUrl,
        pdf_file: pdfUrl,
        status: formData.status || 'active',
        updated_at: new Date().toISOString()
      };

      if (editingBook) {
        // Update existing book
        const { error } = await supabase
          .from('books')
          .update(bookData)
          .eq('id', editingBook.id);
          
        if (error) throw error;
        toast.success('Book updated successfully!');
      } else {
        // Create new book
        const { data, error } = await supabase
          .from('books')
          .insert([{ 
            ...bookData,
            created_at: new Date().toISOString(),
            downloads: 0
          }])
          .select();
          
        if (error) throw error;
        toast.success('Book added successfully!');
      }

      resetForm();
      refreshBooks();
      setShowForm(false);
      setEditingBook(null);
    } catch (error) {
      console.error('Error saving book:', error);
      toast.error(`Failed to save book: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  

  // Handle book selection for bulk actions
  const toggleBookSelection = (bookId) => {
    setSelectedBooks(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(bookId)) {
        newSelection.delete(bookId);
      } else {
        newSelection.add(bookId);
      }
      return newSelection;
    });
  };

  // Select all books on current page
  const selectAllBooks = () => {
    if (selectedBooks.size === books.length) {
      setSelectedBooks(new Set());
    } else {
      setSelectedBooks(new Set(books.map(book => book.id)));
    }
  };

  // Handle bulk actions on selected books
  const handleBulkAction = async (action) => {
    const bookIds = Array.from(selectedBooks);
    if (bookIds.length === 0) {
      toast.error('Please select at least one book');
      return;
    }

    try {
      switch (action) {
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${bookIds.length} selected books?`)) {
            const { error } = await supabase
              .from('books')
              .delete()
              .in('id', bookIds);
              
            if (error) throw error;
            
            toast.success(`${bookIds.length} books deleted successfully`);
            setSelectedBooks(new Set());
            refreshBooks();
          }
          break;
          
        case 'feature':
          await supabase
            .from('books')
            .update({ is_featured: true })
            .in('id', bookIds);
            
          toast.success(`${bookIds.length} books marked as featured`);
          refreshBooks();
          break;
          
        case 'unfeature':
          await supabase
            .from('books')
            .update({ is_featured: false })
            .in('id', bookIds);
            
          toast.success(`${bookIds.length} books unfeatured`);
          refreshBooks();
          break;
          
        case 'publish':
          await supabase
            .from('books')
            .update({ status: 'published' })
            .in('id', bookIds);
            
          toast.success(`${bookIds.length} books published`);
          refreshBooks();
          break;
          
        case 'unpublish':
          await supabase
            .from('books')
            .update({ status: 'draft' })
            .in('id', bookIds);
            
          toast.success(`${bookIds.length} books unpublished`);
          refreshBooks();
          break;
          
        default:
          break;
      }
      
      setBulkAction('');
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error(`Failed to complete action: ${error.message}`);
    }
  };

  // Toggle book status
  const toggleBookStatus = async (bookId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('books')
        .update({ status: newStatus })
        .eq('id', bookId);
        
      if (error) throw error;
      
      toast.success(`Book ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      refreshBooks();
    } catch (error) {
      console.error('Error toggling book status:', error);
      toast.error(`Failed to update book status: ${error.message}`);
    }
  };

  // Delete a book
  const handleDelete = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        const { error } = await supabase
          .from('books')
          .delete()
          .eq('id', bookId);
          
        if (error) throw error;
        
        toast.success('Book deleted successfully');
        refreshBooks();
      } catch (error) {
        console.error('Error deleting book:', error);
        toast.error(`Failed to delete book: ${error.message}`);
      }
    }
  };

  // Handle edit book
  const handleEdit = (book) => {
    setEditingBook(book);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle filter change
 const handleFilterChange = (filterName, value) => {
  // Update filters
  setFilters(prev => ({
    ...prev,
    [filterName]: value, // dynamically update the specific filter
  }));

  // Reset page number when filters change
  setPage(1);
};


  // Delete a book
  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    
    try {
      const { error } = await supabase.from("books").delete().eq("id", bookId);
      if (error) throw error;
      toast.success("Book deleted successfully!");
      refreshBooks();
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error(`Failed to delete book: ${error.message}`);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      id: "",
      title: "",
      author: "",
      description: "",
      genre: "",
      language: "English",
      subjects: "",
      cover_image: DEFAULT_COVER_IMAGE,
      pdf_file: null,
      downloads: 0,
      status: 'active',
      is_featured: false,
      is_bestseller: false,
      isbn: "",
      published_date: "",
      page_count: "",
      publisher: "",
      price: ""
    });
    setEditingBook(null);
    setShowForm(false);
  };

  // Navigation controls: admin can only leave to landing page
  const handleBackToLanding = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleSignOut = useCallback(async () => {
    try {
      if (supabase?.auth?.signOut) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      // no-op
    } finally {
      navigate('/');
    }
  }, [navigate]);

// ...
  if (metricsLoading) {
    return (
      <div className="min-h-screen bg-dark-gray dark:bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-coral mb-4"></div>
          <p className="text-white dark:text-dark-gray">Loading...</p>
        </div>
      </div>
    );
  }

  // Render dashboard tab removed; dashboard rendered inline below

  return (
    <div className="min-h-screen bg-dark-gray dark:bg-white">
      {/* Admin Navbar */}
      <header className="bg-white dark:bg-dark-gray border-b border-dark-gray dark:border-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="grid grid-cols-12 items-center">
            {/* Left spacer */}
            <div className="col-span-3" />

            {/* Centered title */}
            <div className="col-span-6 flex items-center justify-center">
              <span className="text-sm md:text-base font-semibold uppercase tracking-[0.3em] text-dark-gray dark:text-white">
                NextChapter
              </span>
            </div>

            {/* Right profile icon */}
            <div className="col-span-3 flex items-center justify-end">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-dark-gray/30 dark:border-white/30 text-dark-gray dark:text-white hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-colors"
                aria-label="Go to profile"
              >
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Hero-style header inspired by Profile page */}
        <div className="grid grid-cols-12 gap-8 md:gap-16 mb-10">
          <div className="col-span-12 md:col-span-5">
            <div className="mb-4">
              <span className="text-xs font-medium uppercase tracking-widest text-white dark:text-dark-gray border-b-2 border-white dark:border-dark-gray pb-2 inline-block">
                Admin Area
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl text-white dark:text-dark-gray mb-4 leading-none">
              Admin Dashboard
            </h1>
            <p className="text-lg text-white/70 dark:text-dark-gray/70 leading-relaxed font-light max-w-xl">
              Manage your books, catalogue and platform analytics from a single place.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest border-2 border-white dark:border-dark-gray text-white dark:text-dark-gray bg-transparent hover:bg-white/10 dark:hover:bg-dark-gray/10 w-[150px] "
              >
                <X className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
          <div className="col-span-12 md:col-span-7 border-t-2 border-white dark:border-dark-gray pt-6 md:pt-0 md:border-t-0 md:border-l-2 md:pl-10">
            <p className="text-sm text-white/60 dark:text-dark-gray/60 uppercase tracking-widest mb-6">
              Overview of platform metrics, trending genres and catalogue management.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard 
                label="Total Books" 
                value={metrics.totalBooks?.toLocaleString() || '0'} 
                icon={<BookOpen className="w-5 h-5 text-blue-500" />}
                change="+5.2%"
                changeType="increase"
              />
              <StatCard 
                label="Paid Users" 
                value={metrics.paidUsers?.toLocaleString() || '1,245'} 
                icon={<Users className="w-5 h-5 text-green-500" />}
                change="+12.1%"
                changeType="increase"
              />
              <StatCard 
                label="Revenue" 
                value={`$${(metrics.revenue || 0).toLocaleString()}`} 
                icon={<DollarSign className="w-5 h-5 text-yellow-500" />}
                change="+8.7%"
                changeType="increase"
              />
              <StatCard 
                label="New Reviews" 
                value={metrics.newReviews?.toLocaleString() || '42'} 
                icon={<Star className="w-5 h-5 text-purple-500" />}
                change="+15.3%"
                changeType="increase"
              />
              <div className="col-span-2">
                <StatCard 
                  label="User Retention" 
                  value={`${metrics.userRetention || '78'}%`} 
                  icon={<Users className="w-5 h-5 text-pink-500" />}
                  change="+2.4%"
                  changeType="increase"
                />
              </div>
            </div>

            {/* === Analytics === */}
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-dark-gray border-2 border-white dark:border-dark-gray p-5">
                <h2 className="text-2xl font-bold text-dark-gray dark:text-white mb-4 uppercase tracking-widest">
                  Monthly Revenue & Active Subscriptions
                </h2>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={monthlyData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottomRight', offset: -5 }} />
                    <YAxis yAxisId="left" label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Subscriptions', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#2563EB" strokeWidth={2} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="subscriptions" name="Subscriptions" stroke="#10B981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-dark-gray border-2 border-white dark:border-dark-gray p-5">
                <h2 className="text-2xl font-bold text-dark-gray dark:text-white mb-4 uppercase tracking-widest">
                  Trending Genres
                </h2>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={topGenres} dataKey="count" nameKey="genre" outerRadius={100} label>
                      {topGenres.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={genreColors[index % genreColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* === Trending Books & Reported Comments === */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
              <div className="bg-white dark:bg-dark-gray border-2 border-white dark:border-dark-gray p-4 flex flex-col h-full">
                <h2 className="text-xl font-bold text-dark-gray dark:text-white mb-4 uppercase tracking-widest">
                  Trending Books
                </h2>
                <div className="grid grid-cols-1 gap-3 mt-1 max-h-52 overflow-y-auto pr-1">
                  {books.slice(0, 4).map((book) => (
                    <div key={book.id} className="p-3 bg-dark-gray dark:bg-white border border-white/20 dark:border-dark-gray/20 text-white dark:text-dark-gray">
                      <h3 className="text-xs uppercase tracking-widest text-white/70 dark:text-dark-gray/70 mb-1 line-clamp-1">{book.title}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-extrabold">{Number(book.score || 0).toLocaleString()}</span>
                        <span className="text-[10px] uppercase tracking-widest text-white/60 dark:text-dark-gray/60">score</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-dark-gray border-2 border-white dark:border-dark-gray p-4 flex flex-col justify-between h-full">
                <h2 className="text-xl font-bold text-dark-gray dark:text-white mb-3 uppercase tracking-widest">
                  Reported Comments
                </h2>
                <div>
                  <p className="text-3xl font-extrabold text-dark-gray dark:text-white">
                    {metrics.reportedComments?.toLocaleString() || '0'}
                  </p>
                  {metrics.reportedCommentsChange && (
                    <p className={`mt-1 text-[11px] uppercase tracking-widest ${metrics.reportedCommentsChange.startsWith('+') ? 'text-red-500' : 'text-green-500'}`}>
                      {metrics.reportedCommentsChange}
                    </p>
                  )}
                  <p className="mt-3 text-[11px] uppercase tracking-widest text-dark-gray/60 dark:text-white/60">
                    Monitor and moderate user-reported comments here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === Catalogue Management === */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl text-white dark:text-dark-gray font-bold uppercase tracking-widest">
              Catalogue Management
            </h2>
            <p className="text-white/60 dark:text-dark-gray/60 text-sm uppercase tracking-widest">
              Add, curate and maintain the reading experience.
            </p>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => {
                if (showForm) {
                  formRef.current && formRef.current.requestSubmit();
                } else {
                  setEditingBook(null);
                  setShowForm(true);
                  setTimeout(() => {
                    if (formRef.current) {
                      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 0);
                }
              }}
              className="group inline-flex items-center gap-3 bg-white dark:bg-dark-gray text-dark-gray dark:text-white px-5 py-2 text-xs font-medium uppercase tracking-widest border border-white dark:border-dark-gray transition-all duration-300 hover:bg-dark-gray dark:hover:bg-white hover:text-white dark:hover:text-dark-gray"
            >
              {showForm ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{showForm ? 'Save Book' : 'Add Book'}</span>
            </button>
          </div>
        </div>

        {/* Add/Edit Book Form */}
        {showForm && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 overflow-y-auto py-10"
            onClick={(e) => {
              if (e.target === e.currentTarget) resetForm();
            }}
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-3xl border-2 border-white dark:border-dark-gray bg-white dark:bg-dark-gray p-8 relative max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-dark-gray dark:text-white font-bold uppercase tracking-widest">
                  {editingBook ? 'Edit Book' : 'Add New Book'}
                </h2>
                <button
                  type="button"
                  onClick={resetForm}
                  className="p-2 bg-dark-gray dark:bg-white text-white dark:text-dark-gray border-2 border-white dark:border-dark-gray hover:opacity-80 transition-opacity"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} ref={formRef} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-dark-gray dark:text-white mb-2">
                    Book ID *
                  </label>
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleInputChange}
                    required
                    disabled={!!editingBook}
                    className="w-full bg-dark-gray dark:bg-white text-white dark:text-dark-gray border-2 border-white dark:border-dark-gray px-4 py-3 text-sm focus:outline-none focus:border-coral"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-dark-gray dark:text-white mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-dark-gray dark:bg-white text-white dark:text-dark-gray border-2 border-white dark:border-dark-gray px-4 py-3 text-sm focus:outline-none focus:border-coral"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-dark-gray dark:text-white mb-2">
                    Author *
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-dark-gray dark:bg-white text-white dark:text-dark-gray border-2 border-white dark:border-dark-gray px-4 py-3 text-sm focus:outline-none focus:border-coral"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-dark-gray dark:text-white mb-2">
                    Genre
                  </label>
                  <input
                    type="text"
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    className="w-full bg-dark-gray dark:bg-white text-white dark:text-dark-gray border-2 border-white dark:border-dark-gray px-4 py-3 text-sm focus:outline-none focus:border-coral"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-dark-gray dark:text-white mb-2">
                    Language
                  </label>
                  <input
                    type="text"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    placeholder="e.g., English, Spanish"
                    className="w-full bg-dark-gray dark:bg-white text-white dark:text-dark-gray border-2 border-white dark:border-dark-gray px-4 py-3 text-sm focus:outline-none focus:border-coral"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-dark-gray dark:text-white mb-2">
                    Subjects (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="subjects"
                    value={formData.subjects}
                    onChange={handleInputChange}
                    placeholder="e.g., Fiction, Romance, Classic"
                    className="w-full bg-dark-gray dark:bg-white text-white dark:text-dark-gray border-2 border-white dark:border-dark-gray px-4 py-3 text-sm focus:outline-none focus:border-coral"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-dark-gray dark:text-white mb-2">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    name="cover_image"
                    value={formData.cover_image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/cover.jpg"
                    className="w-full bg-dark-gray dark:bg-white text-white dark:text-dark-gray border-2 border-white dark:border-dark-gray px-4 py-3 text-sm focus:outline-none focus:border-coral"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-dark-gray dark:text-white mb-2">
                    Downloads
                  </label>
                  <input
                    type="number"
                    name="downloads"
                    value={formData.downloads}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full bg-dark-gray dark:bg-white text-white dark:text-dark-gray border-2 border-white dark:border-dark-gray px-4 py-3 text-sm focus:outline-none focus:border-coral"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-dark-gray dark:text-white mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full bg-dark-gray dark:bg-white text-white dark:text-dark-gray border-2 border-white dark:border-dark-gray px-4 py-3 text-sm focus:outline-none focus:border-coral resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-dark-gray dark:text-white mb-2">
                    Upload PDF File
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      name="pdf_file"
                      onChange={handleFileChange}
                      accept=".pdf"
                      className="w-full bg-dark-gray dark:bg-white text-white dark:text-dark-gray border-2 border-white dark:border-dark-gray px-4 py-3 text-sm focus:outline-none focus:border-coral file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:uppercase file:tracking-widest file:bg-white dark:file:bg-dark-gray file:text-dark-gray dark:file:text-white file:cursor-pointer"
                    />
                  </div>
                  {formData.pdf_file && !(formData.pdf_file instanceof File) && (
                    <p className="mt-2 text-xs text-white/60 dark:text-dark-gray/60">
                      Current: {formData.pdf_file}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-dark-gray dark:text-white mb-2">
                    Upload Cover Image
                  </label>
                  <input
                    type="file"
                    name="cover_file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full bg-dark-gray dark:bg-white text-white dark:text-dark-gray border-2 border-white dark:border-dark-gray px-4 py-3 text-sm focus:outline-none focus:border-coral file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:uppercase file:tracking-widest file:bg-white dark:file:bg-dark-gray file:text-dark-gray dark:file:text-white file:cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-2 bg-white dark:bg-dark-gray text-dark-gray dark:text-white border-2 border-white dark:border-dark-gray px-6 py-3 text-xs uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dark-gray dark:border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingBook ? 'Update Book' : 'Add Book'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-2 bg-dark-gray dark:bg-white text-white dark:text-dark-gray border-2 border-white dark:border-dark-gray px-6 py-3 text-xs uppercase tracking-widest hover:opacity-80 transition-opacity"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
              </form>
            </div>
          </div>
        )}

        {/* Books Table */}
        <>
          <div className="mb-6 bg-white dark:bg-dark-gray border-2 border-white dark:border-dark-gray p-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
              <div className="flex-1">
                <label className="block text-xs uppercase tracking-widest text-dark-gray dark:text-white mb-2">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title or author..."
                  className="w-full bg-dark-gray dark:bg-white text-white dark:text-dark-gray border-2 border-white dark:border-dark-gray px-4 py-2 text-sm focus:outline-none focus:border-coral"
                />
              </div>
              <div className="w-full md:w-64">
                <label className="block text-xs uppercase tracking-widest text-dark-gray dark:text-white mb-2">Genre</label>
                <select
                  value={filters.genre}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                  className="w-full bg-dark-gray dark:bg-white text-white dark:text-dark-gray border-2 border-white dark:border-dark-gray px-4 py-2 text-sm focus:outline-none focus:border-coral"
                >
                  <option value="">All</option>
                  {BOOK_GENRES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest border-2 border-white dark:border-dark-gray text-dark-gray dark:text-white bg-white dark:bg-dark-gray hover:opacity-80"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
          <div className="border-2 border-white dark:border-dark-gray overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white dark:bg-dark-gray">
                <tr>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-widest text-dark-gray dark:text-white font-bold border-b-2 border-dark-gray dark:border-white">
                    Cover
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-widest text-dark-gray dark:text-white font-bold border-b-2 border-dark-gray dark:border-white">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-widest text-dark-gray dark:text-white font-bold border-b-2 border-dark-gray dark:border-white">
                    Author
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-widest text-dark-gray dark:text-white font-bold border-b-2 border-dark-gray dark:border-white">
                    Genre
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-widest text-dark-gray dark:text-white font-bold border-b-2 border-dark-gray dark:border-white">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-widest text-dark-gray dark:text-white font-bold border-b-2 border-dark-gray dark:border-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {booksLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-white/60 dark:text-dark-gray/60 text-sm uppercase tracking-widest">
                      Loading books...
                    </td>
                  </tr>
                ) : books.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-white/60 dark:text-dark-gray/60 text-sm uppercase tracking-widest">
                      No books found. Add your first book!
                    </td>
                  </tr>
                ) : (
                  books.map((book) => (
                    <tr key={book.id} className="border-b border-white/10 dark:border-dark-gray/10 hover:bg-white/5 dark:hover:bg-dark-gray/5 transition-colors">
                      <td className="px-6 py-4">
                        {book.cover_image ? (
                          <img
                            src={book.cover_image}
                            alt={book.title}
                            className="w-16 h-24 object-cover border-2 border-white dark:border-dark-gray"
                          />
                        ) : (
                          <div className="w-16 h-24 bg-white dark:bg-dark-gray flex items-center justify-center text-2xl border-2 border-white dark:border-dark-gray">
                            📚
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white dark:text-dark-gray text-sm font-medium uppercase tracking-widest">
                          {book.title}
                        </div>
                        {book.description && (
                          <div className="text-white/60 dark:text-dark-gray/60 text-xs mt-1 line-clamp-2">
                            {book.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-white dark:text-dark-gray text-sm uppercase tracking-widest">
                        {book.author || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-white dark:text-dark-gray text-sm uppercase tracking-widest">
                        {book.genre || '-'}
                      </td>
                      <td className="px-6 py-4 text-white dark:text-dark-gray text-sm">
                        <span className="inline-flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {typeof book.rating === 'number' ? book.rating.toFixed(1) : (book.rating || '-')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(book)}
                            className="p-2 bg-white dark:bg-dark-gray text-dark-gray dark:text-white border-2 border-white dark:border-dark-gray hover:opacity-80 transition-opacity"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(book.id)}
                            className="p-2 bg-white dark:bg-dark-gray text-dark-gray dark:text-white border-2 border-white dark:border-dark-gray hover:opacity-80 transition-opacity"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-white/60 dark:text-dark-gray/60 text-xs uppercase tracking-widest">
              Total Books: {totalBooks} • Page {page} of {Math.max(totalPages || 1, 1)}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-3 py-1 text-xs uppercase tracking-widest border-2 border-white dark:border-dark-gray text-white dark:text-dark-gray disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-white/80 dark:text-dark-gray/80 text-xs">
                {page}
              </span>
              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages || 1, page + 1))}
                disabled={page >= (totalPages || 1)}
                className="px-3 py-1 text-xs uppercase tracking-widest border-2 border-white dark:border-dark-gray text-white dark:text-dark-gray disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      </div>
    </div>
);

};

const StatCard = ({ label, value, icon, change, changeType }) => (
  <div className="bg-dark-gray dark:bg-white border border-white/20 dark:border-dark-gray/20">
    <div className="p-5">
      <div className="flex items-start justify-between">
        <dt className="text-[11px] uppercase tracking-widest text-white/70 dark:text-dark-gray/70">
          {label}
        </dt>
        <div className="shrink-0">
          <div className="text-yellow-400 dark:text-yellow-500">
            {icon}
          </div>
        </div>
      </div>
      <dd className="mt-3 flex items-center">
        <div className="text-3xl font-extrabold text-white dark:text-dark-gray">
          {value}
        </div>
        {change && (
          <span className={`ml-3 text-[10px] uppercase tracking-widest px-2.5 py-1 rounded border ${changeType === 'increase' ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}>
            {change}
          </span>
        )}
      </dd>
    </div>
  </div>
);

// Book Card Component
const BookCard = ({ book, onEdit, onDelete, onToggleStatus, isSelected, onToggleSelect }) => (
  <div className={`bg-white rounded-lg shadow overflow-hidden transition-all duration-200 ${
    isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
  }`}>
    <div className="p-4">
      <div className="flex items-start">
        <div className="shrink-0 h-40 w-28 overflow-hidden rounded-md">
          <img
            src={book.cover_image || DEFAULT_COVER_IMAGE}
            alt={book.title}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 line-clamp-1">
              {book.title}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                book.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {book.status || 'draft'}
              </span>
              {book.is_featured && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Featured
                </span>
              )}
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500">{book.author}</p>
          
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <span>{book.genre}</span>
            <span className="mx-2">•</span>
            <span>{book.language}</span>
            <span className="mx-2">•</span>
            <span>{book.downloads || 0} downloads</span>
          </div>
          
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {book.description || 'No description available.'}
          </p>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(book)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Edit2 className="-ml-1 mr-1.5 h-4 w-4" />
                Edit
              </button>
              <button
                onClick={() => onToggleStatus(book.id, book.status)}
                className={`inline-flex items-center px-3 py-1.5 border ${
                  book.status === 'active' 
                    ? 'border-red-300 text-red-700 hover:bg-red-50' 
                    : 'border-green-300 text-green-700 hover:bg-green-50'
                } shadow-sm text-sm font-medium rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {book.status === 'active' ? (
                  <>
                    <XCircle className="-ml-1 mr-1.5 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Check className="-ml-1 mr-1.5 h-4 w-4" />
                    Activate
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(book.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <button
                onClick={() => onDelete(book.id)}
                className="ml-3 text-red-600 hover:text-red-900"
                title="Delete book"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Chart Components
const RevenueChart = ({ data }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue & Users</h3>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
          <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            name="Revenue ($)"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6, stroke: '#2563EB', strokeWidth: 2 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="users"
            name="Active Users"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6, stroke: '#059669', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const GenrePieChart = ({ data, colors }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-lg font-medium text-gray-900 mb-4">Top Genres</h3>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
            nameKey="genre"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name, props) => [
              `${value} books`, 
              props.payload.genre
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const RecentActivity = ({ activities }) => {
  return (
    <div className="bg-white dark:bg-dark-gray border-2 border-white dark:border-dark-gray">
      <div className="px-4 py-5 sm:px-6 border-b-2 border-white dark:border-dark-gray">
        <h3 className="text-xs uppercase tracking-widest text-dark-gray dark:text-white">Recent Activity</h3>
      </div>
      <ul className="divide-y divide-white/10 dark:divide-dark-gray/10">
        {activities.map((activity) => (
          <li key={activity.id} className="px-4 py-4 sm:px-6">
            <div className="flex items-center">
              <div className="min-w-0 flex-1 flex items-center">
                <div>
                  <p className="text-sm font-semibold text-dark-gray dark:text-white truncate">
                    {activity.user}
                  </p>
                  <p className="text-sm text-dark-gray/60 dark:text-white/60">
                    {activity.action} <span className="font-medium">{activity.target}</span>
                  </p>
                </div>
              </div>
              <div className="ml-4 shrink-0">
                <p className="text-xs uppercase tracking-widest text-dark-gray/60 dark:text-white/60">{activity.time}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Admin;
