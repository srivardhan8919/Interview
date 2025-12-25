const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const staticQuestions = require('../data/staticQuestions');

// --- CONFIGURATION ---
const USE_STATIC_QUESTIONS = false; // REVERTED: Gemini handles questions
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


// Middleware to check for API keys in env
const checkKeys = (req, res, next) => {
    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Server missing GEMINI_API_KEY' });
    }
    if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({ error: 'Server missing GROQ_API_KEY' });
    }
    next();
};

// --- HELPER: Clean JSON Utils ---
const cleanAndParseJSON = (text) => {
    try {
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonMatch = cleanText.match(/\[[\s\S]*\]/) || cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        throw new Error("No JSON found");
    } catch (e) {
        return null;
    }
};

// --- HELPER: Validator Functions ---
const BANNED_EASY_KEYWORDS = ["internal", "implementation", "engine", "compiler", "thread safety", "race condition", "advanced trade-off", "memory layout"];
const BANNED_REPORT_PHRASES = ["the candidate", "the interviewee", "user demonstrated", "user showed"];

const validateQuestions = (questions, difficulty) => {
    if (!Array.isArray(questions)) return { valid: false, reason: "Not an array" };
    if (difficulty === "Easy") {
        for (const q of questions) {
            const lowerQ = q.toLowerCase();
            if (BANNED_EASY_KEYWORDS.some(kw => lowerQ.includes(kw))) {
                return { valid: false, reason: `Easy Mode Violation: Found '${lowerQ}' match` };
            }
        }
    }
    return { valid: true };
};

const validateReport = (json, historyLength) => {
    if (!json.executive_summary || !json.top_3_focus_areas || !json.question_feedback) return { valid: false, reason: "Missing top-level keys" };
    if (!Array.isArray(json.question_feedback)) return { valid: false, reason: "question_feedback is not array" };
    if (json.question_feedback.length !== historyLength) return { valid: false, reason: `Length mismatch: Expected ${historyLength}, got ${json.question_feedback.length}` };

    // Tone Check
    const summaryLower = json.executive_summary.toLowerCase();
    if (BANNED_REPORT_PHRASES.some(p => summaryLower.includes(p))) return { valid: false, reason: "Found third-person language in summary" };

    // Structure Check
    for (const item of json.question_feedback) {
        if (!item.what_you_did_well || !item.what_was_missing || !item.strong_answer_guidance) {
            return { valid: false, reason: "Missing feedback fields" };
        }
    }
    return { valid: true };
};

// --- PHASE 1: BATCH GENERATION ---
router.post('/generate', checkKeys, async (req, res) => {
    const { role, difficulty, round = 1, sessionSeed } = req.body;

    // --- STRICT DIFFICULTY CONFIGURATION ---
    const DIFFICULTY_CONFIG = {
        Easy: {
            1: "Pure basics. Definitions. Simple concepts. Goal: Confidence building.",
            2: "Logical thinking ONLY within basics. 'Explain in your own words'. Simple reasoning. NO advanced depth. NO internals. NO tricky edge cases. Goal: Validating understanding of basics."
        },
        Medium: {
            1: "Basics + moderate depth. Why things work. Goal: Testing competence.",
            2: "Deeper explanation. Simple trade-offs. Practical reasoning. Goal: Testing application of knowledge."
        },
        Hard: {
            1: "Combination of basic + medium concepts. Strong fundamentals expected. Goal: Filtering for excellence.",
            2: "Truly hard questions. Internals. Trade-offs. Real-world scenarios. Goal: Testing mastery."
        }
    };

    const TECHNICAL_ROLES = [
        "Frontend Developer", "Backend Developer", "Full Stack Developer", "DevOps Engineer",
        "Data Scientist", "Machine Learning Engineer", "Python Developer", "Java Developer"
    ];

    try {
        if (USE_STATIC_QUESTIONS) {
            return res.json(["Static Fallback Q1", "Static Fallback Q2"]);
        }

        const diffRules = DIFFICULTY_CONFIG[difficulty]?.[round] || DIFFICULTY_CONFIG["Medium"][1];
        const count = round === 1 ? 5 : 4;

        let topicInstructions = "";
        if (TECHNICAL_ROLES.includes(role)) {
            topicInstructions = `
            TOPIC MIXING (MANDATORY):
            - Include a balanced mix of: Role-specific skills (Primary), Databases, Operating Systems, Networking, DSA Logic.
            - DSA Logic Rules: Ask to explain the logic (e.g., "Why use a hash map?"). NEVER ask to write code.
            - Ensure role-specific questions remain the focus.
            - Do NOT cluster topics.
            `;
        }

        const prompt = `Generate ${count} unique technical interview questions for a ${role} position (Round ${round}).
        
        STRICT DIFFICULTY LEVEL: ${difficulty}
        DIFFICULTY RULES: ${diffRules}
        
        ${topicInstructions}
        
        STRICT VALIDATION RULES:
        1. Diversity: Each question MUST test a different skill.
        2. Format: Return ONLY a raw JSON array of strings. No markdown.
        3. Style: Direct, spoken-interview style. NO "Write code to..." questions. Ask "Why", "Explain", "How would you handle".
        4. No Internals in Easy Mode: If difficulty is Easy, REJECT any question about internal implementation details or complex race conditions.
        5. Noise: Do not number the strings. Do not add introductory text.
        
        Example: ["What is the difference between X and Y?", "How does a hash map work conceptually?"]`;

        // RETRY LOOP (Max 2)
        for (let attempt = 0; attempt < 2; attempt++) {
            console.log(`[GENERATE] Attempt ${attempt + 1}: ${role} / ${difficulty}`);

            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });

                if (!response.ok) throw await response.json();
                const data = await response.json();
                const text = data.candidates[0].content.parts[0].text;
                let questions = cleanAndParseJSON(text);

                if (!questions) continue;

                const valResult = validateQuestions(questions, difficulty);
                if (!valResult.valid) {
                    console.warn(`[GENERATE] Validation Failed: ${valResult.reason}. Retrying...`);
                    continue;
                }

                return res.json(questions);

            } catch (e) {
                console.error("Gen Error:", e);
            }
        }

        res.status(500).json({ error: "Failed to generate valid interview questions after retries." });



    } catch (e) {
        console.error("Batch Generate Error:", e);
        res.status(500).json({ error: 'Failed to generate questions' });
    }
});

