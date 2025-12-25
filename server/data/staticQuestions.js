const staticQuestions = {
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
    }
};

module.exports = staticQuestions;
