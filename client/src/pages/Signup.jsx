import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import CursorEffect from '../components/CursorEffect';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });
    const [showSuccess, setShowSuccess] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    // Check password requirements
    useEffect(() => {
        setPasswordRequirements({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*]/.test(password)
        });
    }, [password]);

    const allRequirementsMet = Object.values(passwordRequirements).every(req => req);

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!allRequirementsMet) {
            setError('Please meet all password requirements');
            return false;
        }

        setIsLoading(true);
        setError('');

        try {
            const success = await signup(username, password);
            if (success) {
                setShowSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError('Username might be taken or invalid');
            }
        } catch (err) {
            console.error('Signup error:', err);
            setError('Username might be taken or invalid');
        } finally {
            setIsLoading(false);
        }

        return false;
    };

    if (showSuccess) {
        return (
            <div className="auth-container">
                <CursorEffect />
                <div className="auth-success-screen">
                    <div className="auth-success-content fade-in-up">
                        <div className="auth-success-icon">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <h2 className="auth-success-title">Account Created!</h2>
                        <p className="auth-success-text">Redirecting you to login...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <CursorEffect />

            {/* Left Side - Visual Content */}
            <div className="auth-visual">
                <div className="auth-visual-content">
                    <div className="floating-particles">
                        <div className="particle"></div>
                        <div className="particle"></div>
                        <div className="particle"></div>
                        <div className="particle"></div>
                        <div className="particle"></div>
                    </div>
                    <div className="auth-brand fade-in-up">
                        <h1 className="auth-brand-title">Start Your Journey</h1>
                        <p className="auth-brand-subtitle">Join thousands mastering their interview skills</p>
                        <div className="auth-features">
                            <div className="auth-feature">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                <span>Practice with AI</span>
                            </div>
                            <div className="auth-feature">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                <span>Get Instant Feedback</span>
                            </div>
                            <div className="auth-feature">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                <span>Land Your Dream Job</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="auth-form-container">
                <div className="auth-form-wrapper fade-in">
                    <div className="auth-form-header">
                        <h2 className="auth-form-title">Create Account</h2>
                        <p className="auth-form-subtitle">Start your interview prep journey today</p>
                    </div>

                    {error && (
                        <div className="auth-alert auth-alert-error slide-down">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form" noValidate>
                        <div className="auth-input-group">
                            <label className="auth-label">Username</label>
                            <div className="auth-input-wrapper">
                                <svg className="auth-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <input
                                    type="text"
                                    className="auth-input"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    placeholder="Choose a username"
                                    minLength="3"
                                />
                                {username.length >= 3 && (
                                    <svg className="auth-input-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                )}
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label className="auth-label">Password</label>
                            <div className="auth-input-wrapper">
                                <svg className="auth-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="auth-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Choose a strong password"
                                    minLength="8"
                                />
                                <button
                                    type="button"
                                    className="auth-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Password requirements */}
                            {password && (
                                <div className="password-requirements">
                                    <div className="requirement-item">
                                        <span className={`requirement-check ${passwordRequirements.length ? 'valid' : ''}`}>
                                            {passwordRequirements.length ? '✓' : '○'}
                                        </span>
                                        <span>At least 8 characters</span>
                                    </div>
                                    <div className="requirement-item">
                                        <span className={`requirement-check ${passwordRequirements.uppercase ? 'valid' : ''}`}>
                                            {passwordRequirements.uppercase ? '✓' : '○'}
                                        </span>
                                        <span>One uppercase letter (A-Z)</span>
                                    </div>
                                    <div className="requirement-item">
                                        <span className={`requirement-check ${passwordRequirements.lowercase ? 'valid' : ''}`}>
                                            {passwordRequirements.lowercase ? '✓' : '○'}
                                        </span>
                                        <span>One lowercase letter (a-z)</span>
                                    </div>
                                    <div className="requirement-item">
                                        <span className={`requirement-check ${passwordRequirements.number ? 'valid' : ''}`}>
                                            {passwordRequirements.number ? '✓' : '○'}
                                        </span>
                                        <span>One number (0-9)</span>
                                    </div>
                                    <div className="requirement-item">
                                        <span className={`requirement-check ${passwordRequirements.special ? 'valid' : ''}`}>
                                            {passwordRequirements.special ? '✓' : '○'}
                                        </span>
                                        <span>One special character (!@#$%^&*)</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={isLoading || !allRequirementsMet}
                        >
                            {isLoading ? (
                                <>
                                    <div className="auth-spinner"></div>
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>Already have an account?</span>
                    </div>

                    <Link to="/login" className="auth-link">
                        Sign in instead
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
