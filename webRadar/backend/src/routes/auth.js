const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'blinq-secret-key-change-in-production';

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
}

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(`[AUTH] Register attempt for: ${username}`);

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const existingUser = await db.findUser({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const userId = uuidv4();

        await db.createUser({
            id: userId,
            username,
            password_hash: hashedPassword,
            hwid: null,
            is_admin: false,
            created_at: new Date().toISOString()
        });

        res.json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(`[AUTH] Login attempt for: ${username}`);

        const user = await db.findUser({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!bcrypt.compareSync(password, user.password_hash)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username, isAdmin: user.is_admin }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                isAdmin: user.is_admin
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/generate-otp', authenticateToken, async (req, res) => {
    try {
        const code = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

        await db.createOTP({
            id: uuidv4(),
            user_id: req.user.id,
            code,
            expires_at: expiresAt,
            used: false
        });

        res.json({ success: true, code, expiresAt });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/verify-otp', async (req, res) => {
    try {
        const { code, hwid } = req.body;

        const otp = await db.findOTP({ code });
        if (!otp) {
            return res.status(401).json({ error: 'Invalid or expired OTP' });
        }

        const user = await db.findUser({ id: otp.user_id });
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        await db.updateOTP(otp.id, { used: true });

        if (hwid) {
            await db.updateUser(otp.user_id, { hwid });
        }

        const sessionToken = jwt.sign({
            id: otp.user_id,
            username: user.username,
            type: 'cheat_session'
        }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            success: true,
            token: sessionToken,
            username: user.username
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await db.findUser({ id: req.user.id });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                is_admin: user.is_admin,
                created_at: user.created_at
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;
