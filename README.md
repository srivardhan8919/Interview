<div align="center">

# 🎯 InterviewAce

### AI-Powered Mock Interview Simulator

[![Made with React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

*Master your interview skills with AI-powered practice sessions, real-time feedback, and comprehensive performance analytics.*

[Features](#-features) • [Quick Start](#-quick-start) • [Tech Stack](#-tech-stack) • [Deployment](#-deployment)

</div>

---

## ✨ Features

### 🤖 AI-Powered Interviews
- **Dynamic Question Generation** — Tailored technical and behavioral questions using Google Gemini AI
- **Multiple Roles** — Frontend, Backend, Full Stack, DevOps, Data Science, ML, Python, Java, Managerial, HR
- **Difficulty Levels** — Easy, Medium, Hard with strict validation to ensure appropriate complexity

### 🎙️ Real-Time Speech Interaction
- **Speech-to-Text** — Browser-native transcription of your verbal answers
- **Text-to-Speech** — Questions read aloud for realistic interview simulation
- **Manual Input** — Fallback text input if microphone unavailable

### 📊 Comprehensive Feedback
- **AI Analysis** — Detailed evaluation using Groq LLM (Llama 3.3 70B)
- **Per-Question Breakdown** — What you did well, what was missing, guidance for strong answers
- **Focus Areas** — Actionable improvement suggestions

### 🎨 Premium Experience
- **3D Visual Avatar** — Interactive Three.js animated sphere responds during interviews
- **Modern UI** — Clean, responsive design with smooth animations
- **PDF Reports** — Download detailed session reports with full transcript

### 📈 Progress Tracking
- **Session History** — All past interviews saved to your account
- **Report Review** — Revisit any session's detailed feedback
- **Secure Authentication** — JWT-based auth with bcrypt password hashing

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **PostgreSQL** database (local or cloud like [Neon](https://neon.tech))
- **API Keys**: [Google Gemini](https://ai.google.dev/) and [Groq](https://groq.com/)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/interviewace.git
cd interviewace
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

Start the server:
```bash
npm start
```

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🛠️ Tech Stack

### Frontend (`/client`)
| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **Vite 7** | Build Tool |
| **React Router 7** | Client-side Routing |
| **Three.js** + **React Three Fiber** | 3D Avatar Animation |
| **Bootstrap 5** | Responsive Styling |
| **Axios** | API Communication |
| **jsPDF** | PDF Report Generation |
| **React Markdown** | AI Response Rendering |

### Backend (`/server`)
| Technology | Purpose |
|------------|---------|
| **Node.js** + **Express 5** | REST API Server |
| **PostgreSQL** + **pg** | Database |
| **JWT** + **bcrypt** | Authentication |
| **Google Gemini** | Question Generation |
| **Groq SDK** | Report Analysis (Llama 3.3) |

---

## 📂 Project Structure

```
interviewace/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI Components
│   │   │   ├── Avatar.jsx     # 3D Animated Sphere
│   │   │   ├── CursorEffect.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── SplashScreen.jsx
│   │   ├── pages/             # Application Views
│   │   │   ├── Dashboard.jsx  # Home / Session Config
│   │   │   ├── InterviewSession.jsx
│   │   │   ├── Report.jsx     # Results & PDF Export
│   │   │   ├── History.jsx    # Past Sessions
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── context/           # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── api.js             # Axios Configuration
│   │   ├── App.jsx
│   │   └── index.css
│   └── vite.config.js
│
├── server/                    # Express Backend
│   ├── routes/
│   │   ├── ai.js              # Gemini/Groq Integration
│   │   ├── auth.js            # JWT Authentication
│   │   ├── sessions.js        # Session CRUD
│   │   └── health.js          # Health Check
│   ├── data/
│   │   └── staticQuestions.js # HR/Managerial Question Bank
│   ├── db.js                  # PostgreSQL Connection
│   └── server.js              # Express Entry Point
│
├── .gitignore
└── README.md
```

---

## 🌐 Deployment

### Deploy to Render

#### Step 1: Deploy Backend (Web Service)
1. Create new **Web Service** on Render
2. Connect your repository
3. Configure:
   - **Name**: `interviewace-api` (or your choice)
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables:
   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | Your Neon PostgreSQL connection string |
   | `JWT_SECRET` | A secure random string |
   | `GEMINI_API_KEY` | Your Google Gemini API key |
   | `GROQ_API_KEY` | Your Groq API key |

5. Deploy and **copy your backend URL** (e.g., `https://interviewace-api.onrender.com`)

#### Step 2: Deploy Frontend (Static Site)
1. Create new **Static Site** on Render
2. Connect your repository
3. Configure:
   - **Name**: `interviewace` (or your choice)
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add environment variable:
   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | `https://YOUR-BACKEND-URL.onrender.com/api` |
   
   > ⚠️ **Important**: Include `/api` at the end of the backend URL!

5. Deploy - your app is now live!

---

## 📖 Usage

1. **Create Account** — Sign up to save your progress
2. **Select Role** — Choose from 11 different interview types
3. **Set Difficulty** — Easy (basics), Medium (application), Hard (mastery)
4. **Start Interview** — 5 AI-generated questions per round
5. **Speak Answers** — Use microphone or type manually
6. **Get Feedback** — Instant analysis after each answer
7. **Review Report** — Download PDF with full transcript and coaching

---

## 🔐 Environment Variables

### Backend (`server/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for JWT token signing |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `GROQ_API_KEY` | Yes | Groq API key |
| `DB_SSL` | No | Set to `true` for SSL connections |
| `FRONTEND_URL` | No | Lock CORS to specific domain (optional security) |

### Frontend (Render Environment)
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes (prod) | Full backend URL with `/api` suffix |

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for aspiring engineers**

[⬆ Back to Top](#-interviewace)

</div>
