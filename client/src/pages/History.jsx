import React, { useEffect, useState } from 'react';
import api from '../api';
import { jsPDF } from 'jspdf';
import { useNavigate } from 'react-router-dom';

const History = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await api.get('/sessions');
                setSessions(res.data);
            } catch (error) {
                console.error("Failed to fetch sessions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, []);

    const downloadPDF = (e, session) => {
        e.stopPropagation();
        const doc = new jsPDF();

        // Header
        doc.setFillColor(59, 130, 246); // Primary blue
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text("InterviewAce Report", 20, 20);

        doc.setFontSize(10);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 30);

        // Metadata
        doc.setTextColor(0, 0, 0);
        let y = 50;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Role:`, 20, y);
        doc.setFont("helvetica", "normal");
        doc.text(session.role, 50, y);

        y += 7;
        doc.setFont("helvetica", "bold");
        doc.text(`Difficulty:`, 20, y);
        doc.setFont("helvetica", "normal");
        doc.text(session.difficulty, 50, y);

        y += 7;
        doc.setFont("helvetica", "bold");
        doc.text(`Date:`, 20, y);
        doc.setFont("helvetica", "normal");
        doc.text(new Date(session.date).toLocaleString(), 50, y);

        y += 7;
        doc.setFont("helvetica", "bold");
        doc.text(`Overall Score:`, 20, y);
        doc.setFont("helvetica", "normal");
        doc.text(`${session.score}/10`, 50, y);

        y += 15;
        doc.line(20, y, 190, y);
        y += 10;

        // Content Loop
        if (session.data) {
            session.data.forEach((item, index) => {
                if (y > 250) {
                    doc.addPage();
                    y = 20;
                }

                // Question
                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.setTextColor(31, 41, 55);
                const qLines = doc.splitTextToSize(`Q${index + 1}: ${item.question}`, 170);
                doc.text(qLines, 20, y);
                y += qLines.length * 5 + 3;

                // Answer
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.setTextColor(75, 85, 99);
                const aPrefix = "Your Answer: ";
                const aLines = doc.splitTextToSize(aPrefix + (item.answer || "(No answer)"), 170);
                doc.text(aLines, 20, y);
                y += aLines.length * 5 + 3;

                // Feedback metrics
                doc.setFontSize(9);
                doc.setTextColor(59, 130, 246);
                const metrics = `Clarity: ${item.feedback.clarity}/10 | Pace: ${item.feedback.pace}wpm | Fillers: ${item.feedback.fillers}`;
                doc.text(metrics, 20, y);
                y += 5;

                // Detailed Feedback
                doc.setFont("helvetica", "italic");
                doc.setTextColor(16, 185, 129);
                const fLines = doc.splitTextToSize(`Feedback: ${item.feedback.feedback}`, 170);
                doc.text(fLines, 20, y);

                y += fLines.length * 4 + 10;
            });
        }

        // Summary / Footer
        if (y > 250) {
            doc.addPage();
            y = 20;
        }
        y += 5;
        doc.setDrawColor(200);
        doc.line(20, y, 190, y);
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("Summary & Suggestions", 20, y);
        y += 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const summaryText = "Review your clarity scores and pacing trends. Consistent practice with focusing on 'Clarity' feedback will help improve your overall interview presence.";
        const sLines = doc.splitTextToSize(summaryText, 170);
        doc.text(sLines, 20, y);

        doc.save(`InterviewAce_Report_${new Date(session.date).toISOString().split('T')[0]}.pdf`);
    };

    if (loading) return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-body">
            <div className="spinner-border text-primary" role="status"></div>
        </div>
    );

    return (
        <div className="container-narrow section-spacing fade-in">
            <div className="d-flex align-items-center justify-content-between mb-5">
                <div>
                    <h1 className="h3 fw-bold text-primary mb-1">Session History</h1>
                    <p className="text-secondary mb-0">Review your past interviews and track your progress</p>
                </div>
            </div>

            {sessions.length === 0 ? (
                <div className="text-center py-5 border rounded-3 bg-white border-dashed">
                    <div className="mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                    <h4 className="h5 fw-bold text-secondary">No sessions yet</h4>
                    <p className="text-secondary mb-4">Start your first interview to see it here.</p>
                    <button className="btn btn-google" onClick={() => navigate('/')}>Start Interview</button>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {sessions.map(session => (
                        <div
                            key={session.id}
                            className="card-google p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 cursor-pointer card-hover"
                            onClick={() => navigate('/report', { state: { session } })}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="d-flex align-items-start gap-3">
                                <div className="d-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-circle mt-1" style={{ width: '48px', height: '48px', minWidth: '48px' }}>
                                    <span className="fw-bold">{session.score}</span>
                                </div>
                                <div>
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <h5 className="mb-0 fw-bold fs-5 text-primary">{session.role}</h5>
                                        <span className={`badge badge-soft ${session.difficulty === 'Hard' ? 'badge-warning' : session.difficulty === 'Medium' ? 'badge-info' : 'badge-success'}`}>
                                            {session.difficulty}
                                        </span>
                                    </div>
                                    <div className="text-secondary small">
                                        {new Date(session.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        {' • '}
                                        {new Date(session.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex align-items-center gap-3 align-self-end align-self-md-center">
                                <button className="btn btn-sm btn-google-outline d-flex align-items-center gap-2" onClick={(e) => downloadPDF(e, session)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                    PDF
                                </button>
                                <button className="btn btn-sm btn-light text-primary fw-medium rounded-pill px-3">
                                    View Details →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;
