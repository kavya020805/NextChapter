/** @format */

import { supabase } from "./supabaseClient";

/**
 * Fetch all user dashboard data from Supabase
 * @param {string} userId - User ID from auth
 * @returns {Promise<object>} - Complete user dashboard data
 */
export async function fetchUserDashboardData(userId) {
	if (!userId) {
		return {
			profile: null,
			readingSessions: [],
			booksRead: [],
			currentlyReading: [],
			pinnedBooks: [],
			readingStats: {
				totalBooks: 0,
				totalPages: 0,
				activeDays: 0,
				currentStreak: 0,
				longestStreak: 0,
				averageSession: 0,
				readingSpeed: 0,
				thisMonthBooks: 0,
				thisMonthPages: 0,
			},
			monthlyProgress: [],
			genreDistribution: {},
			challengeData: {
				completed: 0,
				target: 52,
				percentage: 0,
				remaining: 52,
			},
		};
	}

	try {
		// Fetch all data in parallel
		const [
			profileResult,
			readingSessionsResult,
			booksReadResult,
			currentlyReadingResult,
			/* pinnedBooksResult (unused, keep slot for structure) */ pinnedBooksResult,
			/* genrePreferencesResult (unused) */ genrePreferencesResult,
			/* monthlyProgressResult (unused) */ monthlyProgressResult,
		] = await Promise.all([
			// User profile
			supabase.from("user_profiles").select("*").eq("user_id", userId).single(),

			// Reading sessions - check if table exists, otherwise use localStorage fallback
			supabase
				.from("reading_sessions")
				.select("*")
				.eq("user_id", userId)
				.order("date", { ascending: false }),

			// Books read - user_books rows with status 'read'
			supabase
				.from("user_books")
				.select("*")
				.eq("user_id", userId)
				.eq("status", "read")
				.order("completed_at", { ascending: false }),

			// Currently reading - user_books rows with status 'reading'
			supabase
				.from("user_books")
				.select("*")
				.eq("user_id", userId)
				.eq("status", "reading")
				.order("updated_at", { ascending: false }),

			// Pinned books - user_books rows with pinned flag
			Promise.resolve({ data: [], error: null }),

			// Genre preferences (no longer persisted; compute on the fly)
			Promise.resolve({ data: null, error: null }),

			// Monthly progress (no longer persisted; compute on the fly)
			Promise.resolve({ data: null, error: null }),
		]);

		// Prepare user_books row collections
		const booksReadRows = booksReadResult.data || [];
		const currentlyReadingRows = currentlyReadingResult.data || [];

		// Fetch all referenced books in a single query
		const allBookIds = Array.from(
			new Set(
				[
					...booksReadRows.map((row) => row.book_id),
					...currentlyReadingRows.map((row) => row.book_id),
				].filter(Boolean)
			)
		);

		let booksById = {};
		if (allBookIds.length > 0) {
			const { data: booksData, error: booksError } = await supabase
				.from("books")
				.select("*")
				.in("id", allBookIds);

			if (booksError) {
				console.error("Error fetching books for dashboard:", booksError);
			} else if (Array.isArray(booksData)) {
				booksById = Object.fromEntries(
					booksData.map((book) => [book.id, book])
				);
			}
		}

		// Get reading sessions (with localStorage fallback)
		let readingSessions = [];
		if (readingSessionsResult.data && readingSessionsResult.data.length > 0) {
			// Normalize pages and date fields regardless of column naming
			readingSessions = readingSessionsResult.data.map((session) => {
				// Prefer explicit date field; fall back to session_date or created_at
				const rawDate =
					session.date || session.session_date || session.created_at || null;
				let normalizedDate = null;
				if (rawDate) {
					const d = new Date(rawDate);
					if (!Number.isNaN(d.getTime())) {
						// Store as canonical YYYY-MM-DD string for the heatmap
						normalizedDate = d.toISOString().split("T")[0];
					}
				}

				return {
					...session,
					// Canonical date field used by ReadingActivityCard and stats
					date: normalizedDate,
					// Canonical pages field from pages or pages_read (DB schema)
					pages:
						typeof session.pages === "number"
							? session.pages
							: typeof session.pages_read === "number"
							? session.pages_read
							: 0,
				};
			});
		} else {
			// Fallback to localStorage
			try {
				const localSessions = localStorage.getItem("reading_sessions");
				if (localSessions) {
					readingSessions = JSON.parse(localSessions).map((session) => {
						const rawDate =
							session.date ||
							session.session_date ||
							session.created_at ||
							null;
						let normalizedDate = null;
						if (rawDate) {
							const d = new Date(rawDate);
							if (!Number.isNaN(d.getTime())) {
								normalizedDate = d.toISOString().split("T")[0];
							}
						}

						return {
							...session,
							user_id: userId,
							date: normalizedDate,
							pages:
								typeof session.pages === "number"
									? session.pages
									: typeof session.pages_read === "number"
									? session.pages_read
									: 0,
						};
					});
				}
			} catch (e) {
				console.error("Error parsing localStorage reading_sessions:", e);
			}
		}

		// Get books read
		let booksRead = [];
		if (booksReadRows.length > 0) {
			booksRead = booksReadRows
				.map((item) => {
					const book = booksById[item.book_id];
					if (!book) return null;
					// Prefer explicit completed_at; fall back to updated_at/created_at
					const rawCompleted =
						item.completed_at || item.updated_at || item.created_at || null;
					return {
						...book,
						completed_at: rawCompleted,
						user_book_id: item.id,
					};
				})
				.filter(Boolean);
		} else {
			// Fallback to localStorage
			try {
				const readIds = JSON.parse(localStorage.getItem("read") || "[]");
				if (readIds.length > 0) {
					const { data: booksData } = await supabase
						.from("books")
						.select("*")
						.in("id", readIds);

					if (booksData) {
						booksRead = booksData;
					}
				}
			} catch (e) {
				console.error("Error fetching read books:", e);
			}
		}

		// Get currently reading
		let currentlyReading = [];
		if (currentlyReadingRows.length > 0) {
			currentlyReading = currentlyReadingRows
				.map((item) => {
					const book = booksById[item.book_id];
					if (!book) return null;
					return {
						...book,
						current_page: item.current_page,
						// Use progress_percentage from user_books; fall back to legacy progress if present
						progress:
							typeof item.progress_percentage === "number"
								? item.progress_percentage
								: typeof item.progress === "number"
								? item.progress
								: 0,
						user_book_id: item.id,
					};
				})
				.filter(Boolean);
		}

		// Get pinned books
		let pinnedBooks = [];

		// Calculate reading statistics
		const stats = calculateReadingStats(readingSessions, booksRead);

		// Calculate fresh data (always recalculate to ensure accuracy)
		const calculatedMonthlyProgress = calculateMonthlyProgress(
			readingSessions,
			booksRead
		);
		const calculatedGenreDistribution = calculateGenreDistribution(booksRead);

		// Use freshly calculated monthly progress and genre distribution
		const monthlyProgress = calculatedMonthlyProgress;
		const genreDistribution = calculatedGenreDistribution;

		// Calculate challenge data
		const challengeData = calculateChallengeData(
			booksRead.filter((book) => book.completed_at)
		);

		return {
			profile: profileResult.data,
			readingSessions,
			booksRead,
			currentlyReading,
			pinnedBooks,
			readingStats: stats,
			monthlyProgress,
			genreDistribution,
			challengeData,
		};
	} catch (error) {
		console.error("Error fetching dashboard data:", error);
		// Return empty data structure on error
		return {
			profile: null,
			readingSessions: [],
			booksRead: [],
			currentlyReading: [],
			pinnedBooks: [],
			readingStats: {
				totalBooks: 0,
				totalPages: 0,
				activeDays: 0,
				currentStreak: 0,
				longestStreak: 0,
				averageSession: 0,
				readingSpeed: 0,
				thisMonthBooks: 0,
				thisMonthPages: 0,
			},
			monthlyProgress: [],
			genreDistribution: {},
			challengeData: {
				completed: 0,
				target: 52,
				percentage: 0,
				remaining: 52,
			},
		};
	}
}

