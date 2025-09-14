import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HospitalIcon } from '../components/icons/HospitalIcon.jsx';
import { DoctorIcon } from '../components/icons/DoctorIcon.jsx';
import { XIcon } from '../components/icons/XIcon.jsx';

const HospitalInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDoctorsModal, setShowDoctorsModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchHospitalInfo();
    }
  }, [id]);

  const fetchHospitalInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://13.232.200.28:8000/admin/hospitals/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setHospital(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch hospital information');
      console.error('Error fetching hospital:', err);
    } finally {
      setLoading(false);
    }
  };
  console.log(hospital);

  const handleBackToHospitals = () => {
    navigate('/hospitals');
  };

  const handleViewDoctors = () => {
    setShowDoctorsModal(true);
  };

  const closeDoctorsModal = () => {
    setShowDoctorsModal(false);
  };

  if (loading) {
    return (
      <div className="p-8 font-sans">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2f4f6f]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 font-sans">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-md">
          <p className="text-red-600 text-base">{error}</p>
          <button 
            onClick={fetchHospitalInfo}
            className="mt-3 px-5 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="p-8 font-sans">
        <div className="text-center py-12">
          <HospitalIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Hospital not found</h3>
          <p className="text-gray-500 text-base">The hospital you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 font-sans bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBackToHospitals}
            className="flex items-center text-[#2f4f6f] hover:text-gray-700 transition-all duration-200 font-medium"
          >
            <XIcon className="w-5 h-5 mr-2 rotate-45" />
            Back to Hospitals
          </button>
        </div>
        <h1 className="text-3xl font-bold text-[#2f4f6f] mb-1">{hospital.hospitalName}</h1>
        <p className="text-gray-600 text-base">Complete hospital information and doctor details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hospital Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col h-full">
            {/* Hospital Image */}
            <div className="h-64 bg-gradient-to-r from-[#2f4f6f] to-gray-400 flex items-center justify-center">
              {hospital.hospitalImage ? (
                <img 
                  src={`http://13.232.200.28:8000${hospital.hospitalImage}`} 
                  alt={hospital.hospitalName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <HospitalIcon className="w-20 h-20 text-white" />
              )}
            </div>

            {/* Hospital Details */}
            <div className="p-7">
              <h2 className="text-2xl font-bold text-[#2f4f6f] mb-4">Hospital Information</h2>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Hospital Name:</span>
                  <p className="text-gray-800 font-semibold text-base">{hospital.hospitalName}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Address:</span>
                  <p className="text-gray-800 text-base">{hospital.address}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Contact:</span>
                  <p className="text-gray-800 text-base">{hospital.contact}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Email:</span>
                  <p className="text-gray-800 text-base">{hospital.email}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-600">Total Doctors:</span>
                  <p className="text-[#2f4f6f] font-bold text-lg">
                    {hospital.docters ? hospital.docters.length : 0}
                  </p>
                </div>
              </div>

              {/* View Doctors Button */}
              {hospital.docters && hospital.docters.length > 0 && (
                <div className="mt-8">
                  <button
                    onClick={handleViewDoctors}
                    className="w-full bg-[#2f4f6f] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#24384e] transition-all duration-200 text-base flex items-center justify-center shadow-sm"
                  >
                    <DoctorIcon className="w-5 h-5 mr-2" />
                    View All Doctors ({hospital.docters.length})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Doctors List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#2f4f6f]">Doctors</h2>
              <span className="px-4 py-1 bg-gray-100 text-[#2f4f6f] rounded-full text-base font-semibold">
                {hospital.docters ? hospital.docters.length : 0} doctors
              </span>
            </div>

            {hospital.docters && hospital.docters.length > 0 ? (
              <div className="space-y-6">
                {hospital.docters.map((doctor, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl p-6 bg-white hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start space-x-6">
                      {/* Doctor Avatar */}
                      <div className="w-16 h-16 bg-gradient-to-r from-[#2f4f6f] to-gray-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        {doctor.verificationDetails?.profileImage ? (
                          <img
                            src={doctor.verificationDetails.profileImage}
                            alt={doctor.verificationDetails.fullName}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <DoctorIcon className="w-8 h-8 text-white" />
                        )}
                      </div>

                      {/* Doctor Details */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-[#2f4f6f]">
                            {doctor.verificationDetails?.fullName || 'Name not available'}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            doctor.registrationStatus === 'verified'
                              ? 'bg-green-100 text-green-800'
                              : doctor.registrationStatus === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doctor.registrationStatus?.replace(/_/g, ' ') || 'Unknown'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Specialization:</span>
                            <span className="ml-2 text-gray-800">
                              {doctor.verificationDetails?.primarySpecialization || 'Not specified'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Category:</span>
                            <span className="ml-2 text-gray-800">
                              {doctor.verificationDetails?.category || 'Not specified'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Experience:</span>
                            <span className="ml-2 text-gray-800">
                              {doctor.verificationDetails?.experienceYears || 'Not specified'} years
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Consultation Fee:</span>
                            <span className="ml-2 text-gray-800">
                              ₹{doctor.verificationDetails?.consultationFee || 'Not specified'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Email:</span>
                            <span className="ml-2 text-gray-800">{doctor.email || 'Not provided'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Mobile:</span>
                            <span className="ml-2 text-gray-800">{doctor.mobileNumber || 'Not provided'}</span>
                          </div>
                        </div>

                        {doctor.verificationDetails?.about && (
                          <div className="mb-3">
                            <span className="text-gray-600 text-sm">About:</span>
                            <p className="text-gray-800 text-sm mt-1">
                              {doctor.verificationDetails.about}
                            </p>
                          </div>
                        )}

                        {doctor.verificationDetails?.qualifications && doctor.verificationDetails.qualifications.length > 0 && (
                          <div className="mb-3">
                            <span className="text-gray-600 text-sm">Qualifications:</span>
                            <div className="mt-1">
                              {doctor.verificationDetails.qualifications.map((qual, qualIndex) => (
                                <div key={qualIndex} className="text-sm text-gray-800">
                                  {qual.degree} - {qual.universityCollege} ({qual.year})
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {doctor.verificationDetails?.location && (
                          <div className="mb-3">
                            <span className="text-gray-600 text-sm">Location:</span>
                            <p className="text-gray-800 text-sm">
                              {doctor.verificationDetails.location.city}, {doctor.verificationDetails.location.state}
                            </p>
                          </div>
                        )}

                        {doctor.verificationDetails?.medicalCouncilRegistrationNumber && (
                          <div className="mb-3">
                            <span className="text-gray-600 text-sm">Medical Council Registration:</span>
                            <p className="text-gray-800 text-sm">
                              {doctor.verificationDetails.medicalCouncilRegistrationNumber}
                            </p>
                          </div>
                        )}

                        {/* View Details Button */}
                        <div className="mt-4">
                          <button
                            onClick={() => navigate(`/doctors/${doctor._id}`)}
                            className="px-4 py-2 bg-[#2f4f6f] text-white rounded-lg font-semibold hover:bg-[#24384e] transition-all duration-200 text-sm"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <DoctorIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No doctors registered</h3>
                <p className="text-gray-500 text-base">
                  This hospital doesn't have any doctors registered yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Doctors Modal */}
      {showDoctorsModal && hospital && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-[#2f4f6f]">
                  All Doctors at {hospital.hospitalName}
                </h2>
                <p className="text-gray-600 text-base">
                  {hospital.docters ? hospital.docters.length : 0} doctors registered
                </p>
              </div>
              <button
                onClick={closeDoctorsModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <XIcon className="w-6 h-6 text-[#2f4f6f]" />
              </button>
            </div>

            {/* Doctors List */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {hospital.docters && hospital.docters.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {hospital.docters.map((doctor, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-6 bg-white hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-start space-x-6">
                        {/* Doctor Avatar */}
                        <div className="w-20 h-20 bg-gradient-to-r from-[#2f4f6f] to-gray-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                          {doctor.verificationDetails?.profileImage ? (
                            <img
                              src={doctor.verificationDetails.profileImage}
                              alt={doctor.verificationDetails.fullName}
                              className="w-20 h-20 rounded-full object-cover"
                            />
                          ) : (
                            <DoctorIcon className="w-10 h-10 text-white" />
                          )}
                        </div>

                        {/* Doctor Details */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-semibold text-[#2f4f6f]">
                              {doctor.verificationDetails?.fullName || 'Name not available'}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              doctor.registrationStatus === 'verified'
                                ? 'bg-green-100 text-green-800'
                                : doctor.registrationStatus === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {doctor.registrationStatus?.replace(/_/g, ' ') || 'Unknown'}
                            </span>
                          </div>

                          <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Specialization:</span>
                              <span className="text-gray-800 font-medium">
                                {doctor.verificationDetails?.primarySpecialization || 'Not specified'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Category:</span>
                              <span className="text-gray-800">
                                {doctor.verificationDetails?.category || 'Not specified'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Experience:</span>
                              <span className="text-gray-800">
                                {doctor.verificationDetails?.experienceYears || 'Not specified'} years
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Consultation Fee:</span>
                              <span className="text-gray-800 font-semibold">
                                ₹{doctor.verificationDetails?.consultationFee || 'Not specified'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Email:</span>
                              <span className="text-gray-800">{doctor.email || 'Not provided'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Mobile:</span>
                              <span className="text-gray-800">{doctor.mobileNumber || 'Not provided'}</span>
                            </div>
                          </div>

                          {doctor.verificationDetails?.about && (
                            <div className="mb-3">
                              <span className="text-gray-600 text-sm font-medium">About:</span>
                              <p className="text-gray-800 text-sm mt-1">
                                {doctor.verificationDetails.about}
                              </p>
                            </div>
                          )}

                          {doctor.verificationDetails?.qualifications && doctor.verificationDetails.qualifications.length > 0 && (
                            <div className="mb-3">
                              <span className="text-gray-600 text-sm font-medium">Qualifications:</span>
                              <div className="mt-1">
                                {doctor.verificationDetails.qualifications.map((qual, qualIndex) => (
                                  <div key={qualIndex} className="text-sm text-gray-800">
                                    • {qual.degree} - {qual.universityCollege} ({qual.year})
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {doctor.verificationDetails?.location && (
                            <div className="mb-3">
                              <span className="text-gray-600 text-sm font-medium">Location:</span>
                              <p className="text-gray-800 text-sm">
                                {doctor.verificationDetails.location.city}, {doctor.verificationDetails.location.state}
                              </p>
                            </div>
                          )}

                          {doctor.verificationDetails?.medicalCouncilRegistrationNumber && (
                            <div className="mb-3">
                              <span className="text-gray-600 text-sm font-medium">Medical Council Registration:</span>
                              <p className="text-gray-800 text-sm">
                                {doctor.verificationDetails.medicalCouncilRegistrationNumber}
                              </p>
                            </div>
                          )}

                          {/* View Details Button */}
                          <div className="mt-4">
                            <button
                              onClick={() => navigate(`/doctors/${doctor._id}`)}
                              className="px-4 py-2 bg-[#2f4f6f] text-white rounded-lg font-semibold hover:bg-[#24384e] transition-all duration-200 text-sm"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <DoctorIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No doctors registered</h3>
                  <p className="text-gray-500 text-base">
                    This hospital doesn't have any doctors registered yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalInfo;
