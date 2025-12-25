import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Dashboard = () => {
    const [role, setRole] = useState('Frontend Developer');
    const [difficulty, setDifficulty] = useState('Medium');
    const [loading, setLoading] = useState(false);
    const [sessions, setSessions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await api.get('/sessions');
            setSessions(res.data);
        } catch (error) {
            console.error("Failed to fetch sessions", error);
        }
    };

    const handleStart = async () => {
        setLoading(true);
        try {
            navigate('/interview', { state: { role, difficulty } });
        } catch (error) {
            console.error("Error starting interview", error);
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        "Frontend Developer", "Backend Developer", "Full Stack Developer",
        "DevOps Engineer", "Product Manager", "Data Scientist",
        "Machine Learning Engineer", "Python Developer", "Java Developer",
        "Managerial", "HR"
    ];

    return (
        <div className="container-narrow section-spacing fade-in">
            {/* Hero Section */}
            <div className="text-center mb-5">
                <h1 className="display-5 fw-bold text-primary mb-3">Master Your Interview</h1>
                <p className="lead text-secondary mx-auto" style={{ maxWidth: '600px' }}>
                    Practice with realistic questions and get instant AI-powered feedback to improve your confidence.
                </p>
            </div>

            {/* Config Card */}
            <div className="card-google p-4 p-md-5 mb-5">
                <h3 className="h4 mb-4 fw-bold text-primary">Start a New Session</h3>

                <div className="row g-4">
                    <div className="col-md-6">
                        <label className="form-label small fw-bold text-secondary text-uppercase tracking-wider">Target Role</label>
                        <select
                            className="form-select form-select-lg input-google"
                            value={role}
                            onChange={e => setRole(e.target.value)}
                            style={{ height: 'auto' }}
                        >
                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label small fw-bold text-secondary text-uppercase tracking-wider">Difficulty Level</label>
                        <div className="d-flex gap-2">
                            {['Easy', 'Medium', 'Hard'].map(level => (
                                <button
                                    key={level}
                                    className={`btn flex-fill py-2 ${difficulty === level ? 'btn-google' : 'btn-google-outline'}`}
                                    onClick={() => setDifficulty(level)}
                                    style={difficulty === level ? {} : { borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-5 text-center">
                    <button
                        className="btn btn-google btn-lg px-5 py-3 rounded-pill shadow-lg"
                        onClick={handleStart}
                        disabled={loading}
                        style={{ minWidth: '200px' }}
                    >
                        {loading ? (
                            <span>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Preparing...
                            </span>
                        ) : (
                            <span className="d-flex align-items-center justify-content-center gap-2">
                                Start Interview
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </span>
                        )}
                    </button>
                    <p className="small text-muted mt-3">
                        AI will generate 5 questions tailored to {role}
                    </p>
                </div>
            </div>

            {/* Recent Sessions */}
            {sessions.length > 0 && (
                <div className="mt-5">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <h3 className="h5 fw-bold text-secondary">Recent Activity</h3>
                        <button className="btn btn-link text-decoration-none small text-primary fw-medium" onClick={() => navigate('/history')}>View all</button>
                    </div>

                    <div className="d-flex flex-column gap-3">
                        {sessions.slice(0, 3).map((s) => (
                            <div
                                key={s.id}
                                className="card-google-static p-4 d-flex align-items-center justify-content-between cursor-pointer card-hover"
                                onClick={() => navigate('/report', { state: { session: s } })}
                                style={{ cursor: 'pointer' }}
                            >
                                <div>
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <h5 className="mb-0 fw-bold fs-6 text-primary">{s.role}</h5>
                                        <span className={`badge badge-soft ${s.difficulty === 'Hard' ? 'badge-warning' : s.difficulty === 'Medium' ? 'badge-info' : 'badge-success'}`}>
                                            {s.difficulty}
                                        </span>
                                    </div>
                                    <small className="text-secondary">
                                        {new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        {' • '}
                                        {new Date(s.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    </small>
                                </div>
                                <div className="text-end">
                                    <span className="btn btn-sm btn-light text-secondary border rounded-pill px-3">View Report</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
