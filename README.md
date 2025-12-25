# InterviewAce - AI Mock Interview Simulator

InterviewAce is a comprehensive, full-stack web application designed to help users prepare for software engineering interviews. It acts as an AI-powered mock interview coach, offering realistic technical and behavioral questions, real-time speech feedback, and detailed performance analysis.

## 🚀 Features

*   **AI-Powered Interviews**: Generates dynamic questions based on selected roles and difficulty levels (using Gemini AI).
*   **Real-time Interaction**:
    *   **Speech-to-Text (STT)**: Transcribes your verbal answers tailored for browser-native performance.
    *   **Text-to-Speech (TTS)**: Reads questions aloud for a realistic interview experience.
*   **Instant Feedback**:
    *   Analysis of answer content, technical accuracy, and STAR method usage.
    *   Fluency tracking (filler words counting, pace estimation).
*   **3D Visual Experience**: Immersive interface elements using Three.js ($`@react-three/fiber`).
*   **Progress Tracking**: Save and review past interview sessions.
*   **Reports**: Download detailed interview reports as PDFs.
*   **User Authentication**: Secure signup and login to save progress across devices.

## 🛠️ Tech Stack

### Frontend (`/client`)
*   **Framework**: [React](https://react.dev/) (via [Vite](https://vitejs.dev/))
*   **Styling**: [Bootstrap 5](https://getbootstrap.com/)
*   **Routing**: React Router DOM
*   **3D Graphics**: Three.js & React Three Fiber
*   **State/Data**: Axios for API requests
*   **Utilities**: `jspdf` (PDF generation), `react-markdown` (Formatting AI responses)

### Backend (`/server`)
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: SQLite3 (`interviewace.db`)
*   **Authentication**: JWT (JSON Web Tokens) & Bcrypt
*   **Environment**: Dotenv

## 📋 Prerequisites

*   **Node.js** (v18+ recommended)
*   **npm** (Node Package Manager)
*   **API Keys**: You may need API keys for **Google Gemini** and **Groq** services.

## ⚙️ Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd Coach
    ```

2.  **Setup Backend**
    ```bash
    cd server
    npm install
    # Create a .env file with your secrets (PORT, JWT_SECRET, etc.)
    npm start
    ```
    *The server usually runs on `http://localhost:3000` (or as configured).*

3.  **Setup Frontend**
    Open a new terminal:
    ```bash
    cd client
    npm install
    npm run dev
    ```
    *The client will typically start on `http://localhost:5173`.*

## 📖 Usage Guide

1.  **Register/Login**: Create an account to save your history.
2.  **Configure API Keys**: Enter your Gemini/Groq keys in the settings if required by the app instantiation.
3.  **Start Interview**:
    *   Select a **Role** (e.g., Frontend Dev, Python Engineer).
    *   Select **Difficulty** (Easy, Medium, Hard).
4.  **The Interview**:
    *   Listen to the question.
    *   Speak your answer clearly (ensure microphone permissions are allowed).
    *   Receive instant AI feedback.
5.  **Review**: Check your session report and download it as user helpful PDF.

## 📂 Project Structure

```
Coach-main/
├── client/                 # Frontend React Application
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── pages/          # Application Pages/Views
│   │   ├── App.jsx         # Main Component
│   │   └── main.jsx        # Entry Point
│   ├── index.html
│   └── vite.config.js
│
├── server/                 # Backend Node.js API
│   ├── routes/             # API Route Definitions
│   ├── db.js               # Database Connection (SQLite)
│   ├── server.js           # Express App Entry Point
│   └── interviewace.db     # SQLite Database File
│
└── README.md               # Project Documentation
```

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

---
*Built with ❤️ for aspiring engineers.*
