import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed-top bg-surface border-bottom" style={{ zIndex: 9999 }}>
            <div className="container-fluid px-4 py-3">
                <div className="d-flex justify-content-between align-items-center">
                    {/* Brand */}
                    <Link
                        className="text-decoration-none d-flex align-items-center gap-2"
                        to="/"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        <div
                            className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                            style={{ width: '32px', height: '32px', background: 'var(--primary-color)' }}
                        >
                            I
                        </div>
                        <span className="fw-bold fs-5 tracking-tight">InterviewAce</span>
                    </Link>

                    {/* Mobile Toggle */}
                    <button
                        className="navbar-toggler d-lg-none border-0 p-2"
                        type="button"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <span className="navbar-toggler-icon" style={{ backgroundImage: 'none' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </span>
                    </button>

                    {/* Desktop Menu */}
                    <div className="d-none d-lg-flex align-items-center gap-4">
                        {user ? (
                            <>
                                <Link
                                    className={`text-decoration-none fw-medium ${isActive('/history') ? 'text-primary' : 'text-secondary'}`}
                                    to="/history"
                                >
                                    History
                                </Link>
                                <div className="d-flex align-items-center gap-3 ms-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center bg-secondary text-primary fw-bold"
                                            style={{ width: '32px', height: '32px', fontSize: '14px' }}
                                        >
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="btn btn-sm btn-google-outline border-0 text-secondary"
                                        style={{ padding: '0.4rem 0.8rem' }}
                                    >
                                        Log out
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="d-flex gap-3">
                                <Link className="btn btn-google-outline border-0" to="/login">Sign in</Link>
                                <Link className="btn btn-google" to="/signup">Get Started</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Content */}
                {isMenuOpen && (
                    <div className="d-lg-none pt-3 pb-2 border-top mt-3 fade-in">
                        {user ? (
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex align-items-center gap-2 px-2 text-secondary">
                                    <div className="rounded-circle d-flex align-items-center justify-content-center bg-secondary" style={{ width: '28px', height: '28px' }}>
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="fw-medium">{user.username}</span>
                                </div>
                                <Link className="nav-link px-2 text-primary" to="/history">History</Link>
                                <button onClick={handleLogout} className="btn btn-link text-decoration-none text-secondary px-2 text-start">Log out</button>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-2">
                                <Link className="btn btn-light w-100 text-start" to="/login">Sign in</Link>
                                <Link className="btn btn-primary w-100" to="/signup">Get Started</Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
