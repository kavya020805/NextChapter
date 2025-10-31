import React from 'react';

const ProfileDropdown = () => {
  return (
    <div className="bg-dropdown-bg p-4 text-white rounded-md shadow-xl border border-border z-50">
      <div className="mb-3">
        <h4 className="font-medium text-white/90">YOUR ACCOUNT</h4>
      </div>
      <div className="space-y-2">
        <button className="block w-full text-left text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors py-1 px-2 rounded">
          Help
        </button>
        <button className="block w-full text-left text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors py-1 px-2 rounded">
          Watch Anywhere
        </button>
        <button className="block w-full text-left text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors py-1 px-2 rounded">
          Accounts & Settings
        </button>
        <button className="block w-full text-left text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors py-1 px-2 rounded">
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;