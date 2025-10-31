import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SongOfIceFire from '@/assets/song-of-ice-fire.jpg';
import MidnightLibrary from '@/assets/midnight-library.jpg';
import ProjectHailMary from '@/assets/project-hail-mary.jpg';
import EvelynHugo from '@/assets/evelyn-hugo.jpg';

const featuredBooks = [
  {
    title: 'Song of Ice and Fire',
    author: 'George R. R. Martin',
    languages: 'English | Hindi',
    coverUrl: SongOfIceFire,
    chapter: 'Chapter 1'
  },
  {
    title: 'The Midnight Library',
    author: 'Matt Haig',
    languages: 'English | Spanish',
    coverUrl: MidnightLibrary,
    chapter: 'Chapter 1'
  },
  {
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    languages: 'English | French',
    coverUrl: ProjectHailMary,
    chapter: 'Chapter 1'
  },
  {
    title: 'The Seven Husbands of Evelyn Hugo',
    author: 'Taylor Jenkins Reid',
    languages: 'English | German',
    coverUrl: EvelynHugo,
    chapter: 'Chapter 1'
  }
];

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentBook = featuredBooks[currentIndex];

  const nextBook = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredBooks.length);
  };

  const prevBook = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? featuredBooks.length - 1 : prevIndex - 1
    );
  };

  return (
    <section className="bg-hero-bg px-4 py-12 md:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-section-title">
              {currentBook.title}
            </h1>
            <div className="space-y-2">
              <p className="text-xl text-muted-foreground">{currentBook.author}</p>
              <p className="text-sm text-muted-foreground">{currentBook.languages}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add to Library
                </Button>
                <Button variant="outline" className="gap-2">
                  <Info className="h-4 w-4" />
                  More Info
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevBook}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextBook}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-xl">
            <img 
              src={currentBook.coverUrl} 
              alt={currentBook.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;