/**
 * Calculate reading statistics from sessions and books
 */
function calculateReadingStats(readingSessions, booksRead) {
	const currentYear = new Date().getFullYear();
	const currentMonth = new Date().getMonth();
	const yearStart = new Date(currentYear, 0, 1);
	const monthStart = new Date(currentYear, currentMonth, 1);

	// Filter sessions for current year
	const yearSessions = readingSessions.filter((session) => {
		if (!session.date) return false;
		const sessionDate = new Date(session.date);
		return sessionDate >= yearStart;
	});

	// Filter sessions for current month
	const monthSessions = yearSessions.filter((session) => {
		const sessionDate = new Date(session.date);
		return sessionDate >= monthStart;
	});

	// Calculate active days
	const uniqueDays = new Set(yearSessions.map((s) => s.date));
	const activeDays = uniqueDays.size;

	// Calculate total pages
	const totalPages = yearSessions.reduce((sum, s) => sum + (s.pages || 0), 0);

	// Calculate current streak
	const currentStreak = calculateCurrentStreak(readingSessions);

	// Calculate longest streak
	const longestStreak = calculateLongestStreak(readingSessions);

	// Calculate average session duration (in minutes)
	// Prefer duration_minutes if present; fall back to minutes_read for older data
	const totalSessionTime = yearSessions.reduce(
		(sum, s) => sum + (s.duration_minutes || s.minutes_read || 0),
		0
	);
	const averageSession =
		yearSessions.length > 0
			? Math.round(totalSessionTime / yearSessions.length)
			: 0;

	// Calculate average reading speed as pages per day over the last 7 days
	const today = new Date();
	const weekStart = new Date(today);
	weekStart.setDate(today.getDate() - 6);

	const weekSessions = readingSessions.filter((session) => {
		if (!session.date) return false;
		const sessionDate = new Date(session.date);
		return sessionDate >= weekStart && sessionDate <= today;
	});

	const totalWeekPages = weekSessions.reduce(
		(sum, s) => sum + (s.pages || 0),
		0
	);
	const readingSpeed = Math.round(totalWeekPages / 7);

	// This month stats
	const thisMonthBooks = booksRead.filter((book) => {
		if (!book.completed_at) return false;
		const completedDate = new Date(book.completed_at);
		return completedDate >= monthStart;
	}).length;

	const thisMonthPages = monthSessions.reduce(
		(sum, s) => sum + (s.pages || 0),
		0
	);

	return {
		totalBooks: booksRead.length,
		totalPages,
		activeDays,
		currentStreak,
		longestStreak,
		averageSession,
		readingSpeed,
		thisMonthBooks,
		thisMonthPages,
	};
}

