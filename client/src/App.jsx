import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import SplashScreen from './components/SplashScreen';
import Login from './pages/Login';
import Signup from './pages/Signup';

import Dashboard from './pages/Dashboard';
import InterviewSession from './pages/InterviewSession';
import Report from './pages/Report';
import History from './pages/History';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

const AppContent = () => {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

    return (
        <div style={{
            paddingTop: isAuthPage ? '0' : '80px',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/interview" element={<ProtectedRoute><InterviewSession /></ProtectedRoute>} />
                <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            </Routes>
        </div>
    );
};

function App() {
    const [showSplash, setShowSplash] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);

    useEffect(() => {
        // Check if splash was already shown this session
        const splashShown = sessionStorage.getItem('splashShown');
        if (!splashShown) {
            setShowSplash(true);
        } else {
            setFadeIn(true);
        }
    }, []);

    const handleSplashComplete = () => {
        sessionStorage.setItem('splashShown', 'true');
        setShowSplash(false);
        setFadeIn(true); // Immediate, no delay
    };

    if (showSplash) {
        return <SplashScreen onComplete={handleSplashComplete} />;
    }

    return (
        <div className={fadeIn ? 'app-fade-in' : ''} style={{ opacity: fadeIn ? undefined : 0 }}>
            <AuthProvider>
                <Router>
                    <Navbar />
                    <AppContent />
                </Router>
            </AuthProvider>
        </div>
    );
}

export default App;

