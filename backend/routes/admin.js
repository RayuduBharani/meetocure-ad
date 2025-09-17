const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await Admin.find().select('-password');
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
});

// Create new user
router.post('/', async (req, res) => {
    try {
        const { name, email, password, role, status } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }

        // Check if user already exists
        const existingUser = await Admin.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create new user
        const userData = {
            name,
            email,
            password, // In production, hash this password
            role: role || 'Admin',
            status: status || 'Active'
        };

        const user = await Admin.create(userData);
        
        // Return user without password
        const userResponse = user.toObject();
        delete userResponse.password;
        
        res.status(201).json({
            success: true,
            data: userResponse,
            message: 'User created successfully'
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
});

// Update user
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, status, password } = req.body;

        // Validation
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name and email are required'
            });
        }

        // Check if email is already taken by another user
        const existingUser = await Admin.findOne({ 
            email, 
            _id: { $ne: id } 
        });
        
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email is already taken by another user'
            });
        }

        // Prepare update data
        const updateData = { name, email, role, status };
        
        // Only update password if provided
        if (password && password.trim() !== '') {
            updateData.password = password; // In production, hash this password
        }

        const updatedUser = await Admin.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: updatedUser,
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await Admin.findByIdAndDelete(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await Admin.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
});

// Update user status (activate/deactivate)
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['Active', 'Inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Valid status (Active/Inactive) is required'
            });
        }

        const user = await Admin.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: user,
            message: `User ${status.toLowerCase()} successfully`
        });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
});

module.exports = router;
