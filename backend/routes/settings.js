const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// Get all settings
router.get('/', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update general settings
router.patch('/general', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        
        settings.general = {
            ...settings.general,
            ...req.body
        };
        
        const updatedSettings = await settings.save();
        res.json(updatedSettings.general);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});





module.exports = router;