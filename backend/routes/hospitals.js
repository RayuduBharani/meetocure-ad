const express = require('express');
const router = express.Router();
const HospitalLogins = require('../models/Hospital');
const Doctor = require('../models/DoctorShema');
const DoctorVerification = require('../models/DoctorVerificationShema');

// Utility function to get doctor stats for a hospital
const getDoctorStatsForHospital = async (hospitalName) => {
    try {
        const doctorVerifications = await DoctorVerification.find({
            'hospitalInfo.hospitalName': { $regex: new RegExp(hospitalName, 'i') }
        }).populate('doctorId');

        const totalDoctors = doctorVerifications.length;
        const verifiedDoctors = doctorVerifications.filter(dv => dv.verified === true).length;
        const pendingDoctors = doctorVerifications.filter(dv => dv.verified === false).length;

        return {
            totalDoctors,
            verifiedDoctors,
            pendingDoctors,
            doctors: doctorVerifications
        };
    } catch (error) {
        console.error('Error getting doctor stats:', error);
        return {
            totalDoctors: 0,
            verifiedDoctors: 0,
            pendingDoctors: 0,
            doctors: []
        };
    }
};

// GET all hospitals with complete doctor details
router.get('/', async (req, res) => {
    try {
        console.log('📊 Fetching all hospitals...');
        
        const hospitals = await HospitalLogins.find().select('-password');
        console.log(`Found ${hospitals.length} hospitals in database`);

        // Get doctor stats for each hospital
        const hospitalsWithDoctors = await Promise.all(
            hospitals.map(async (hospital) => {
                const stats = await getDoctorStatsForHospital(hospital.hospitalName);
                return {
                    _id: hospital._id,
                    email: hospital.email,
                    hospitalName: hospital.hospitalName,
                    address: hospital.address,
                    contact: hospital.contact,
                    hospitalImage: hospital.hospitalImage,
                    ...stats
                };
            })
        );

        console.log('✅ Successfully fetched hospitals with doctor data');

        res.status(200).json({
            success: true,
            data: hospitalsWithDoctors,
            count: hospitalsWithDoctors.length,
            message: 'Hospitals fetched successfully'
        });

    } catch (error) {
        console.error('❌ Error fetching hospitals:', error);
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
        console.log('📈 Fetching hospital statistics...');

        // Get total hospitals
        const totalHospitals = await HospitalLogins.countDocuments();
        
        // Get all doctor verifications
        const allDoctorVerifications = await DoctorVerification.find();
        
        const totalDoctors = allDoctorVerifications.length;
        const totalVerifiedDoctors = allDoctorVerifications.filter(dv => dv.verified === true).length;
        const totalPendingDoctors = allDoctorVerifications.filter(dv => dv.verified === false).length;
        
        // Count unique hospitals that have doctors
        const hospitalNames = new Set();
        allDoctorVerifications.forEach(dv => {
            if (dv.hospitalInfo && dv.hospitalInfo.length > 0) {
                dv.hospitalInfo.forEach(hi => {
                    if (hi.hospitalName) {
                        hospitalNames.add(hi.hospitalName.toLowerCase());
                    }
                });
            }
        });
        
        const hospitalsWithDoctors = hospitalNames.size;

        const stats = {
            totalHospitals,
            totalDoctors,
            totalVerifiedDoctors,
            totalPendingDoctors,
            hospitalsWithDoctors,
            hospitalsWithoutDoctors: Math.max(0, totalHospitals - hospitalsWithDoctors)
        };

        console.log('✅ Stats calculated:', stats);

        res.status(200).json({
            success: true,
            data: stats,
            message: 'Statistics fetched successfully'
        });

    } catch (error) {
        console.error('❌ Error fetching hospital stats:', error);
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
        console.log('👥 Fetching all doctors...');

        const doctorVerifications = await DoctorVerification.find()
            .populate('doctorId')
            .sort({ createdAt: -1 });

        const doctorsWithHospitalInfo = doctorVerifications.map(dv => ({
            _id: dv._id,
            doctorId: dv.doctorId,
            fullName: dv.fullName,
            primarySpecialization: dv.primarySpecialization,
            category: dv.category,
            consultationFee: dv.consultationFee,
            verified: dv.verified,
            hospitalInfo: dv.hospitalInfo,
            location: dv.location,
            medicalCouncilRegistrationNumber: dv.medicalCouncilRegistrationNumber,
            createdAt: dv.createdAt,
            updatedAt: dv.updatedAt
        }));

        console.log(`✅ Found ${doctorsWithHospitalInfo.length} doctors`);

        res.status(200).json({
            success: true,
            data: doctorsWithHospitalInfo,
            count: doctorsWithHospitalInfo.length,
            message: 'All doctors fetched successfully'
        });

    } catch (error) {
        console.error('❌ Error fetching all doctors:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching all doctors',
            error: error.message
        });
    }
});

