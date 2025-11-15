import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Star,
  BookOpen,
  Bookmark,
  CheckCircle,
  Plus,
  Minus,
  Heart,
  ArrowBigUp,
  MessageSquare,
  Flag
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { io } from 'socket.io-client';

const TABLE_PREFERENCES = {
  comments: ['book_discussions', 'book_comments'],
  replies: ['book_discussion_replies', 'book_comment_replies'],
  commentReactions: ['book_discussion_reactions', 'book_comment_reactions'],
  replyReactions: ['book_discussion_reply_reactions', 'book_reply_reactions'],
  commentReports: ['book_discussion_reports', 'book_comment_reports'],
  replyReports: ['book_discussion_reply_reports', 'book_reply_reports']
};

const isTableMissingError = (error) => error?.code === '42P01';

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isInReadingList, setIsInReadingList] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [likedComments, setLikedComments] = useState([]);
  const [upvotedComments, setUpvotedComments] = useState([]);
  const [reportedComments, setReportedComments] = useState([]);
  const [likedReplies, setLikedReplies] = useState([]);
  const [upvotedReplies, setUpvotedReplies] = useState([]);
  const [reportedReplies, setReportedReplies] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const socketRef = useRef(null);
  const tableCacheRef = useRef({});

  const createFallbackId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const toNumber = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const runTableQuery = useCallback(
    async (key, executor, { optional = false } = {}) => {
      const candidates = TABLE_PREFERENCES[key] || [];
      const cached = tableCacheRef.current[key];
      const orderedCandidates =
        cached && candidates.includes(cached)
          ? [cached, ...candidates.filter((candidate) => candidate !== cached)]
          : candidates;

      if (orderedCandidates.length === 0) {
        if (optional) {
          return { data: null, error: null, table: null };
        }
        throw new Error(`No table candidates configured for key: ${key}`);
      }

      let lastMissingError = null;

      for (const table of orderedCandidates) {
        let result;
        try {
          result = await executor(table);
        } catch (error) {
          if (!isTableMissingError(error)) {
            throw error;
          }
          lastMissingError = error;
          if (cached === table) {
            delete tableCacheRef.current[key];
          }
          continue;
        }

        const error = result?.error ?? null;

        if (!error) {
          tableCacheRef.current[key] = table;
          return { ...result, table };
        }

        if (!isTableMissingError(error)) {
          throw error;
        }

        lastMissingError = error;
        if (cached === table) {
          delete tableCacheRef.current[key];
        }
      }

      if (optional) {
        return { data: null, error: lastMissingError, table: null };
      }

      if (lastMissingError) {
        throw lastMissingError;
      }

      throw new Error(`Unable to resolve table for key: ${key}`);
    },
    []
  );

  const resolveBookId = useCallback(() => {
    const raw = book?.id ?? id;
    if (typeof raw === 'number' || typeof raw === 'string') return raw;
    if (raw && typeof raw.toString === 'function') return raw.toString();
    return id;
  }, [book, id]);

  const syncReadingState = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const read = JSON.parse(localStorage.getItem('read') || '[]');
    setIsInReadingList(wishlist.includes(id));
    setIsRead(read.includes(id));

    const savedProgress = localStorage.getItem(`book_progress_${id}`);
    setProgress(savedProgress ? parseInt(savedProgress, 10) : 0);
  };

  const formatReply = (reply) => ({
    id: reply.id ?? createFallbackId(),
    text: reply.text ?? reply.content ?? '',
    date: reply.created_at ?? reply.date ?? new Date().toISOString(),
    user: reply.author_name || reply.user || 'Anonymous',
    likes: toNumber(reply.likes_count ?? reply.likes),
    upvotes: toNumber(reply.upvotes_count ?? reply.upvotes)
  });

  const formatComment = (comment) => ({
    id: comment.id ?? createFallbackId(),
    text: comment.text ?? comment.content ?? '',
    date: comment.created_at ?? comment.date ?? new Date().toISOString(),
    user: comment.author_name || comment.user || 'Anonymous',
    likes: toNumber(comment.likes_count ?? comment.likes),
    upvotes: toNumber(comment.upvotes_count ?? comment.upvotes),
    replies: Array.isArray(comment.book_comment_replies ?? comment.replies)
      ? (comment.book_comment_replies ?? comment.replies).map(formatReply)
      : []
  });

  const updateCommentsState = (updater) => {
    setComments((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return next;
    });
  };

  useEffect(() => {
    loadBook();
  }, [id]);

  useEffect(() => {
    if (!id || authLoading) return;
    loadEngagementData();
  }, [id, user?.id, authLoading]);

  useEffect(() => {
    if (progress >= 100) {
      setIsRead(true);
    }
  }, [progress]);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL;
    if (!socketUrl) return;

    const socket = io(socketUrl, {
      transports: ['websocket']
    });
    socketRef.current = socket;

    socket.emit('joinBook', { bookId: id });
    socket.emit('syncComments', { bookId: id });

    socket.on('commentsSync', ({ comments: syncedComments }) => {
      if (!Array.isArray(syncedComments)) return;
      updateCommentsState((prev) => {
        const incoming = syncedComments
          .map(formatComment)
          .reduce((acc, comment) => {
            if (!acc.some((existing) => existing.id === comment.id)) {
              acc.push(comment);
            }
            return acc;
          }, []);
        const merged = [...incoming, ...prev.filter((existing) => !incoming.some((inc) => inc.id === existing.id))];
        return merged.sort((a, b) => new Date(b.date) - new Date(a.date));
      });
    });

    socket.on('commentAdded', ({ comment }) => {
      if (!comment) return;
      updateCommentsState((prev) => {
        const normalized = formatComment(comment);
        if (prev.some((existing) => existing.id === normalized.id)) {
          return prev;
        }
        const next = [normalized, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date));
        return next;
      });
    });

    socket.on('commentReactionUpdated', ({ commentId, reaction, total }) => {
      if (!commentId || !reaction) return;
      updateCommentsState((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                ...(reaction === 'like' ? { likes: total } : { upvotes: total })
              }
            : comment
        )
      );
    });

    socket.on('commentReplied', ({ commentId, reply }) => {
      if (!commentId || !reply) return;
      const normalizedReply = formatReply(reply);
      updateCommentsState((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                replies: comment.replies.some((existing) => existing.id === normalizedReply.id)
                  ? comment.replies
                  : [...comment.replies, normalizedReply]
              }
            : comment
        )
      );
    });

    socket.on('replyReactionUpdated', ({ commentId, replyId, reaction, total }) => {
      if (!commentId || !replyId || !reaction) return;
      updateCommentsState((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                replies: comment.replies.map((reply) =>
                  reply.id === replyId
                    ? {
                        ...reply,
                        ...(reaction === 'like' ? { likes: total } : { upvotes: total })
                      }
                    : reply
                )
              }
            : comment
        )
      );
    });

    return () => {
      socket.emit('leaveBook', { bookId: id });
      socket.disconnect();
      socketRef.current = null;
    };
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
        syncReadingState();
      } else {
        // Fallback to local JSON
        const response = await fetch('/books-data.json');
        if (response.ok) {
          const booksData = await response.json();
          const foundBook = booksData.find(b => b.id === id);
          if (foundBook) {
            setBook(foundBook);
            syncReadingState();
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

  const loadRatings = async () => {
      try {
        const { data, error } = await supabase
          .from('book_ratings')
          .select('rating, user_id')
          .eq('book_id', id);

        if (error) throw error;

        const ratingsData = Array.isArray(data) ? data : [];
        const total = ratingsData.length;
        setTotalRatings(total);

        if (total > 0) {
          const avg =
            ratingsData.reduce((sum, entry) => sum + toNumber(entry.rating), 0) / total;
          setRating(avg.toFixed(1));
        } else {
          setRating(0);
        }

        if (user) {
          const existing = ratingsData.find((entry) => entry.user_id === user.id);
          setUserRating(existing ? toNumber(existing.rating) : 0);
        } else {
          setUserRating(0);
        }
      } catch (error) {
        console.error('Error loading ratings:', error);
        setRating(0);
        setTotalRatings(0);
        if (!user) {
          setUserRating(0);
        }
      }
  };

  const loadComments = async () => {
      try {
        const bookId = resolveBookId();

        const commentResult = await runTableQuery(
          'comments',
          (table) =>
            supabase
              .from(table)
              .select('id, book_id, user_id, author_name, text, likes_count, upvotes_count, created_at')
              .eq('book_id', bookId)
              .order('created_at', { ascending: false })
        );

        if (commentResult.error) {
          throw commentResult.error;
        }

        const commentsData = Array.isArray(commentResult.data) ? commentResult.data : [];
        const commentIds = commentsData.map((comment) => comment.id);

        let repliesData = [];
        if (commentIds.length > 0) {
          const { data: replyRows, table: repliesTable } = await runTableQuery(
            'replies',
            (table) =>
              supabase
                .from(table)
                .select('id, comment_id, user_id, author_name, text, likes_count, upvotes_count, created_at')
                .in('comment_id', commentIds),
            { optional: true }
          );

          if (repliesTable && Array.isArray(replyRows)) {
            repliesData = replyRows;
          }
        }

        const repliesByComment = repliesData.reduce((acc, reply) => {
          const key = reply.comment_id;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(reply);
          return acc;
        }, {});

        const formatted = commentsData.map((comment) =>
          formatComment({
            ...comment,
            replies: repliesByComment[comment.id] || []
          })
        );

        setComments(formatted);

        if (user) {
          const [
            commentReactionsResult,
            replyReactionsResult,
            commentReportsResult,
            replyReportsResult
          ] = await Promise.all([
            runTableQuery(
              'commentReactions',
              (table) =>
                supabase
                  .from(table)
                  .select('comment_id, reaction_type')
                  .eq('book_id', bookId)
                  .eq('user_id', user.id),
              { optional: true }
            ),
            runTableQuery(
              'replyReactions',
              (table) =>
                supabase
                  .from(table)
                  .select('reply_id, reaction_type')
                  .eq('book_id', bookId)
                  .eq('user_id', user.id),
              { optional: true }
            ),
            runTableQuery(
              'commentReports',
              (table) =>
                supabase
                  .from(table)
                  .select('comment_id')
                  .eq('book_id', bookId)
                  .eq('user_id', user.id),
              { optional: true }
            ),
            runTableQuery(
              'replyReports',
              (table) =>
                supabase
                  .from(table)
                  .select('reply_id')
                  .eq('book_id', bookId)
                  .eq('user_id', user.id),
              { optional: true }
            )
          ]);

          const commentReactions = commentReactionsResult?.table
            ? Array.isArray(commentReactionsResult.data)
              ? commentReactionsResult.data
              : []
            : [];
          const replyReactions = replyReactionsResult?.table
            ? Array.isArray(replyReactionsResult.data)
              ? replyReactionsResult.data
              : []
            : [];
          const commentReports = commentReportsResult?.table
            ? Array.isArray(commentReportsResult.data)
              ? commentReportsResult.data
              : []
            : [];
          const replyReports = replyReportsResult?.table
            ? Array.isArray(replyReportsResult.data)
              ? replyReportsResult.data
              : []
            : [];

          setLikedComments(
            commentReactions
              .filter((reaction) => reaction.reaction_type === 'like')
              .map((reaction) => reaction.comment_id)
          );
          setUpvotedComments(
            commentReactions
              .filter((reaction) => reaction.reaction_type === 'upvote')
              .map((reaction) => reaction.comment_id)
          );
          setLikedReplies(
            replyReactions
              .filter((reaction) => reaction.reaction_type === 'like')
              .map((reaction) => reaction.reply_id)
          );
          setUpvotedReplies(
            replyReactions
              .filter((reaction) => reaction.reaction_type === 'upvote')
              .map((reaction) => reaction.reply_id)
          );
          setReportedComments(commentReports.map((report) => report.comment_id));
          setReportedReplies(replyReports.map((report) => report.reply_id));
        } else {
          setLikedComments([]);
          setUpvotedComments([]);
          setReportedComments([]);
          setLikedReplies([]);
          setUpvotedReplies([]);
          setReportedReplies([]);
        }

        setReplyText({});
        setReplyingTo(null);
      } catch (error) {
        console.error('Error loading comments:', error);
        setComments([]);
      }
  };

  const loadEngagementData = async () => {
    await Promise.all([loadRatings(), loadComments()]);
  };

  const updateCommentCount = async (commentId, type, delta) => {
    const target = comments.find((comment) => comment.id === commentId);
    if (!target) return;

    const column = type === 'likes' ? 'likes_count' : 'upvotes_count';
    const currentValue = type === 'likes' ? target.likes : target.upvotes;
    const nextValue = Math.max(0, toNumber(currentValue) + delta);

    const { data } = await runTableQuery(
      'comments',
      (table) =>
        supabase
          .from(table)
          .update({ [column]: nextValue })
          .eq('id', commentId)
          .select('id, likes_count, upvotes_count')
          .single()
    );

    updateCommentsState((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              likes: toNumber(data?.likes_count ?? (type === 'likes' ? nextValue : comment.likes)),
              upvotes: toNumber(data?.upvotes_count ?? (type === 'upvotes' ? nextValue : comment.upvotes))
            }
          : comment
      )
    );
  };

  const updateReplyCount = async (commentId, replyId, type, delta) => {
    const parent = comments.find((comment) => comment.id === commentId);
    if (!parent) return;
    const reply = parent.replies.find((item) => item.id === replyId);
    if (!reply) return;

    const column = type === 'likes' ? 'likes_count' : 'upvotes_count';
    const currentValue = type === 'likes' ? reply.likes : reply.upvotes;
    const nextValue = Math.max(0, toNumber(currentValue) + delta);

    const { data } = await runTableQuery(
      'replies',
      (table) =>
        supabase
          .from(table)
          .update({ [column]: nextValue })
          .eq('id', replyId)
          .select('id, likes_count, upvotes_count')
          .single()
    );

    updateCommentsState((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replies: comment.replies.map((item) =>
                item.id === replyId
                  ? {
                      ...item,
                      likes: toNumber(data?.likes_count ?? (type === 'likes' ? nextValue : item.likes)),
                      upvotes: toNumber(data?.upvotes_count ?? (type === 'upvotes' ? nextValue : item.upvotes))
                    }
                  : item
              )
            }
          : comment
      )
    );
  };

  const handleRating = async (value) => {
    if (!user) {
      alert('Sign in to rate this book.');
      return;
    }

    try {
      setUserRating(value);
      const { error } = await supabase
        .from('book_ratings')
        .upsert(
          {
            book_id: id,
            user_id: user.id,
            rating: value
          },
          { onConflict: 'book_id,user_id' }
        );

      if (error) throw error;
      await loadRatings();
    } catch (error) {
      console.error('Error saving rating:', error);
    }
  };

  const handleProgressChange = (value) => {
    const normalizedValue = Math.min(100, Math.max(0, value));
    setProgress(normalizedValue);
    localStorage.setItem(`book_progress_${id}`, normalizedValue.toString());
    if (normalizedValue >= 100) {
      setIsRead(true);
    }
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

  const handleSubmitComment = async () => {
    if (!user) {
      alert('Sign in to comment on this book.');
      return;
    }

    const text = commentText.trim();

    if (!text || isSubmittingComment) return;

    setIsSubmittingComment(true);

    try {
      const displayName = user?.user_metadata?.full_name || user?.email || 'Anonymous';
      const bookId = resolveBookId();

      const result = await runTableQuery(
        'comments',
        (table) =>
          supabase
            .from(table)
            .insert([
              {
                book_id: bookId,
                user_id: user.id,
                author_name: displayName,
                text
              }
            ])
            .select('id, book_id, user_id, author_name, text, likes_count, upvotes_count, created_at')
            .single()
      );

      if (result.error) {
        throw result.error;
      }

      if (!result.data) {
        throw new Error('Comment insert did not return a row.');
      }

      const formatted = formatComment({ ...result.data, replies: [] });

      updateCommentsState((prev) =>
        [formatted, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date))
      );

      setCommentText('');

      if (socketRef.current) {
        socketRef.current.emit('addComment', {
          bookId,
          comment: formatted
        });
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Unable to post your comment right now. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleToggleLike = async (commentId) => {
    if (!user) {
      alert('Sign in to like comments.');
      return;
    }

    const hasLiked = likedComments.includes(commentId);
    const delta = hasLiked ? -1 : 1;
    const bookId = resolveBookId();

    try {
      if (hasLiked) {
        await runTableQuery(
          'commentReactions',
          (table) =>
            supabase
              .from(table)
              .delete()
              .eq('comment_id', commentId)
              .eq('user_id', user.id)
              .eq('reaction_type', 'like')
        );
      } else {
        await runTableQuery(
          'commentReactions',
          (table) =>
            supabase
              .from(table)
              .upsert(
                {
                  book_id: bookId,
                  comment_id: commentId,
                  user_id: user.id,
                  reaction_type: 'like'
                },
                { onConflict: 'comment_id,user_id,reaction_type' }
              )
        );
      }

      await updateCommentCount(commentId, 'likes', delta);

      setLikedComments((prev) =>
        hasLiked ? prev.filter((cid) => cid !== commentId) : [...prev, commentId]
      );

      if (socketRef.current) {
        socketRef.current.emit('updateCommentReaction', {
          bookId: id,
          commentId,
          reaction: 'like',
          delta
        });
      }
    } catch (error) {
      console.error('Error updating comment like:', error);
    }
  };

  const handleToggleUpvote = async (commentId) => {
    if (!user) {
      alert('Sign in to upvote comments.');
      return;
    }

    const hasUpvoted = upvotedComments.includes(commentId);
    const delta = hasUpvoted ? -1 : 1;
    const bookId = resolveBookId();

    try {
      if (hasUpvoted) {
        await runTableQuery(
          'commentReactions',
          (table) =>
            supabase
              .from(table)
              .delete()
              .eq('comment_id', commentId)
              .eq('user_id', user.id)
              .eq('reaction_type', 'upvote')
        );
      } else {
        await runTableQuery(
          'commentReactions',
          (table) =>
            supabase
              .from(table)
              .upsert(
                {
                  book_id: bookId,
                  comment_id: commentId,
                  user_id: user.id,
                  reaction_type: 'upvote'
                },
                { onConflict: 'comment_id,user_id,reaction_type' }
              )
        );
      }

      await updateCommentCount(commentId, 'upvotes', delta);

      setUpvotedComments((prev) =>
        hasUpvoted ? prev.filter((cid) => cid !== commentId) : [...prev, commentId]
      );

      if (socketRef.current) {
        socketRef.current.emit('updateCommentReaction', {
          bookId: id,
          commentId,
          reaction: 'upvote',
          delta
        });
      }
    } catch (error) {
      console.error('Error updating comment upvote:', error);
    }
  };

  const handleReportComment = async (commentId) => {
    if (!user) {
      alert('Sign in to report comments.');
      return;
    }
    if (reportedComments.includes(commentId)) return;

    try {
      const bookId = resolveBookId();
      await runTableQuery(
        'commentReports',
        (table) =>
          supabase.from(table).insert({
            book_id: bookId,
            comment_id: commentId,
            user_id: user.id
          })
      );

      setReportedComments((prev) => [...prev, commentId]);
      alert('Comment reported. Thank you for helping keep our community safe.');
    } catch (error) {
      console.error('Error reporting comment:', error);
    }
  };

  const handleReplyChange = (commentId, value) => {
    setReplyText((prev) => ({
      ...prev,
      [commentId]: value
    }));
  };

  const handleSubmitReply = async (commentId) => {
    const text = replyText[commentId]?.trim();
    if (!text) return;

    try {
      const displayName = user?.user_metadata?.full_name || user?.email || 'Anonymous';
      const bookId = resolveBookId();
      const result = await runTableQuery(
        'replies',
        (table) =>
          supabase
            .from(table)
            .insert({
              book_id: bookId,
              comment_id: commentId,
              user_id: user?.id ?? null,
              author_name: displayName,
              text
            })
            .select('id, comment_id, user_id, author_name, text, likes_count, upvotes_count, created_at')
            .single()
      );

      if (result.error) {
        throw result.error;
      }

      if (!result.data) {
        throw new Error('Reply insert did not return a row.');
      }

      const formattedReply = formatReply(result.data);

      updateCommentsState((commentsState) =>
        commentsState.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                replies: [...comment.replies, formattedReply]
              }
            : comment
        )
      );

      if (socketRef.current) {
        socketRef.current.emit('replyComment', {
          bookId: id,
          commentId,
          reply: formattedReply
        });
      }

      setReplyText((prev) => ({
        ...prev,
        [commentId]: ''
      }));
      setReplyingTo(null);
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Unable to post your reply right now. Please try again.');
    }
  };

  const handleToggleReplyLike = async (commentId, replyId) => {
    if (!user) {
      alert('Sign in to like replies.');
      return;
    }

    const hasLiked = likedReplies.includes(replyId);
    const delta = hasLiked ? -1 : 1;
    const bookId = resolveBookId();

    try {
      if (hasLiked) {
        await runTableQuery(
          'replyReactions',
          (table) =>
            supabase
              .from(table)
              .delete()
              .eq('reply_id', replyId)
              .eq('user_id', user.id)
              .eq('reaction_type', 'like')
        );
      } else {
        await runTableQuery(
          'replyReactions',
          (table) =>
            supabase
              .from(table)
              .upsert(
                {
                  book_id: bookId,
                  reply_id: replyId,
                  user_id: user.id,
                  reaction_type: 'like'
                },
                { onConflict: 'reply_id,user_id,reaction_type' }
              )
        );
      }

      await updateReplyCount(commentId, replyId, 'likes', delta);

      setLikedReplies((prev) =>
        hasLiked ? prev.filter((rid) => rid !== replyId) : [...prev, replyId]
      );

      if (socketRef.current) {
        socketRef.current.emit('updateReplyReaction', {
          bookId: id,
          commentId,
          replyId,
          reaction: 'like',
          delta
        });
      }
    } catch (error) {
      console.error('Error updating reply like:', error);
    }
  };

  const handleToggleReplyUpvote = async (commentId, replyId) => {
    if (!user) {
      alert('Sign in to upvote replies.');
      return;
    }

    const hasUpvoted = upvotedReplies.includes(replyId);
    const delta = hasUpvoted ? -1 : 1;
    const bookId = resolveBookId();

    try {
      if (hasUpvoted) {
        await runTableQuery(
          'replyReactions',
          (table) =>
            supabase
              .from(table)
              .delete()
              .eq('reply_id', replyId)
              .eq('user_id', user.id)
              .eq('reaction_type', 'upvote')
        );
      } else {
        await runTableQuery(
          'replyReactions',
          (table) =>
            supabase
              .from(table)
              .upsert(
                {
                  book_id: bookId,
                  reply_id: replyId,
                  user_id: user.id,
                  reaction_type: 'upvote'
                },
                { onConflict: 'reply_id,user_id,reaction_type' }
              )
        );
      }

      await updateReplyCount(commentId, replyId, 'upvotes', delta);

      setUpvotedReplies((prev) =>
        hasUpvoted ? prev.filter((rid) => rid !== replyId) : [...prev, replyId]
      );

      if (socketRef.current) {
        socketRef.current.emit('updateReplyReaction', {
          bookId: id,
          commentId,
          replyId,
          reaction: 'upvote',
          delta
        });
      }
    } catch (error) {
      console.error('Error updating reply upvote:', error);
    }
  };

  const handleReportReply = async (commentId, replyId) => {
    if (!user) {
      alert('Sign in to report replies.');
      return;
    }

    if (reportedReplies.includes(replyId)) return;

    try {
      const bookId = resolveBookId();
      await runTableQuery(
        'replyReports',
        (table) =>
          supabase.from(table).insert({
            book_id: bookId,
            reply_id: replyId,
            comment_id: commentId,
            user_id: user.id
          })
      );

      setReportedReplies((prev) => [...prev, replyId]);
      alert('Reply reported. Thank you for helping keep our community safe.');
    } catch (error) {
      console.error('Error reporting reply:', error);
    }
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
  const isFullyRead = progress >= 100 || isRead;

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
                  <div className="mb-8 w-3/4 mx-auto p-4" style={{ backgroundColor: '#2b2b2b' }}>
                    <div className="border-4 p-1 bg-white" style={{ borderColor: '#2b2b2b' }}>
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
                      {progress > 0 && currentPage > 0 ? 'Continue Reading' : 'Read Now'}
                    </button>

                    <button
                      onClick={toggleReadingList}
                      className={`w-full border-2 px-4 py-2.5 text-[10px] font-medium uppercase tracking-widest transition-opacity hover:opacity-80 flex items-center justify-center gap-2 ${isInReadingList
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
                      onClick={() => {
                        if (!isFullyRead) {
                          toggleMarkAsRead();
                        }
                      }}
                      disabled={isFullyRead}
                      className={`w-full border-2 px-4 py-2.5 text-[10px] font-medium uppercase tracking-widest transition-opacity flex items-center justify-center gap-2 ${isFullyRead
                          ? 'bg-white dark:bg-dark-gray text-dark-gray dark:text-white border-white dark:border-dark-gray'
                          : 'bg-transparent text-white dark:text-dark-gray border-white dark:border-dark-gray hover:opacity-80'
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      <CheckCircle className="w-3 h-3" />
                      {isFullyRead ? 'Already Read' : 'Mark as Read'}
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

                {/* Rating + Feedback */}
                <div className="mb-8 rounded-lg border border-white/10 dark:border-dark-gray/10 bg-white/[0.03] dark:bg-dark-gray/[0.03] px-6 py-7">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-start gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl font-light text-white dark:text-dark-gray tracking-widest">
                            {rating > 0 ? rating : '0.0'}
                          </span>
                          <Star className="w-5 h-5 text-white dark:text-dark-gray fill-current opacity-70" />
                        </div>
                        <p className="text-white/60 dark:text-dark-gray/60 text-xs uppercase tracking-[0.4em]">
                          Average Rating
                        </p>
                      </div>
                      <div className="hidden md:block h-16 w-px bg-white/15 dark:bg-dark-gray/15" />
                      <div className="text-white/60 dark:text-dark-gray/60 text-xs md:text-sm uppercase tracking-[0.35em]">
                        {totalRatings > 0
                          ? `${totalRatings} ${totalRatings === 1 ? 'rating' : 'ratings'}`
                          : 'No ratings yet'}
                      </div>
                    </div>

                    <div className="flex-1 md:max-w-md md:ml-auto">
                      <div className="flex flex-col gap-4 md:items-end md:text-right">
                        <div className="flex flex-col gap-2 md:items-end">
                          <span className="text-white/70 dark:text-dark-gray/70 text-xs md:text-sm uppercase tracking-[0.35em]">
                            Rate this
                          </span>
                          <div className="flex items-center gap-1.5">
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
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-8 rounded-lg border border-white/10 dark:border-dark-gray/10 bg-white/[0.02] dark:bg-dark-gray/[0.02] px-6 py-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white dark:text-dark-gray text-xs md:text-sm font-medium uppercase tracking-[0.35em]">
                      Reading Progress
                    </span>
                    <span className="text-white/70 dark:text-dark-gray/70 text-xs md:text-sm tracking-[0.3em]">
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
                <div className="border-t-2 border-white dark:border-dark-gray pt-8 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white dark:text-dark-gray text-base md:text-lg font-medium uppercase tracking-widest">
                      Comments
                    </h3>
                    <span className="text-white/60 dark:text-dark-gray/60 text-sm md:text-base uppercase tracking-widest">
                      {comments.length} total
                    </span>
                  </div>

                  <div className="rounded-lg border border-white/10 dark:border-dark-gray/10 bg-white/[0.02] dark:bg-dark-gray/[0.02] p-5 flex flex-col gap-3">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your thoughts or start a conversation..."
                      rows={4}
                      className="w-full bg-transparent border border-white/30 dark:border-dark-gray/30 text-white dark:text-dark-gray placeholder-white/40 dark:placeholder-dark-gray/40 px-4 py-3 text-sm focus:outline-none focus:border-white dark:focus:border-dark-gray transition-colors resize-none"
                    />
                    <button
                      onClick={handleSubmitComment}
                      disabled={isSubmittingComment || !commentText.trim()}
                      className="self-start bg-white dark:bg-dark-gray text-dark-gray dark:text-white border border-white dark:border-dark-gray px-4 py-2 text-sm font-medium uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>

                  <div className="rounded-lg border border-white/10 dark:border-dark-gray/10 bg-white/[0.02] dark:bg-dark-gray/[0.02] overflow-hidden">
                    {comments.length === 0 ? (
                      <p className="text-white/60 dark:text-dark-gray/60 text-sm text-center py-8">
                        No comments yet. Share your thoughts!
                      </p>
                    ) : (
                      <div className="divide-y divide-white/10 dark:divide-dark-gray/10">
                        {comments.map((comment, index) => (
                          <div
                            key={comment.id}
                            className={`p-5 space-y-3 ${index === 0 ? 'pt-6' : ''} ${index === comments.length - 1 ? 'pb-6' : ''}`}
                          >
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-white dark:text-dark-gray text-sm md:text-base font-semibold uppercase tracking-widest">
                                  {comment.user}
                                </span>
                                <span className="text-white/45 dark:text-dark-gray/45 text-xs uppercase tracking-[0.35em]">
                                  Comment
                                </span>
                              </div>
                              <span className="text-white/45 dark:text-dark-gray/45 text-xs md:text-sm uppercase tracking-[0.3em]">
                                {new Date(comment.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-white/80 dark:text-dark-gray/70 text-sm md:text-base leading-relaxed">
                              {comment.text}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-white/60 dark:text-dark-gray/60 text-xs uppercase tracking-[0.3em]">
                              <button
                                onClick={() => handleToggleLike(comment.id)}
                                className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                              >
                                <Heart
                                  className="w-3.5 h-3.5"
                                  fill={likedComments.includes(comment.id) ? 'currentColor' : 'none'}
                                />
                                <span>{comment.likes}</span>
                              </button>
                              <button
                                onClick={() => handleToggleUpvote(comment.id)}
                                className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                              >
                                <ArrowBigUp
                                  className="w-3.5 h-3.5"
                                  fill={upvotedComments.includes(comment.id) ? 'currentColor' : 'none'}
                                />
                                <span>{comment.upvotes}</span>
                              </button>
                              <button
                                onClick={() =>
                                  setReplyingTo((current) => (current === comment.id ? null : comment.id))
                                }
                                className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Reply</span>
                              </button>
                              <button
                                onClick={() => handleReportComment(comment.id)}
                                disabled={reportedComments.includes(comment.id)}
                                className="flex items-center gap-1 hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                                title={reportedComments.includes(comment.id) ? 'Already reported' : 'Report comment'}
                              >
                                <Flag className="w-3.5 h-3.5" fill={reportedComments.includes(comment.id) ? 'currentColor' : 'none'} />
                                <span>Report</span>
                              </button>
                            </div>

                            {comment.replies.length > 0 && (
                              <div className="mt-4 space-y-4 border-l border-white/15 dark:border-dark-gray/15 pl-4 md:pl-5">
                                {comment.replies.map((reply) => {
                                  const isLiked = likedReplies.includes(reply.id);
                                  const isUpvoted = upvotedReplies.includes(reply.id);
                                  const isReported = reportedReplies.includes(reply.id);
                                  return (
                                    <div
                                      key={reply.id}
                                      className="space-y-2"
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-white dark:text-dark-gray text-xs md:text-sm font-medium uppercase tracking-widest">
                                          {reply.user}
                                        </span>
                                        <span className="text-white/45 dark:text-dark-gray/45 text-[0.65rem] md:text-xs uppercase tracking-[0.3em]">
                                          {new Date(reply.date).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <p className="text-white/70 dark:text-dark-gray/65 text-xs md:text-sm leading-relaxed">
                                        {reply.text}
                                      </p>
                                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/60 dark:text-dark-gray/60 text-[0.65rem] uppercase tracking-[0.3em]">
                                        <button
                                          onClick={() => handleToggleReplyLike(comment.id, reply.id)}
                                          className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                                        >
                                          <Heart
                                            className="w-3 h-3"
                                            fill={isLiked ? 'currentColor' : 'none'}
                                          />
                                          <span>{reply.likes || 0}</span>
                                        </button>
                                        <button
                                          onClick={() => handleToggleReplyUpvote(comment.id, reply.id)}
                                          className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                                        >
                                          <ArrowBigUp
                                            className="w-3 h-3"
                                            fill={isUpvoted ? 'currentColor' : 'none'}
                                          />
                                          <span>{reply.upvotes || 0}</span>
                                        </button>
                                        <button
                                          onClick={() => handleReportReply(comment.id, reply.id)}
                                          disabled={isReported}
                                          className="flex items-center gap-1 hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                                          title={isReported ? 'Already reported' : 'Report reply'}
                                        >
                                          <Flag className="w-3 h-3" fill={isReported ? 'currentColor' : 'none'} />
                                          <span>Report</span>
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {replyingTo === comment.id && (
                              <div className="mt-3 space-y-2 border border-white/10 dark:border-dark-gray/10 bg-white/[0.02] dark:bg-dark-gray/[0.02] p-3">
                                <textarea
                                  value={replyText[comment.id] || ''}
                                  onChange={(e) => handleReplyChange(comment.id, e.target.value)}
                                  placeholder="Write a reply..."
                                  rows={3}
                                  className="w-full bg-transparent border border-white/20 dark:border-dark-gray/20 text-white dark:text-dark-gray placeholder-white/40 dark:placeholder-dark-gray/40 px-3 py-2 text-sm focus:outline-none focus:border-white dark:focus:border-dark-gray transition-colors resize-none"
                                />
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => handleSubmitReply(comment.id)}
                                    disabled={!replyText[comment.id]?.trim()}
                                    className="bg-white dark:bg-dark-gray text-dark-gray dark:text-white border border-white dark:border-dark-gray px-3 py-1.5 text-sm font-medium uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    Post Reply
                                  </button>
                                  <button
                                    onClick={() => setReplyingTo(null)}
                                    className="text-white/60 dark:text-dark-gray/60 text-sm uppercase tracking-widest hover:opacity-80 transition-opacity"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
};

export default BookDetailPage;

