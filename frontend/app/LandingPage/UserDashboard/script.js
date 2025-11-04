import { books } from "./booksdata.js";
const bookGrid = document.getElementById("bookGrid");
const searchBar = document.getElementById("searchBar");
const genreButtons = document.querySelectorAll(".genre-btn");

let activeGenre = "All";

// Render books
function displayBooks(filteredBooks) {
  bookGrid.innerHTML = "";
  if (filteredBooks.length === 0) {
    bookGrid.innerHTML = `<p class="col-span-full text-center text-gray-500">No books found</p>`;
    return;
  }
  filteredBooks.forEach((book, index) => {
    const card = document.createElement("div");
    card.className = "bg-white rounded-xl shadow hover:shadow-md transition p-4 cursor-pointer";
    card.innerHTML = `
  <div class="relative w-full h-80 overflow-hidden rounded-2xl group transform transition-all duration-500 hover:scale-[1.05] hover:shadow-2xl hover:shadow-[#b4512f]/50">
    
    <!-- Book Cover -->
    <img src="${book.cover}" alt="${book.title}" 
         class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-1 group-hover:brightness-75">
    
    <!-- Animated Overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
      <div class="absolute bottom-0 left-0 right-0 p-4 text-white translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
        <h3 class="text-lg font-bold tracking-wide drop-shadow-md">${book.title}</h3>
        <p class="text-sm text-gray-200">${book.author}</p>
        <span class="inline-block mt-2 bg-[#b4512f] text-white text-xs font-semibold px-2 py-1 rounded-full">${book.genre}</span>
      </div>
    </div>

    <!-- Glow Border on Hover -->
    <div class="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#b4512f] group-hover:shadow-[0_0_20px_#b4512f99] transition-all duration-500"></div>
  </div>
`;


    card.addEventListener("click", () => openBookModal(index));
    bookGrid.appendChild(card);
  });
}
displayBooks(books);

// Genre Filter
genreButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    genreButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeGenre = btn.dataset.genre;
    filterBooks();
  });
});

// Search
searchBar.addEventListener("input", filterBooks);
function filterBooks() {
  const query = searchBar.value.toLowerCase();
  const filtered = books.filter(book => {
    const matchesGenre = activeGenre === "All" || book.genre === activeGenre;
    const matchesSearch =
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query);
    return matchesGenre && matchesSearch;
  });
  displayBooks(filtered);
}

// --- Book Modal Logic ---
const bookModal = document.getElementById("bookModal");
const closeModal = document.getElementById("closeModal");
const modalCover = document.getElementById("modalCover");
const modalTitle = document.getElementById("modalTitle");
const modalAuthor = document.getElementById("modalAuthor");
const modalSummary = document.getElementById("modalSummary");
const reviewList = document.getElementById("reviewList");
const addToLibraryBtn = document.getElementById("addToLibrary");
const startReadingBtn = document.getElementById("startReading");

let currentBook = null;

function openBookModal(index) {
  currentBook = books[index];
  modalCover.src = currentBook.cover;
  modalTitle.textContent = currentBook.title;
  modalAuthor.textContent = `by ${currentBook.author}`;
  modalSummary.textContent = currentBook.summary;
  reviewList.innerHTML = currentBook.reviews.map(r => `<li>• ${r}</li>`).join("");
  bookModal.classList.remove("hidden");
}

closeModal.addEventListener("click", () => bookModal.classList.add("hidden"));

// Add to Library
addToLibraryBtn.addEventListener("click", () => {
  alert(`${currentBook.title} has been added to your library!`);
});

// --- eBook Reader Modal ---
const readerModal = document.getElementById("readerModal");
const closeReader = document.getElementById("closeReader");
const ebookFrame = document.getElementById("ebookFrame");

startReadingBtn.addEventListener("click", () => {
  bookModal.classList.add("hidden");
  ebookFrame.src = currentBook.file;
  readerModal.classList.remove("hidden");
});

closeReader.addEventListener("click", () => {
  readerModal.classList.add("hidden");
  ebookFrame.src = "";
});

const userBtn = document.getElementById("userProfileBtn");
const userMenu = document.getElementById("userMenu");

userBtn.addEventListener("click", () => {
  userMenu.classList.toggle("hidden");
});

// --- DOWNLOAD FEATURE ---
const downloadBtn = document.getElementById("downloadBook");
downloadBtn.addEventListener("click", () => {
  if (currentBook && currentBook.file) {
    const link = document.createElement("a");
    link.href = currentBook.file;
    link.download = `${currentBook.title}.pdf`;
    link.click();
  } else {
    alert("Download not available for this book.");
  }
});

// --- READER FEATURES ---
const readerBookTitle = document.getElementById("readerBookTitle");
const progressText = document.getElementById("progressText");
const bookmarkBtn = document.getElementById("bookmarkBtn");
const saveNoteBtn = document.getElementById("saveNoteBtn");
const notesList = document.getElementById("notesList");
const highlightNote = document.getElementById("highlightNote");

let readingProgress = 0;
let bookmarks = [];
let notes = [];

// Track reading progress (simulate scrolling)
ebookFrame.addEventListener("load", () => {
  progressText.textContent = "Progress: 0%";
  ebookFrame.contentWindow.onscroll = () => {
    const scrollTop = ebookFrame.contentWindow.scrollY;
    const scrollHeight = ebookFrame.contentDocument.body.scrollHeight - ebookFrame.clientHeight;
    const progress = Math.min(100, Math.round((scrollTop / scrollHeight) * 100));
    readingProgress = progress;
    progressText.textContent = `Progress: ${progress}%`;
  };
});

// Bookmark page
bookmarkBtn.addEventListener("click", () => {
  bookmarks.push(`Page at ${readingProgress}%`);
  alert(`Bookmarked page at ${readingProgress}%`);
});

// Save notes
saveNoteBtn.addEventListener("click", () => {
  const note = highlightNote.value.trim();
  if (note) {
    notes.push(note);
    const li = document.createElement("li");
    li.textContent = `🖊️ ${note}`;
    notesList.appendChild(li);
    highlightNote.value = "";
  }
});

// --- RATING & REVIEW ---
const ratingStars = document.querySelectorAll("#ratingStars i");
const reviewText = document.getElementById("reviewText");
const submitReview = document.getElementById("submitReview");

let userRating = 0;

ratingStars.forEach(star => {
  star.addEventListener("click", () => {
    userRating = star.dataset.value;
    ratingStars.forEach(s => {
      s.classList.toggle("text-[#b4512f]", s.dataset.value <= userRating);
      s.classList.toggle("text-gray-400", s.dataset.value > userRating);
    });
  });
});

submitReview.addEventListener("click", () => {
  const text = reviewText.value.trim();
  if (!userRating || !text) {
    alert("Please give a rating and write a review.");
    return;
  }

  const li = document.createElement("li");
  li.innerHTML = `⭐ ${userRating}/5 — ${text}`;
  reviewList.appendChild(li);
  reviewText.value = "";
  ratingStars.forEach(s => s.classList.replace("text-[#b4512f]", "text-gray-400"));
  userRating = 0;
  alert("Review submitted successfully!");
});



