const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = "mongodb+srv://Meetocure:u3OMLp8PimzhzbqP@meetocure.fp2kavy.mongodb.net/?retryWrites=true&w=majority&appName=MeetOcure"

async function connectDB() {
	try {
		await mongoose.connect(MONGO_URI);
		console.log('MongoDB connected');
	} catch (err) {
		console.error('MongoDB connection error:', err.message || err);
		throw err;
	}
}

module.exports = connectDB;