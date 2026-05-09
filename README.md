<div align="center">

<img src="public/favicon.svg" alt="Habitfy Logo" width="80" height="80" />

# Habitfy

**Track habits. Manage finances. Journal your journey.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-habitfy--teal.vercel.app-green?style=for-the-badge&logo=vercel)](https://habitfy-teal.vercel.app)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)

</div>

---

## 📖 About

Habitfy is a personal productivity web app that helps you build better habits, track your daily progress, manage your monthly budget, and reflect through journaling — all in one clean interface.

---

## ✨ Features

- 🗓️ **Habit Tracker** — Add habits, mark daily completions, and visualize your monthly progress on a calendar grid
- 🔥 **Streak Tracking** — Stay motivated with current and longest streak counters
- 📊 **Progress Chart** — See your habit completion trends over time with an interactive graph
- 💰 **Finance Manager** — Set a monthly budget, log expenses by category, and track spending with a bar chart
- 📓 **Journal** — Write daily notes and reflections
- 🔐 **Authentication** — Secure login and signup powered by Supabase Auth
- 📱 **Responsive Design** — Works seamlessly on mobile and desktop

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | CSS (custom) |
| Backend / Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| Charts | Recharts |
| Deployment | Vercel |

---

## 🗄️ Database Schema

```
profiles      — user profile info
habits        — user-created habits
habit_logs    — daily habit completion records
streaks       — current and longest streaks per habit
budgets       — monthly budget per user
expenses      — expense entries with category and amount
journal       — daily journal entries
tasks         — user tasks
```

> All tables have **Row Level Security (RLS)** enabled — users can only access their own data.

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- A [Supabase](https://supabase.com) account and project

### 1. Clone the repository

```bash
git clone https://github.com/rajvardhan-here/habitfy.git
cd habitfy
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

### 4. Run locally

```bash
npm run dev
```

Open ( http://localhost:5173 ) in your browser.

### 5. Build for production

```bash
npm run build
```

---

## 🌐 Deployment

This project is deployed on **Vercel**.

To deploy your own instance:

1. Fork this repository
2. Import it into [Vercel] (https://vercel.com)
3. Add your environment variables in Vercel → Project Settings → Environment Variables
4. Deploy!

---

## 🔐 Security

- All database tables are protected with **Row Level Security (RLS)**
- Users can only read and write their own data
- Authentication is handled by Supabase Auth (JWT-based)
- Environment variables are never committed to the repository

---

## 📁 Project Structure

```
habitfy/
├── public/             # Static assets
├── src/
│   ├── assets/         # Images and icons
│   ├── components/     # Reusable UI components
│   ├── lib/
│   │   └── supabase.js # Supabase client setup
│   └── pages/
│       ├── Dashboard.jsx
│       ├── Finance.jsx
│       ├── HabitTracker.jsx
│       ├── Journal.jsx
│       └── Login.jsx
├── .env                # Local environment variables (not committed)
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Rajvardhan** — [@rajvardhan-here](https://github.com/rajvardhan-here)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  Made with ❤️ by Rajvardhan
</div>
