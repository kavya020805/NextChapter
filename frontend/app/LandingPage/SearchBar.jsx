import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const SearchBar = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus the input when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Handle search logic here
  };

  return (
    <div className="flex-1 max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-hero-bg rounded-lg border border-border">
          <Search className="h-4 w-4 text-muted-foreground ml-3" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search books, authors, genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 bg-transparent focus:ring-0 focus:outline-none px-2 text-sm"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 mr-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

SearchBar.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default SearchBar;