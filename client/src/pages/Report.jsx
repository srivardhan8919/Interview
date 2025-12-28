import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useLocation, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Report = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { session } = location.state || {};
    const reportRef = useRef();

    if (!session) {
        return <div className="text-center mt-5 text-secondary">No session data found. <button className="btn btn-link" onClick={() => navigate('/')}>Go Home</button></div>;
    }

    // Helper to clean text for PDF and UI
    // Removes non-printable characters, artifacts like 'þ', and strips Markdown
    const cleanText = (text) => {
        if (!text) return "";
        let clean = text.toString();
        // Remove Markdown chars (basic)
        clean = clean.replace(/[*_#`]/g, '');
        // Remove known bad entities if they appeared
        clean = clean.replace(/&nbsp;/g, ' ');
        clean = clean.replace(/&amp;/g, '&');
        clean = clean.replace(/&quot;/g, '"');
        clean = clean.replace(/&apos;/g, "'");
        // Aggressive cleaning: Keep only ASCII printable characters and newlines
        // This removes 'þ', 'â', '€', 'Ø', 'Ü', '¡' etc.
        clean = clean.replace(/[^\x20-\x7E\n]/g, '');
        return clean.replace(/\s+/g, ' ').trim();
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;

        // --- THEME ---
        const colors = {
            primary: [37, 99, 235],    // Blue 600
            secondary: [107, 114, 128], // Gray 500
            successBg: [220, 252, 231], // Green 100
            successText: [21, 128, 61], // Green 700
            dangerBg: [254, 226, 226],  // Red 100
            dangerText: [185, 28, 28],  // Red 700
            infoBg: [239, 246, 255],    // Blue 50
            text: [31, 41, 55]          // Gray 800
        };

        // --- TITLE ---
        doc.setFillColor(...colors.primary);
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Interview Performance Report", 14, 25);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 34);

        let finalY = 45;

        // --- INFO TABLE ---
        autoTable(doc, {
            startY: finalY,
            head: [['Role', 'Difficulty', 'Questions Played']],
            body: [[cleanText(session.role), cleanText(session.difficulty), session.data ? String(session.data.length) : "0"]],
            theme: 'plain',
            styles: { fontSize: 11, cellPadding: 5 },
            headStyles: { fontStyle: 'bold', textColor: colors.secondary },
            bodyStyles: { fontStyle: 'bold', textColor: colors.primary, fontSize: 12 }
        });
        finalY = doc.lastAutoTable.finalY + 10;

        // --- EXECUTIVE SUMMARY ---
        if (session.report) {
            autoTable(doc, {
                startY: finalY,
                head: [['Executive Summary']],
                body: [[cleanText(session.report.summary) || "No summary available."]],
                theme: 'striped',
                headStyles: { fillColor: colors.primary, fontSize: 12, halign: 'left' },
                bodyStyles: { fontSize: 11, textColor: colors.text, cellPadding: 6 },
                margin: { top: 10 }
            });
            finalY = doc.lastAutoTable.finalY + 10;

            // --- STRENGTHS & WEAKNESSES ---
            const strengths = session.report.strengths?.map(s => `• ${cleanText(s)}`).join('\n') || "None listed.";
            const weaknesses = session.report.weaknesses?.map(w => `• ${cleanText(w)}`).join('\n') || "None listed.";

            autoTable(doc, {
                startY: finalY,
                head: [['Top Strengths', 'Areas for Improvement']],
                body: [[strengths, weaknesses]],
                theme: 'grid',
                headStyles: {
                    fillColor: [255, 255, 255],
                    textColor: colors.text,
                    fontSize: 12,
                    fontStyle: 'bold',
                    lineColor: [200, 200, 200],
                    lineWidth: 0.1
                },
                columnStyles: {
                    0: { textColor: colors.successText, cellWidth: '50%' },
                    1: { textColor: colors.dangerText, cellWidth: '50%' }
                },
                bodyStyles: { fontSize: 10, cellPadding: 6, valign: 'top' }
            });
            finalY = doc.lastAutoTable.finalY + 15;
        }

        // --- DETAILED ANALYSIS ---
        doc.setFontSize(14);
        doc.setTextColor(...colors.text);
        doc.setFont("helvetica", "bold");
        doc.text("Detailed Question Analysis", 14, finalY);
        finalY += 6;

        if (session.data) {
            session.data.forEach((item, index) => {
                const explanation = session.report?.question_explanations?.[index];

                // Question Header
                autoTable(doc, {
                    startY: finalY,
                    head: [[`Q${index + 1}: ${cleanText(item.question)}`]],
                    theme: 'plain',
                    headStyles: { fillColor: [243, 244, 246], textColor: colors.primary, fontSize: 11, fontStyle: 'bold' },
                    margin: { top: 10 }
                });
                finalY = doc.lastAutoTable.finalY + 2;

                // Answer
                autoTable(doc, {
                    startY: finalY,
                    body: [[`Your Answer: ${cleanText(item.answer) || "(No answer)"}`]],
                    theme: 'plain',
                    bodyStyles: { fontSize: 10, textColor: colors.secondary, fontStyle: 'italic' }
                });
                finalY = doc.lastAutoTable.finalY + 5;

                // Feedback
                if (explanation) {
                    const rows = [];
                    // Using specific icons as labels. jsPDF core fonts may struggle with Emoji, 
                    // but we will try. If they fail, the colors will still indicate the section.
                    if (explanation.what_you_did_well) {
                        rows.push(['(+)', cleanText(explanation.what_you_did_well)]);
                    }
                    if (explanation.what_was_missing) {
                        rows.push(['(!)', cleanText(explanation.what_was_missing)]);
                    }
                    if (explanation.strong_answer_guidance) {
                        rows.push(['(?)', cleanText(explanation.strong_answer_guidance)]);
                    }

                    autoTable(doc, {
                        startY: finalY,
                        body: rows,
                        theme: 'grid',
                        columnStyles: {
                            0: { cellWidth: 15, fontStyle: 'bold', fontSize: 12, halign: 'center', valign: 'middle' },
                            1: { fontSize: 10, cellPadding: 4 }
                        },
                        didParseCell: function (data) {
                            if (data.section === 'body' && data.column.index === 0) {
                                const label = data.cell.raw;
                                if (label === '(+)') {
                                    data.cell.styles.textColor = colors.successText;
                                    data.cell.text = 'OK'; // Safe fallback text
                                }
                                if (label === '(!)') {
                                    data.cell.styles.textColor = colors.dangerText;
                                    data.cell.text = '!';
                                }
                                if (label === '(?)') {
                                    data.cell.styles.textColor = colors.primary;
                                    data.cell.text = '?';
                                }
                            }
                        }
                    });
                    finalY = doc.lastAutoTable.finalY + 10;
                } else {
                    // Fallback
                    autoTable(doc, {
                        startY: finalY,
                        body: [[cleanText(item.feedback.feedback)]],
                        theme: 'plain',
                        bodyStyles: { textColor: colors.text }
                    });
                    finalY = doc.lastAutoTable.finalY + 10;
                }
            });
        }

        doc.save(`InterviewAce_Report_${new Date().toISOString().split('T')[0]}.pdf`);
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
                            <span className="h5 fw-bold text-primary mb-0 d-block mt-1">{cleanText(session.role)}</span>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-3 bg-secondary bg-opacity-10 rounded-3">
                            <span className="d-block small text-secondary fw-bold text-uppercase tracking-wider">Difficulty</span>
                            <span className="h5 fw-bold text-primary mb-0 d-block mt-1">{cleanText(session.difficulty)}</span>
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
                    <p className="lead text-secondary mb-4">{cleanText(session.report.summary)}</p>

                    <div className="row g-4">
                        <div className="col-md-6">
                            <h3 className="h6 fw-bold text-success text-uppercase mb-3">Strengths</h3>
                            <ul className="list-group list-group-flush rounded-3 border">
                                {session.report.strengths?.map((s, i) => (
                                    <li key={i} className="list-group-item bg-success-subtle border-success-subtle text-success-emphasis">
                                        ✓ {cleanText(s)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="col-md-6">
                            <h3 className="h6 fw-bold text-danger text-uppercase mb-3">Areas for Improvement</h3>
                            <ul className="list-group list-group-flush rounded-3 border">
                                {session.report.weaknesses?.map((w, i) => (
                                    <li key={i} className="list-group-item bg-danger-subtle border-danger-subtle text-danger-emphasis">
                                        ! {cleanText(w)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-primary-subtle rounded-3 border border-primary-subtle text-primary-emphasis">
                        <strong className="d-block mb-3 text-uppercase small tracking-wider fw-bold">Your Top 3 Focus Areas</strong>
                        <ul className="mb-0 ps-3">
                            {session.report.suggestions?.map((s, i) => (
                                <li key={i} className="mb-2">{cleanText(s)}</li>
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
                                <h4 className="h5 fw-bold text-primary mb-0 lh-base">{cleanText(a.question)}</h4>
                            </div>

                            <div className="mb-4 ps-md-4">
                                <div className="bg-body p-3 rounded-3 border mb-3">
                                    <span className="small text-secondary fw-bold d-block mb-2">YOUR ANSWER</span>
                                    <p className="mb-0 text-primary">{cleanText(a.answer)}</p>
                                </div>
                                {/* Metrics Removed (Dummy Data Unreliable) */}

                            </div>

                            <div className="ps-md-4">
                                <span className="small text-secondary fw-bold d-block mb-2">COACH FEEDBACK</span>
                                {session.report?.question_explanations?.[i] ? (
                                    <div className="d-flex flex-column gap-3">
                                        <div className="bg-success-subtle p-3 rounded-3 text-success-emphasis border border-success-subtle">
                                            <strong>✓ What You Did Well:</strong> {cleanText(session.report.question_explanations[i].what_you_did_well)}
                                        </div>
                                        <div className="bg-warning-subtle p-3 rounded-3 text-warning-emphasis border border-warning-subtle">
                                            <strong>⚠️ What Was Missing:</strong> {cleanText(session.report.question_explanations[i].what_was_missing)}
                                        </div>
                                        <div className="bg-white p-3 rounded-3 text-secondary border shadow-sm">
                                            <strong>💡 How a Strong Answer Sounds:</strong>
                                            <div className="mt-1">{cleanText(session.report.question_explanations[i].strong_answer_guidance)}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-success-subtle p-4 rounded-3 text-secondary border border-success border-opacity-10" style={{ fontSize: '0.95rem' }}>
                                        <ReactMarkdown>{cleanText(a.feedback.feedback)}</ReactMarkdown>
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
