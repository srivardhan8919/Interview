const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const sessionRoutes = require('./routes/sessions');
const healthRoutes = require('./routes/health');

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api', healthRoutes);

app.get('/', (req, res) => {
    res.send('InterviewAce API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
