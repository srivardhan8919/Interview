import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useLocation, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';

const Report = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { session } = location.state || {};
    const reportRef = useRef();

    if (!session) {
        return <div className="text-center mt-5 text-secondary">No session data found. <button className="btn btn-link" onClick={() => navigate('/')}>Go Home</button></div>;
    }

    const downloadPDF = () => {
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
        doc.text(`${session.score ? session.score : 0}/10`, 50, y);

        y += 15;
        doc.line(20, y, 190, y);
        y += 10;

        // Aggregate Summary
        if (session.report) {
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Executive Summary", 20, y);
            y += 7;

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const sumLines = doc.splitTextToSize(session.report.summary || "", 170);
            doc.text(sumLines, 20, y);
            y += sumLines.length * 5 + 10;

            if (session.report.strengths?.length) {
                doc.setFont("helvetica", "bold");
                doc.text("Strengths:", 20, y);
                doc.setFont("helvetica", "normal");
                y += 5;
                session.report.strengths.forEach(s => {
                    doc.text(`- ${s}`, 25, y);
                    y += 5;
                });
                y += 5;
            }

            if (session.report.weaknesses?.length) {
                doc.setFont("helvetica", "bold");
                doc.text("Weaknesses:", 20, y);
                doc.setFont("helvetica", "normal");
                y += 5;
                session.report.weaknesses.forEach(w => {
                    doc.text(`- ${w}`, 25, y);
                    y += 5;
                });
                y += 10;
            }

            doc.line(20, y, 190, y);
            y += 10;
        }

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

                // Feedback Logic
                const explanation = session.report?.question_explanations?.[index];

                if (explanation) {
                    // 1. Well
                    doc.setFont("helvetica", "bold");
                    doc.setTextColor(22, 163, 74); // Green
                    doc.text("What You Did Well:", 20, y);
                    y += 5;
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(0);
                    const wellLines = doc.splitTextToSize(explanation.what_you_did_well, 170);
                    doc.text(wellLines, 20, y);
                    y += wellLines.length * 5 + 5;

                    // 2. Missing
                    doc.setFont("helvetica", "bold");
                    doc.setTextColor(234, 88, 12); // Orange/Red
                    doc.text("What Was Missing:", 20, y);
                    y += 5;
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(0);
                    const missLines = doc.splitTextToSize(explanation.what_was_missing, 170);
                    doc.text(missLines, 20, y);
                    y += missLines.length * 5 + 5;

                    // 3. Guidance
                    doc.setFont("helvetica", "italic");
                    doc.setTextColor(75, 85, 99); // Gray
                    doc.text("How a Strong Answer Sounds:", 20, y);
                    y += 5;
                    doc.setFont("helvetica", "normal");
                    const guideLines = doc.splitTextToSize(explanation.strong_answer_guidance, 170);
                    doc.text(guideLines, 20, y);
                    y += guideLines.length * 5 + 10;

                } else {
                    // Fallback
                    doc.setFont("helvetica", "italic");
                    doc.setTextColor(16, 185, 129);
                    const fLines = doc.splitTextToSize(`Feedback: ${item.feedback.feedback}`, 170);
                    doc.text(fLines, 20, y);
                    y += fLines.length * 4 + 10;
                }
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

    return (
        <div className="container-narrow section-spacing fade-in">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-5">
                <div>
                    <h1 className="h3 fw-bold text-primary mb-1">Interview Report</h1>
                    <p className="text-secondary mb-0">Analysis of your session on {new Date(session.date).toLocaleDateString()}</p>
                </div>
                <div className="d-flex gap-3">
                    <button className="btn btn-google-outline" onClick={() => navigate('/')}>Back to Dashboard</button>
                    <button className="btn btn-google shadow-sm" onClick={downloadPDF}>Download PDF</button>
                </div>
            </div>

            {/* Summary Card */}
            <div className="card-google p-4 p-md-5 mb-5">
                <div className="row g-4 text-center">
                    <div className="col-md-4">
                        <div className="p-3 bg-secondary bg-opacity-10 rounded-3">
                            <span className="d-block small text-secondary fw-bold text-uppercase tracking-wider">Role</span>
                            <span className="h5 fw-bold text-primary mb-0 d-block mt-1">{session.role}</span>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-3 bg-secondary bg-opacity-10 rounded-3">
                            <span className="d-block small text-secondary fw-bold text-uppercase tracking-wider">Difficulty</span>
                            <span className="h5 fw-bold text-primary mb-0 d-block mt-1">{session.difficulty}</span>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-3 bg-secondary bg-opacity-10 rounded-3">
                            <span className="d-block small text-secondary fw-bold text-uppercase tracking-wider">Questions</span>
                            <span className="h5 fw-bold text-primary mb-0 d-block mt-1">{session.data ? session.data.length : 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Aggregate Report Card */}
            {session.report && (
                <div className="card-google p-4 p-md-5 mb-5 border-start border-4 border-primary">
                    <h2 className="h4 fw-bold text-primary mb-3">Overall Evaluation</h2>
                    <p className="lead text-secondary mb-4">{session.report.summary}</p>

                    <div className="row g-4">
                        <div className="col-md-6">
                            <h3 className="h6 fw-bold text-success text-uppercase mb-3">Strengths</h3>
                            <ul className="list-group list-group-flush rounded-3 border">
                                {session.report.strengths?.map((s, i) => (
                                    <li key={i} className="list-group-item bg-success-subtle border-success-subtle text-success-emphasis">
                                        ✓ {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="col-md-6">
                            <h3 className="h6 fw-bold text-danger text-uppercase mb-3">Areas for Improvement</h3>
                            <ul className="list-group list-group-flush rounded-3 border">
                                {session.report.weaknesses?.map((w, i) => (
                                    <li key={i} className="list-group-item bg-danger-subtle border-danger-subtle text-danger-emphasis">
                                        ! {w}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-primary-subtle rounded-3 border border-primary-subtle text-primary-emphasis">
                        <strong className="d-block mb-3 text-uppercase small tracking-wider fw-bold">Your Top 3 Focus Areas</strong>
                        <ul className="mb-0 ps-3">
                            {session.report.suggestions?.map((s, i) => (
                                <li key={i} className="mb-2">{s}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Questions Analysis */}
            <div className="mb-4">
                <h3 className="h5 fw-bold text-secondary mb-4">Session Transcript & Coaching Notes</h3>
                <div className="d-flex flex-column gap-4">
                    {session.data && session.data.map((a, i) => (
                        <div className="card-google p-4" key={i}>
                            <div className="d-flex gap-3 mb-3">
                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill align-self-start mt-1">
                                    Q{i + 1}
                                </span>
                                <h4 className="h5 fw-bold text-primary mb-0 lh-base">{a.question}</h4>
                            </div>

                            <div className="mb-4 ps-md-4">
                                <div className="bg-body p-3 rounded-3 border mb-3">
                                    <span className="small text-secondary fw-bold d-block mb-2">YOUR ANSWER</span>
                                    <p className="mb-0 text-primary">{a.answer}</p>
                                </div>
                                {/* Metrics Removed (Dummy Data Unreliable) */}

                            </div>

                            <div className="ps-md-4">
                                <span className="small text-secondary fw-bold d-block mb-2">COACH FEEDBACK</span>
                                {session.report?.question_explanations?.[i] ? (
                                    <div className="d-flex flex-column gap-3">
                                        <div className="bg-success-subtle p-3 rounded-3 text-success-emphasis border border-success-subtle">
                                            <strong>✓ What You Did Well:</strong> {session.report.question_explanations[i].what_you_did_well}
                                        </div>
                                        <div className="bg-warning-subtle p-3 rounded-3 text-warning-emphasis border border-warning-subtle">
                                            <strong>⚠️ What Was Missing:</strong> {session.report.question_explanations[i].what_was_missing}
                                        </div>
                                        <div className="bg-white p-3 rounded-3 text-secondary border shadow-sm">
                                            <strong>💡 How a Strong Answer Sounds:</strong>
                                            <div className="mt-1">{session.report.question_explanations[i].strong_answer_guidance}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-success-subtle p-4 rounded-3 text-secondary border border-success border-opacity-10" style={{ fontSize: '0.95rem' }}>
                                        <ReactMarkdown>{a.feedback.feedback}</ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Report;
