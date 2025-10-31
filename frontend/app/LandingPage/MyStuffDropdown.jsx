import React from 'react';

const MyStuffDropdown = () => {
  return (
    <div className="bg-dropdown-bg p-4 text-white rounded-md shadow-xl border border-border z-50">
      <div className="space-y-2">
        <button className="block w-full text-left text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors py-1 px-2 rounded">
          All
        </button>
        <button className="block w-full text-left text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors py-1 px-2 rounded">
          Watchlist
        </button>
        <button className="block w-full text-left text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors py-1 px-2 rounded">
          Already Read
        </button>
      </div>
    </div>
  );
};

export default MyStuffDropdown;