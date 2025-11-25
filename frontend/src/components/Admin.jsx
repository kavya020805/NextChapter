import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { getUserProfile } from "../lib/personalizationUtils";
import { getTrendingBooks } from "../lib/trendingUtils";
import { transformBookCoverUrls } from "../lib/bookUtils";
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
  Flag,
  Mail,
  Calendar,
  Camera,
  Menu,
  LogOut
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

async function fetchTotalUsers() {
  const { data, error } = await supabase.rpc('total_users')
  if (error) throw error
  return data ?? 0
}

// Constants
const PAGE_SIZE = 10;
const STORAGE_BUCKET = 'Book-storage';
const COVERS_BUCKET = 'covers';
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
function usePaginatedBooks({ search, genre, language, sort, rating, reloadFlag }) {
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
      
      console.log('=== FETCH BOOKS DEBUG ===');
      console.log('Search:', search);
      console.log('Genre filter:', genre);
      console.log('Rating filter:', rating);
      
      let query = supabase
        .from("books")
        .select("*", { count: "exact" });

      // Apply search filters
      if (search) {
        const term = `%${search}%`;
        query = query.or(`title.ilike.${term},author.ilike.${term}`);
        console.log('Applied search filter:', term);
      }
      
      if (genre && genre !== 'All' && genre !== '') {
        // Filter by genres array (contains)
        query = query.contains('genres', [genre]);
        console.log('Applied genre filter:', genre);
      }
      
      if (language && language !== 'All') {
        query = query.eq("language", language);
      }

      // Apply rating filter - skip for now if causing issues
      // Rating will be filtered client-side after fetch
      if (rating) {
        console.log('Rating filter will be applied client-side:', rating);
      }
      
      console.log('========================');

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

      // Debug: Check if books have genre and cover data
      if (data && data.length > 0) {
        console.log('=== BOOKS DEBUG ===');
        console.log('Total books fetched:', data.length);
        console.log('Sample book:', data[0]);
        console.log('Genres:', data[0]?.genres);
        console.log('Cover image:', data[0]?.cover_image);
        console.log('==================');
      }

      // Apply client-side rating filter if needed
      let filteredData = data || [];
      if (rating && filteredData.length > 0) {
        const minRating = parseFloat(rating);
        filteredData = filteredData.filter(book => {
          const bookRating = parseFloat(book.rating);
          return !isNaN(bookRating) && bookRating >= minRating;
        });
        console.log('After rating filter:', filteredData.length, 'books');
      }

      // Transform cover URLs to full public URLs
      const booksWithUrls = transformBookCoverUrls(filteredData);

      setBooks(booksWithUrls);
      setCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));
    } catch (err) {
      console.error("Error fetching books:", err);
      setError(err.message);
      toast.error(`Failed to load books: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [search, genre, language, sort, rating, page, reloadFlag]);

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
    recentActivity: [],
    paidUsers: 0,
    newComments: 0,
    userRetention: 0,
    reportedComments: 0,
    reportedCommentsChange: null,
    reportedCommentsList: []
  });
  const [monthlySeries, setMonthlySeries] = useState([]);
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

        // Fetch total users via RPC (not affected by RLS)
        const totalUsers = await fetchTotalUsers();

        // Fetch revenue data (example - adjust based on your payment system)
        const { data: revenueData } = await supabase
          .from('transactions')
          .select('amount, created_at')
          .eq('status', 'completed');

        const { count: newCommentsCount } = await supabase
          .from('book_comments')
          .select('*', { count: 'exact', head: true });

        const { count: reportedCommentsCount, error: countError } = await supabase
          .from('book_comment_reports')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          console.error('Error fetching reported comments count:', countError);
        }

        // Fetch reported comments without joins (to avoid foreign key errors)
        const { data: reportsList, error: reportsError } = await supabase
          .from('book_comment_reports')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        let reportedCommentsList = [];
        
        if (reportsError) {
          console.warn('Error fetching reported comments:', reportsError.message);
        } else if (reportsList && reportsList.length > 0) {
          // Fetch related data for each report separately
          reportedCommentsList = await Promise.all(
            reportsList.map(async (report) => {
              // Fetch comment
              const { data: commentData } = await supabase
                .from('book_comments')
                .select('text')
                .eq('id', report.comment_id)
                .single();
              
              // Fetch book
              const { data: bookData } = await supabase
                .from('books')
                .select('title')
                .eq('id', report.book_id)
                .single();
              
              return {
                ...report,
                comment: commentData,
                book: bookData
              };
            })
          );
        }

        // Fetch user sessions for retention and monthly active subscriptions
        // Note: user_session table doesn't exist yet, so we'll use default values
        let sessionRows = [];
        let totalSessionCount = 0;
        let userRetention = 78; // Default retention percentage
        
        // Uncomment when user_session table is created:
        /*
        const { data: sessionRows, count: totalSessionCount, error: sessionError } = await supabase
          .from('user_session')
          .select('user_id, created_at', { count: 'exact' });

        if (sessionError && sessionError.code !== 'PGRST116' && sessionError.code !== 'PGRST205') {
          console.warn('Error fetching user sessions:', sessionError);
        }

        // Calculate user retention based on sessions in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const sessionCountLast7 = (sessionRows || []).filter(row => {
          const created = row.created_at ? new Date(row.created_at) : null;
          return created && created >= sevenDaysAgo;
        }).length;

        userRetention = totalUsers && sessionCountLast7
          ? Math.min(100, Math.round((sessionCountLast7 / totalUsers) * 100))
          : 78;
        */

        // Fetch genre distribution
        // Note: This query won't work with Supabase's REST API directly
        // We'll fetch all books and calculate genre distribution client-side
        const { data: allBooksForGenres } = await supabase
          .from('books')
          .select('genres');
        
        // Calculate genre distribution
        const genreCount = {};
        if (allBooksForGenres) {
          allBooksForGenres.forEach(book => {
            if (Array.isArray(book.genres)) {
              book.genres.forEach(genre => {
                genreCount[genre] = (genreCount[genre] || 0) + 1;
              });
            }
          });
        }
        
        // Convert to array and sort
        const genreData = Object.entries(genreCount)
          .map(([genre, count]) => ({ genre, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Fetch recent activity
        const { data: recentActivity } = await supabase
          .from('user_activity')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        // Build monthly series for the revenue/subscriptions chart from DB data
        const now = new Date();
        const year = now.getFullYear();
        const monthlyBuckets = Array.from({ length: 12 }, (_, index) => ({
          month: format(new Date(year, index, 1), 'MMM'),
          revenue: 0,
          subscriptionsUsers: new Set(),
        }));

        // Aggregate revenue per month (current year)
        (revenueData || []).forEach(txn => {
          if (!txn.created_at) return;
          const created = new Date(txn.created_at);
          if (created.getFullYear() !== year) return;
          const monthIndex = created.getMonth();
          const amount = parseFloat(txn.amount) || 0;
          monthlyBuckets[monthIndex].revenue += amount;
        });

        // Aggregate distinct active users per month from sessions (approximate active subscriptions)
        // Note: Skipped because user_session table doesn't exist yet
        // When table is created, uncomment the code above and this will work automatically
        // For now, we'll use synthetic data for the chart
        if (sessionRows && sessionRows.length > 0) {
          sessionRows.forEach(session => {
            if (!session.created_at || !session.user_id) return;
            const created = new Date(session.created_at);
            if (created.getFullYear() !== year) return;
            const monthIndex = created.getMonth();
            monthlyBuckets[monthIndex].subscriptionsUsers.add(session.user_id);
          });
        } else {
          // Generate synthetic subscription data for demo purposes
          monthlyBuckets.forEach((bucket, index) => {
            const baseSubscriptions = 200 + Math.floor(Math.random() * 50);
            for (let i = 0; i < baseSubscriptions; i++) {
              bucket.subscriptionsUsers.add(`user_${index}_${i}`);
            }
          });
        }

        const computedMonthlySeries = monthlyBuckets.map(bucket => ({
          month: bucket.month,
          revenue: Math.round(bucket.revenue),
          subscriptions: bucket.subscriptionsUsers.size,
        }));

        setMonthlySeries(computedMonthlySeries);

        setMetrics({
          totalBooks: bookCount || 0,
          totalUsers: totalUsers || 0,
          activeUsers: Math.floor((totalUsers || 0) * 0.65), // Example calculation
          revenue: 0,
          monthlyGrowth: 12.5, // Example growth percentage
          topGenres: genreData || [],
          recentActivity: recentActivity || [],
          paidUsers: 0,
          newComments: newCommentsCount || 0,
          userRetention,
          reportedComments: reportedCommentsCount || 0,
          reportedCommentsChange: null,
          reportedCommentsList: reportedCommentsList || []
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

  return { metrics, monthlySeries, loading, error };
}

// Removed getCoverImageUrl - now using transformBookCoverUrls from bookUtils

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
    rating: '',
    status: 'all',
    featured: 'all',
    dateRange: 'all'
  });
  const [reloadFlag, setReloadFlag] = useState(0);
  const formRef = useRef(null);
  const adminFileInputRef = useRef(null);
  const { user, signOut } = useAuth();
  const [adminProfile, setAdminProfile] = useState(null);
  const [adminProfileLoading, setAdminProfileLoading] = useState(true);
  const [adminIsEditing, setAdminIsEditing] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminDateOfBirth, setAdminDateOfBirth] = useState('');
  const [adminDescription, setAdminDescription] = useState('');
  const [adminProfilePhotoUrl, setAdminProfilePhotoUrl] = useState('');
  const [adminProfilePhotoFile, setAdminProfilePhotoFile] = useState(null);
  const [adminUploadingPhoto, setAdminUploadingPhoto] = useState(false);
  const [adminImageError, setAdminImageError] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactSubmissions, setContactSubmissions] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    storage: { used: 0, total: 100, status: 'good' },
    api: { status: 'good', lastCheck: new Date() },
    database: { status: 'good', responseTime: 45 },
    errors: { count: 0, rate: 0 }
  });
  const [recentActivity, setRecentActivity] = useState([]);
  // Using metrics from useDashboardMetrics hook instead of local state
  // Remove the duplicate stats state
  
  // Use custom hooks for data fetching
  const { metrics, monthlySeries, loading: metricsLoading } = useDashboardMetrics();
  
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
    rating: filters.rating,
    reloadFlag
  });

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    author: '',
    author_bio: '',
    author_birth_year: '',
    description: '',
    genre: '',
    language: 'English',
    cover_image: DEFAULT_COVER_IMAGE,
    pdf_file: null,
    cover_file: null
  });

  // Format currency
  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
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
      icon: <User className="w-6 h-6 text-green-500" />,
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
      label: "New Comments", 
      value: metrics.newComments?.toLocaleString() || '0',
      icon: <Star className="w-6 h-6 text-purple-500" />,
      change: '+15.3%',
      changeType: 'increase'
    },
    { 
      label: "User Retention", 
      value: `${metrics.userRetention || '78'}%`,
      icon: <BarChart2 className="w-6 h-6 text-pink-500" />,
      change: '+2.4%',
      changeType: 'increase'
    }
  ];

  // Generate smoother synthetic data for charts (12 months for current year)
  const generateMonthlyData = () => {
    const months = [];
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1); // Jan 1st of current year

    let revenue = 50000; // base revenue in INR
    let subscriptions = 200; // base active subscriptions count

    for (let i = 0; i < 12; i++) {
      const date = new Date(yearStart.getFullYear(), yearStart.getMonth() + i, 1);

      // Apply small month-over-month change
      const revenueGrowthFactor = 1 + (Math.random() * 0.08 - 0.02); // between -2% and +6%
      const subsGrowthFactor = 1 + (Math.random() * 0.10 - 0.03);    // between -3% and +7%

      revenue = Math.max(20000, revenue * revenueGrowthFactor);
      subscriptions = Math.max(50, subscriptions * subsGrowthFactor);

      months.push({
        month: format(date, 'MMM'), // Jan, Feb, ...
        revenue: Math.round(revenue),
        subscriptions: Math.round(subscriptions)
      });
    }

    return months;
  };

  const monthlyData = useMemo(() => generateMonthlyData(), []);

  // Top genres data (from metrics, used as fallback)
  // Pastel genre colors (aligned with GenrePreferencesCard)
  const genreColors = [
    '#6EE7B7', // pastel emerald
    '#93C5FD', // pastel blue
    '#FDBA74', // pastel orange
    '#FDE68A', // pastel amber
    '#F9A8D4', // pastel pink
    '#A5B4FC', // pastel indigo
    '#C4B5FD', // pastel violet
  ];
  const topGenres = metrics.topGenres.length > 0 
    ? metrics.topGenres 
    : [
      { genre: 'Fiction', count: 120 },
      { genre: 'Science Fiction', count: 85 },
      { genre: 'Mystery', count: 76 },
      { genre: 'Romance', count: 64 },
      { genre: 'Non-Fiction', count: 55 }
    ];

  // Trending books (same ones shown in the Trending Books card)
  // Genre distribution based on trending books (for Trending Genres card)
  const trendingGenresDistribution = trendingBooks.reduce((acc, book) => {
    const rawGenres = Array.isArray(book.genres)
      ? book.genres
      : book.genre
      ? [book.genre]
      : [];

    rawGenres.forEach((genre) => {
      if (!genre) return;
      const key = genre.toString().trim();
      if (!key) return;
      acc[key] = (acc[key] || 0) + 1;
    });

    return acc;
  }, {});

  // Convert distribution object into sorted list with percentages (top 5)
  const trendingGenresList = (() => {
    const entries = Object.entries(trendingGenresDistribution);
    if (entries.length === 0) return [];

    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    return entries
      .map(([genre, count]) => ({
        genre,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  })();

  // Recent activity data is now managed via state (recentActivity) loaded in useEffect


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
      // Handle genres array - convert to comma-separated string for the form
      const genresString = Array.isArray(editingBook.genres) 
        ? editingBook.genres.join(', ') 
        : editingBook.genre || '';
      
      setFormData({
        id: editingBook.id,
        title: editingBook.title || '',
        author: editingBook.author || '',
        author_bio: editingBook.author_bio || '',
        author_birth_year: editingBook.author_birth_year || '',
        description: editingBook.description || '',
        genre: genresString,
        language: editingBook.language || 'English',
        cover_image: editingBook.cover_image || DEFAULT_COVER_IMAGE,
        pdf_file: editingBook.pdf_file || null,
        cover_file: null
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
  const uploadFile = async (file, bucketName) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
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
        pdfUrl = await uploadFile(formData.pdf_file, STORAGE_BUCKET);
      }

      // Upload cover image if a new file is selected
      if (formData.cover_file instanceof File) {
        coverImageUrl = await uploadFile(formData.cover_file, COVERS_BUCKET);
      }

      // Convert comma-separated genres to array
      const genresArray = formData.genre 
        ? formData.genre.split(',').map(g => g.trim()).filter(Boolean)
        : [];

      // Prepare book data with new fields
      const bookData = {
        title: formData.title,
        author: formData.author,
        author_bio: formData.author_bio || null,
        author_birth_year: formData.author_birth_year ? parseInt(formData.author_birth_year) : null,
        description: formData.description || null,
        genres: genresArray,
        language: formData.language || 'English',
        cover_image: coverImageUrl,
        pdf_file: pdfUrl
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
        // Create new book with auto-generated ID or user-provided ID
        let bookId = formData.id && formData.id.trim() !== '' 
          ? formData.id.trim()
          : null;
        
        // If no ID provided, generate one in BOOK_XXX format
        if (!bookId) {
          // Get the highest existing book number
          const { data: existingBooks, error: fetchError } = await supabase
            .from('books')
            .select('id')
            .like('id', 'BOOK_%')
            .order('id', { ascending: false })
            .limit(1);
          
          if (fetchError) {
            console.warn('Could not fetch existing books, using timestamp-based ID:', fetchError);
            bookId = `BOOK_${Date.now()}`;
          } else {
            let nextNumber = 1;
            if (existingBooks && existingBooks.length > 0) {
              const lastId = existingBooks[0].id;
              const match = lastId.match(/BOOK_(\d+)/);
              if (match) {
                nextNumber = parseInt(match[1]) + 1;
              }
            }
            bookId = `BOOK_${String(nextNumber).padStart(3, '0')}`;
          }
        }
        
        const { data, error } = await supabase
          .from('books')
          .insert([{ 
            id: bookId,
            ...bookData,
            created_at: new Date().toISOString(),
            rating: 0
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
  console.log('Filter changed:', filterName, '=', value);
  
  // Update filters
  setFilters(prev => {
    const newFilters = {
      ...prev,
      [filterName]: value,
    };
    console.log('New filters:', newFilters);
    return newFilters;
  });

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

  // Handle actions on reported comments (approve or reject)
  const handleReportAction = async (report, action) => {
    try {
      if (action === 'approve') {
        // Approve: Remove the report but keep the comment
        const { error } = await supabase
          .from('book_comment_reports')
          .delete()
          .eq('id', report.id);
        
        if (error) {
          console.error('Error approving report:', error);
          throw error;
        }
        
        toast.success('Report dismissed - Comment approved');
      } else if (action === 'reject') {
        // Confirm before deleting
        const confirmDelete = window.confirm(
          'Are you sure you want to reject and delete this comment? This action cannot be undone.\n\n' +
          `Comment: "${report.comment?.text?.substring(0, 100)}..."`
        );
        
        if (!confirmDelete) return;

        console.log('Attempting to delete comment with ID:', report.comment_id);
        console.log('Current user:', user?.id);

        // Step 1: Delete all reports for this comment first
        const { error: deleteReportsError } = await supabase
          .from('book_comment_reports')
          .delete()
          .eq('comment_id', report.comment_id);
        
        if (deleteReportsError) {
          console.error('Error deleting reports:', deleteReportsError);
          throw deleteReportsError;
        }

        console.log('Reports deleted, now deleting comment...');

        // Step 2: Delete the comment from book_comments table
        // Note: This requires admin DELETE policy on book_comments table
        const { data: deleteData, error: deleteCommentError } = await supabase
          .from('book_comments')
          .delete()
          .eq('id', report.comment_id)
          .select();
        
        if (deleteCommentError) {
          console.error('Error deleting comment:', deleteCommentError);
          console.error('Error details:', {
            message: deleteCommentError.message,
            details: deleteCommentError.details,
            hint: deleteCommentError.hint,
            code: deleteCommentError.code
          });
          
          // Check if it's a permission error
          if (deleteCommentError.code === '42501' || deleteCommentError.message.includes('permission')) {
            toast.error('Permission denied. Please run the admin_comments_permissions.sql script to grant admin delete permissions.');
          }
          
          throw deleteCommentError;
        }

        console.log('Comment deleted successfully:', deleteData);
        toast.success('Comment rejected and permanently deleted from database');
      }
      
      // Trigger a refresh of the metrics to update the list
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error handling report action:', error);
      toast.error(`Failed to update report: ${error.message}`);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      id: "",
      title: "",
      author: "",
      author_bio: "",
      author_birth_year: "",
      description: "",
      genre: "",
      language: "English",
      cover_image: DEFAULT_COVER_IMAGE,
      pdf_file: null,
      cover_file: null
    });
    setEditingBook(null);
    setShowForm(false);
  };



  const handleSignOut = async () => {
    setSignOutLoading(true);
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Failed to sign out. Please try again.');
        setSignOutLoading(false);
      } else {
        // Sign out successful - AuthContext will handle redirect
        console.log('Sign out successful');
      }
    } catch (err) {
      console.error('Sign out exception:', err);
      toast.error('An error occurred during sign out.');
      setSignOutLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      if (!user) {
        if (!cancelled) {
          setAdminProfile(null);
          setAdminProfileLoading(false);
          setAdminIsEditing(false);
          setAdminUsername('');
          setAdminDateOfBirth('');
          setAdminDescription('');
          setAdminProfilePhotoUrl('');
          setAdminProfilePhotoFile(null);
          setAdminImageError(false);
        }
        return;
      }

      try {
        setAdminProfileLoading(true);
        const profile = await getUserProfile(user.id);
        if (!cancelled) {
          setAdminProfile(profile || null);
          setAdminUsername(profile?.username || user?.email?.split('@')[0] || 'Admin');
          setAdminDateOfBirth(profile?.date_of_birth || '');
          setAdminDescription(profile?.description || '');
          setAdminProfilePhotoUrl(profile?.profile_photo_url || '');
          setAdminProfilePhotoFile(null);
          setAdminImageError(false);
          setAdminIsEditing(false);
          setAdminProfileLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading admin profile:', error);
          setAdminProfile(null);
          setAdminProfileLoading(false);
          setAdminIsEditing(false);
        }
      }
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Load contact submissions
  const loadContactSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.log('Contact submissions table not found - skipping');
        return;
      }
      setContactSubmissions(data || []);
    } catch (error) {
      console.error('Error loading contact submissions:', error);
    }
  };

  // Load system health data
  const loadSystemHealth = async () => {
    try {
      const startTime = Date.now();
      
      // Test database response time with a simple query
      const { error: dbError } = await supabase
        .from('books')
        .select('id', { count: 'exact', head: true })
        .limit(1);
      
      const dbResponseTime = Date.now() - startTime;
      
      // Get storage usage from Supabase storage
      let storageUsed = 0;
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        if (buckets) {
          // Estimate storage usage (this is approximate)
          storageUsed = Math.min(95, Math.floor(buckets.length * 15 + Math.random() * 20));
        }
      } catch (storageError) {
        console.log('Storage check skipped:', storageError);
        storageUsed = 35; // Default value
      }
      
      // Count recent errors from reported comments or failed operations
      let errorCount = 0;
      try {
        const { count: reportsCount } = await supabase
          .from('book_comment_reports')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
        
        errorCount = reportsCount || 0;
      } catch (err) {
        console.log('Error count check skipped:', err);
      }
      
      const health = {
        storage: { 
          used: storageUsed, 
          total: 100, 
          status: storageUsed > 80 ? 'warning' : 'good' 
        },
        api: { 
          status: 'good', 
          lastCheck: new Date() 
        },
        database: { 
          status: dbError ? 'error' : (dbResponseTime > 1000 ? 'warning' : 'good'), 
          responseTime: dbResponseTime 
        },
        errors: { 
          count: errorCount, 
          rate: errorCount / 24 
        }
      };
      
      setSystemHealth(health);
    } catch (error) {
      console.error('Error loading system health:', error);
      // Set default values on error
      setSystemHealth({
        storage: { used: 0, total: 100, status: 'error' },
        api: { status: 'error', lastCheck: new Date() },
        database: { status: 'error', responseTime: 0 },
        errors: { count: 0, rate: 0 }
      });
    }
  };

  // Load recent activity
  const loadRecentActivity = async () => {
    try {
      const activities = [];
      const now = Date.now();
      
      // Calculate 7 days ago timestamp
      const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      // Helper function to format time ago
      const timeAgo = (date) => {
        const seconds = Math.floor((now - new Date(date).getTime()) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? 's' : ''} ago`;
      };
      
      // Fetch recent books added (last 7 days)
      const { data: recentBooks } = await supabase
        .from('books')
        .select('title, created_at')
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (recentBooks) {
        recentBooks.forEach(book => {
          activities.push({
            type: 'book_added',
            message: `New book added: ${book.title}`,
            time: timeAgo(book.created_at),
            icon: 'BookOpen',
            timestamp: new Date(book.created_at).getTime()
          });
        });
      }
      
      // Fetch recent contact submissions (last 7 days)
      const { data: recentContacts } = await supabase
        .from('contact_submissions')
        .select('name, created_at')
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false })
        .limit(2);
      
      if (recentContacts) {
        recentContacts.forEach(contact => {
          activities.push({
            type: 'contact_form',
            message: `New contact from ${contact.name}`,
            time: timeAgo(contact.created_at),
            icon: 'Mail',
            timestamp: new Date(contact.created_at).getTime()
          });
        });
      }
      
      // Fetch recent comment reports (last 7 days)
      const { data: recentReports } = await supabase
        .from('book_comment_reports')
        .select('reason, created_at')
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false })
        .limit(2);
      
      if (recentReports) {
        recentReports.forEach(report => {
          activities.push({
            type: 'comment_report',
            message: `Comment reported: ${report.reason}`,
            time: timeAgo(report.created_at),
            icon: 'AlertTriangle',
            timestamp: new Date(report.created_at).getTime()
          });
        });
      }
      
      // Fetch recent comments as user activity (last 7 days)
      const { data: recentComments } = await supabase
        .from('book_comments')
        .select('created_at')
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false })
        .limit(2);
      
      if (recentComments) {
        recentComments.forEach(comment => {
          activities.push({
            type: 'user_activity',
            message: 'New comment posted',
            time: timeAgo(comment.created_at),
            icon: 'Star',
            timestamp: new Date(comment.created_at).getTime()
          });
        });
      }
      
      // Sort all activities by timestamp (most recent first) and take top 5
      activities.sort((a, b) => b.timestamp - a.timestamp);
      const topActivities = activities.slice(0, 5);
      
      // If no activities found, show placeholder
      if (topActivities.length === 0) {
        topActivities.push({
          type: 'system',
          message: 'No recent activity in the last 7 days',
          time: 'waiting for events',
          icon: 'Clock',
          timestamp: now
        });
      }
      
      setRecentActivity(topActivities);
    } catch (error) {
      console.error('Error loading recent activity:', error);
      // Set fallback activity on error
      setRecentActivity([{
        type: 'system',
        message: 'Activity feed unavailable',
        time: 'check connection',
        icon: 'Clock',
        timestamp: Date.now()
      }]);
    }
  };

  // Handle contact submission status update
  const updateSubmissionStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh submissions
      loadContactSubmissions();
    } catch (error) {
      console.error('Error updating submission status:', error);
    }
  };

  // Load trending books for admin dashboard (same logic as TrendingBooksPage)
  useEffect(() => {
    const loadTrending = async () => {
      try {
        const books = await getTrendingBooks(8, 30);
        setTrendingBooks(books || []);
      } catch (err) {
        console.error('Error loading trending books for admin:', err);
        setTrendingBooks([]);
      }
    };

    loadTrending();
    loadContactSubmissions();
    loadSystemHealth();
    loadRecentActivity();
  }, []);

  const handleAdminDateOfBirthChange = (e) => {
    const raw = e.target.value;
    if (!raw) {
      setAdminDateOfBirth('');
      return;
    }

    const parts = raw.split('-');
    const yearPart = (parts[0] || '').replace(/\D/g, '').slice(0, 4);
    const rest = parts.slice(1).join('-');
    const normalized = rest ? `${yearPart}-${rest}` : yearPart;

    setAdminDateOfBirth(normalized);
  };

  const handleAdminFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setAdminProfilePhotoFile(file);
    setAdminUploadingPhoto(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.warn('Storage upload failed, using data URL:', uploadError);
        const reader = new FileReader();
        reader.onloadend = () => {
          setAdminProfilePhotoUrl(reader.result);
          setAdminUploadingPhoto(false);
        };
        reader.readAsDataURL(file);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      setAdminProfilePhotoUrl(publicUrl);
    } catch (error) {
      console.error('Error uploading admin photo:', error);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminProfilePhotoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setAdminUploadingPhoto(false);
    }
  };

  const handleAdminSave = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!user) return;

    setAdminProfileLoading(true);
    try {
      let finalPhotoUrl = adminProfilePhotoUrl;

      if (adminProfilePhotoFile && !adminProfilePhotoUrl) {
        setAdminUploadingPhoto(true);
        try {
          const fileExt = adminProfilePhotoFile.name.split('.').pop();
          const fileName = `${user.id}-${Date.now()}.${fileExt}`;
          const filePath = `profile-photos/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, adminProfilePhotoFile, {
              cacheControl: '3600',
              upsert: true,
            });

          if (!uploadError) {
            const {
              data: { publicUrl },
            } = supabase.storage.from('avatars').getPublicUrl(filePath);
            finalPhotoUrl = publicUrl;
          } else {
            finalPhotoUrl = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve(reader.result);
              };
              reader.readAsDataURL(adminProfilePhotoFile);
            });
          }
        } catch (error) {
          console.error('Error uploading admin photo:', error);
        } finally {
          setAdminUploadingPhoto(false);
        }
      }

      const updateData = {
        username: adminUsername,
        date_of_birth: adminDateOfBirth || null,
        description: adminDescription || null,
        profile_photo_url: finalPhotoUrl || null,
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert(
          {
            user_id: user.id,
            ...updateData,
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        console.error('Error saving admin profile:', error);
        toast.error('Failed to save admin profile. Please try again.');
        setAdminProfileLoading(false);
        return;
      }

      setAdminIsEditing(false);
      setAdminProfilePhotoFile(null);

      const refreshed = await getUserProfile(user.id);
      setAdminProfile(refreshed || null);
      setAdminUsername(refreshed?.username || user?.email?.split('@')[0] || 'Admin');
      setAdminDateOfBirth(refreshed?.date_of_birth || '');
      setAdminDescription(refreshed?.description || '');
      setAdminProfilePhotoUrl(refreshed?.profile_photo_url || finalPhotoUrl || '');
      setAdminImageError(false);

      toast.success('Admin profile updated successfully!');
    } catch (error) {
      console.error('Error saving admin profile:', error);
      toast.error('An error occurred while saving admin profile. Please try again.');
    } finally {
      setAdminProfileLoading(false);
    }
  };

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Left logo / brand */}
            <div className="flex items-center gap-3">
              <img
                src="/LOGO.svg"
                alt="NextChapter Logo"
                className="h-6 sm:h-8 w-auto"
              />
            </div>

            {/* Right - Desktop Navigation */}
            <div className="hidden md:flex items-center gap-3">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signOutLoading}
                className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider text-dark-gray dark:text-white hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span>{signOutLoading ? 'Signing Out...' : 'Sign Out'}</span>
              </button>
            </div>

            {/* Right - Mobile Menu Button */}
            <div className="flex md:hidden items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-dark-gray/30 dark:border-white/30 text-dark-gray dark:text-white hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden overflow-hidden border-t border-dark-gray/10 dark:border-white/10 mt-3 pt-3"
              >
                <nav className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    disabled={signOutLoading}
                    className="flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider text-dark-gray dark:text-white hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50 text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{signOutLoading ? 'Signing Out...' : 'Sign Out'}</span>
                  </button>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
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
      {/* Admin Dashboard Section */}
      <section className="bg-dark-gray dark:bg-white py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero-style header inspired by Profile page */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 lg:gap-16 mb-8 md:mb-10">
          <div className="md:col-span-12 lg:col-span-5">
            <div className="mb-3 sm:mb-4">
              <span className="text-xs font-medium uppercase tracking-widest text-white dark:text-dark-gray border-b-2 border-white dark:border-dark-gray pb-2 inline-block">
                Admin Area
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white dark:text-dark-gray mb-3 sm:mb-4 leading-none">
              Admin Dashboard
            </h1>
            <p className="text-base sm:text-lg text-white/70 dark:text-dark-gray/70 leading-relaxed font-light max-w-xl mb-6">
              Manage your books, catalogue and platform analytics from a single place.
            </p>
            
            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              disabled={signOutLoading}
              className="group inline-flex items-center gap-3 bg-transparent border border-white dark:border-dark-gray text-white dark:text-dark-gray px-6 py-3 text-xs font-medium uppercase tracking-wider transition-all duration-300 hover:border-red-400 dark:hover:border-red-400 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed relative z-0"
            >
              <LogOut className="w-4 h-4 transition-colors duration-300" />
              <span className="relative z-10 transition-colors duration-300">
                {signOutLoading ? 'Signing Out...' : 'Sign Out'}
              </span>
            </button>
          </div>
          <div className="md:col-span-12 lg:col-span-7 border-t-2 border-white dark:border-dark-gray pt-6 lg:pt-0 lg:border-t-0 lg:border-l-2 lg:pl-10">
            {/* Admin Profile Card - aligned with user profile design */}
            <div className="mb-4 bg-dark-gray dark:bg-white border-2 border-white/30 dark:border-dark-gray/30 p-4">
              {adminProfileLoading ? (
                <div className="text-white/70 dark:text-dark-gray/70 text-sm">
                  Loading admin profile...
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {/* Profile Picture */}
                      <div className="relative">
                        {adminProfilePhotoUrl && !adminImageError ? (
                          <img
                            src={adminProfilePhotoUrl}
                            alt="Admin Profile"
                            className="w-12 h-12 rounded-full border-2 border-white/40 dark:border-dark-gray/40 object-cover"
                            onError={() => setAdminImageError(true)}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full border-2 border-white/40 dark:border-dark-gray/40 flex items-center justify-center">
                            <User className="w-6 h-6 text-white dark:text-dark-gray" />
                          </div>
                        )}
                        {adminIsEditing && (
                          <>
                            <button
                              type="button"
                              onClick={() => adminFileInputRef.current?.click()}
                              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-dark-gray border-2 border-white dark:border-dark-gray flex items-center justify-center hover:bg-white/90 dark:hover:bg-dark-gray/90 transition-colors"
                              title="Change photo"
                            >
                              <Camera className="w-3 h-3 text-dark-gray dark:text-white" />
                            </button>
                            <input
                              ref={adminFileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleAdminFileSelect}
                              className="hidden"
                            />
                          </>
                        )}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl text-white dark:text-dark-gray font-medium mb-0.5">
                          {adminIsEditing ? (
                            <input
                              type="text"
                              value={adminUsername}
                              onChange={(e) => setAdminUsername(e.target.value)}
                              placeholder="Username"
                              className="w-full bg-transparent border-0 border-b-2 border-white/40 dark:border-dark-gray/40 px-0 py-0.5 text-white dark:text-dark-gray text-xl font-medium focus:outline-none focus:border-white/60 dark:focus:border-dark-gray/60 transition-colors"
                            />
                          ) : (
                            adminUsername || user?.email?.split('@')[0] || 'Admin'
                          )}
                        </h2>
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium uppercase tracking-wider bg-white/5 dark:bg-dark-gray/5 text-white/70 dark:text-dark-gray/70 border-2 border-white/30 dark:border-dark-gray/30">
                            Admin
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {adminIsEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setAdminIsEditing(false);
                              setAdminUsername(adminProfile?.username || user?.email?.split('@')[0] || 'Admin');
                              setAdminDateOfBirth(adminProfile?.date_of_birth || '');
                              setAdminDescription(adminProfile?.description || '');
                              setAdminProfilePhotoUrl(adminProfile?.profile_photo_url || '');
                              setAdminProfilePhotoFile(null);
                              setAdminImageError(false);
                            }}
                            className="px-2 py-1 text-xs text-white/60 dark:text-dark-gray/60 hover:text-white dark:hover:text-dark-gray transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleAdminSave}
                            disabled={adminProfileLoading || adminUploadingPhoto}
                            className="px-2 py-1 text-xs text-white/70 dark:text-dark-gray/70 hover:text-white dark:hover:text-dark-gray transition-colors disabled:opacity-50"
                          >
                            {adminProfileLoading || adminUploadingPhoto ? 'Saving...' : 'Save'}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAdminIsEditing(true)}
                          className="p-2 text-white/50 dark:text-dark-gray/50 hover:text-white dark:hover:text-dark-gray transition-colors"
                          title="Edit admin profile"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Email Row */}
                    <div className="flex items-center gap-3 pb-3 border-b-2 border-white/30 dark:border-dark-gray/30">
                      <Mail className="w-5 h-5 text-white dark:text-dark-gray opacity-60" />
                      <div className="flex-1">
                        <p className="text-xs font-medium uppercase tracking-wider text-white/60 dark:text-dark-gray/60 mb-1">
                          Email
                        </p>
                        <p className="text-sm text-white dark:text-dark-gray">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    {/* Date of Birth Row */}
                    <div className="flex items-center gap-3 pb-3 border-b-2 border-white/30 dark:border-dark-gray/30">
                      <Calendar className="w-5 h-5 text-black dark:text-black" />
                      <div className="flex-1">
                        <p className="text-xs font-medium uppercase tracking-wider text-white/60 dark:text-dark-gray/60 mb-1">
                          Date of Birth
                        </p>
                        {adminIsEditing ? (
                          <input
                            type="date"
                            value={adminDateOfBirth}
                            onChange={handleAdminDateOfBirthChange}
                            className="w-full bg-transparent border-0 border-b-2 border-white/40 dark:border-dark-gray/40 px-0 py-0.5 text-black dark:text-dark-gray text-sm focus:outline-none focus:border-black/60 dark:focus:border-dark-gray/60 transition-colors"
                          />
                        ) : (
                          <p className="text-sm text-black dark:text-dark-gray">
                            {adminDateOfBirth
                              ? new Date(adminDateOfBirth).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              : 'Not set'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Description Row */}
                    <div className="pb-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-white/60 dark:text-dark-gray/60 mb-1">
                        Description
                      </p>
                      {adminIsEditing ? (
                        <textarea
                          value={adminDescription}
                          onChange={(e) => setAdminDescription(e.target.value)}
                          placeholder="Add a short description..."
                          className="w-full bg-transparent border-0 border-b-2 border-white/40 dark:border-dark-gray/40 px-0 py-0.5 text-sm text-white dark:text-dark-gray resize-none focus:outline-none focus:border-white/60 dark:focus:border-dark-gray/60 transition-colors"
                          rows={2}
                        />
                      ) : (
                        <p className="text-sm text-white dark:text-dark-gray">
                          {adminDescription || 'No description set yet.'}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Actions Panel */}
            <div className="mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-white dark:text-dark-gray mb-3 sm:mb-4 uppercase tracking-widest">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    setEditingBook(null);
                    setShowForm(true);
                  }}
                  className="flex flex-col items-center gap-2 p-3 sm:p-4 bg-white/10 dark:bg-dark-gray/10 hover:bg-white/20 dark:hover:bg-dark-gray/20 transition-colors"
                >
                  <Plus className="w-5 h-5 text-white dark:text-dark-gray" />
                  <span className="text-xs text-white dark:text-dark-gray uppercase tracking-wider">Add Book</span>
                </button>
                
                <button
                  onClick={() => {
                    const csvData = books.map(book => `${book.title},${book.author},${book.rating || 0}`).join('\n');
                    const blob = new Blob([`Title,Author,Rating\n${csvData}`], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'books-export.csv';
                    a.click();
                  }}
                  className="flex flex-col items-center gap-2 p-3 sm:p-4 bg-white/10 dark:bg-dark-gray/10 hover:bg-white/20 dark:hover:bg-dark-gray/20 transition-colors"
                >
                  <Download className="w-5 h-5 text-white dark:text-dark-gray" />
                  <span className="text-xs text-white dark:text-dark-gray uppercase tracking-wider">Export</span>
                </button>
              </div>
            </div>

            {/* System Health */}
            <div className="mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-white dark:text-dark-gray mb-3 sm:mb-4 uppercase tracking-widest">
                System Health
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white/10 dark:bg-dark-gray/10 p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/60 dark:text-dark-gray/60 uppercase tracking-wider">Storage</span>
                    <div className={`w-2 h-2 rounded-full ${
                      systemHealth.storage.status === 'good' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                  <div className="text-lg font-bold text-white dark:text-dark-gray">
                    {systemHealth.storage.used}%
                  </div>
                  <div className="w-full bg-white/20 dark:bg-dark-gray/20 h-1 mt-2">
                    <div 
                      className="bg-white dark:bg-dark-gray h-1 transition-all duration-300"
                      style={{ width: `${systemHealth.storage.used}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-white/10 dark:bg-dark-gray/10 p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/60 dark:text-dark-gray/60 uppercase tracking-wider">Database</span>
                    <div className={`w-2 h-2 rounded-full ${
                      systemHealth.database.status === 'good' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                  <div className="text-lg font-bold text-white dark:text-dark-gray">
                    {systemHealth.database.responseTime}ms
                  </div>
                </div>
                
                <div className="bg-white/10 dark:bg-dark-gray/10 p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/60 dark:text-dark-gray/60 uppercase tracking-wider">API Status</span>
                    <div className={`w-2 h-2 rounded-full ${
                      systemHealth.api.status === 'good' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                  <div className="text-lg font-bold text-white dark:text-dark-gray">
                    Online
                  </div>
                </div>
                
                <div className="bg-white/10 dark:bg-dark-gray/10 p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/60 dark:text-dark-gray/60 uppercase tracking-wider">Errors</span>
                    <div className={`w-2 h-2 rounded-full ${
                      systemHealth.errors.count === 0 ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                  </div>
                  <div className="text-lg font-bold text-white dark:text-dark-gray">
                    {systemHealth.errors.count}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              <StatCard 
                label="Total Books" 
                value={metrics.totalBooks?.toLocaleString() || '0'} 
                icon={<BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />}
              />
              <StatCard 
                label="Paid Users" 
                value={metrics.paidUsers?.toLocaleString() || '1,245'} 
                icon={<User className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />}
              />
              <StatCard 
                label="Revenue" 
                value={formatCurrency(metrics.revenue)} 
                icon={<DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />}
              />
              <StatCard 
                label="New Comments" 
                value={metrics.newComments?.toLocaleString() || '0'} 
                icon={<Star className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />}
              />
              <StatCard 
                label="User Retention" 
                value={`${metrics.userRetention || '78'}%`} 
                icon={<BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />}
              />
              <StatCard 
                label="All Users" 
                value={metrics.totalUsers?.toLocaleString() || '0'} 
                icon={<Users className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />}
              />
            </div>

            {/* === Analytics === */}
            {/* Row 1: Full-width dual-line monthly revenue vs subscriptions chart */}
            <div className="mb-4">
              <div className="bg-dark-gray dark:bg-white border-2 border-white/30 dark:border-dark-gray/30 p-3 sm:p-4 lg:p-5">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white dark:text-dark-gray mb-1 sm:mb-2 uppercase tracking-widest">
                  Monthly Revenue & Active Subscriptions
                </h2>
                <p className="text-xs text-white/70 dark:text-dark-gray/70 mb-3 sm:mb-4 uppercase tracking-widest">
                  Shows how revenue and active subscriptions move together across the year.
                </p>
                <div className="w-full overflow-x-auto -mx-3 sm:mx-0">
                  <div className="min-w-[500px] px-3 sm:px-0">
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={monthlySeries} margin={{ top: 10, right: 24, left: 0, bottom: 10 }}>
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          name="Revenue (₹)"
                          stroke="#2563EB"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="subscriptions"
                          name="Active Subscriptions"
                          stroke="#10B981"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Legend verticalAlign="bottom" height={24} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Trending Genres (with pie chart) & Trending Books in one row */}
            <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
              <div className="bg-dark-gray dark:bg-white border-2 border-white/30 dark:border-dark-gray/30 p-3 sm:p-4 flex flex-col h-full">
                {/* Header */}
                <div className="mb-4">
                  <h3 className="text-base text-white dark:text-dark-gray font-semibold uppercase tracking-wider mb-1">
                    Trending Genres
                  </h3>
                  <p className="text-xs text-white/60 dark:text-dark-gray/60">
                    Genres from the most popular books on the platform right now.
                  </p>
                </div>

                {/* Content: pie chart + legend list */}
                {trendingGenresList.length === 0 ? (
                  <p className="text-xs text-white/60 dark:text-dark-gray/60 flex-1">
                    No trending genres available yet.
                  </p>
                ) : (
                  <div className="flex flex-col md:flex-row gap-6 flex-1 items-center md:items-start">
                    {/* Pie Chart */}
                    <div className="shrink-0 w-full md:w-[40%] flex justify-center items-center py-2">
                      <ResponsiveContainer width="100%" height={140}>
                        <PieChart>
                          <Pie
                            data={trendingGenresList}
                            dataKey="percentage"
                            nameKey="genre"
                            innerRadius={30}
                            outerRadius={50}
                            paddingAngle={2}
                          >
                            {trendingGenresList.map((entry, index) => (
                              <Cell
                                key={`trending-genre-${entry.genre}`}
                                fill={genreColors[index % genreColors.length]}
                              />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Legend list */}
                    <div className="flex-1 w-full md:w-[60%] space-y-2.5">
                      {trendingGenresList.map((item, index) => {
                        const color = genreColors[index % genreColors.length];
                        return (
                          <div key={item.genre} className="flex items-center gap-3">
                            <div
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-white dark:text-dark-gray truncate">
                                {item.genre}
                              </div>
                              <div className="text-xs text-white/60 dark:text-dark-gray/60">
                                {item.count} {item.count === 1 ? 'book' : 'books'} ({item.percentage}%)
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-dark-gray dark:bg-white border-2 border-white/30 dark:border-dark-gray/30 p-3 sm:p-4 flex flex-col h-full">
                <h2 className="text-lg sm:text-xl font-bold text-white dark:text-dark-gray mb-3 sm:mb-4 uppercase tracking-widest">
                  Trending Books
                </h2>
                <div className="grid grid-cols-1 gap-2 sm:gap-3 mt-1 max-h-52 overflow-y-auto pr-1">
                  {trendingBooks.slice(0, 10).map((book) => (
                    <div key={book.id} className="p-3 bg-dark-gray dark:bg-white border border-white/20 dark:border-dark-gray/20 text-white dark:text-dark-gray">
                      <h3 className="text-xs uppercase tracking-widest text-white/70 dark:text-dark-gray/70 mb-1 line-clamp-1">{book.title}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-extrabold">{Number(book.trendingScore || 0).toFixed(1)}</span>
                        <span className="text-[10px] uppercase tracking-widest text-white/60 dark:text-dark-gray/60">trending score</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 3: Contact Submissions & Recent Activity */}
            <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Contact Submissions */}
              <div className="bg-dark-gray dark:bg-white border-2 border-white/30 dark:border-dark-gray/30 p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-white dark:text-dark-gray uppercase tracking-widest">
                    Contact Forms
                  </h2>
                  <span className="px-2 py-1 bg-white/20 dark:bg-dark-gray/20 text-white dark:text-dark-gray text-xs uppercase tracking-widest">
                    {contactSubmissions.filter(s => s.status === 'new').length} New
                  </span>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {contactSubmissions.length === 0 ? (
                    <p className="text-white/60 dark:text-dark-gray/60 text-sm uppercase tracking-widest">
                      No submissions yet
                    </p>
                  ) : (
                    contactSubmissions.slice(0, 5).map((submission) => (
                      <div key={submission.id} className="border-l-2 border-white/30 dark:border-dark-gray/30 pl-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-medium text-white dark:text-dark-gray">
                              {submission.name}
                            </p>
                            <p className="text-xs text-white/60 dark:text-dark-gray/60">
                              {submission.email}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs uppercase tracking-widest ${
                            submission.status === 'new' 
                              ? 'bg-blue-500/20 text-black-700' 
                              : submission.status === 'read'
                              ? 'bg-yellow-500/20 text-black-700'
                              : 'bg-green-500/20 text-black-700'
                          }`}>
                            {submission.status}
                          </span>
                        </div>
                        <p className="text-sm text-white dark:text-dark-gray mb-2 line-clamp-1">
                          <strong>Subject:</strong> {submission.subject}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateSubmissionStatus(submission.id, 'read')}
                            className="px-2 py-1 bg-white/20 dark:bg-dark-gray/20 text-white dark:text-dark-gray text-xs uppercase tracking-widest hover:bg-white/30 dark:hover:bg-dark-gray/30 transition-colors"
                          >
                            Mark Read
                          </button>
                          <button
                            onClick={async () => {
                              // Open Gmail
                              const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(submission.email)}&su=${encodeURIComponent('Re: ' + submission.subject)}&body=${encodeURIComponent('Hi ' + submission.name + ',\n\nThank you for contacting us.\n\n---\nOriginal message:\n' + submission.message)}`;
                              window.open(gmailUrl, '_blank');
                              
                              // Delete the submission from database
                              try {
                                const { error } = await supabase
                                  .from('contact_submissions')
                                  .delete()
                                  .eq('id', submission.id);
                                
                                if (error) {
                                  console.error('Error deleting submission:', error);
                                  toast.error('Failed to remove submission');
                                } else {
                                  // Refresh the submissions list
                                  loadContactSubmissions();
                                  toast.success('Reply sent! Submission removed.');
                                }
                              } catch (err) {
                                console.error('Error:', err);
                              }
                            }}
                            className="px-2 py-1 bg-white/20 dark:bg-dark-gray/20 text-white dark:text-dark-gray text-xs uppercase tracking-widest hover:bg-white/30 dark:hover:bg-dark-gray/30 transition-colors"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-dark-gray dark:bg-white border-2 border-white/30 dark:border-dark-gray/30 p-3 sm:p-4">
                <h2 className="text-lg sm:text-xl font-bold text-white dark:text-dark-gray mb-3 sm:mb-4 uppercase tracking-widest">
                  Recent Activity
                </h2>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recentActivity.map((activity, index) => {
                    const IconComponent = {
                      UserPlus: User,
                      BookOpen: BookOpen,
                      Mail: Mail,
                      AlertTriangle: Flag,
                      Star: Star
                    }[activity.icon] || Clock;
                    
                    return (
                      <div key={index} className="flex items-start gap-3 border-l-2 border-white/30 dark:border-dark-gray/30 pl-3">
                        <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-white/10 dark:bg-dark-gray/10">
                          <IconComponent className="w-4 h-4 text-white dark:text-dark-gray" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white dark:text-dark-gray">
                            {activity.message}
                          </p>
                          <p className="text-xs text-white/60 dark:text-dark-gray/60">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Row 4: Reported Comments */}
            <div className="mb-4">
              <div className="bg-dark-gray dark:bg-white border-2 border-white/30 dark:border-dark-gray/30 p-3 sm:p-4">
                <h2 className="text-lg sm:text-xl font-bold text-white dark:text-dark-gray mb-3 sm:mb-4 uppercase tracking-widest">
                  Reported Comments
                </h2>
                
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {metrics.reportedCommentsList && metrics.reportedCommentsList.length > 0 ? (
                    metrics.reportedCommentsList.map((report) => (
                      <div 
                        key={report.id} 
                        className="p-3 bg-dark-gray dark:bg-white border border-white/20 dark:border-dark-gray/20"
                      >
                        {/* Book Title & Reason */}
                        <div className="mb-2">
                          <h3 className="text-xs uppercase tracking-widest text-white/70 dark:text-dark-gray/70 mb-1 line-clamp-1">
                            {report.book?.title || 'Unknown Book'}
                          </h3>
                          {report.reason && (
                            <span className="text-[10px] text-red-500 uppercase tracking-widest">
                              {report.reason}
                            </span>
                          )}
                        </div>

                        {/* Comment Text */}
                        <p className="text-xs text-white/80 dark:text-dark-gray/80 mb-3 line-clamp-2">
                          "{report.comment?.text || 'Comment not available'}"
                        </p>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReportAction(report, 'approve')}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-green-500/10 text-green-600 dark:text-green-500 hover:bg-green-500/20 transition-colors border border-green-500/30"
                          >
                            <Check className="w-3 h-3" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReportAction(report, 'reject')}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-500/20 transition-colors border border-red-500/30"
                          >
                            <XCircle className="w-3 h-3" />
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Check className="w-12 h-12 text-green-500/50 mx-auto mb-3" />
                      <p className="text-sm text-white/60 dark:text-dark-gray/60">
                        No reported comments at this time.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>


          </div>
        </div>

        {/* === Catalogue Management === */}
        <div className="mt-16 sm:mt-24 lg:mt-32 mb-6 sm:mb-8">
          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl text-white dark:text-dark-gray font-bold uppercase tracking-widest">
                Catalogue Management
              </h2>
              <p className="text-white/60 dark:text-dark-gray/60 text-xs sm:text-sm uppercase tracking-widest mt-1">
                Add, curate and maintain the reading experience.
              </p>
            </div>
          </div>

          {/* Search Bar with Filters and Add Button */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 dark:text-dark-gray/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or author..."
                className="w-full bg-dark-gray dark:bg-white text-white dark:text-dark-gray border-2 border-white/30 dark:border-dark-gray/30 pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-white dark:focus:border-dark-gray placeholder:text-white/40 dark:placeholder:text-dark-gray/40"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <select
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
                className="flex-1 bg-dark-gray dark:bg-white text-white dark:text-dark-gray border-2 border-white/30 dark:border-dark-gray/30 px-3 sm:px-4 py-2.5 sm:py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-white dark:focus:border-dark-gray"
              >
                <option value="">All Genres</option>
                {BOOK_GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <select
                value={filters.rating || ''}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="flex-1 bg-dark-gray dark:bg-white text-white dark:text-dark-gray border-2 border-white/30 dark:border-dark-gray/30 px-3 sm:px-4 py-2.5 sm:py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-white dark:focus:border-dark-gray"
              >
                <option value="">All Ratings</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Stars</option>
              </select>
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
                className="inline-flex items-center justify-center gap-2 bg-white dark:bg-dark-gray text-dark-gray dark:text-white px-4 sm:px-6 py-2.5 sm:py-3 text-xs font-bold uppercase tracking-widest border-2 border-white dark:border-dark-gray transition-all hover:bg-dark-gray dark:hover:bg-white hover:text-white dark:hover:text-dark-gray whitespace-nowrap"
              >
                {showForm ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{showForm ? 'Save' : 'Add Book'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Add/Edit Book Form */}
        {showForm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) resetForm();
            }}
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-2xl bg-white dark:bg-dark-gray border border-dark-gray/20 dark:border-white/20 shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-dark-gray border-b border-dark-gray/10 dark:border-white/10 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
                <h2 className="text-base sm:text-lg text-dark-gray dark:text-white font-medium uppercase tracking-wider">
                  {editingBook ? 'Edit Book' : 'Add Book'}
                </h2>
                <button
                  type="button"
                  onClick={resetForm}
                  className="p-1.5 text-dark-gray/50 dark:text-white/50 hover:text-dark-gray dark:hover:text-white transition-colors touch-manipulation"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} ref={formRef} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                {/* Book ID */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-dark-gray/60 dark:text-white/60 mb-1.5 font-medium">
                    Book ID (optional - auto-generated if empty)
                  </label>
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleInputChange}
                    disabled={!!editingBook}
                    placeholder="e.g., BOOK_026 (auto-generated if empty)"
                    className="w-full bg-transparent text-dark-gray dark:text-white border-b border-dark-gray/20 dark:border-white/20 px-0 py-2 text-sm focus:outline-none focus:border-dark-gray dark:focus:border-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-dark-gray/40 dark:text-white/40">
                    Leave empty to auto-generate next ID (e.g., BOOK_026, BOOK_027...)
                  </p>
                </div>

                {/* Title & Author */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-dark-gray/60 dark:text-white/60 mb-1.5 font-medium">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="Book title"
                      className="w-full bg-transparent text-dark-gray dark:text-white border-b border-dark-gray/20 dark:border-white/20 px-0 py-2 text-sm focus:outline-none focus:border-dark-gray dark:focus:border-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-dark-gray/60 dark:text-white/60 mb-1.5 font-medium">
                      Author *
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      required
                      placeholder="Author name"
                      className="w-full bg-transparent text-dark-gray dark:text-white border-b border-dark-gray/20 dark:border-white/20 px-0 py-2 text-sm focus:outline-none focus:border-dark-gray dark:focus:border-white transition-colors"
                    />
                  </div>
                </div>

                {/* Author Bio */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-dark-gray/60 dark:text-white/60 mb-1.5 font-medium">
                    Author Bio
                  </label>
                  <textarea
                    name="author_bio"
                    value={formData.author_bio}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Brief biography of the author"
                    className="w-full bg-transparent text-dark-gray dark:text-white border-b border-dark-gray/20 dark:border-white/20 px-0 py-2 text-sm focus:outline-none focus:border-dark-gray dark:focus:border-white transition-colors resize-none"
                  />
                </div>

                {/* Author Birth Year & Language */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-dark-gray/60 dark:text-white/60 mb-1.5 font-medium">
                      Author Birth Year
                    </label>
                    <input
                      type="number"
                      name="author_birth_year"
                      value={formData.author_birth_year}
                      onChange={handleInputChange}
                      placeholder="e.g., 1975"
                      min="1800"
                      max={new Date().getFullYear()}
                      className="w-full bg-transparent text-dark-gray dark:text-white border-b border-dark-gray/20 dark:border-white/20 px-0 py-2 text-sm focus:outline-none focus:border-dark-gray dark:focus:border-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-dark-gray/60 dark:text-white/60 mb-1.5 font-medium">
                      Language
                    </label>
                    <input
                      type="text"
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      placeholder="e.g., English"
                      className="w-full bg-transparent text-dark-gray dark:text-white border-b border-dark-gray/20 dark:border-white/20 px-0 py-2 text-sm focus:outline-none focus:border-dark-gray dark:focus:border-white transition-colors"
                    />
                  </div>
                </div>

                {/* Genre */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-dark-gray/60 dark:text-white/60 mb-1.5 font-medium">
                    Genre (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    placeholder="e.g., Fiction, Romance, Drama"
                    className="w-full bg-transparent text-dark-gray dark:text-white border-b border-dark-gray/20 dark:border-white/20 px-0 py-2 text-sm focus:outline-none focus:border-dark-gray dark:focus:border-white transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-dark-gray/60 dark:text-white/60 mb-1.5 font-medium">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Book description or summary"
                    className="w-full bg-transparent text-dark-gray dark:text-white border-b border-dark-gray/20 dark:border-white/20 px-0 py-2 text-sm focus:outline-none focus:border-dark-gray dark:focus:border-white transition-colors resize-none"
                  />
                </div>

                {/* Cover Image URL */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-dark-gray/60 dark:text-white/60 mb-1.5 font-medium">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    name="cover_image"
                    value={formData.cover_image}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className="w-full bg-transparent text-dark-gray dark:text-white border-b border-dark-gray/20 dark:border-white/20 px-0 py-2 text-sm focus:outline-none focus:border-dark-gray dark:focus:border-white transition-colors"
                  />
                </div>

                {/* File Uploads */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-dark-gray/60 dark:text-white/60 mb-2 font-medium">
                      Cover Image
                    </label>
                    <input
                      type="file"
                      name="cover_file"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="w-full text-xs text-dark-gray dark:text-white file:mr-2 file:py-1.5 file:px-3 file:border file:border-dark-gray/20 dark:file:border-white/20 file:text-xs file:uppercase file:tracking-wider file:bg-transparent file:text-dark-gray dark:file:text-white file:cursor-pointer hover:file:bg-dark-gray/5 dark:hover:file:bg-white/5 file:transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-dark-gray/60 dark:text-white/60 mb-2 font-medium">
                      PDF File
                    </label>
                    <input
                      type="file"
                      name="pdf_file"
                      onChange={handleFileChange}
                      accept=".pdf"
                      className="w-full text-xs text-dark-gray dark:text-white file:mr-2 file:py-1.5 file:px-3 file:border file:border-dark-gray/20 dark:file:border-white/20 file:text-xs file:uppercase file:tracking-wider file:bg-transparent file:text-dark-gray dark:file:text-white file:cursor-pointer hover:file:bg-dark-gray/5 dark:hover:file:bg-white/5 file:transition-colors"
                    />
                    {formData.pdf_file && !(formData.pdf_file instanceof File) && (
                      <p className="mt-1.5 text-xs text-dark-gray/40 dark:text-white/40 truncate">
                        Current: {formData.pdf_file}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-dark-gray/10 dark:border-white/10">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 flex items-center justify-center gap-2 bg-dark-gray dark:bg-white text-white dark:text-dark-gray px-5 py-3 sm:py-2.5 text-xs uppercase tracking-wider font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {editingBook ? 'Update' : 'Add'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-3 sm:py-2.5 text-xs uppercase tracking-wider font-medium text-dark-gray/60 dark:text-white/60 hover:text-dark-gray dark:hover:text-white transition-colors touch-manipulation"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Books Table */}
        <>
          <div className="border-2 border-white dark:border-dark-gray overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[640px]">
              <thead className="bg-white dark:bg-dark-gray">
                <tr>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs uppercase tracking-widest text-dark-gray dark:text-white font-bold border-b-2 border-dark-gray dark:border-white">
                    Cover
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs uppercase tracking-widest text-dark-gray dark:text-white font-bold border-b-2 border-dark-gray dark:border-white">
                    Title
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs uppercase tracking-widest text-dark-gray dark:text-white font-bold border-b-2 border-dark-gray dark:border-white">
                    Author
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs uppercase tracking-widest text-dark-gray dark:text-white font-bold border-b-2 border-dark-gray dark:border-white">
                    Genre
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs uppercase tracking-widest text-dark-gray dark:text-white font-bold border-b-2 border-dark-gray dark:border-white">
                    Rating
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs uppercase tracking-widest text-dark-gray dark:text-white font-bold border-b-2 border-dark-gray dark:border-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {booksLoading ? (
                  <tr>
                    <td colSpan="6" className="px-3 sm:px-6 py-8 sm:py-12 text-center text-white/60 dark:text-dark-gray/60 text-xs sm:text-sm uppercase tracking-widest">
                      Loading books...
                    </td>
                  </tr>
                ) : books.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-3 sm:px-6 py-8 sm:py-12 text-center text-white/60 dark:text-dark-gray/60 text-xs sm:text-sm uppercase tracking-widest">
                      No books found. Add your first book!
                    </td>
                  </tr>
                ) : (
                  books.map((book) => (
                    <tr key={book.id} className="border-b border-white/10 dark:border-dark-gray/10 hover:bg-white/5 dark:hover:bg-dark-gray/5 transition-colors">
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                        {book.cover_image ? (
                          <img
                            src={book.cover_image}
                            alt={book.title}
                            className="w-12 h-16 sm:w-16 sm:h-24 object-cover border-2 border-white dark:border-dark-gray"
                            onError={(e) => {
                              console.log('Image failed to load:', book.cover_image);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="w-12 h-16 sm:w-16 sm:h-24 bg-white/10 dark:bg-dark-gray/10 flex items-center justify-center text-xl sm:text-2xl border-2 border-white/30 dark:border-dark-gray/30"
                          style={{ display: book.cover_image ? 'none' : 'flex' }}
                        >
                          📚
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                        <div className="text-white dark:text-dark-gray text-xs sm:text-sm font-medium uppercase tracking-widest">
                          {book.title}
                        </div>
                        {book.description && (
                          <div className="text-white/60 dark:text-dark-gray/60 text-xs mt-1 line-clamp-2 hidden sm:block">
                            {book.description}
                          </div>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-white dark:text-dark-gray text-xs sm:text-sm uppercase tracking-widest">
                        {book.author || 'Unknown'}
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-white dark:text-dark-gray text-xs sm:text-sm uppercase tracking-widest">
                        {Array.isArray(book.genres) && book.genres.length > 0 
                          ? book.genres[0] 
                          : (book.genre || '-')}
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-white dark:text-dark-gray text-xs sm:text-sm">
                        <span className="inline-flex items-center gap-1 sm:gap-2">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                          {book.rating ? (
                            typeof book.rating === 'number' 
                              ? book.rating.toFixed(1) 
                              : parseFloat(book.rating).toFixed(1)
                          ) : '-'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                        <div className="flex gap-1 sm:gap-2">
                          <button
                            onClick={() => handleEdit(book)}
                            className="p-1.5 sm:p-2 bg-white dark:bg-dark-gray text-dark-gray dark:text-white border-2 border-white dark:border-dark-gray hover:opacity-80 transition-opacity"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(book.id)}
                            className="p-1.5 sm:p-2 bg-white dark:bg-dark-gray text-dark-gray dark:text-white border-2 border-white dark:border-dark-gray hover:opacity-80 transition-opacity"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="text-white/60 dark:text-dark-gray/60 text-xs uppercase tracking-widest text-center sm:text-left">
              Total Books: {totalBooks} • Page {page} of {Math.max(totalPages || 1, 1)}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs uppercase tracking-widest border-2 border-white dark:border-dark-gray text-white dark:text-dark-gray disabled:opacity-40 touch-manipulation"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-white/80 dark:text-dark-gray/80 text-xs px-2">
                {page}
              </span>
              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages || 1, page + 1))}
                disabled={page >= (totalPages || 1)}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs uppercase tracking-widest border-2 border-white dark:border-dark-gray text-white dark:text-dark-gray disabled:opacity-40 touch-manipulation"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ label, value, icon, change }) => (
  <div className="bg-dark-gray dark:bg-white border-2 border-white/30 dark:border-dark-gray/30 p-4 flex flex-col">
    {/* Title and Icon */}
    <div className="flex items-center justify-between mb-3">
      <h4 className="text-xs text-white/60 dark:text-dark-gray/60 uppercase tracking-wider font-medium">
        {label}
      </h4>
      <div className="shrink-0">
        {icon}
      </div>
    </div>

    {/* Value */}
    <div className="mb-2">
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-white dark:text-dark-gray leading-none">
          {value}
        </span>
      </div>
    </div>

    {/* Tag / change text */}
    {change && (
      <div className="flex justify-center mt-2">
        <span className="px-2.5 py-1 bg-white/5 dark:bg-dark-gray/5 text-white dark:text-dark-gray text-xs rounded text-center">
          {change}
        </span>
      </div>
    )}
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
