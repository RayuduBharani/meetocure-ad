const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Doctor = require('../models/DoctorShema');
const Appointment = require('../models/Appointment');
const Hospital = require('../models/Hospital');
const DoctorVerification = require('../models/DoctorVerificationShema');

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Get total counts
        const totalPatients = await Patient.countDocuments();
        const totalDoctors = await Doctor.countDocuments();
        const totalHospitals = await Hospital.countDocuments();
        const pendingVerifications = await DoctorVerification.countDocuments({ status: 'pending' });

        // Get appointment statistics
        const appointmentsToday = await Appointment.countDocuments({
            createdAt: { $gte: today, $lt: tomorrow }
        });

        // Get completed and cancelled appointments for today
        const completedToday = await Appointment.countDocuments({
            createdAt: { $gte: today, $lt: tomorrow },
            status: 'completed'
        });

        const cancelledToday = await Appointment.countDocuments({
            createdAt: { $gte: today, $lt: tomorrow },
            status: 'cancelled'
        });

        // Get monthly stats
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const appointmentsThisMonth = await Appointment.countDocuments({
            createdAt: { $gte: firstDayOfMonth, $lt: tomorrow }
        });

        // Get new registrations today
        const newPatientsToday = await Patient.countDocuments({
            createdAt: { $gte: today, $lt: tomorrow }
        });

        const newDoctorsToday = await Doctor.countDocuments({
            createdAt: { $gte: today, $lt: tomorrow }
        });

        // Get doctor specialty distribution
        const doctorSpecialties = await Doctor.aggregate([
            { $group: { _id: "$specialty", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Get hospital distribution by city
        const hospitalsByCity = await Hospital.aggregate([
            { $group: { _id: "$city", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Calculate success rate
        const successRate = appointmentsToday ? 
            Math.round((completedToday / appointmentsToday) * 100) : 0;

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalPatients,
                    totalDoctors,
                    totalHospitals,
                    pendingVerifications
                },
                appointments: {
                    today: appointmentsToday,
                    completed: completedToday,
                    cancelled: cancelledToday,
                    monthly: appointmentsThisMonth,
                    successRate
                },
                newRegistrations: {
                    patients: newPatientsToday,
                    doctors: newDoctorsToday
                },
                insights: {
                    topSpecialties: doctorSpecialties,
                    topCities: hospitalsByCity
                }
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
