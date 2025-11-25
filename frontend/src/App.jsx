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
import ExploreBooksPage from './pages/ExploreBooksPage'
import OAuthCallbackPage from './pages/OAuthCallbackPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import RefundsPage from './pages/RefundsPage'
import ContactPage from './pages/ContactPage'
import ShippingPage from './pages/ShippingPage'
import Gallery from './components/Gallery'
import GalleryLocal from './components/GalleryLocal'
import Reader from './components/Reader'
import ReaderLocal from './components/ReaderLocal'
import Admin from './components/Admin'
import OAuthCallbackHandler from './components/OAuthCallbackHandler'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <OAuthCallbackHandler />
      <Routes>
        {/* Public routes - Landing page accessible to everyone including admin */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth routes - Public access, redirect if already logged in */}
        <Route 
          path="/sign-in" 
          element={
            <ProtectedRoute publicRoute>
              <SignInPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sign-up" 
          element={
            <ProtectedRoute publicRoute>
              <SignUpPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <ProtectedRoute publicRoute>
              <ForgotPasswordPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reset-password" 
          element={
            <ProtectedRoute publicRoute>
              <ResetPasswordPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Policy pages - Public access for everyone */}
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/refunds" element={<RefundsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/shipping" element={<ShippingPage />} />
        
        {/* OAuth callback route - handles OAuth redirects for both old and new users */}
        <Route path="/auth/callback" element={<OAuthCallbackPage />} />
        
        {/* Personalization - shown after first sign-in, blocks admin */}
        <Route 
          path="/personalization" 
          element={
            <ProtectedRoute blockAdmin>
              <PersonalizationPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected routes - require authentication, block admin */}
        <Route 
          path="/books" 
          element={
            <ProtectedRoute blockAdmin>
              <BooksPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recommended" 
          element={
            <ProtectedRoute blockAdmin>
              <RecommendedBooksPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/trending" 
          element={
            <ProtectedRoute blockAdmin>
              <TrendingBooksPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/highest-rated" 
          element={
            <ProtectedRoute blockAdmin>
              <HighestRatedBooksPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/explore" 
          element={
            <ProtectedRoute blockAdmin>
              <ExploreBooksPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reading-list" 
          element={
            <ProtectedRoute blockAdmin>
              <ReadingListPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/already-read" 
          element={
            <ProtectedRoute blockAdmin>
              <AlreadyReadPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/book/:id" 
          element={
            <ProtectedRoute blockAdmin>
              <BookDetailPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/subscription" 
          element={
            <ProtectedRoute blockAdmin>
              <SubscriptionPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute blockAdmin>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/gallery" 
          element={
            <ProtectedRoute blockAdmin>
              <Gallery />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/gallery-local" 
          element={
            <ProtectedRoute blockAdmin>
              <GalleryLocal />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reader" 
          element={
            <ProtectedRoute blockAdmin>
              <Reader />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reader-local" 
          element={
            <ProtectedRoute blockAdmin>
              <ReaderLocal />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin>
              <Admin />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </ErrorBoundary>
  )
}

export default App

