import React from 'react';
import PropTypes from 'prop-types';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BookCard from './BookCard';

// Mock book data for display purposes
const generateMockBooks = (count, genre) => {
  const mockAuthors = ['Emma Wilson', 'John Smith', 'Sarah Johnson', 'Michael Brown', 'Lisa Davis', 'David Miller'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `${genre}-${i}`,
    title: `${genre} Book ${i + 1}`,
    author: mockAuthors[i % mockAuthors.length],
    coverUrl: `https://picsum.photos/200/300?random=${genre}-${i}&blur=1`
  }));
};

const BookSection = ({ title, books }) => {
  // Use mock data for now
  const displayBooks = books.length > 0 ? books : generateMockBooks(6, title.toLowerCase());

  return (
    <section className="mb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-section-title">
            {title}
          </h2>
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary/80 flex items-center gap-1"
          >
            See more
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {displayBooks.map((book) => (
            <BookCard
              key={book.id}
              title={book.title}
              author={book.author}
              coverUrl={book.coverUrl}
              className="w-full"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

BookSection.propTypes = {
  title: PropTypes.string.isRequired,
  books: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    author: PropTypes.string,
    coverUrl: PropTypes.string
  }))
};

BookSection.defaultProps = {
  books: []
};

export default BookSection;