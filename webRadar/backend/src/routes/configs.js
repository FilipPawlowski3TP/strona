const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const { authenticateToken } = require('./auth');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/configs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${uuidv4()}.json`);
    }
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
            cb(null, true);
        } else {
            cb(new Error('Only JSON files allowed'), false);
        }
    },
    limits: { fileSize: 1024 * 1024 }
});

router.post('/upload', authenticateToken, upload.single('config'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const configData = fs.readFileSync(req.file.path, 'utf8');
        const configName = req.body.name || req.file.originalname.replace('.json', '');
        const isPublic = req.body.isPublic === 'true' ? 1 : 0;

        try {
            JSON.parse(configData);
        } catch (e) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Invalid JSON file' });
        }

        const configId = uuidv4();
        await db.createConfig({
            id: configId,
            user_id: req.user.id,
            name: configName,
            data: configData,
            is_public: isPublic === 1,
            downloads: 0,
            created_at: new Date().toISOString()
        });

        fs.unlinkSync(req.file.path);

        res.json({ 
            success: true, 
            config: {
                id: configId,
                name: configName,
                isPublic: isPublic === 1
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/my', authenticateToken, async (req, res) => {
    try {
        const configs = await db.findConfigs({ user_id: req.user.id });
        res.json({ success: true, configs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/public', async (req, res) => {
    try {
        const configs = await db.findConfigs({ is_public: true });
        const configsWithAuthors = await Promise.all(configs.map(async c => {
            const user = await db.findUser({ id: c.user_id });
            return {
                id: c.id,
                name: c.name,
                downloads: c.downloads,
                created_at: c.created_at,
                author: user ? user.username : 'Unknown'
            };
        }));
        res.json({ success: true, configs: configsWithAuthors });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/download/:id', async (req, res) => {
    try {
        const config = await db.findConfig({ id: req.params.id });
        
        if (!config) {
            return res.status(404).json({ error: 'Config not found' });
        }

        await db.updateConfig(req.params.id, { downloads: (config.downloads || 0) + 1 });

        res.json({ 
            success: true, 
            config: {
                id: config.id,
                name: config.name,
                data: typeof config.data === 'string' ? JSON.parse(config.data) : config.data
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const deleted = await db.deleteConfig(req.params.id, req.user.id);
        
        if (!deleted) {
            return res.status(404).json({ error: 'Config not found' });
        }

        res.json({ success: true, message: 'Config deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
