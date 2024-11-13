const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// In-memory storage for simplicity
const users = [];
const moods = [];

// Register Endpoint
app.post('/users/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = users.find(user => user.email === email);
    if (userExists) {
        return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password and create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, name, email, password: hashedPassword };
    users.push(newUser);

    res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
});

// Login Endpoint
app.post('/users/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', userId: user.id });
});

// Mood Record Endpoint
app.post('/mood', (req, res) => {
    const { userId, mood, reason } = req.body;
    if (!userId || !mood || !reason) {
        return res.status(400).json({ message: 'Missing userId, mood, or reason' });
    }

    // Record mood
    const newMood = { userId: parseInt(userId), mood, reason, timestamp: new Date() };
    moods.push(newMood);

    res.json({ message: 'Mood recorded successfully', newMood });
});

// Fetch Mood Records Endpoint
app.get('/mood', (req, res) => {
    const userId = parseInt(req.query.userId);
    const userMoods = moods.filter(mood => mood.userId === userId);

    res.json({ moods: userMoods });
});

// Start the server
app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
});
