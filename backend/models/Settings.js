const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    general: {
        language: {
            type: String,
            enum: ['English', 'Hindi', 'Telugu'],
            default: 'English'
        },
        notificationsEnabled: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);