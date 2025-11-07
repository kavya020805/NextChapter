import { useState } from 'react'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import BookSection from '../components/BookSection'

// Mock data - replace with Supabase data later
const comedyBooks = [
  { id: 1, title: 'Beginners', cover: 'https://picsum.photos/200/300?random=1' },
  { id: 2, title: 'Glorious Exploits', cover: 'https://picsum.photos/200/300?random=2' },
  { id: 3, title: 'Holly', cover: 'https://picsum.photos/200/300?random=3' },
  { id: 4, title: 'The Soulmate', cover: 'https://picsum.photos/200/300?random=4' },
  { id: 5, title: 'Book 5', cover: 'https://picsum.photos/200/300?random=5' },
  { id: 6, title: 'David Nicholls', cover: 'https://picsum.photos/200/300?random=6' },
]

const thrillerBooks = [
  { id: 7, title: 'The Paris Widow', cover: 'https://picsum.photos/200/300?random=7' },
  { id: 8, title: 'The Chamber', cover: 'https://picsum.photos/200/300?random=8' },
  { id: 9, title: 'Hera Gold', cover: 'https://picsum.photos/200/300?random=9' },
  { id: 10, title: 'Room', cover: 'https://picsum.photos/200/300?random=10' },
  { id: 11, title: 'The Housemaid', cover: 'https://picsum.photos/200/300?random=11' },
  { id: 12, title: 'The Wedding', cover: 'https://picsum.photos/200/300?random=12' },
]

function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <HeroSection />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <BookSection title="Comedy" books={comedyBooks} />
        <BookSection title="Thriller" books={thrillerBooks} />
      </main>
    </div>
  )
}

export default LandingPage

