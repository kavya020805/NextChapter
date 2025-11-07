import { ChevronRight } from 'lucide-react'

function BookCard({ book }) {
  return (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden rounded-lg shadow-md group-hover:shadow-xl transition-all duration-300">
        <img
          src={book.cover}
          alt={book.title}
          className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <p className="text-white font-semibold text-sm text-center px-4">
            {book.title}
          </p>
        </div>
      </div>
    </div>
  )
}

function BookSection({ title, books }) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-coral">{title}</h2>
        <button className="flex items-center space-x-1 text-gray-700 hover:text-coral transition-colors">
          <span className="text-sm">See more</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  )
}

export default BookSection

