<!-- @format -->

# NextChapter

## 🚀 Overview

An online bookstore that redefines digital reading. Users can explore, purchase, and read books online, with **AI-driven recommendations, intelligent summaries, and multimedia-enhanced reading experiences**. Designed for a seamless, modern user experience with a scalable architecture.

---

## ✨ Features

- 🔍 **Smart Search** – Find books instantly with advanced filters
- 🤖 **AI Recommendations** – Personalized book suggestions
- 📖 **Online Reading Mode** – Elegant, distraction-free reader
- 📝 **AI Summaries & Insights** – Quick takeaways for faster learning
- 🎥 **Interactive Content** – Multimedia elements for engaging reading
- 🧾 **User Library** – Save and manage your collection across devices
- **Landing Page** with hero section and book categories
- **Responsive Design** optimized for mobile and desktop
- **Framer Motion** for smooth animations

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS (clean, responsive UI)
- **Backend**: Node.js / Express (REST APIs)
- **Database**: Supabase / MongoDB / Firebase
- **AI Integration**: NLP models for recommendations & summaries
- **Animation**: Framer Motion
- **Deployment**: Vercel / Netlify (frontend), Render / Heroku (backend)

---

## 📂 Project Structure

```bash
.
├── frontend/        # React app (React + Vite + Tailwind)
├── backendWeb/      # Node.js API
├── backendAI/       # Python LLM Integration
├── docs/            # Documentation & designs
└── README.md
```

### React Frontend Structure

```
NextChapter-React/
├── src/
│   ├── components/        # Reusable components
│   │   ├── Header.jsx
│   │   ├── HeroSection.jsx
│   │   └── BookSection.jsx
│   ├── pages/            # Page components
│   │   └── LandingPage.jsx
│   ├── lib/              # Utilities
│   │   └── supabaseClient.js
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
└── package.json         # Dependencies
```

---

## ⚡ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Prasanna-Gupta/NextChapter.git
cd NextChapter
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

- Copy `.env.example` to `.env`
- Add your Supabase credentials:
  ```
  VITE_SUPABASE_URL=your_supabase_project_url
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
  ```

### 4. Run development server

```bash
npm run dev
```

### 5. Open in browser

```
http://localhost:5173
```

---

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

---

## 🎨 Design

The landing page is designed based on the Figma prototype:
- Clean, modern interface
- Cream and coral color scheme
- Featured hero section
- Book categories (Comedy, Thriller, etc.)

[Figma File](https://www.figma.com/design/1hZPTeSGErMWfbfgiuGxFP/NextChapter?node-id=261-76&t=6hj7PHXcodaAcMU4-1)

<video width="600" controls>
  <source src="./gallery/figmauiPrototype.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

---

## 📝 Next Steps

- [ ] Set up Supabase database tables
- [ ] Implement authentication (login/signup)
- [ ] Create personalization flow
- [ ] Add book search functionality
- [ ] Integrate with Supabase for real book data

---

## 🤝 Contributing

Feel free to contribute to this project!

## 📄 License

MIT License
