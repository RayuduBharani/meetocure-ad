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
            .populate({
                path: 'docters',
                model: 'Doctor',
                populate: {
                    path: 'verificationDetails',
                    model: 'DoctorVerification'
                }
            })
            .select('-password');

        console.log('Fetched hospitals with populated doctors:', hospitals.length);

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
        
        // Get hospitals with populated doctors for accurate counting
        const hospitals = await Hospital.find().populate('docters');
        
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
        
        const hospitals = await Hospital.find()
            .populate({
                path: 'docters',
                model: 'Doctor',
                populate: {
                    path: 'verificationDetails',
                    model: 'DoctorVerification'
                }
            });

        const allDoctors = [];
        hospitals.forEach(hospital => {
            if (hospital.docters && hospital.docters.length > 0) {
                hospital.docters.forEach(doctor => {
                    allDoctors.push({
                        ...doctor.toObject(),
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
        
        const hospital = await Hospital.findById(req.params.id)
            .populate({
                path: 'docters',
                model: 'Doctor',
                populate: {
                    path: 'verificationDetails',
                    model: 'DoctorVerification'
                }
            })
            .select('-password');

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        console.log(`Hospital ${hospital.hospitalName} has ${hospital.docters?.length || 0} doctors`);

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
        
        const hospital = await Hospital.findById(req.params.id)
            .populate({
                path: 'docters',
                model: 'Doctor',
                populate: {
                    path: 'verificationDetails',
                    model: 'DoctorVerification'
                }
            });
        
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        res.status(200).json({
            success: true,
            data: hospital.docters || [],
            count: hospital.docters ? hospital.docters.length : 0,
            hospitalInfo: {
                name: hospital.hospitalName,
                address: hospital.address,
                contact: hospital.contact
            }
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
            specialties: specialties || [],
            facilities: facilities || [],
            location: location || {},
            docters: []
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

// DELETE hospital
router.delete('/:id', async (req, res) => {
    try {
        await connectDB();
        
        const hospital = await Hospital.findById(req.params.id).populate('docters');
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        if (hospital.docters && hospital.docters.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete hospital with registered doctors. Please remove all doctors first.',
                doctorsCount: hospital.docters.length
            });
        }

        await Hospital.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Hospital deleted successfully',
            data: {
                hospitalName: hospital.hospitalName,
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

// POST add doctor to hospital
router.post('/:hospitalId/doctors/:doctorId', async (req, res) => {
    try {
        await connectDB();
        
        const hospital = await Hospital.findById(req.params.hospitalId);
        const doctor = await Doctor.findById(req.params.doctorId);
        
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }
        
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        
        // Check if doctor is already added to this hospital
        if (hospital.docters.includes(req.params.doctorId)) {
            return res.status(400).json({
                success: false,
                message: 'Doctor is already associated with this hospital'
            });
        }
        
        hospital.docters.push(req.params.doctorId);
        await hospital.save();
        
        res.status(200).json({
            success: true,
            message: 'Doctor added to hospital successfully',
            data: {
                hospitalId: hospital._id,
                doctorId: doctor._id,
                hospitalName: hospital.hospitalName,
                doctorName: doctor.fullName || doctor.name
            }
        });
    } catch (error) {
        console.error('Error adding doctor to hospital:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding doctor to hospital',
            error: error.message
        });
    }
});

// DELETE remove doctor from hospital
router.delete('/:hospitalId/doctors/:doctorId', async (req, res) => {
    try {
        await connectDB();
        
        const hospital = await Hospital.findById(req.params.hospitalId);
        
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }
        
        hospital.docters = hospital.docters.filter(
            doctorId => doctorId.toString() !== req.params.doctorId
        );
        
        await hospital.save();
        
        res.status(200).json({
            success: true,
            message: 'Doctor removed from hospital successfully'
        });
    } catch (error) {
        console.error('Error removing doctor from hospital:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing doctor from hospital',
            error: error.message
        });
    }
});

module.exports = router;
