import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import BooksPage from './pages/BooksPage'
import Gallery from './components/Gallery'
import GalleryLocal from './components/GalleryLocal'
import Reader from './components/Reader'
import ReaderLocal from './components/ReaderLocal'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/books" element={<BooksPage />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/gallery-local" element={<GalleryLocal />} />
      <Route path="/reader" element={<Reader />} />
      <Route path="/reader-local" element={<ReaderLocal />} />
    </Routes>
  )
}

export default App

