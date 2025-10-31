import React from 'react';

const MenuDropdown = () => {
  const genres = [
    'Fiction', 'Romance', 'Short-Stories',
    'Manga', 'Biography', 'Spirituality',
    'Comedy', 'Self Help', 'Humanities',
    'Crime', 'Horror', 'Arts',
    'Drama', 'Education', 'Science & Technology',
    'Fantasy', 'Kids', '',
    'Science - Fiction', 'Adventure', '',
    'Mystery & Thriller', 'History', '',
    'Poems', 'Travel', ''
  ];

  const featuredCollections = [
    'New Releases',
    'Trending',
    'Critically Acclaimed',
    'Highest Rated'
  ];

  return (
    <div className="bg-dropdown-bg p-6 text-white rounded-md shadow-xl border border-border z-50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Genres Column */}
        <div>
          <h3 className="font-semibold mb-4 text-white/90">GENRES</h3>
          <div className="space-y-2">
            {genres.slice(0, 9).map((genre) => (
              genre && (
                <button
                  key={`genre-first-${genre}`}
                  className="block w-full text-left text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors py-1 px-2 rounded"
                >
                  {genre}
                </button>
              )
            ))}
          </div>
        </div>

        {/* Second Genres Column */}
        <div>
          <div className="h-8"></div> {/* Spacer to align with other columns */}
          <div className="space-y-2">
            {genres.slice(9, 18).map((genre) => (
              genre && (
                <button
                  key={`genre-second-${genre}`}
                  className="block w-full text-left text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors py-1 px-2 rounded"
                >
                  {genre}
                </button>
              )
            ))}
          </div>
        </div>

        {/* Featured Collections Column */}
        <div>
          <h3 className="font-semibold mb-4 text-white/90">FEATURED COLLECTIONS</h3>
          <div className="space-y-2">
            {featuredCollections.map((collection) => (
              <button
                key={`collection-${collection}`}
                className="block w-full text-left text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors py-1 px-2 rounded"
              >
                {collection}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuDropdown;