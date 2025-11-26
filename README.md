<!-- @format -->

# NextChapter

## 🚀 Overview

NextChapter is a modern digital library platform that revolutionizes online reading. Users can explore, read, and manage their book collections with **AI-powered recommendations, content moderation, personalized reading experiences, and comprehensive analytics**. Built with a focus on user experience, accessibility, and scalability.

---

## ✨ Features

### � Cmore Features
- 🔍 **Advanced Search & Filters** – Find books by title, author, genre, language, and rating
- 📖 **Built-in PDF Reader** – Read books directly in the browser with PDF.js integration
- 🎨 **Dark/Light Theme** – Seamless theme switching with persistent preferences
- 📱 **Fully Responsive** – Optimized for desktop, tablet, and mobile devices
- 🔐 **Authentication System** – Secure sign-up/sign-in with OAuth support (Google, GitHub)

### 🤖 AI-Powered Features
- **AI Content Moderation** – Groq-powered moderation for user-generated content
- **Personalized Recommendations** – Smart book suggestions based on reading preferences
- **Genre-Based Discovery** – Curated book collections by genre

### � User Dashboard
- **Reading Statistics** – Track books read, pages completed, and reading time
- **Reading Activity** – Visual charts showing daily/weekly reading patterns
- **Monthly Progress** – Monitor reading goals and achievements
- **Reading Challenge** – Set and track annual reading goals
- **Currently Reading** – Quick access to books in progress
- **Pinned Books** – Bookmark favorite books for easy access
- **Genre Preferences** – Customize reading recommendations

### 👨‍💼 Admin Features
- **Book Management** – Add, edit, and delete books
- **Bulk Upload** – Upload multiple books via CSV with cover images and PDFs
- **User Management** – View and manage user accounts
- **Analytics Dashboard** – Track platform usage and statistics

### 📖 Reading Experience
- **Reading Lists** – Organize books into custom lists
- **Already Read** – Track completed books
- **Trending Books** – Discover popular titles
- **Highest Rated** – Browse top-rated books
- **New Releases** – Stay updated with latest additions
- **Word Meaning Search** – Built-in dictionary for vocabulary lookup

### 🎯 Additional Features
- **Subscription System** – Premium membership with Razorpay integration
- **Profile Management** – Customize user profiles and preferences
- **Contact & Support** – User support and feedback system
- **Legal Pages** – Privacy policy, terms of service, refunds, and shipping info
- **Custom Cursor** – Enhanced UI interactions
- **Error Boundaries** – Graceful error handling
- **Loading States** – Smooth loading animations

---

## 🛠️ Tech Stack

### Frontend
- **React 18** – Modern UI library with hooks
- **Vite** – Lightning-fast build tool and dev server
- **Tailwind CSS 4** – Utility-first CSS framework
- **Framer Motion** – Smooth animations and transitions
- **React Router DOM** – Client-side routing
- **Lucide React** – Beautiful icon library
- **Recharts** – Data visualization for analytics
- **PDF.js** – PDF rendering in browser
- **Socket.io Client** – Real-time features
- **React Toastify** – Toast notifications

### Backend & Services
- **Supabase** – Backend-as-a-Service (Database, Auth, Storage)
- **FastAPI (Python)** – AI moderation service
- **Groq API** – AI-powered content moderation

### Development Tools
- **FingerprintJS** – Device fingerprinting
- **DOMPurify** – XSS protection
- **date-fns** – Date manipulation
- **Razorpay** – Payment gateway integration

### Deployment
- **Vercel** – Frontend hosting
- **Render** – Backend AI service hosting

---

## 📂 Project Structure

