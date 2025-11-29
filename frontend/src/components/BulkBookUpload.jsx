import { useState, useRef } from 'react'
import { Upload, X, Check, AlertCircle, Download } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { toast } from 'react-toastify'

const BulkBookUpload = ({ onSuccess }) => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      setResults(null)
    } else {
      toast.error('Please select a CSV file')
    }
  }

  const downloadTemplate = () => {
    const template = `id,title,author,description,genres,language,cover_image,pdf_file,audio_file,author_bio,author_birth_year
BOOK_001,Sample Book,John Doe,A great book about...,Fiction;Mystery,English,https://example.com/cover.jpg,https://example.com/book.pdf,https://example.com/audio.mp3,Author biography here,1970
BOOK_002,Another Book,Jane Smith,Another amazing story...,Romance;Drama,English,https://example.com/cover2.jpg,https://example.com/book2.pdf,https://example.com/audio2.mp3,Author bio,1985`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'book_upload_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim())
    const books = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const book = {}
      
      headers.forEach((header, index) => {
        const value = values[index] || ''
        
        // Handle genres (semicolon-separated)
        if (header === 'genres') {
          book.genres = value ? value.split(';').map(g => g.trim()).filter(Boolean) : []
        } 
        // Handle author_birth_year as integer
        else if (header === 'author_birth_year') {
          book.author_birth_year = value ? parseInt(value) : null
        }
        // Handle other fields
        else {
          book[header] = value || null
        }
      })

      // Set defaults
      if (!book.language) book.language = 'English'
      if (!book.rating) book.rating = 0
      if (!book.created_at) book.created_at = new Date().toISOString()

      books.push(book)
    }

    return books
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    const uploadResults = {
      total: 0,
      success: 0,
      failed: 0,
      errors: []
    }

    try {
      const text = await file.text()
      const books = parseCSV(text)
      uploadResults.total = books.length

      // Get the highest existing book number for auto-generation
      const { data: existingBooks } = await supabase
        .from('books')
        .select('id')
        .like('id', 'BOOK_%')
        .order('id', { ascending: false })
        .limit(1)

      let nextNumber = 1
      if (existingBooks && existingBooks.length > 0) {
        const lastId = existingBooks[0].id
        const match = lastId.match(/BOOK_(\d+)/)
        if (match) {
          nextNumber = parseInt(match[1]) + 1
        }
      }

      for (const book of books) {
        try {
          // Auto-generate ID if not provided or empty
          if (!book.id || book.id.trim() === '') {
            book.id = `BOOK_${String(nextNumber).padStart(3, '0')}`
            nextNumber++
          }

          // Check if book ID already exists
          const { data: existing } = await supabase
            .from('books')
            .select('id')
            .eq('id', book.id)
            .single()

          if (existing) {
            uploadResults.errors.push(`Book ${book.id} already exists`)
            uploadResults.failed++
            continue
          }

          // Insert book
          const { error } = await supabase
            .from('books')
            .insert([book])

          if (error) throw error
          uploadResults.success++
        } catch (error) {
          uploadResults.failed++
          uploadResults.errors.push(`${book.title || book.id}: ${error.message}`)
        }
      }

      setResults(uploadResults)
      
      if (uploadResults.success > 0) {
        toast.success(`Successfully uploaded ${uploadResults.success} books!`)
        if (onSuccess) onSuccess()
      }
      
      if (uploadResults.failed > 0) {
        toast.warning(`${uploadResults.failed} books failed to upload`)
      }
    } catch (error) {
      console.error('Error processing CSV:', error)
      toast.error(`Failed to process CSV: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-dark-gray border-2 border-dark-gray/20 dark:border-white/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium uppercase tracking-wider text-dark-gray dark:text-white">
          Bulk Book Upload
        </h3>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-dark-gray dark:bg-white text-white dark:text-dark-gray border-2 border-dark-gray dark:border-white hover:bg-dark-gray/90 dark:hover:bg-white/90 transition-all"
        >
          <Download className="w-4 h-4" />
          Download Template
        </button>
      </div>

      {/* Upload Area */}
      <div className="mb-6">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-dark-gray/30 dark:border-white/30 rounded p-8 text-center cursor-pointer hover:border-dark-gray/50 dark:hover:border-white/50 transition-colors"
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-dark-gray/40 dark:text-white/40" />
          {file ? (
            <div>
              <p className="text-dark-gray dark:text-white font-medium mb-2">{file.name}</p>
              <p className="text-sm text-dark-gray/60 dark:text-white/60">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-dark-gray dark:text-white mb-2">
                Click to select CSV file
              </p>
              <p className="text-sm text-dark-gray/60 dark:text-white/60">
                or drag and drop
              </p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Upload Button */}
      {file && (
        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex-1 px-6 py-3 bg-dark-gray dark:bg-white text-white dark:text-dark-gray border-2 border-dark-gray dark:border-white hover:bg-dark-gray/90 dark:hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium uppercase tracking-wider"
          >
            {uploading ? 'Uploading...' : 'Upload Books'}
          </button>
          <button
            onClick={() => {
              setFile(null)
              setResults(null)
            }}
            className="px-6 py-3 border-2 border-dark-gray/30 dark:border-white/30 text-dark-gray dark:text-white hover:border-dark-gray/50 dark:hover:border-white/50 transition-all text-sm font-medium uppercase tracking-wider"
          >
            Clear
          </button>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="mt-6 p-4 bg-dark-gray/5 dark:bg-white/5 border border-dark-gray/20 dark:border-white/20">
          <h4 className="text-sm font-medium uppercase tracking-wider text-dark-gray dark:text-white mb-3">
            Upload Results
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-dark-gray dark:text-white">
                {results.success} books uploaded successfully
              </span>
            </div>
            {results.failed > 0 && (
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-red-600" />
                <span className="text-dark-gray dark:text-white">
                  {results.failed} books failed
                </span>
              </div>
            )}
          </div>

          {/* Error Details */}
          {results.errors.length > 0 && (
            <div className="mt-4 max-h-40 overflow-y-auto">
              <p className="text-xs uppercase tracking-wider text-dark-gray/60 dark:text-white/60 mb-2">
                Errors:
              </p>
              {results.errors.map((error, index) => (
                <div key={index} className="flex items-start gap-2 text-xs text-red-600 mb-1">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-dark-gray/5 dark:bg-white/5 border border-dark-gray/20 dark:border-white/20">
        <h4 className="text-sm font-medium uppercase tracking-wider text-dark-gray dark:text-white mb-2">
          CSV Format Instructions
        </h4>
        <ul className="text-xs text-dark-gray/70 dark:text-white/70 space-y-1">
          <li>• First row must contain column headers</li>
          <li>• Required fields: title, author</li>
          <li>• Optional fields: pdf_file, audio_file (audiobook URL)</li>
          <li>• Genres: separate multiple genres with semicolons (e.g., "Fiction;Mystery")</li>
          <li>• ID: optional, will auto-generate if not provided</li>
          <li>• Download template for correct format</li>
        </ul>
      </div>
    </div>
  )
}

export default BulkBookUpload
