const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Load .env early
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Minimal startup checks to help new developers
if (!process.env.MONGO_URI) {
    console.warn('WARNING: MONGO_URI not set. Use backend/.env or set env var MONGO_URI.');
}

// Connect MongoDB with basic error handling
mongoose.connect(process.env.MONGO_URI, { autoIndex: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => {
        console.error('MongoDB connection error:', err && err.message ? err.message : err);
        // don't crash immediately in case env misconfigured; allow process to continue for local dev
    });

// Small migration helper: drop legacy unique index on `email` if it exists
mongoose.connection.on('connected', async () => {
    try {
        const db = mongoose.connection.db;
        const colNames = await db.listCollections().toArray();
        const hasUsers = colNames.find(c => c.name === 'users');
        if (hasUsers) {
            const indexes = await db.collection('users').indexes();
            const emailIndex = indexes.find(idx => idx.key && idx.key.email === 1);
            if (emailIndex) {
                try {
                    await db.collection('users').dropIndex(emailIndex.name);
                    console.log('Dropped legacy users.email index:', emailIndex.name);
                } catch (err) {
                    console.warn('Could not drop users.email index (ok to ignore):', err.message || err);
                }
            }
        }
    } catch (err) {
        console.warn('Error checking/dropping legacy indexes:', err.message || err);
    }
});

// Routes (kept simple for readability)
const postRoutes = require("./routes/postRoutes");
app.use("/posts", postRoutes);
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

// Graceful shutdown (helpful during local development)
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on('SIGINT', () => {
    console.log('Shutting down...');
    server.close(() => {
        mongoose.disconnect().then(() => process.exit(0));
    });
});