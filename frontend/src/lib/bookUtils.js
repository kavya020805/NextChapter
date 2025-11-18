import { supabase } from './supabaseClient'

/**
 * Transform book cover_image paths to full public URLs
 * @param {Object|Array} books - Single book object or array of books
 * @returns {Object|Array} - Book(s) with transformed cover_image URLs
 */
export function transformBookCoverUrls(books) {
  const transformSingle = (book) => {
    if (!book) return book
    
    let coverImage = book.cover_image
    
    // If cover_image is a relative path, convert to full URL
    if (coverImage && !coverImage.startsWith('http')) {
      const { data: { publicUrl } } = supabase.storage
        .from('covers')
        .getPublicUrl(coverImage.replace(/^covers\//, ''))
      coverImage = publicUrl
    }
    
    return {
      ...book,
      cover_image: coverImage
    }
  }
  
  // Handle array of books
  if (Array.isArray(books)) {
    return books.map(transformSingle)
  }
  
  // Handle single book
  return transformSingle(books)
}
