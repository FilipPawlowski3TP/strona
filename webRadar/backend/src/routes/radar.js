const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const { authenticateToken } = require('./auth');

const router = express.Router();

function generateShareCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

router.post('/create', authenticateToken, async (req, res) => {
    try {
        const sessionId = uuidv4();
        const shareCode = generateShareCode();
        const mapName = req.body.mapName || 'Unknown';
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        await db.createSession({
            id: sessionId,
            user_id: req.user.id,
            share_code: shareCode,
            map_name: mapName,
            created_at: new Date().toISOString(),
            expires_at: expiresAt
        });

        res.json({ 
            success: true, 
            session: {
                id: sessionId,
                shareCode,
                mapName,
                expiresAt
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/join/:shareCode', async (req, res) => {
    try {
        const code = req.params.shareCode;
        let session;
        
        if (code.includes('-') && code.length > 10) {
            session = await db.findSession({ id: code });
        } else {
            session = await db.findSession({ share_code: code.toUpperCase() });
        }

        if (!session) {
            return res.status(404).json({ error: 'Session not found or expired' });
        }

        const user = await db.findUser({ id: session.user_id });

        res.json({ 
            success: true, 
            session: {
                id: session.id,
                mapName: session.map_name,
                owner: user ? user.username : 'Unknown',
                createdAt: session.created_at
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/my-sessions', authenticateToken, async (req, res) => {
    try {
        const sessions = await db.findSessions({ user_id: req.user.id });
        res.json({ success: true, sessions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/update/:sessionId', async (req, res) => {
    try {
        const { mapName } = req.body;
        
        if (mapName) {
            await db.updateSession(req.params.sessionId, { map_name: mapName });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:sessionId', authenticateToken, async (req, res) => {
    try {
        const deleted = await db.deleteSession(req.params.sessionId, req.user.id);

        if (!deleted) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json({ success: true, message: 'Session deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
