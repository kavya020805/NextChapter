import React from 'react';
import PropTypes from 'prop-types';
import { Search, Grid3x3, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import NextChapterLogo from '@/assets/next-chapter-logo.png';
import SearchBar from './SearchBar';
import MenuDropdown from './MenuDropdown';
import ProfileDropdown from './ProfileDropdown';
import MyStuffDropdown from './MyStuffDropdown';

const Header = ({ isSearchOpen, onSearchToggle }) => {
  return (
    <header className="bg-background border-b border-border px-4 md:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-8">
          <img 
            src={NextChapterLogo} 
            alt="Next Chapter" 
            className="h-8 w-auto"
          />
          
          {/* Navigation - hidden on mobile */}
          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" className="text-nav-text font-medium hover:bg-primary/10">
              Home
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-nav-text font-medium hover:bg-primary/10 flex items-center gap-1">
                  MyStuff
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <MyStuffDropdown />
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" className="text-nav-text font-medium hover:bg-primary/10 flex items-center gap-2">
              <div className="grid grid-cols-2 gap-1">
                <div className="w-2 h-2 bg-nav-text rounded-sm"></div>
                <div className="w-2 h-2 bg-nav-text rounded-sm"></div>
                <div className="w-2 h-2 bg-nav-text rounded-sm"></div>
                <div className="w-2 h-2 bg-nav-text rounded-sm"></div>
              </div>
              Browse
              <ChevronDown className="h-4 w-4" />
            </Button>
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={onSearchToggle}
          >
            <Search className="h-5 w-5" />
          </Button>

          <div className="hidden md:block w-72">
            <SearchBar />
          </div>

          {/* Profile Dropdown - hidden on mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden md:inline-flex">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <ProfileDropdown />
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Grid3x3 className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <MenuDropdown />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  isSearchOpen: PropTypes.bool.isRequired,
  onSearchToggle: PropTypes.func.isRequired
};

export default Header;