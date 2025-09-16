const express = require('express');
const router = express.Router();
const Doctor = require('../models/DoctorShema');
const DoctorVerification = require('../models/DoctorVerificationShema');
const Appointments = require('../models/Appointment'); // Changed to match the model name
const Patient = require('../models/Patient');

// Get single doctor by ID
router.get('/:id', async (req, res) => {
    console.log(req.params.id);
    try {
        const doctor = await DoctorVerification.findById(req.params.id)
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        res.status(200).json({
            success: true,
            data: doctor
        });
    } catch (error) {
        console.error('Error fetching doctor:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching doctor',
            error: error.message
        });
    }
});

// Get all doctors
router.get('/', async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .populate('verificationDetails')
            .select('-passwordHash');

        const formattedDoctors = doctors.map(doctor => {
            const verificationDetails = doctor.verificationDetails || {};
            return verificationDetails
        });


        res.status(200).json({
            success: true,
            count: formattedDoctors.length,
            data: formattedDoctors
        });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching doctors',
            error: error.message
        });
    }
});

// Get doctor's patients and their appointments
router.get('/:id/patients', async (req, res) => {
    try {
        console.log('Fetching patients for doctor verification ID:', req.params.id);
        
        // First get the doctor verification details
        const doctorVerification = await DoctorVerification.findById(req.params.id);
        if (!doctorVerification) {
            return res.status(404).json({
                success: false,
                message: 'Doctor verification details not found'
            });
        }

        // Get the base doctor document
        const doctor = await Doctor.findOne({ verificationDetails: req.params.id });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Get all appointments for this doctor
        console.log('Finding appointments with doctor ID:', doctor._id);
        const appointments = await Appointments.find({ 
            doctor: doctor._id 
        })
        .populate('patient')
        .sort({ appointment_date: -1, appointment_time: -1 }); // Most recent first
        console.log('Found appointments:', appointments.length);
        console.log('First appointment:', appointments[0]);

        // Group appointments by patient
        const patientAppointments = appointments.reduce((acc, appointment) => {
            if (!appointment.patient) return acc;
            
            const patientId = appointment.patient._id.toString();
            if (!acc[patientId]) {
                acc[patientId] = {
                    patientInfo: {
                        name: appointment.patientInfo.name,
                        phone: appointment.patientInfo.phone,
                        age: appointment.patientInfo.age,
                        gender: appointment.patientInfo.gender
                    },
                    patientId: patientId,
                    appointments: []
                };
            }
            acc[patientId].appointments.push({
                id: appointment._id,
                date: appointment.appointment_date,
                time: appointment.appointment_time,
                status: appointment.status,
                type: appointment.appointment_type,
                payment: appointment.payment
            });
            return acc;
        }, {});

        // Convert to array and sort by most recent appointment
        const patientsList = Object.values(patientAppointments)
            .sort((a, b) => {
                const lastAppA = a.appointments[0]?.date || new Date(0);
                const lastAppB = b.appointments[0]?.date || new Date(0);
                return lastAppB - lastAppA;
            });

        console.log('Doctor verification details:', {
            id: doctorVerification._id,
            name: doctorVerification.fullName,
            doctorId: doctorVerification.doctorId
        });
        console.log('Found appointments:', appointments.length);
        console.log('Processed patients:', patientsList.length);
        
        res.status(200).json({
            success: true,
            data: {
                doctor: {
                    id: doctorVerification._id,
                    name: doctorVerification.fullName || 'Unknown',
                    specialization: doctorVerification.primarySpecialization || 'Not specified'
                },
                patients: patientsList,
                totalPatients: patientsList.length,
                totalAppointments: appointments.length
            }
        });
    } catch (error) {
        console.error('Error fetching doctor patients:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching doctor patients',
            error: error.message
        });
    }
});

// Update doctor status
router.patch('/:id', async (req, res) => {
    try {
        const { registrationStatus } = req.body;
        
        if (!registrationStatus) {
            return res.status(400).json({
                success: false,
                message: 'Registration status is required'
            });
        }

        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            { registrationStatus },
            { new: true }
        ).populate('verificationDetails').select('-passwordHash');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Doctor status updated successfully',
            data: doctor
        });
    } catch (error) {
        console.error('Error updating doctor status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating doctor status',
            error: error.message
        });
    }
});

// Delete a doctor by ID
router.delete('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Delete the associated DoctorVerification record if it exists
        if (doctor.verificationDetails) {
            await DoctorVerification.findByIdAndDelete(doctor.verificationDetails);
            console.log('Deleted associated DoctorVerification record');
        }

        // Delete the doctor record
        await Doctor.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Doctor and associated verification details deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting doctor:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting doctor',
            error: error.message
        });
    }
});

module.exports = router;
