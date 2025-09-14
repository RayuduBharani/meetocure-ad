const express = require('express');
const router = express.Router();
const connectDB = require('../DB');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const PatientDetails = require('../models/PatientDetails');
const Doctor = require('../models/DoctorShema');

// GET appointments by date
router.get('/', async (req, res) => {
    try {
        await connectDB();
        
        const { date } = req.query;
        let filter = {};
        
        // Filter by specific date
        if (date) {
            const targetDate = new Date(date);
            const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
            const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);
            
            filter.appointment_date = {
                $gte: startOfDay,
                $lt: endOfDay
            };
        }
        
        // Find appointments with populated data
        const appointments = await Appointment.find(filter)
            .populate({
                path: 'patient',
                select: 'phone notifications createdAt'
            })
            .populate({
                path: 'doctor',
                select: 'email mobileNumber registrationStatus verificationDetails',
                populate: {
                    path: 'verificationDetails',
                    select: 'fullName gender primarySpecialization additionalSpecializations category consultationFee about experienceYears location qualifications'
                }
            })
            .sort({ appointment_date: 1, appointment_time: 1 }); // Sort by date and time ascending
        
        // Transform the data for frontend
        const transformedAppointments = appointments.map(appointment => {
            // Get patient details
            let patientName = 'Unknown Patient';
            let patientPhone = '';
            
            if (appointment.patient) {
                patientPhone = appointment.patient.phone;
            }
            
            // Use patientInfo if available, otherwise try to get from PatientDetails
            if (appointment.patientInfo && appointment.patientInfo.name) {
                patientName = appointment.patientInfo.name;
            }
            
            return {
                id: appointment._id,
                patient: {
                    id: appointment.patient?._id,
                    name: patientName,
                    phone: patientPhone,
                    info: appointment.patientInfo
                },
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
                appointmentDate: appointment.appointment_date,
                appointmentTime: appointment.appointment_time,
                appointmentType: appointment.appointment_type,
                status: appointment.status,
                reason: appointment.reason,
                payment: appointment.payment,
                medicalRecords: appointment.medicalRecords.map(record => ({
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
                })),
                createdAt: appointment.createdAt,
                updatedAt: appointment.updatedAt
            };
        });
        
        res.status(200).json({
            success: true,
            data: transformedAppointments,
            count: transformedAppointments.length,
            date: date || null
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// GET appointment by ID
router.get('/:id', async (req, res) => {
    try {
        await connectDB();
        
        const appointment = await Appointment.findById(req.params.id)
            .populate({
                path: 'patient',
                select: 'phone notifications createdAt'
            })
            .populate({
                path: 'doctor',
                select: 'email mobileNumber registrationStatus verificationDetails',
                populate: {
                    path: 'verificationDetails',
                    select: 'fullName gender primarySpecialization additionalSpecializations category consultationFee about experienceYears location qualifications'
                }
            });
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }
        
        // Transform the data
        const transformedAppointment = {
            id: appointment._id,
            patient: {
                id: appointment.patient?._id,
                name: appointment.patientInfo?.name || 'Unknown Patient',
                phone: appointment.patient?.phone || '',
                info: appointment.patientInfo
            },
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
            appointmentDate: appointment.appointment_date,
            appointmentTime: appointment.appointment_time,
            appointmentType: appointment.appointment_type,
            status: appointment.status,
            reason: appointment.reason,
            payment: appointment.payment,
            medicalRecords: appointment.medicalRecords.map(record => ({
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
            })),
            createdAt: appointment.createdAt,
            updatedAt: appointment.updatedAt
        };
        
        res.status(200).json({
            success: true,
            data: transformedAppointment
        });
    } catch (error) {
        console.error('Error fetching appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// UPDATE appointment status
router.patch('/:id/status', async (req, res) => {
    try {
        await connectDB();
        
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }
        
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }
        
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate({
            path: 'patient',
            select: 'phone notifications createdAt'
        }).populate({
            path: 'doctor',
            select: 'email mobileNumber registrationStatus verificationDetails',
            populate: {
                path: 'verificationDetails',
                select: 'fullName gender primarySpecialization additionalSpecializations category consultationFee about experienceYears location qualifications'
            }
        });
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Appointment status updated successfully',
            data: {
                id: appointment._id,
                status: appointment.status,
                appointmentDate: appointment.appointment_date,
                appointmentTime: appointment.appointment_time
            }
        });
    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// UPDATE appointment
router.put('/:id', async (req, res) => {
    try {
        await connectDB();
        
        const updatedData = req.body;
        const appointmentId = req.params.id;

        // Find the appointment first
        const appointment = await Appointment.findById(appointmentId);
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Update the appointment with new data
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            {
                appointment_time: updatedData.appointment_time,
                appointment_type: updatedData.appointment_type,
                status: updatedData.status,
                reason: updatedData.reason,
                patientInfo: updatedData.patientInfo,
                payment: updatedData.payment
            },
            { new: true, runValidators: true }
        ).populate({
            path: 'patient',
            select: 'phone notifications createdAt'
        }).populate({
            path: 'doctor',
            select: 'email mobileNumber registrationStatus verificationDetails',
            populate: {
                path: 'verificationDetails',
                select: 'fullName gender primarySpecialization'
            }
        });

        res.status(200).json({
            success: true,
            message: 'Appointment updated successfully',
            data: updatedAppointment
        });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// DELETE appointment
router.delete('/:id', async (req, res) => {
    try {
        await connectDB();
        
        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }
        
        await Appointment.findByIdAndDelete(req.params.id);
        
        res.status(200).json({
            success: true,
            message: 'Appointment deleted successfully',
            data: {
                id: appointment._id,
                appointmentDate: appointment.appointment_date,
                appointmentTime: appointment.appointment_time
            }
        });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

module.exports = router;
