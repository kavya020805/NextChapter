import React from 'react';
import PropTypes from 'prop-types';

const BookCard = ({ title, author, coverUrl, className = '' }) => {
  return (
    <div className={`group cursor-pointer ${className}`}>
      <div className="relative overflow-hidden rounded-lg shadow-md group-hover:shadow-xl transition-shadow">
        <img 
          src={coverUrl} 
          alt={`${title} by ${author}`}
          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="text-center text-white p-4">
            <p className="font-medium text-sm mb-1">{title}</p>
            <p className="text-xs opacity-80">{author}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

BookCard.propTypes = {
  title: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  coverUrl: PropTypes.string.isRequired,
  className: PropTypes.string
};

BookCard.defaultProps = {
  className: ''
};

export default BookCard;