/**
 * Calculate current reading streak
 */
function calculateCurrentStreak(readingSessions) {
	if (readingSessions.length === 0) return 0;

	const sortedSessions = [...readingSessions]
		.filter((s) => s.date)
		.map((s) => new Date(s.date).toISOString().split("T")[0])
		.sort((a, b) => b.localeCompare(a));

	if (sortedSessions.length === 0) return 0;

	const today = new Date().toISOString().split("T")[0];
	const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

	let streak = 0;
	let currentDate = sortedSessions.includes(today) ? today : yesterday;

	for (const date of sortedSessions) {
		if (date === currentDate) {
			streak++;
			const dateObj = new Date(currentDate);
			dateObj.setDate(dateObj.getDate() - 1);
			currentDate = dateObj.toISOString().split("T")[0];
		} else if (date < currentDate) {
			break;
		}
	}

	return streak;
}

/**
 * Calculate longest reading streak
 */
function calculateLongestStreak(readingSessions) {
	if (readingSessions.length === 0) return 0;

	const sortedDates = [
		...new Set(
			readingSessions
				.filter((s) => s.date)
				.map((s) => new Date(s.date).toISOString().split("T")[0])
		),
	].sort((a, b) => a.localeCompare(b));

	if (sortedDates.length === 0) return 0;

	let longestStreak = 1;
	let currentStreak = 1;

	for (let i = 1; i < sortedDates.length; i++) {
		const prevDate = new Date(sortedDates[i - 1]);
		const currDate = new Date(sortedDates[i]);
		const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

		if (diffDays === 1) {
			currentStreak++;
			longestStreak = Math.max(longestStreak, currentStreak);
		} else {
			currentStreak = 1;
		}
	}

	return longestStreak;
}

