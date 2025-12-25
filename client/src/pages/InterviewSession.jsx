import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import Avatar from '../components/Avatar';

// --- EXPERIENCE CONTRACT (STATE MACHINE) ---
const STATE = {
    INTRO: 'INTRO',                 // "Ritual" entry, breathing, calibration
    READING: 'READING',             // Question active, user thinking
    ANSWERING: 'ANSWERING',         // Mic active, recording user
    FEEDBACK: 'FEEDBACK',           // Insight overlay shown
    TRANSITION: 'TRANSITION',       // Round switch or Decompression
    OUTRO: 'OUTRO'                  // Final save, calming before report
};

const InterviewSession = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { role, difficulty } = location.state || { role: 'Frontend Developer', difficulty: 'Medium' };

    // --- State Management ---
    const [sessionState, setSessionState] = useState(STATE.INTRO);

    // --- LAYOUT: RESIZABLE PANELS ---
    const [leftWidth, setLeftWidth] = useState(300); // Pixels
    const [rightWidth, setRightWidth] = useState(350); // Pixels
    const containerRef = useRef(null);
    const isDraggingLeft = useRef(false);
    const isDraggingRight = useRef(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();

            if (isDraggingLeft.current) {
                const newWidth = e.clientX - containerRect.left;
                if (newWidth > 200 && newWidth < containerRect.width - rightWidth - 300) {
                    setLeftWidth(newWidth);
                }
            } else if (isDraggingRight.current) {
                const newWidth = containerRect.right - e.clientX;
                if (newWidth > 200 && newWidth < containerRect.width - leftWidth - 300) {
                    setRightWidth(newWidth);
                }
            }
        };

        const handleMouseUp = () => {
            isDraggingLeft.current = false;
            isDraggingRight.current = false;
            document.body.style.cursor = 'default';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [leftWidth, rightWidth]);

    const startDragLeft = () => {
        isDraggingLeft.current = true;
        document.body.style.cursor = 'col-resize';
    };

    const startDragRight = () => {
        isDraggingRight.current = true;
        document.body.style.cursor = 'col-resize';
    };

    // Data
    const [round, setRound] = useState(1);
    const [questions, setQuestions] = useState([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState([]);

    // UI/UX
    const [introText, setIntroText] = useState("Calibrating interview environment...");
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);

    // STT & Avatar
    const [transcript, setTranscript] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const recognitionRef = useRef(null);
    const transcriptRef = useRef('');

    // --- RITUAL: INTRO PHASE ---
    useEffect(() => {
        // 1. Start with Breathing Ritual
        const startRitual = async () => {
            setTimeout(() => setIntroText("Aligning AI persona to role..."), 1500);
            setTimeout(() => setIntroText("Preparing first question..."), 3000);

            // 2. Load Data in background
            try {
                const res = await api.post('/ai/generate', { role, difficulty, round: 1, sessionSeed: Date.now() });
                setQuestions(res.data);

                // 3. Transition to Interview
                setTimeout(() => {
                    setSessionState(STATE.READING);
                    if (res.data[0]) speakQuestion(res.data[0]);
                }, 4500);
            } catch (error) {
                console.error("Setup failed", error);
                alert("Setup failed. Please refresh.");
            }
        };
        startRitual();
        return () => window.speechSynthesis.cancel();
    }, []);

    // Effect Removed: transcriptRef update handled manually to avoid recursion on STT

    const currentQ = questions[currentQIndex] || "";

    // --- LOGIC: ROUND HANDLING ---
    const loadRound = async (roundNum) => {
        setLoading(true); // Internal loading state for data fetch
        try {
            const res = await api.post('/ai/generate', { role, difficulty, round: roundNum, sessionSeed: Date.now() });
            setQuestions(res.data);
            setCurrentQIndex(0);
            setRound(roundNum);

            // Seamless transition
            setSessionState(STATE.READING);
            if (res.data[0]) speakQuestion(res.data[0]);
        } catch (error) {
            console.error("Round load failed", error);
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIC: TTS ---
    const speakQuestion = (text) => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    // --- LOGIC: STT (Safeguarded) ---
    // --- LOGIC: STT (Safeguarded) ---
    const isPausedRef = useRef(false); // Ref for immediate access in callbacks
    const isRecordingRef = useRef(false);

    const startRecording = () => {
        // Transition state to ANSWERING (Focus shift)
        setSessionState(STATE.ANSWERING);

        if (!('webkitSpeechRecognition' in window)) {
            alert("Speech recognition not supported in this browser.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (e) => {
            let interim = '';
            let newFinalChunk = '';

            for (let i = e.resultIndex; i < e.results.length; ++i) {
                if (e.results[i].isFinal) {
                    newFinalChunk += e.results[i][0].transcript;
                } else {
                    interim += e.results[i][0].transcript;
                }
            }

            if (newFinalChunk) {
                const text = transcriptRef.current;
                // Deduplication Check: Only append if it's not a direct repeat of the end
                // (Simple heuristic: if the new chunk is fully contained in the last 50 chars, ignore)
                const lastChars = text.slice(-50);
                if (!lastChars.includes(newFinalChunk.trim())) {
                    const needsSpace = text.length > 0 && !text.endsWith(' ') && !newFinalChunk.startsWith(' ');
                    transcriptRef.current = text + (needsSpace ? ' ' : '') + newFinalChunk;
                }
            }

            // UI Display = Final (Persisted) + Interim (Ephemeral)
            setTranscript((transcriptRef.current + (interim ? ' ' + interim : '')).trim());
        };

        // Silence = Safe State. Do NOT stop UI. Just restart engine if needed.
        recognition.onend = () => {
            // Check refs for truthy state, because closures might be stale
            if (isRecordingRef.current && !isPausedRef.current) {
                try { recognition.start() } catch (e) { }
            }
        };

        try {
            recognition.start();
            recognitionRef.current = recognition;

            // Sync React State & Refs
            setIsRecording(true);
            isRecordingRef.current = true;

            setIsPaused(false);
            isPausedRef.current = false;

        } catch (e) { console.error(e); }
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.onend = null;
            try { recognitionRef.current.stop(); } catch (e) { }
        }

        setIsRecording(false);
        isRecordingRef.current = false;

        setIsPaused(false);
        isPausedRef.current = false;
    };

    const togglePause = () => {
        if (isPaused) {
            // Resume
            startRecording();
        } else {
            // Pause
            setIsPaused(true);
            isPausedRef.current = true;

            // Stop engine, but Keep "isRecording" true conceptually (just paused)
            if (recognitionRef.current) {
                // We keep onend active? No, we don't want it to restart immediately.
                // But onend checks isPausedRef, so it won't restart!
                try { recognitionRef.current.stop(); } catch (e) { }
            }
        }
    };

    // --- LOGIC: SUBMIT (Insight First) ---
    // --- LOGIC: SUBMIT (Insight First) ---
    const handleCompleteAnswer = async () => {
        stopRecording();

        if (!transcript.trim() || transcript.trim().length < 10) {
            setFeedback({ feedback: "I couldn't hear you clearly. Please add more detail.", pace: 0, fillers: 0 });
            setSessionState(STATE.FEEDBACK);
            return;
        }

        try {
            // Heuristic Analysis (Silent / Background)
            // We still call it to get the "feedback" object structure for history, 
            // even if we don't show it.
            const res = await api.post('/ai/analyze', { transcript });
            const result = res.data;

            // Store data
            const answerData = {
                question: currentQ,
                answer: transcript,
                feedback: result, // result is now dummy
                round: round
            };
            setAnswers(prev => [...prev, answerData]);

            // SKIP FEEDBACK OVERLAY -> Move to next question immediately
            // setFeedback(result);
            // setSessionState(STATE.FEEDBACK);
            handleNext();

        } catch (error) {
            console.error("Analysis Error", error);
            // Fallback: still move next
            handleNext();
        }
    };

    // --- LOGIC: NAVIGATION (Decompression) ---
    const handleNext = async () => {
        setFeedback(null);
        setTranscript('');
        transcriptRef.current = '';

        // 1. More questions in this round?
        if (currentQIndex < questions.length - 1) {
            setSessionState(STATE.READING);
            setCurrentQIndex(currentQIndex + 1);
            speakQuestion(questions[currentQIndex + 1]);
            return;
        }

        // 2. End of Round 1 -> Decompress -> Round 2
        if (round === 1) {
            setSessionState(STATE.TRANSITION); // "Great job on Round 1..."
            setTimeout(() => {
                loadRound(2);
            }, 3000); // 3s decompression
            return;
        }

        // 3. End of Round 2 -> Outro -> Finish
        finishInterview();
    };

    const finishInterview = async () => {
        setSessionState(STATE.OUTRO); // "Finalizing your profile..."

        try {
            const reportRes = await api.post('/ai/report', { role, difficulty, history: answers });
            const finalReport = reportRes.data;

            const sessionData = {
                role, difficulty,
                score: finalReport.score || 8,
                data: answers,
                report: finalReport
            };

            await api.post('/sessions', sessionData);

            // Smooth exit
            setTimeout(() => {
                navigate('/report', { state: { session: { ...sessionData, date: new Date().toISOString() } } });
            }, 2000);

        } catch (error) {
            navigate('/');
        }
    };


    // --- RENDERS: INTRO RITUAL ---
    if (sessionState === STATE.INTRO) {
        return (
            <div className="interview-container d-flex flex-column align-items-center justify-content-center text-center">
                <div className="mb-4 animate-breathe">
                    <div className="spinner-grow text-primary" style={{ width: '4rem', height: '4rem' }} role="status"></div>
                </div>
                <h2 className="h4 fw-light text-secondary ritual-enter" key={introText}>{introText}</h2>
            </div>
        );
    }

    if (sessionState === STATE.TRANSITION || sessionState === STATE.OUTRO) {
        return (
            <div className="interview-container d-flex flex-column align-items-center justify-content-center text-center ritual-enter">
                <h2 className="h3 fw-bold text-primary mb-3">
                    {sessionState === STATE.TRANSITION ? "Round 1 Complete" : "Interview Complete"}
                </h2>
                <p className="lead text-secondary mb-4 animate-pulse-calm">
                    {sessionState === STATE.TRANSITION ? "Take a breath. Preparing advanced scenario..." : "Synthesizing your performance report..."}
                </p>
            </div>
        );
    }

    // --- RENDERS: MAIN INTERVIEW ---
    // Visual Hierarchy Helpers
    const isReading = sessionState === STATE.READING;
    const isAnswering = sessionState === STATE.ANSWERING;
    const isFeedback = sessionState === STATE.FEEDBACK;

    return (
        <div
            ref={containerRef}
            className="interview-container container-fluid p-0 d-flex overflow-hidden"
            style={{
                height: 'calc(100vh - 80px)',
                width: '100vw'
            }}
        >
            {/* --- LEFT: CONTEXT (Resizable) --- */}
            <div
                className={`bg-surface d-flex flex-column h-100 shadow-sm transition-colors ${isReading ? 'focus-active' : 'focus-dimmed'}`}
                style={{ width: leftWidth, minWidth: 200, flexShrink: 0, zIndex: 10 }}
            >
                <div className="p-3 border-bottom">
                    <span className="small text-uppercase tracking-wider fw-bold text-secondary">Correctness Context</span>
                    <div className="mt-1 text-primary fw-bold">
                        {round === 1 ? "Concepts & Definitions" : "Scenarios & Trade-offs"}
                    </div>
                </div>
                <div className="p-3 overflow-auto flex-grow-1" style={{ minHeight: 0 }}>
                    <h3 className="h5 fw-bold text-dark question-text mb-3 animate-breathe" style={{ animationDuration: '6s', overflowWrap: 'break-word' }}>{currentQ}</h3>

                    {isReading && (
                        <div className="text-secondary small mt-2">
                            <span className="me-2">💡</span> The interviewer is waiting. Click the mic when ready.
                        </div>
                    )}
                </div>
            </div>

            {/* RESIZER LEFT */}
            <div
                className="d-flex align-items-center justify-content-center bg-light border-end border-start hover-bg-secondary"
                style={{ width: 8, cursor: 'col-resize', zIndex: 20, userSelect: 'none' }}
                onMouseDown={startDragLeft}
            >
                <div style={{ width: 2, height: 20, background: '#ccc' }}></div>
            </div>

            {/* --- CENTER: PRESENCE (Fluid) --- */}
            <div
                className={`flex-grow-1 bg-body d-flex flex-column align-items-center justify-content-center position-relative transition-all ${isFeedback ? 'blur-sm' : ''}`}
                style={{ minWidth: 300, overflow: 'hidden' }}
            >
                <div className="w-100 h-100 position-absolute top-0 start-0 avatar-container">
                    <Avatar isSpeaking={isSpeaking} />
                </div>

                {/* Status Indicator (Non-intrusive) */}
                <div className="position-absolute bottom-0 mb-4 fade-in" style={{ zIndex: 5 }}>
                    {isRecording && !isPaused && <span className="badge bg-danger text-white px-3 py-2 rounded-pill shadow-sm animate-pulse">Listening... (Take your time)</span>}
                    {isPaused && <span className="badge bg-warning text-dark px-3 py-2 rounded-pill shadow-sm">Paused - Thought Break</span>}
                </div>
            </div>

            {/* RESIZER RIGHT */}
            <div
                className="d-flex align-items-center justify-content-center bg-light border-end border-start hover-bg-secondary"
                style={{ width: 8, cursor: 'col-resize', zIndex: 20, userSelect: 'none' }}
                onMouseDown={startDragRight}
            >
                <div style={{ width: 2, height: 20, background: '#ccc' }}></div>
            </div>

            {/* --- RIGHT: ACTION (Resizable) --- */}
            <div
                className={`bg-surface d-flex flex-column h-100 shadow-sm transition-colors ${isAnswering ? 'focus-active' : 'focus-dimmed'}`}
                style={{ width: rightWidth, minWidth: 200, flexShrink: 0, zIndex: 10, overflow: 'hidden' }}
            >
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-body" style={{ flexShrink: 0 }}>
                    <span className="small text-uppercase tracking-wider fw-bold text-secondary">Your Answer</span>
                </div>

                {/* Main Content Area - constrained to remaining space */}
                <div className="p-3 flex-grow-1 d-flex flex-column overflow-hidden" style={{ minHeight: 0 }}>
                    <textarea
                        className="form-control input-google flex-grow-1 p-2 fs-6 border-0 bg-transparent h-100"
                        style={{ resize: 'none', outline: 'none', boxShadow: 'none' }}
                        value={transcript}
                        onChange={e => {
                            setTranscript(e.target.value);
                            transcriptRef.current = e.target.value;
                        }}
                        placeholder={isReading ? "Listen to the question first..." : "Click mic and speak freely..."}
                        disabled={isFeedback}
                    ></textarea>
                </div>

                {/* Footer Controls - Fixed Height (Auto) */}
                <div className="p-3 border-top bg-body d-flex align-items-center justify-content-center gap-3 flex-wrap" style={{ flexShrink: 0 }}>
                    {transcript && !isRecording && (
                        <button className="btn btn-light text-secondary rounded-circle shadow-sm" style={{ width: 48, height: 48 }} onClick={() => setTranscript('')} title="Clear">🗑</button>
                    )}

                    {!isRecording && !transcript && (
                        <button className="btn btn-google rounded-pill px-4 py-3 shadow-md fw-bold d-flex align-items-center gap-2" onClick={startRecording}>
                            <span className="material-icons">mic</span> Start Answer
                        </button>
                    )}

                    {isRecording && (
                        <>
                            <button className="btn btn-outline-warning rounded-pill px-4 py-2" onClick={togglePause}>
                                {isPaused ? "Resume" : "Pause"}
                            </button>
                            <button className="btn btn-danger rounded-pill px-4 py-2 shadow-sm" onClick={handleCompleteAnswer}>
                                Complete Answer
                            </button>
                        </>
                    )}

                    {transcript && !isRecording && (
                        <button className="btn btn-success rounded-pill px-4 py-3 shadow-md fw-bold" onClick={handleCompleteAnswer}>
                            Submit Text
                        </button>
                    )}
                </div>
            </div>

            {/* Feedback Overlay (Kept but unlikely to show) */}
            {sessionState === STATE.FEEDBACK && feedback && (
                <div className="position-absolute top-0 start-0 w-100 h-100 insight-backdrop d-flex align-items-center justify-content-center fade-in" style={{ zIndex: 50 }}>
                    <div className="card-google shadow-lg p-5 border-0 ritual-enter" style={{ maxWidth: '550px', width: '90%' }}>
                        <div className="text-center mb-4">
                            <h3 className="h4 fw-bold text-primary mb-2">Reflection</h3>
                            <p className="text-secondary">Here is a quick insight on your response.</p>
                        </div>

                        {/* Insight First - No Numbers yet */}
                        <div className="bg-primary-subtle p-4 rounded-3 border-start border-4 border-primary mb-4">
                            <p className="mb-0 text-primary-emphasis fw-medium" style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                                "{feedback.feedback}"
                            </p>
                        </div>

                        <button className="btn btn-google w-100 py-3 rounded-pill shadow-md fw-bold fs-6" onClick={handleNext}>
                            {currentQIndex < questions.length - 1 ? "Next Question →" : round === 1 ? "Finish Round 1 →" : "Finish Interview →"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewSession;