// GET doctors by hospital name
router.get('/name/:hospitalName/doctors', async (req, res) => {
    try {
        const hospitalName = decodeURIComponent(req.params.hospitalName);
        console.log(`👨‍⚕️ Fetching doctors for hospital: ${hospitalName}`);

        const doctorVerifications = await DoctorVerification.find({
            'hospitalInfo.hospitalName': { $regex: new RegExp(hospitalName, 'i') }
        }).populate('doctorId').sort({ createdAt: -1 });

        if (doctorVerifications.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No doctors found for hospital: ${hospitalName}`,
                data: [],
                count: 0
            });
        }

        // Get hospital info from verification data
        const hospitalInfo = doctorVerifications[0].hospitalInfo.find(
            hi => hi.hospitalName.toLowerCase().includes(hospitalName.toLowerCase())
        );

        console.log(`✅ Found ${doctorVerifications.length} doctors for ${hospitalName}`);

        res.status(200).json({
            success: true,
            data: doctorVerifications,
            count: doctorVerifications.length,
            hospitalInfo: hospitalInfo || { hospitalName },
            message: `Doctors for ${hospitalName} fetched successfully`
        });

    } catch (error) {
        console.error('❌ Error fetching doctors by hospital name:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching doctors by hospital name',
            error: error.message
        });
    }
});

// GET hospital by name with doctors details
router.get('/name/:hospitalName', async (req, res) => {
    try {
        const hospitalName = decodeURIComponent(req.params.hospitalName);
        console.log(`🏥 Fetching hospital: ${hospitalName}`);

        const hospital = await HospitalLogins.findOne({ 
            hospitalName: { $regex: new RegExp(hospitalName, 'i') }
        }).select('-password');

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: `Hospital '${hospitalName}' not found`
            });
        }

        const stats = await getDoctorStatsForHospital(hospital.hospitalName);

        const hospitalWithDoctors = {
            _id: hospital._id,
            email: hospital.email,
            hospitalName: hospital.hospitalName,
            address: hospital.address,
            contact: hospital.contact,
            hospitalImage: hospital.hospitalImage,
            ...stats
        };

        console.log(`✅ Hospital ${hospital.hospitalName} has ${stats.totalDoctors} doctors`);

        res.status(200).json({
            success: true,
            data: hospitalWithDoctors,
            message: `Hospital ${hospitalName} fetched successfully`
        });

    } catch (error) {
        console.error('❌ Error fetching hospital by name:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching hospital by name',
            error: error.message
        });
    }
});

// GET search hospitals by name
router.get('/search/:searchTerm', async (req, res) => {
    try {
        const searchTerm = decodeURIComponent(req.params.searchTerm);
        console.log(`🔍 Searching hospitals with term: ${searchTerm}`);

        const hospitals = await HospitalLogins.find({
            hospitalName: { $regex: new RegExp(searchTerm, 'i') }
        }).select('-password');

        const hospitalsWithDoctors = await Promise.all(
            hospitals.map(async (hospital) => {
                const stats = await getDoctorStatsForHospital(hospital.hospitalName);
                return {
                    _id: hospital._id,
                    email: hospital.email,
                    hospitalName: hospital.hospitalName,
                    address: hospital.address,
                    contact: hospital.contact,
                    hospitalImage: hospital.hospitalImage,
                    ...stats
                };
            })
        );

        console.log(`✅ Found ${hospitalsWithDoctors.length} hospitals matching '${searchTerm}'`);

        res.status(200).json({
            success: true,
            data: hospitalsWithDoctors,
            count: hospitalsWithDoctors.length,
            searchTerm,
            message: `Search results for '${searchTerm}'`
        });

    } catch (error) {
        console.error('❌ Error searching hospitals:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching hospitals',
            error: error.message
        });
    }
});

    // GET hospital by ID with doctors details
router.get('/:id', async (req, res) => {
    try {
        console.log(`🏥 Fetching hospital by ID: ${req.params.id}`);

        const hospital = await HospitalLogins.findById(req.params.id).select('-password');

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        const stats = await getDoctorStatsForHospital(hospital.hospitalName);

        const hospitalWithDoctors = {
            _id: hospital._id,
            email: hospital.email,
            hospitalName: hospital.hospitalName,
            address: hospital.address,
            contact: hospital.contact,
            hospitalImage: hospital.hospitalImage,
            doctors: stats.doctors,
            ...stats
        };        console.log(`✅ Hospital ${hospital.hospitalName} has ${stats.totalDoctors} doctors`);

        res.status(200).json({
            success: true,
            data: hospitalWithDoctors,
            message: 'Hospital fetched successfully'
        });

    } catch (error) {
        console.error('❌ Error fetching hospital:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid hospital ID format'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error fetching hospital',
            error: error.message
        });
    }
});

// GET doctors for a specific hospital by ID
router.get('/:id/doctors', async (req, res) => {
    try {
        console.log(`👨‍⚕️ Fetching doctors for hospital ID: ${req.params.id}`);

        const hospital = await HospitalLogins.findById(req.params.id).select('-password');
        
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        const doctorVerifications = await DoctorVerification.find({
            'hospitalInfo.hospitalName': { $regex: new RegExp(hospital.hospitalName, 'i') }
        }).populate('doctorId').sort({ createdAt: -1 });

        console.log(`✅ Found ${doctorVerifications.length} doctors for hospital ${hospital.hospitalName}`);

        res.status(200).json({
            success: true,
            data: doctorVerifications,
            count: doctorVerifications.length,
            hospitalInfo: {
                id: hospital._id,
                name: hospital.hospitalName,
                address: hospital.address,
                contact: hospital.contact
            },
            message: `Doctors for ${hospital.hospitalName} fetched successfully`
        });

    } catch (error) {
        console.error('❌ Error fetching hospital doctors:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid hospital ID format'
            });
        }

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
        console.log('🏥 Creating new hospital...');
        
        const { email, password, hospitalName, address, contact, hospitalImage } = req.body;

        // Validation
        if (!email || !password || !hospitalName || !address || !contact) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: email, password, hospitalName, address, contact'
            });
        }

        // Check if hospital already exists
        const existingHospital = await HospitalLogins.findOne({ 
            $or: [
                { email: email.toLowerCase() },
                { hospitalName: { $regex: new RegExp(hospitalName, 'i') } }
            ]
        });

        if (existingHospital) {
            return res.status(409).json({
                success: false,
                message: 'Hospital with this email or name already exists'
            });
        }

        const hospital = new HospitalLogins({
            email: email.toLowerCase(),
            password, // Note: In production, hash this password
            hospitalName,
            address,
            contact,
            hospitalImage: hospitalImage || null
        });

        await hospital.save();

        console.log(`✅ Hospital created: ${hospital.hospitalName}`);

        res.status(201).json({
            success: true,
            message: 'Hospital created successfully',
            data: {
                _id: hospital._id,
                email: hospital.email,
                hospitalName: hospital.hospitalName,
                address: hospital.address,
                contact: hospital.contact,
                hospitalImage: hospital.hospitalImage
            }
        });

    } catch (error) {
        console.error('❌ Error creating hospital:', error);
        
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Hospital with this email already exists'
            });
        }

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
        console.log(`🔄 Updating hospital ID: ${req.params.id}`);

        const { hospitalName, address, contact, hospitalImage } = req.body;

        const hospital = await HospitalLogins.findByIdAndUpdate(
            req.params.id,
            {
                hospitalName,
                address,
                contact,
                hospitalImage
            },
            { 
                new: true, 
                runValidators: true,
                select: '-password'
            }
        );

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        console.log(`✅ Hospital updated: ${hospital.hospitalName}`);

        res.status(200).json({
            success: true,
            message: 'Hospital updated successfully',
            data: hospital
        });

    } catch (error) {
        console.error('❌ Error updating hospital:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid hospital ID format'
            });
        }

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
        console.log(`🗑️ Deleting hospital ID: ${req.params.id}`);

        const hospital = await HospitalLogins.findById(req.params.id);
        
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        // Check if hospital has doctors
        const stats = await getDoctorStatsForHospital(hospital.hospitalName);
        
        if (stats.totalDoctors > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete hospital with registered doctors. Please remove all doctors first.',
                doctorsCount: stats.totalDoctors
            });
        }

        await HospitalLogins.findByIdAndDelete(req.params.id);

        console.log(`✅ Hospital deleted: ${hospital.hospitalName}`);

        res.status(200).json({
            success: true,
            message: 'Hospital deleted successfully',
            data: {
                hospitalName: hospital.hospitalName,
                deletedAt: new Date()
            }
        });

    } catch (error) {
        console.error('❌ Error deleting hospital:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid hospital ID format'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error deleting hospital',
            error: error.message
        });
    }
});

module.exports = router;
