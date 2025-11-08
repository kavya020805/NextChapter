import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import { useTheme } from '../contexts/ThemeContext';
import { Star, BookOpen, Bookmark, CheckCircle, MessageSquare, Plus, Minus } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isInReadingList, setIsInReadingList] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [activeTab, setActiveTab] = useState('reviews');
  const [reviews, setReviews] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [discussionText, setDiscussionText] = useState('');

  useEffect(() => {
    loadBook();
    loadUserData();
  }, [id]);

  const loadBook = async () => {
    setLoading(true);
    try {
      // Try fetching from Supabase first
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setBook(data);
        // Load saved rating and progress
        const savedRating = localStorage.getItem(`book_rating_${id}`);
        const savedProgress = localStorage.getItem(`book_progress_${id}`);
        if (savedRating) setUserRating(parseInt(savedRating));
        if (savedProgress) setProgress(parseInt(savedProgress));
      } else {
        // Fallback to local JSON
        const response = await fetch('/books-data.json');
        if (response.ok) {
          const booksData = await response.json();
          const foundBook = booksData.find(b => b.id === id);
          if (foundBook) {
            setBook(foundBook);
            const savedRating = localStorage.getItem(`book_rating_${id}`);
            const savedProgress = localStorage.getItem(`book_progress_${id}`);
            if (savedRating) setUserRating(parseInt(savedRating));
            if (savedProgress) setProgress(parseInt(savedProgress));
          } else {
            setBook(null);
          }
        } else {
          setBook(null);
        }
      }
    } catch (error) {
      console.error('Error loading book:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const read = JSON.parse(localStorage.getItem('read') || '[]');
    setIsInReadingList(wishlist.includes(id));
    setIsRead(read.includes(id));
    
    // Load reviews and discussions
    const savedReviews = JSON.parse(localStorage.getItem(`book_reviews_${id}`) || '[]');
    const savedDiscussions = JSON.parse(localStorage.getItem(`book_discussions_${id}`) || '[]');
    setReviews(savedReviews);
    setDiscussions(savedDiscussions);
  };

  const handleRating = (value) => {
    setUserRating(value);
    localStorage.setItem(`book_rating_${id}`, value.toString());
    // Update average rating
    const allRatings = JSON.parse(localStorage.getItem(`book_ratings_${id}`) || '[]');
    allRatings.push(value);
    localStorage.setItem(`book_ratings_${id}`, JSON.stringify(allRatings));
    const avg = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
    setRating(avg.toFixed(1));
  };

  const handleProgressChange = (value) => {
    setProgress(value);
    localStorage.setItem(`book_progress_${id}`, value.toString());
  };

  const toggleReadingList = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (isInReadingList) {
      const updated = wishlist.filter(bid => bid !== id);
      localStorage.setItem('wishlist', JSON.stringify(updated));
      setIsInReadingList(false);
    } else {
      wishlist.push(id);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      setIsInReadingList(true);
    }
  };

  const toggleMarkAsRead = () => {
    const read = JSON.parse(localStorage.getItem('read') || '[]');
    if (isRead) {
      const updated = read.filter(bid => bid !== id);
      localStorage.setItem('read', JSON.stringify(updated));
      setIsRead(false);
      setProgress(0);
      localStorage.removeItem(`book_progress_${id}`);
    } else {
      read.push(id);
      localStorage.setItem('read', JSON.stringify(read));
      setIsRead(true);
      setProgress(100);
      localStorage.setItem(`book_progress_${id}`, '100');
    }
  };

  const handleSubmitReview = () => {
    if (!reviewText.trim()) return;
    
    const newReview = {
      id: Date.now(),
      text: reviewText,
      rating: userRating,
      date: new Date().toISOString(),
      user: 'You'
    };
    
    const updated = [...reviews, newReview];
    setReviews(updated);
    localStorage.setItem(`book_reviews_${id}`, JSON.stringify(updated));
    setReviewText('');
  };

  const handleSubmitDiscussion = () => {
    if (!discussionText.trim()) return;
    
    const newDiscussion = {
      id: Date.now(),
      text: discussionText,
      date: new Date().toISOString(),
      user: 'You',
      replies: []
    };
    
    const updated = [...discussions, newDiscussion];
    setDiscussions(updated);
    localStorage.setItem(`book_discussions_${id}`, JSON.stringify(updated));
    setDiscussionText('');
  };

  const handleReadNow = () => {
    navigate(`/reader-local?id=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-gray dark:bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white dark:text-dark-gray text-sm uppercase tracking-widest">Loading...</div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-dark-gray dark:bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white dark:text-dark-gray text-sm uppercase tracking-widest">Book not found</div>
        </div>
      </div>
    );
  }

  // Extract genre from subjects array or use genre field if available
  const genre = book.genre || book.subjects?.[0] || book.subjects || 'Fiction';

  return (
    <div className="min-h-screen bg-dark-gray dark:bg-white">
      <Header />
      
      {/* Book Detail Section */}
      <section className="bg-dark-gray dark:bg-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 md:gap-16">
            {/* Left Column - Cover and Actions */}
            <div className="col-span-12 md:col-span-4">
              <div className="sticky top-8">
                {/* Cover */}
                <div className="mb-8 w-3/4 mx-auto p-4" style={{backgroundColor: '#2b2b2b'}}>
                  <div className="border-4 p-1 bg-white" style={{borderColor: '#2b2b2b'}}>
                    <div className="overflow-hidden">
                      {book.cover_image ? (
                        <img 
                          src={book.cover_image} 
                          alt={book.title}
                          className="w-full aspect-2/3 object-cover"
                        />
                      ) : (
                        <div className="w-full aspect-2/3 bg-white dark:bg-dark-gray flex items-center justify-center text-dark-gray dark:text-white text-6xl">
                          📚
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleReadNow}
                    className="w-full bg-white dark:bg-dark-gray text-dark-gray dark:text-white border-2 border-white dark:border-dark-gray px-6 py-3 text-xs font-medium uppercase tracking-widest hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Read Now
                  </button>
                  
                  <button
                    onClick={toggleReadingList}
                    className={`w-full border-2 px-4 py-2.5 text-[10px] font-medium uppercase tracking-widest transition-opacity hover:opacity-80 flex items-center justify-center gap-2 ${
                      isInReadingList
                        ? 'bg-white dark:bg-dark-gray text-dark-gray dark:text-white border-white dark:border-dark-gray'
                        : 'bg-transparent text-white dark:text-dark-gray border-white dark:border-dark-gray'
                    }`}
                  >
                    {isInReadingList ? (
                      <>
                        <Minus className="w-3 h-3" />
                        Remove from List
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        Add to Reading List
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={toggleMarkAsRead}
                    className={`w-full border-2 px-4 py-2.5 text-[10px] font-medium uppercase tracking-widest transition-opacity hover:opacity-80 flex items-center justify-center gap-2 ${
                      isRead
                        ? 'bg-white dark:bg-dark-gray text-dark-gray dark:text-white border-white dark:border-dark-gray'
                        : 'bg-transparent text-white dark:text-dark-gray border-white dark:border-dark-gray'
                    }`}
                  >
                    <CheckCircle className="w-3 h-3" />
                    {isRead ? 'Mark as Unread' : 'Mark as Read'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Book Info */}
            <div className="col-span-12 md:col-span-8">
              {/* Title and Author */}
              <div className="mb-8 border-b-2 border-white dark:border-dark-gray pb-8">
                <h1 className="text-2xl md:text-3xl lg:text-4xl text-white dark:text-dark-gray mb-4 leading-tight font-light">
                  {book.title}
                </h1>
                <p className="text-white/70 dark:text-dark-gray/70 text-sm md:text-base mb-3 font-light uppercase tracking-widest">
                  {book.author || 'Unknown Author'}
                </p>
                <p className="text-xs uppercase tracking-widest mb-4" style={{ color: '#d47249' }}>
                  {genre}
                </p>
                {book.description && (
                  <p className="text-white/70 dark:text-dark-gray/70 text-sm leading-relaxed font-light mt-4">
                    {book.description}
                  </p>
                )}
              </div>

              {/* Rating */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(star)}
                        className="text-white dark:text-dark-gray hover:opacity-80 transition-opacity"
                      >
                        <Star 
                          className={`w-4 h-4 ${star <= userRating ? 'fill-current' : ''}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                {userRating > 0 && (
                  <p className="text-white/60 dark:text-dark-gray/60 text-[10px] uppercase tracking-widest">
                    Your rating: {userRating} stars
                  </p>
                )}
              </div>

              {/* Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white dark:text-dark-gray text-[10px] font-medium uppercase tracking-widest">
                    Reading Progress
                  </span>
                  <span className="text-white/70 dark:text-dark-gray/70 text-[10px]">
                    {progress}%
                  </span>
                </div>
                <div className="w-full bg-white/10 dark:bg-dark-gray/10 h-1.5 border border-white/20 dark:border-dark-gray/20">
                  <div 
                    className="h-full bg-white dark:bg-dark-gray transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="border-t-2 border-white dark:border-dark-gray pt-8">
                <div className="flex gap-4 mb-6 border-b border-white/20 dark:border-dark-gray/20">
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-3 px-2 text-[10px] font-medium uppercase tracking-widest transition-opacity hover:opacity-80 ${
                      activeTab === 'reviews'
                        ? 'text-white dark:text-dark-gray border-b-2 border-white dark:border-dark-gray'
                        : 'text-white/60 dark:text-dark-gray/60'
                    }`}
                  >
                    Reviews
                  </button>
                  <button
                    onClick={() => setActiveTab('discussions')}
                    className={`pb-3 px-2 text-[10px] font-medium uppercase tracking-widest transition-opacity hover:opacity-80 ${
                      activeTab === 'discussions'
                        ? 'text-white dark:text-dark-gray border-b-2 border-white dark:border-dark-gray'
                        : 'text-white/60 dark:text-dark-gray/60'
                    }`}
                  >
                    Discussions
                  </button>
                </div>

                {/* Reviews Panel */}
                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="border border-white/20 dark:border-dark-gray/20 p-4">
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Write your review..."
                        rows={4}
                        className="w-full bg-transparent border border-white/30 dark:border-dark-gray/30 text-white dark:text-dark-gray placeholder-white/40 dark:placeholder-dark-gray/40 px-4 py-3 text-sm focus:outline-none focus:border-white dark:focus:border-dark-gray transition-colors resize-none mb-3"
                      />
                      <button
                        onClick={handleSubmitReview}
                        disabled={!reviewText.trim()}
                        className="bg-white dark:bg-dark-gray text-dark-gray dark:text-white border border-white dark:border-dark-gray px-4 py-2 text-xs font-medium uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Submit Review
                      </button>
                    </div>

                    <div className="space-y-4">
                      {reviews.length === 0 ? (
                        <p className="text-white/60 dark:text-dark-gray/60 text-sm text-center py-8">
                          No reviews yet. Be the first to review!
                        </p>
                      ) : (
                        reviews.map((review) => (
                          <div key={review.id} className="border border-white/20 dark:border-dark-gray/20 p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-white dark:text-dark-gray text-sm font-medium">
                                {review.user}
                              </span>
                              {review.rating > 0 && (
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-3 h-3 ${star <= review.rating ? 'fill-current' : ''} text-white/60 dark:text-dark-gray/60`}
                                    />
                                  ))}
                                </div>
                              )}
                              <span className="text-white/40 dark:text-dark-gray/40 text-xs">
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-white/70 dark:text-dark-gray/70 text-sm leading-relaxed">
                              {review.text}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Discussions Panel */}
                {activeTab === 'discussions' && (
                  <div className="space-y-6">
                    <div className="border border-white/20 dark:border-dark-gray/20 p-4">
                      <textarea
                        value={discussionText}
                        onChange={(e) => setDiscussionText(e.target.value)}
                        placeholder="Start a discussion..."
                        rows={4}
                        className="w-full bg-transparent border border-white/30 dark:border-dark-gray/30 text-white dark:text-dark-gray placeholder-white/40 dark:placeholder-dark-gray/40 px-4 py-3 text-xs focus:outline-none focus:border-white dark:focus:border-dark-gray transition-colors resize-none mb-3"
                      />
                      <button
                        onClick={handleSubmitDiscussion}
                        disabled={!discussionText.trim()}
                        className="bg-white dark:bg-dark-gray text-dark-gray dark:text-white border border-white dark:border-dark-gray px-4 py-2 text-[10px] font-medium uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Post Discussion
                      </button>
                    </div>

                    <div className="space-y-4">
                      {discussions.length === 0 ? (
                        <p className="text-white/60 dark:text-dark-gray/60 text-xs text-center py-8">
                          No discussions yet. Start the conversation!
                        </p>
                      ) : (
                        discussions.map((discussion) => (
                          <div key={discussion.id} className="border border-white/20 dark:border-dark-gray/20 p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-white dark:text-dark-gray text-xs font-medium">
                                {discussion.user}
                              </span>
                              <span className="text-white/40 dark:text-dark-gray/40 text-[10px]">
                                {new Date(discussion.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-white/70 dark:text-dark-gray/70 text-xs leading-relaxed mb-3">
                              {discussion.text}
                            </p>
                            <button className="text-white/60 dark:text-dark-gray/60 text-[10px] uppercase tracking-widest hover:opacity-80 transition-opacity flex items-center gap-1">
                              <MessageSquare className="w-2.5 h-2.5" />
                              Reply
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BookDetailPage;

