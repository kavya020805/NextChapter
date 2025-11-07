import { useState, useEffect } from 'react'
import { Play, Plus, Info } from 'lucide-react'

const featuredBooks = [
  {
    id: 1,
    title: 'Song of Ice and Fire',
    author: 'George R. R. Martin',
    rating: 4.8,
    ratingCount: '23M',
    languages: ['English', 'Hindi'],
    coverUrl: 'https://picsum.photos/400/600?random=hero1',
  },
  {
    id: 2,
    title: 'The Midnight Library',
    author: 'Matt Haig',
    rating: 4.6,
    ratingCount: '15M',
    languages: ['English', 'Spanish'],
    coverUrl: 'https://picsum.photos/400/600?random=hero2',
  },
  {
    id: 3,
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    rating: 4.7,
    ratingCount: '18M',
    languages: ['English', 'French'],
    coverUrl: 'https://picsum.photos/400/600?random=hero3',
  },
]

function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentBook = featuredBooks[currentIndex]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredBooks.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="bg-gradient-to-br from-cream to-peach px-4 py-12 md:py-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
              {currentBook.title}
            </h1>
            
            <div className="flex items-center space-x-2 text-gray-700">
              <span className="font-medium">{currentBook.author}</span>
              <span className="text-gray-400">•</span>
              <div className="flex items-center space-x-1">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold">{currentBook.rating}</span>
              </div>
              <span className="text-sm text-gray-500">({currentBook.ratingCount} ratings)</span>
            </div>

            <div className="flex items-center space-x-2">
              {currentBook.languages.map((lang, idx) => (
                <span key={lang} className="flex items-center">
                  <span className="text-sm text-gray-600">{lang}</span>
                  {idx < currentBook.languages.length - 1 && (
                    <span className="mx-2 text-gray-400">|</span>
                  )}
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 bg-coral hover:bg-dark-coral text-white px-6 py-3 rounded-md font-semibold transition-colors">
                <Play className="w-5 h-5 fill-current" />
                <span>Watch</span>
              </button>
              <button className="p-3 border-2 border-gray-300 hover:border-gray-400 rounded-md transition-colors">
                <Plus className="w-5 h-5 text-gray-700" />
              </button>
              <button className="p-3 border-2 border-gray-300 hover:border-gray-400 rounded-md transition-colors">
                <Info className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Navigation Dots */}
            <div className="flex items-center space-x-2 pt-4">
              {featuredBooks.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex ? 'w-8 bg-coral' : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right Cover Image */}
          <div className="relative">
            <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-2xl">
              <img
                src={currentBook.coverUrl}
                alt={currentBook.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection

