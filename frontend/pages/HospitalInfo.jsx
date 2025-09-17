import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HospitalIcon } from '../components/icons/HospitalIcon';
import { DoctorIcon } from '../components/icons/DoctorIcon';
import Badge from '../components/ui/Badge.jsx';

const HospitalInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    useEffect(() => {
        fetchHospitalDetails();
    }, [id]);

    const fetchHospitalDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`http://13.201.62.186:8000/admin/hospitals/${id}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                setHospital(data.data);
            } else {
                setError(data.message || 'Failed to fetch hospital details');
            }
        } catch (err) {
            setError('Failed to fetch hospital details: ' + err.message);
            console.error('Error fetching hospital details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDoctors = () => {
        navigate(`/hospitals/${id}/doctors`);
    };

    const handleBack = () => {
        navigate('/hospitals');
    };



    if (loading) {
        return (
            <div className="p-8">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
                    <p className="text-red-600 text-base mb-4">{error}</p>
                    <div className="flex space-x-3">
                        <button 
                            onClick={handleBack}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            Back to Hospitals
                        </button>
                        <button 
                            onClick={() => {
                                setError(null);
                                setLoading(true);
                                fetchHospitalDetails();
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!hospital) {
        return (
            <div className="p-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-600">Hospital not found</p>
                    <button 
                        onClick={handleBack}
                        className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    >
                        Back to Hospitals
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <button
                        onClick={handleBack}
                        className="text-gray-600 hover:text-gray-800 mb-2 flex items-center"
                    >
                        ← Back to Hospitals
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {hospital.hospitalName}
                    </h1>
                    <p className="text-gray-600">Hospital Details</p>
                </div>
            </div>
            
            {/* Hospital Details Card */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Hospital Image Banner */}
                <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    {hospital.hospitalImage ? (
                        <img 
                            src={hospital.hospitalImage} 
                            alt={hospital.hospitalName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }}
                        />
                    ) : (
                        <HospitalIcon className="w-16 h-16 text-white" />
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm text-gray-600">Address</label>
                                    <p className="text-gray-800">{hospital.address}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">Contact Number</label>
                                    <p className="text-gray-800">{hospital.contact}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">Email</label>
                                    <p className="text-gray-800">{hospital.email}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Doctor Statistics</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <label className="text-sm text-blue-600">Total Doctors</label>
                                    <p className="text-2xl font-bold text-blue-800">{hospital.totalDoctors || 0}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <label className="text-sm text-green-600">Verified</label>
                                    <p className="text-2xl font-bold text-green-800">{hospital.verifiedDoctors || 0}</p>
                                </div>
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <label className="text-sm text-yellow-600">Pending</label>
                                    <p className="text-2xl font-bold text-yellow-800">{hospital.pendingDoctors || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info (if available) */}
                    {hospital.specialties && hospital.specialties.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Specialties</h3>
                            <div className="flex flex-wrap gap-2">
                                {hospital.specialties.map((specialty, index) => (
                                    <span 
                                        key={index}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                    >
                                        {specialty}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {hospital.description && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">About</h3>
                            <p className="text-gray-600">{hospital.description}</p>
                        </div>
                    )}

                    {/* Doctors List */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Doctors ({hospital.doctors?.length || 0})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {hospital.doctors && hospital.doctors.map((doctor) => (
                                <div key={doctor._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="text-lg font-medium text-gray-900">
                                                Dr. {doctor.verificationDetails?.fullName || doctor.fullName || 'No Name'}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {doctor.verificationDetails?.primarySpecialization || doctor.primarySpecialization || 'Specialization not specified'}
                                            </p>
                                        </div>
                                        <Badge 
                                            type={doctor.verified ? "success" : "warning"}
                                            text={doctor.verified ? "Verified" : "Pending"}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2 mb-4">
                                        {(doctor.verificationDetails?.category || doctor.category) && (
                                            <div className="text-sm">
                                                <span className="text-gray-600">Category:</span>
                                                <span className="ml-2 text-gray-800">{doctor.verificationDetails?.category || doctor.category}</span>
                                            </div>
                                        )}
                                        {(doctor.verificationDetails?.consultationFee || doctor.consultationFee) && (
                                            <div className="text-sm">
                                                <span className="text-gray-600">Consultation Fee:</span>
                                                <span className="ml-2 text-gray-800">₹{doctor.verificationDetails?.consultationFee || doctor.consultationFee}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => navigate(`/doctors/${doctor._id}`)}
                                            className="flex-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium transition-colors"
                                        >
                                            View Details
                                        </button>
                                        <button
                                            onClick={() => navigate(`/doctors/${doctor._id}/patients`)}
                                            className="flex-1 px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm font-medium transition-colors"
                                        >
                                            View Patients
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {(!hospital.doctors || hospital.doctors.length === 0) && (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <DoctorIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600">No doctors found for this hospital</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HospitalInfo;
