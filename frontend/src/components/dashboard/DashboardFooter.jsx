import { useEffect, useState } from 'react'

function DashboardFooter() {
  const [totals, setTotals] = useState({ books: 0, pages: 0 })

  useEffect(() => {
    // Calculate totals from localStorage
    const calculateTotals = () => {
      const read = JSON.parse(localStorage.getItem('read') || '[]')
      
      // Mock pages calculation (in real app, this would come from database)
      // Average book has ~300 pages
      const totalPages = read.length > 0 ? read.length * 300 : 10290 // Fallback to demo data
      const totalBooks = read.length > 0 ? read.length : 34 // Fallback to demo data
      
      setTotals({
        books: totalBooks,
        pages: totalPages
      })
    }

    calculateTotals()
  }, [])

  return (
    <div className="bg-white dark:bg-dark-gray border border-dark-gray/10 dark:border-white/10 p-4">
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-xl text-dark-gray dark:text-white font-bold mb-0.5">
            {totals.books.toLocaleString()}
          </p>
          <p className="text-xs text-dark-gray/60 dark:text-white/60 uppercase tracking-wider">
            Total Books
          </p>
        </div>
        <div>
          <p className="text-xl text-dark-gray dark:text-white font-bold mb-0.5">
            {totals.pages.toLocaleString()}
          </p>
          <p className="text-xs text-dark-gray/60 dark:text-white/60 uppercase tracking-wider">
            Total Pages
          </p>
        </div>
      </div>
    </div>
  )
}

export default DashboardFooter

