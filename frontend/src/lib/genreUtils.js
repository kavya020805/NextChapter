/**
 * Utility functions for handling book genres
 * Genres are stored as PostgreSQL array/vector type in the database
 */

/**
 * Parse genres from a book object
 * Handles different formats: array, PostgreSQL array string, or single string
 * @param {Object} book - Book object with genres field
 * @returns {Array<string>} - Array of genre strings
 */
export function parseGenres(book) {
  if (!book) return [];
  
  const genresField = book.genres;
  
  // Already an array
  if (Array.isArray(genresField)) {
    return genresField.filter(Boolean).map(g => g.toString().trim()).filter(Boolean);
  }
  
  // PostgreSQL array format: {item1,item2,item3}
  if (typeof genresField === 'string' && genresField.startsWith('{') && genresField.endsWith('}')) {
    try {
      const cleaned = genresField.slice(1, -1); // Remove { and }
      return cleaned
        .split(',')
        .map(g => g.trim())
        .filter(Boolean);
    } catch (e) {
      console.warn('Failed to parse PostgreSQL array format:', genresField);
    }
  }
  
  // Single string
  if (typeof genresField === 'string' && genresField.trim()) {
    return [genresField.trim()];
  }
  
  // Fallback to genre (singular) or subjects fields
  if (book.genre) {
    return Array.isArray(book.genre) ? book.genre : [book.genre];
  }
  
  if (book.subjects) {
    return Array.isArray(book.subjects) ? book.subjects : [book.subjects];
  }
  
  return [];
}

/**
 * Get genre distribution from an array of books
 * @param {Array<Object>} books - Array of book objects
 * @returns {Object} - Object with genre names as keys and counts as values
 */
export function getGenreDistribution(books) {
  const distribution = {};
  
  books.forEach(book => {
    const genres = parseGenres(book);
    genres.forEach(genre => {
      if (genre) {
        distribution[genre] = (distribution[genre] || 0) + 1;
      }
    });
  });
  
  return distribution;
}

/**
 * Get top N genres from a distribution
 * @param {Object} distribution - Genre distribution object
 * @param {number} limit - Number of top genres to return
 * @returns {Array<Object>} - Array of {genre, count, percentage} objects
 */
export function getTopGenres(distribution, limit = 5) {
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  
  return Object.entries(distribution)
    .map(([genre, count]) => ({
      genre,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
