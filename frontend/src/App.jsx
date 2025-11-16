import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import BooksPage from './pages/BooksPage'
import ReadingListPage from './pages/ReadingListPage'
import AlreadyReadPage from './pages/AlreadyReadPage'
import BookDetailPage from './pages/BookDetailPage'
import SubscriptionPage from './pages/SubscriptionPage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ProfilePage from './pages/ProfilePage'
import PersonalizationPage from './pages/PersonalizationPage'
import RecommendedBooksPage from './pages/RecommendedBooksPage'
import TrendingBooksPage from './pages/TrendingBooksPage'
import HighestRatedBooksPage from './pages/HighestRatedBooksPage'
import Gallery from './components/Gallery'
import GalleryLocal from './components/GalleryLocal'
import Reader from './components/Reader'
import ReaderLocal from './components/ReaderLocal'
import Admin from './components/Admin'
import OAuthCallbackHandler from './components/OAuthCallbackHandler'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <>
      <OAuthCallbackHandler />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Personalization - shown after first sign-in */}
        <Route 
          path="/personalization" 
          element={
            <ProtectedRoute>
              <PersonalizationPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected routes - require authentication */}
        <Route 
          path="/books" 
          element={
            <ProtectedRoute>
              <BooksPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recommended" 
          element={
            <ProtectedRoute>
              <RecommendedBooksPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/trending" 
          element={
            <ProtectedRoute>
              <TrendingBooksPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/highest-rated" 
          element={
            <ProtectedRoute>
              <HighestRatedBooksPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reading-list" 
          element={
            <ProtectedRoute>
              <ReadingListPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/already-read" 
          element={
            <ProtectedRoute>
              <AlreadyReadPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/book/:id" 
          element={
            <ProtectedRoute>
              <BookDetailPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/subscription" 
          element={
            <ProtectedRoute>
              <SubscriptionPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/gallery" 
          element={
            <ProtectedRoute>
              <Gallery />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/gallery-local" 
          element={
            <ProtectedRoute>
              <GalleryLocal />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reader" 
          element={
            <ProtectedRoute>
              <Reader />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reader-local" 
          element={
            <ProtectedRoute>
              <ReaderLocal />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  )
}

export default App