```bash
NextChapter-React/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── dashboard/     # Dashboard-specific components
│   │   │   ├── Admin.jsx      # Admin panel
│   │   │   ├── BulkUploadModal.jsx  # Bulk book upload
│   │   │   ├── Header.jsx     # Navigation header
│   │   │   ├── HeroSection.jsx
│   │   │   ├── BookSection.jsx
│   │   │   ├── PdfViewer.jsx  # PDF reader
│   │   │   ├── Reader.jsx     # Book reader
│   │   │   └── ...
│   │   ├── pages/             # Page components
│   │   │   ├── LandingPage.jsx
│   │   │   ├── BooksPage.jsx
│   │   │   ├── BookDetailPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── ExploreBooksPage.jsx
│   │   │   ├── ReadingListPage.jsx
│   │   │   ├── SignInPage.jsx
│   │   │   └── ...
│   │   ├── contexts/          # React contexts
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── useRazorpay.js
│   │   ├── lib/               # Utility functions
│   │   │   ├── supabaseClient.js
│   │   │   ├── bookUtils.js
│   │   │   ├── dashboardUtils.js
│   │   │   ├── errorHandler.js
│   │   │   └── ...
│   │   ├── services/          # API services
│   │   │   └── moderation/
│   │   ├── pdf/               # PDF utilities
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/                # Static assets
│   │   ├── books-data.json
│   │   ├── bulk-upload-template.csv
│   │   ├── pdfs/
│   │   └── pdfjs/
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── backendAI/                  # Python AI service
│   ├── main.py                # FastAPI server
│   ├── requirements.txt
│   ├── render.yaml
│   └── Setup_AI_Moderation.md
├── documentation/              # Project documentation
│   ├── elicitation/
│   ├── EPICS.md
│   ├── user-stories.md
│   └── sprints.md
├── gallery/                    # Screenshots & media
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ (for AI moderation service)
- Supabase account
- Groq API key (for AI moderation)

### Frontend Setup

#### 1. Clone the repository
```bash
git clone https://github.com/Prasanna-Gupta/NextChapter.git
cd NextChapter-React/frontend
```

#### 2. Install dependencies
```bash
npm install
```

#### 3. Set up environment variables
Create a `.env` file in the `frontend` directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

#### 4. Run development server
```bash
npm run dev
```

#### 5. Open in browser
```
http://localhost:5173
```

### Backend AI Setup (Optional)

#### 1. Navigate to backend directory
```bash
cd backendAI
```

#### 2. Create virtual environment
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### 3. Install dependencies
```bash
pip install -r requirements.txt
```

#### 4. Set up environment variables
Create a `.env` file in the `backendAI` directory:
```env
GROQ_API_KEY=your_groq_api_key_here
PORT=8000
```

#### 5. Run the AI service
```bash
python -m uvicorn main:app --reload
```

The AI moderation service will be available at `http://localhost:8000`

---

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend AI
- `python -m uvicorn main:app --reload` - Start AI service with hot reload
- Access API docs at `http://localhost:8000/docs`

---

## 🎨 Design Philosophy

NextChapter follows a clean, modern design approach:
- **Minimalist Interface** – Focus on content, not clutter
- **Cream & Coral Color Scheme** – Warm, inviting aesthetic
- **Dark Mode Support** – Reduce eye strain for night reading
- **Smooth Animations** – Framer Motion for delightful interactions
- **Responsive Layout** – Seamless experience across all devices
- **Accessibility First** – WCAG compliant design patterns

[View Figma Prototype](https://www.figma.com/design/1hZPTeSGErMWfbfgiuGxFP/NextChapter?node-id=261-76&t=6hj7PHXcodaAcMU4-1)

---

## �️ Dat abase Schema (Supabase)

### Tables
- **books** - Book catalog with metadata, cover images, and PDF files
- **users** - User accounts and profiles
- **reading_progress** - Track user reading progress
- **reading_lists** - User-created book lists
- **subscriptions** - Premium membership data
- **user_preferences** - Personalization settings

### Storage Buckets
- **covers** - Book cover images
- **pdfs** - Book PDF files

## 🎯 Key Features Explained

### Bulk Upload Books
Admins can upload multiple books at once using a CSV file:
1. Download the CSV template from the admin panel
2. Fill in book details (title, author, description, genres, etc.)
3. Add `cover_filename` and `pdf_filename` columns
4. Upload the CSV along with corresponding image and PDF files
5. System automatically matches files by name and uploads to Supabase

### AI Content Moderation
- Powered by Groq API for real-time content analysis
- Moderates user comments, reviews, and feedback
- Flags inappropriate content automatically
- FastAPI backend service deployed on Render

### Reading Analytics
- Tracks reading time, pages read, and books completed
- Visual charts using Recharts
- Monthly and yearly progress tracking
- Reading streak and challenge features

### Personalization
- Genre preference selection
- AI-powered book recommendations
- Customized book discovery based on reading history
- Trending and highest-rated book suggestions

---

## 🔒 Security Features

- **XSS Protection** - DOMPurify sanitization
- **Authentication** - Supabase Auth with OAuth
- **Device Fingerprinting** - FingerprintJS for security
- **Error Boundaries** - Graceful error handling
- **Input Validation** - Pydantic models for API validation

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy the dist/ folder to Vercel
```

### Backend AI (Render)
- Uses `render.yaml` for configuration
- Automatic deployment from GitHub
- Environment variables configured in Render dashboard

## 📸 Screenshots

### Landing Page
![Landing Page](./gallery/LandindPage.png)

### Authentication
![Authentication](./gallery/Authentication.png)

### Personalization
![Personalization](./gallery/Personalization.png)

### Figma Prototype
[View Figma Design](https://www.figma.com/design/1hZPTeSGErMWfbfgiuGxFP/NextChapter?node-id=261-76&t=6hj7PHXcodaAcMU4-1)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License

## 👥 Team

Developed by the NextChapter team

## 📞 Support

For support, email support@nextchapter.com or open an issue in the repository.

---

**Built with ❤️ using React, Vite, Tailwind CSS, and Supabase**
