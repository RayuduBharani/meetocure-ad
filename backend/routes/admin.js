const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await Admin.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new user
router.post('/', async (req, res) => {
    try {
        const existingUser = await Admin.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const user = await Admin.create(req.body);
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;
        
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user
router.patch('/:id', async (req, res) => {
    try {
        const { password, ...updateData } = req.body;
        const user = await Admin.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    try {
        const user = await Admin.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;