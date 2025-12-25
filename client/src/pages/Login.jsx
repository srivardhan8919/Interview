import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        const success = await login(username, password);
        if (success) {
            navigate('/');
        } else {
            setError('Invalid credentials');
            setIsLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
            <div className="w-100 fade-in" style={{ maxWidth: '400px' }}>
                <div className="text-center mb-4">
                    <h1 className="h3 mb-2 fw-bold text-primary">Welcome back</h1>
                    <p className="text-secondary">Sign in to continue your interview prep</p>
                </div>

                <div className="card-google p-4 p-md-5">
                    {error && <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="form-label small fw-medium text-secondary mb-1">Username</label>
                            <input
                                type="text"
                                className="input-google"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Enter your username"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="form-label small fw-medium text-secondary mb-1">Password</label>
                            <input
                                type="password"
                                className="input-google"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-google w-100 py-2"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-4">
                    <p className="small text-secondary">
                        Don't have an account? <Link to="/signup" className="text-primary fw-medium">Create account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
