const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    hospitalName: { type: String, required: true },
    address: { type: String, required: true },
    contact: { type: String, required: true },
    hospitalImage: { type: String },
    docters : {
        type : Array,
        default : []
    }
});

module.exports = mongoose.model('HospitalLogins', UserSchema);