const staticQuestions = {
    // =========================================================================
    // TECHNICAL ROLES
    // =========================================================================
    "Python Developer": {
        "Easy": {
            1: [
                "What is the difference between a list and a tuple in Python?",
                "Explain the concept of PEP 8.",
                "How does garbage collection work in Python?",
                "What form of inheritance does Python support?",
                "Explain the usage of decorators."
            ],
            2: [
                "How do you handle exceptions in Python?",
                "Explain the difference between deep and shallow copies.",
                "What are Python generators and when should you use them?",
                "Describe how you handle memory management in large datasets."
            ]
        },
        "Medium": {
            1: [
                "Explain the Global Interpreter Lock (GIL).",
                "What are decorators and how are they used?",
                "Explain the difference between `__init__` and `__new__`.",
                "How does Python's memory management work?",
                "Explain the difference between a set and a dictionary."
            ],
            2: [
                "How would you optimize a slow Python application?",
                "Explain the concept of meta-classes.",
                "How does multiprocessing differ from multithreading in Python?",
                "Design a system to handle large file processing in Python."
            ]
        }
    },
    "Frontend Developer": {
        "Medium": {
            1: [
                "Explain the virtual DOM in React.",
                "What is the difference between `let`, `const`, and `var`?",
                "Explain how CSS Grid differs from Flexbox.",
                "What are React Hooks and why do we use them?",
                "Explain the concept of closures in JavaScript."
            ],
            2: [
                "How do you optimize the performance of a React application?",
                "Explain the difference between server-side rendering and client-side rendering.",
                "How do you handle state management in a large application?",
                "Describe a difficult bug you fixed in a frontend project."
            ]
        }
    },

    // =========================================================================
    // HR ROLE (Behavioral / Personal Questions)
    // =========================================================================
    "HR": {
        // Round 1: FIXED questions (always the same, same order)
        round1_fixed: [
            "Tell me about yourself.",
            "What are your greatest strengths?",
            "What do you consider your weaknesses?",
            "Why did you choose this career field?",
            "Why should we hire you?"
        ],
        // Round 2: Pool for random selection (pick 4)
        round2_pool: [
            "Describe a challenging situation at work and how you handled it.",
            "How do you handle failure or setbacks?",
            "Where do you see yourself in 5 years?",
            "How do you handle pressure or tight deadlines?",
            "What motivates you at work?",
            "Tell me about a time you had a conflict with a coworker. How did you resolve it?",
            "What is your greatest professional achievement?",
            "How do you prioritize your tasks when you have multiple deadlines?",
            "Describe a time when you went above and beyond for a project.",
            "What are your salary expectations?",
            "Why are you leaving your current job?",
            "How do you handle criticism or negative feedback?"
        ]
    },

    // =========================================================================
    // MANAGERIAL ROLE (Situational / Leadership Questions)
    // =========================================================================
    "Managerial": {
        // Round 1: FIXED questions (always the same, same order)
        round1_fixed: [
            "How do you handle conflict within your team?",
            "Describe your approach to delegating tasks.",
            "How do you handle an underperforming team member?",
            "What is your leadership style?",
            "How do you motivate your team during difficult times?"
        ],
        // Round 2: Pool for random selection (pick 4)
        round2_pool: [
            "Two team members are having a conflict that's affecting the whole team. What do you do?",
            "A critical deadline is at risk due to unexpected issues. How would you handle it?",
            "A stakeholder disagrees with your team's decision. How do you proceed?",
            "How do you handle ambiguity when making important decisions?",
            "Describe a time you had to deliver bad news to your team.",
            "How do you build trust with a new team?",
            "Tell me about a time you had to make an unpopular decision.",
            "How do you balance being a leader and being approachable?",
            "Describe how you give constructive feedback to team members.",
            "How do you handle a situation where your manager disagrees with you?",
            "Tell me about a project that failed. What did you learn?",
            "How do you ensure your team stays aligned with company goals?"
        ]
    }
};

module.exports = staticQuestions;