// --- PHASE 2: SILENT (No-op Analysis) ---
router.post('/analyze', (req, res) => {
    // SILENCED: Immediate 200 OK. No LLM. No Heuristics needed for blocking flow.
    res.json({
        pace: 0,
        fillers: 0,
        clarity: 10,
        feedback: "Answer recorded."
    });
});

// --- PHASE 3: FINAL REPORT (GROQ) ---
// --- PHASE 3: FINAL REPORT (GROQ) ---
router.post('/report', checkKeys, async (req, res) => {
    const { role, difficulty, history } = req.body;

    const systemPrompt = `You are a Senior Technical Interview Coach.
    Your task: Evaluate the FULL interview transcript and generate a truthful, human, and actionable report.
    
    TONE & STYLE:
    - Write directly to the user using "You" (e.g., "You explained...").
    - Be honest but supportive.
    - NO third-person ("the candidate").
    - NO fake numeric scores.
    
    INPUT DATA:
    Role: ${role}
    Difficulty: ${difficulty}
    Transcript: ${JSON.stringify(history)}
    
    MANDATORY OUTPUT STRUCTURE (Strict JSON):
    {
      "executive_summary": "Conversational summary (2-3 sentences). Use 'You'.",
      "top_3_focus_areas": ["Actionable Step 1", "Step 2", "Step 3"],
      "question_feedback": [
        {
           "what_you_did_well": "One short, positive bullet point (✓)",
           "what_was_missing": "One honest bullet point on the main gap (⚠️). If they repeated the question, flag it here explicitly.",
           "strong_answer_guidance": "2-3 lines describing good answer structure."
        }
      ]
    }
    
    CRITICAL RULES:
    1. Arrays must match exactly: question_feedback length == ${history.length}.
    2. Repetition Detection: If the answer repeats the question, state it in 'what_was_missing'.
    3. No undefined fields.`;

    // RETRY LOOP (Max 2)
    for (let attempt = 0; attempt < 2; attempt++) {
        console.log(`[REPORT] Attempt ${attempt + 1}: Generating report...`);
        try {
            const chatCompletion = await groq.chat.completions.create({
                messages: [{ role: 'user', content: systemPrompt }],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.6,
                max_tokens: 3500,
                response_format: { type: 'json_object' }
            });

            const content = chatCompletion.choices[0].message.content;
            const json = JSON.parse(content);

            const valResult = validateReport(json, history.length);
            if (!valResult.valid) {
                console.warn(`[REPORT] Validation Failed: ${valResult.reason}. Retrying...`);
                continue;
            }

            // Success - Map to FrontEnd Props
            const finalReport = {
                summary: json.executive_summary,
                strengths: [],
                weaknesses: [],
                suggestions: json.top_3_focus_areas,
                score: 0,
                question_explanations: json.question_feedback
            };

            return res.json(finalReport);

        } catch (e) {
            console.error("Report Gen Error:", e);
        }
    }

    // FINAL FALLBACK (Explicit Failure)
    res.json({
        summary: "We encountered an error generating your full detailed report. Please review the transcript below.",
        strengths: [],
        weaknesses: [],
        suggestions: ["Review transcript manually.", "Retry the interview to get AI feedback.", "Check connection settings."],
        score: 0,
        question_explanations: history.map(() => ({
            what_you_did_well: "Detailed feedback unavailable.",
            what_was_missing: "Report generation failed.",
            strong_answer_guidance: "Please try again later."
        }))
    });
});

module.exports = router;
