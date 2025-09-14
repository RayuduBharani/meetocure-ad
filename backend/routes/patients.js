const express = require('express');
const router = express.Router();
const connectDB = require('../DB');
const Patient = require('../models/Patient');
const PatientDetails = require('../models/PatientDetails');
const Appointment = require('../models/Appointment');

// Get all patients with their details
router.get('/', async (req, res) => {
    try {
        await connectDB();
        
        // Get all patients with their details
        const patients = await PatientDetails.find();
        
        
        // Transform the data to match frontend expectations
        const transformedPatients = patients.map((patientDetail, index) => ({
            id: patientDetail._id,
            _id: patientDetail._id, // Adding _id explicitly
            name: patientDetail.name || 'Unknown',
            contact: patientDetail.phone,
            city: 'Not specified',
            appointments: 0,
            status: 'Enrolled',
            avatar: patientDetail.photo || `https://i.pravatar.cc/40?img=${index + 1}`,
            phone: patientDetail.phone,
            dob: patientDetail.dob,
            gender: patientDetail.gender,
            createdAt: patientDetail.createdAt,
            patientId: patientDetail._id
        }));
        
        res.status(200).json({
            success: true,
            data: transformedPatients,
            count: transformedPatients.length
        });
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Register a new patient
router.post('/register', async (req, res) => {
    try {
        await connectDB();
        
        const { phone, name, dob, gender, photo } = req.body;
        
        // Validate required fields
        if (!phone) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }
        
        // Check if patient already exists
        const existingPatient = await Patient.findOne({ phone });
        if (existingPatient) {
            return res.status(409).json({
                success: false,
                message: 'Patient with this phone number already exists'
            });
        }
        
        // Create new patient
        const newPatient = await Patient.create({
            phone,
            notifications: []
        });
        
        // Create patient details
        const patientDetails = await PatientDetails.create({
            patient: newPatient._id,
            name: name || '',
            phone,
            dob: dob ? new Date(dob) : undefined,
            gender: gender || 'Other',
            photo: photo || ''
        });
        
        res.status(201).json({
            success: true,
            message: 'Patient registered successfully',
            data: {
                patientId: newPatient._id,
                detailsId: patientDetails._id,
                phone,
                name: name || '',
                gender: gender || 'Other'
            }
        });
    } catch (error) {
        console.error('Error registering patient:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get patient by ID
router.get('/:id', async (req, res) => {
    try {
        await connectDB();
        
        // First try to find the patient
        const patient = await Patient.findById(req.params.id);
        
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }
        
        // Then find the patient details
        const patientDetails = await PatientDetails.findOne({ patient: patient._id })
            .populate('patient', 'phone notifications createdAt');

        if (!patientDetails) {
            return res.status(404).json({
                success: false,
                message: 'Patient details not found'
            });
        }
        
        const transformedPatient = {
            id: `PT${String(patientDetails._id).slice(-5).toUpperCase()}`,
            name: patientDetails.name || 'Unknown',
            contact: patientDetails.phone,
            city: 'Not specified',
            appointments: 0,
            status: 'Enrolled',
            avatar: patientDetails.photo || 'https://i.pravatar.cc/40?img=1',
            phone: patientDetails.phone,
            dob: patientDetails.dob,
            gender: patientDetails.gender,
            createdAt: patientDetails.createdAt,
            patientId: patientDetails._id
        };
        
        res.status(200).json({
            success: true,
            data: transformedPatient
        });
    } catch (error) {
        console.error('Error fetching patient:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Update patient details
router.put('/:id', async (req, res) => {
    try {
        await connectDB();
        
        const { name, dob, gender, photo } = req.body;
        
        const updatedPatient = await PatientDetails.findByIdAndUpdate(
            req.params.id,
            {
                name,
                dob: dob ? new Date(dob) : undefined,
                gender,
                photo
            },
            { new: true, runValidators: true }
        ).populate('patient', 'phone notifications createdAt');
        
        if (!updatedPatient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Patient updated successfully',
            data: updatedPatient
        });
    } catch (error) {
        console.error('Error updating patient:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Delete patient
router.delete('/:id', async (req, res) => {
    try {
        await connectDB();
        
        const patientDetails = await PatientDetails.findById(req.params.id);
        if (!patientDetails) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }
        
        // Delete patient details first
        await PatientDetails.findByIdAndDelete(req.params.id);
        
        // Delete the associated patient
        await Patient.findByIdAndDelete(patientDetails.patient);
        
        res.status(200).json({
            success: true,
            message: 'Patient deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting patient:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get patient appointments
router.get('/:id/appointments', async (req, res) => {
    try {
        await connectDB();
        
        let patient = null;
        let patientDetails = null;
        
        // First try to find by PatientDetails ID
        patientDetails = await PatientDetails.findById(req.params.id);
        if (patientDetails) {
            // If found in PatientDetails, get the associated Patient
            patient = await Patient.findById(patientDetails.patient);
        } else {
            // If not found in PatientDetails, try finding in Patient collection
            patient = await Patient.findById(req.params.id);
            if (patient) {
                patientDetails = await PatientDetails.findOne({ patient: patient._id });
            }
        }
        
        if (!patient || !patientDetails) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Find all appointments for this patient
        const appointments = await Appointment.find({ patient: patient._id })
            .populate({
                path: 'doctor',
                select: 'email mobileNumber registrationStatus verificationDetails',
                populate: {
                    path: 'verificationDetails',
                    select: 'fullName gender primarySpecialization additionalSpecializations category consultationFee about experienceYears location qualifications'
                }
            })
            .sort({ appointment_date: -1, appointment_time: -1 });
        
        // Transform the data for frontend
        const transformedAppointments = appointments.map(appointment => ({
            id: appointment._id,
            appointmentDate: appointment.appointment_date,
            appointmentTime: appointment.appointment_time,
            appointmentType: appointment.appointment_type,
            status: appointment.status,
            reason: appointment.reason,
            doctor: {
                id: appointment.doctor?._id,
                name: appointment.doctor?.verificationDetails?.fullName || 'Unknown Doctor',
                email: appointment.doctor?.email,
                mobileNumber: appointment.doctor?.mobileNumber,
                registrationStatus: appointment.doctor?.registrationStatus,
                gender: appointment.doctor?.verificationDetails?.gender,
                primarySpecialization: appointment.doctor?.verificationDetails?.primarySpecialization,
                additionalSpecializations: appointment.doctor?.verificationDetails?.additionalSpecializations,
                category: appointment.doctor?.verificationDetails?.category,
                consultationFee: appointment.doctor?.verificationDetails?.consultationFee,
                about: appointment.doctor?.verificationDetails?.about,
                experienceYears: appointment.doctor?.verificationDetails?.experienceYears,
                location: appointment.doctor?.verificationDetails?.location,
                qualifications: appointment.doctor?.verificationDetails?.qualifications || []
            },
            patientInfo: appointment.patientInfo,
            payment: appointment.payment,
            medicalRecords: appointment.medicalRecords ? appointment.medicalRecords.map(record => ({
                id: record._id,
                recordType: record.record_type,
                fileUrl: record.file_url,
                description: record.description,
                uploadDate: record.upload_date,
                fileName: record.description || record.file_url.split('/').pop() || 'Unknown File',
                fileExtension: record.file_url.split('.').pop()?.toLowerCase() || 'unknown',
                fileSize: null,
                isImage: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(record.file_url.split('.').pop()?.toLowerCase()),
                isPdf: record.file_url.split('.').pop()?.toLowerCase() === 'pdf'
            })) : []
        }));
        
        res.status(200).json({
            success: true,
            data: {
                patient: {
                    id: patientDetails._id,
                    name: patientDetails.name || 'Unknown',
                    phone: patientDetails.phone,
                    dob: patientDetails.dob,
                    gender: patientDetails.gender,
                    photo: patientDetails.photo
                },
                appointments: transformedAppointments,
                totalAppointments: transformedAppointments.length
            }
        });
    } catch (error) {
        console.error('Error fetching patient appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

module.exports = router;