const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const Doctor = require('../models/DoctorShema');
const DoctorVerification = require('../models/DoctorVerificationShema');
const connectDB = require('../DB');

// GET all hospitals with complete doctor details
router.get('/', async (req, res) => {
    try {
        await connectDB();
        const hospitals = await Hospital.find()
        // console.log(hospitals);

        res.status(200).json({
            success: true,
            data: hospitals,
            count: hospitals.length
        });
    } catch (error) {
        console.error('Error fetching hospitals:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching hospitals',
            error: error.message
        });
    }
});

// GET hospital statistics
router.get('/stats', async (req, res) => {
    try {
        await connectDB();
        
        const totalHospitals = await Hospital.countDocuments();
        
        // Count total doctors across all hospitals
        const hospitals = await Hospital.find();
        let totalDoctors = 0;
        let hospitalsWithDoctors = 0;
        
        hospitals.forEach(hospital => {
            if (hospital.docters && hospital.docters.length > 0) {
                totalDoctors += hospital.docters.length;
                hospitalsWithDoctors++;
            }
        });

        res.status(200).json({
            success: true,
            data: {
                totalHospitals,
                totalDoctors,
                hospitalsWithDoctors,
                hospitalsWithoutDoctors: totalHospitals - hospitalsWithDoctors
            }
        });
    } catch (error) {
        console.error('Error fetching hospital stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching hospital statistics',
            error: error.message
        });
    }
});

// GET all doctors from all hospitals
router.get('/doctors/all', async (req, res) => {
    try {
        await connectDB();
        
        // Get all hospitals with their doctors
        const hospitals = await Hospital.find()
        console.log(hospitals);

        // Flatten all doctors with their hospital information
        const allDoctors = [];
        hospitals.forEach(hospital => {
            if (hospital.docters && hospital.docters.length > 0) {
                hospital.docters.forEach(doctor => {
                    allDoctors.push({
                        ...doctor,
                        hospitalInfo: {
                            hospitalId: hospital._id,
                            hospitalName: hospital.hospitalName,
                            hospitalAddress: hospital.address,
                            hospitalContact: hospital.contact
                        }
                    });
                });
            }
        });

        res.status(200).json({
            success: true,
            data: allDoctors,
            count: allDoctors.length,
            totalHospitals: hospitals.length
        });
    } catch (error) {
        console.error('Error fetching all doctors:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching all doctors',
            error: error.message
        });
    }
});

// GET hospital by ID with doctors details
router.get('/:id', async (req, res) => {
    try {
        await connectDB();
        const hospital = await Hospital.findOne({_id: req.params.id});

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        // If hospital has doctors, fetch their full details
        if (hospital.docters && hospital.docters.length > 0) {
            const doctorIds = hospital.docters.map(id => id.toString().trim().replace(/\n/g, ''));
            console.log('Doctor IDs to fetch:', doctorIds);
            const doctors = await Doctor.find({ _id: { $in: doctorIds } }).populate('verificationDetails');
            console.log('Found doctors:', doctors.length);
            
            // Replace doctor IDs with full doctor objects
            hospital.docters = doctors;
        }

        res.status(200).json({
            success: true,
            data: hospital
        });
    } catch (error) {
        console.error('Error fetching hospital:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching hospital',
            error: error.message
        });
    }
});

// GET doctors for a specific hospital
router.get('/:id/doctors', async (req, res) => {
    try {
        await connectDB();
        const hospital = await Hospital.findById(req.params.id);
        console.log(hospital);
        
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        res.status(200).json({
            success: true,
            data: hospital.docters || [],
            count: hospital.docters ? hospital.docters.length : 0
        });
    } catch (error) {
        console.error('Error fetching hospital doctors:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching hospital doctors',
            error: error.message
        });
    }
});



// POST create new hospital
router.post('/', async (req, res) => {
    try {
        await connectDB();
        const { email, password, hospitalName, address, contact, hospitalImage, description, specialties, facilities, location } = req.body;

        // Check if hospital already exists
        const existingHospital = await Hospital.findOne({ email });
        if (existingHospital) {
            return res.status(409).json({
                success: false,
                message: 'Hospital with this email already exists'
            });
        }

        const hospital = new Hospital({
            email,
            password,
            hospitalName,
            address,
            contact,
            hospitalImage,
            description,
            specialties,
            facilities,
            location,
            doctors: []
        });

        await hospital.save();

        res.status(201).json({
            success: true,
            message: 'Hospital created successfully',
            data: {
                id: hospital._id,
                email: hospital.email,
                hospitalName: hospital.hospitalName,
                address: hospital.address,
                contact: hospital.contact
            }
        });
    } catch (error) {
        console.error('Error creating hospital:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating hospital',
            error: error.message
        });
    }
});

// PUT update hospital
router.put('/:id', async (req, res) => {
    try {
        await connectDB();
        const { hospitalName, address, contact, hospitalImage, description, specialties, facilities, location, docters } = req.body;

        const hospital = await Hospital.findByIdAndUpdate(
            req.params.id,
            {
                hospitalName,
                address,
                contact,
                hospitalImage,
                description,
                specialties,
                facilities,
                location,
                docters
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Hospital updated successfully',
            data: hospital
        });
    } catch (error) {
        console.error('Error updating hospital:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating hospital',
            error: error.message
        });
    }
});

// DELETE hospital (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        await connectDB();
        
        // First check if hospital exists
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        // Check if hospital has doctors
        if (hospital.docters && hospital.docters.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete hospital with registered doctors. Please remove all doctors first.',
                doctorsCount: hospital.docters.length
            });
        }

        // Delete the hospital
        const deletedHospital = await Hospital.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Hospital deleted successfully',
            data: {
                hospitalName: deletedHospital.hospitalName,
                deletedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Error deleting hospital:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting hospital',
            error: error.message
        });
    }
});

// HARD DELETE hospital (permanent delete)
router.delete('/:id/permanent', async (req, res) => {
    try {
        await connectDB();
        
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        // Permanently delete the hospital
        await Hospital.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Hospital permanently deleted',
            data: {
                hospitalName: hospital.hospitalName,
                deletedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Error permanently deleting hospital:', error);
        res.status(500).json({
            success: false,
            message: 'Error permanently deleting hospital',
            error: error.message
        });
    }
});

module.exports = router;