/**
 * Calculate monthly progress data
 */
function calculateMonthlyProgress(readingSessions, booksRead) {
	const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];
	const currentYear = new Date().getFullYear();
	const monthlyCounts = {};
	const monthlyPages = {};

	months.forEach((month) => {
		monthlyCounts[month] = 0;
		monthlyPages[month] = 0;
	});

	// Count books by completion month
	booksRead.forEach((book) => {
		if (book.completed_at) {
			const completedDate = new Date(book.completed_at);
			if (completedDate.getFullYear() === currentYear) {
				const monthIndex = completedDate.getMonth();
				const monthName = months[monthIndex];
				monthlyCounts[monthName] = (monthlyCounts[monthName] || 0) + 1;
			}
		}
	});

	// Count pages by session month
	readingSessions.forEach((session) => {
		if (session.date) {
			const sessionDate = new Date(session.date);
			if (sessionDate.getFullYear() === currentYear) {
				const monthIndex = sessionDate.getMonth();
				const monthName = months[monthIndex];
				monthlyPages[monthName] =
					(monthlyPages[monthName] || 0) + (session.pages || 0);
			}
		}
	});

	return months.map((month) => ({
		month,
		books: monthlyCounts[month] || 0,
		pages: monthlyPages[month] || 0,
	}));
}

/**
 * Calculate genre distribution
 */
function calculateGenreDistribution(booksRead) {
	const distribution = {};

	booksRead.forEach((book) => {
		// Prefer genres text[] from books table, fall back to single genre or subjects
		const rawGenres = book.genres ?? book.genre ?? book.subjects ?? [];

		const genresArray = Array.isArray(rawGenres)
			? rawGenres
			: rawGenres
			? [rawGenres]
			: [];

		genresArray.forEach((genre) => {
			if (!genre) return;
			const key = genre.toString().trim();
			if (!key) return;
			distribution[key] = (distribution[key] || 0) + 1;
		});
	});

	return distribution;
}

/**
 * Calculate challenge data
 */
function calculateChallengeData(booksRead) {
	const currentYear = new Date().getFullYear();
	const yearStart = new Date(currentYear, 0, 1);

	const completedThisYear = booksRead.filter((book) => {
		if (!book.completed_at) return false;
		const completedDate = new Date(book.completed_at);
		return completedDate >= yearStart;
	}).length;

	const target = 52; // Default annual target
	const percentage = Math.round((completedThisYear / target) * 100);
	const remaining = Math.max(0, target - completedThisYear);

	return {
		completed: completedThisYear,
		target,
		percentage,
		remaining,
	};
}

/**
 * Save genre preferences to database
 * @param {string} userId - User ID
 * @param {object} genreDistribution - Genre distribution object
 */
export async function saveGenrePreferences(userId, genreDistribution) {
	// Deprecated: genre preferences are now derived on the fly from booksRead
	// This function is kept as a no-op for backward compatibility.
	return;
}

/**
 * Save monthly progress to database
 * @param {string} userId - User ID
 * @param {array} monthlyProgress - Monthly progress array
 */
export async function saveMonthlyProgress(userId, monthlyProgress) {
	// Deprecated: monthly progress is now derived on the fly from readingSessions
	// This function is kept as a no-op for backward compatibility.
	return;
}

/**
 * Sync dashboard data - recalculate and save genre preferences and monthly progress
 * @param {string} userId - User ID
 * @param {array} readingSessions - Reading sessions
 * @param {array} booksRead - Books read
 */
export async function syncDashboardData(
	userId,
	readingSessions = [],
	booksRead = []
) {
	// Deprecated: dashboard data is now always computed on demand in fetchUserDashboardData
	// This function is kept as a no-op for backward compatibility.
	return;
}
