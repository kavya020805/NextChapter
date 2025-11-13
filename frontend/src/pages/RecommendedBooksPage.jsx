import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import RecommendedBooks from '../../ai-suggestion/RecommendedBooks.jsx';

function RecommendedBooksPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-dark-gray dark:bg-white">
      <Header />

      <main className="max-w-6xl mx-auto px-6 md:px-10 lg:px-12 py-12 md:py-16">
        <header className="mb-10 md:mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50 dark:text-dark-gray/50 mb-3">
            Smart Suggestions
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white dark:text-dark-gray leading-tight">
            Recommended Books
          </h1>
          <p className="mt-4 max-w-2xl text-sm md:text-base text-white/60 dark:text-dark-gray/60 leading-relaxed">
            Discover five hand-picked titles generated from your reading behaviour and preferences.
            Recommendations update on demand—tap the button to fetch a fresh batch tailored to your Supabase profile.
          </p>
        </header>

        <div className="bg-white/5 dark:bg-dark-gray/5 border border-white/10 dark:border-dark-gray/10 rounded-2xl p-6 md:p-10 shadow-lg shadow-black/5 dark:shadow-white/5 backdrop-blur">
          <RecommendedBooks userId={user?.id} />
        </div>
      </main>
    </div>
  );
}

export default RecommendedBooksPage;

