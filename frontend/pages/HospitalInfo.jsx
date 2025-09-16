import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HospitalIcon } from '../components/icons/HospitalIcon.jsx';
import { DoctorIcon } from '../components/icons/DoctorIcon.jsx';
import { XIcon } from '../components/icons/XIcon.jsx';

const HospitalInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State Management
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effects
  useEffect(() => {
    if (id) {
      fetchHospitalInfo();
    }
  }, [id]);

  // API Functions
  const fetchHospitalInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/admin/hospitals/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setHospital(data.data);
        console.log('Hospital data:', data.data);
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

  // Event Handlers
  const handleBackToHospitals = () => navigate('/hospitals');
  const handleViewDoctorDetails = (doctorId) => navigate(`/doctors/${doctorId}`);

  // Helper Functions
  const getStatusBadgeClass = (status) => {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium';
    switch (status) {
      case 'verified':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="p-8 font-sans">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2f4f6f]"></div>
        </div>
      </div>
    );
  }

  // Error State
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

  // Not Found State
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
      {/* Header Section */}
      <div className="mb-8">
        <button
          onClick={handleBackToHospitals}
          className="flex items-center text-[#2f4f6f] hover:text-gray-700 transition-all duration-200 font-medium mb-4"
        >
          <XIcon className="w-5 h-5 mr-2 rotate-45" />
          Back to Hospitals
        </button>
        <h1 className="text-4xl font-bold text-[#2f4f6f] mb-2">{hospital.hospitalName}</h1>
        <p className="text-gray-600 text-lg">Complete hospital information and associated doctors</p>
      </div>

      {/* Hospital Information Section */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Hospital Image */}
          <div className="lg:w-1/3">
            <div className="h-64 lg:h-80 bg-gradient-to-r from-[#2f4f6f] to-gray-400 rounded-xl flex items-center justify-center">
              {hospital.hospitalImage ? (
                <img 
                  src={`http://localhost:8000${hospital.hospitalImage}`} 
                  alt={hospital.hospitalName}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <HospitalIcon className="w-24 h-24 text-white" />
              )}
            </div>
          </div>

          {/* Hospital Details */}
          <div className="lg:w-2/3">
            <h2 className="text-2xl font-bold text-[#2f4f6f] mb-6">Hospital Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <InfoField label="Hospital Name" value={hospital.hospitalName} />
                <InfoField label="Email" value={hospital.email} />
                <InfoField label="Contact" value={hospital.contact} />
              </div>
              
              <div className="space-y-4">
                <InfoField label="Address" value={hospital.address} />
                <InfoField 
                  label="Total Doctors" 
                  value={hospital.docters ? hospital.docters.length : 0}
                  valueClass="text-[#2f4f6f] font-bold text-xl"
                />
                {hospital.location && (hospital.location.city || hospital.location.state) && (
                  <InfoField 
                    label="Location" 
                    value={[hospital.location.city, hospital.location.state].filter(Boolean).join(', ')}
                  />
                )}
              </div>
            </div>

            {hospital.description && (
              <div className="mt-6">
                <InfoField label="Description" value={hospital.description} />
              </div>
            )}

            {hospital.specialties && hospital.specialties.length > 0 && (
              <div className="mt-6">
                <span className="text-sm font-medium text-gray-600 block mb-3">Specialties:</span>
                <div className="flex flex-wrap gap-2">
                  {hospital.specialties.map((specialty, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {hospital.facilities && hospital.facilities.length > 0 && (
              <div className="mt-6">
                <span className="text-sm font-medium text-gray-600 block mb-3">Facilities:</span>
                <div className="flex flex-wrap gap-2">
                  {hospital.facilities.map((facility, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Doctors Section */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-[#2f4f6f]">Associated Doctors</h2>
          <div className="flex items-center space-x-4">
            <span className="px-4 py-2 bg-gray-100 text-[#2f4f6f] rounded-full text-lg font-semibold">
              {hospital.docters ? hospital.docters.length : 0} doctors
            </span>
          </div>
        </div>

        {hospital.docters && hospital.docters.length > 0 ? (
          <div className="space-y-6">
            {hospital.docters.map((doctor, index) => (
              <DoctorCard 
                key={index}
                doctor={doctor}
                onViewDetails={handleViewDoctorDetails}
                getStatusBadgeClass={getStatusBadgeClass}
              />
            ))}
          </div>
        ) : (
          <EmptyDoctorsState />
        )}
      </div>
    </div>
  );
};

// Info Field Component
const InfoField = ({ label, value, valueClass = "text-gray-800 text-base font-medium" }) => (
  <div>
    <span className="text-sm font-medium text-gray-600 block mb-1">{label}:</span>
    <p className={valueClass}>{value}</p>
  </div>
);

// Doctor Card Component
const DoctorCard = ({ doctor, onViewDetails, getStatusBadgeClass }) => (
  <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 hover:shadow-lg transition-all duration-200">
    <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6 space-y-4 lg:space-y-0">
      {/* Doctor Avatar */}
      <div className="flex justify-center lg:justify-start">
        <div className="w-24 h-24 bg-gradient-to-r from-[#2f4f6f] to-gray-400 rounded-full flex items-center justify-center shadow-lg">
          {doctor.verificationDetails?.profileImage ? (
            <img
              src={doctor.verificationDetails.profileImage}
              alt={doctor.verificationDetails.fullName}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <DoctorIcon className="w-12 h-12 text-white" />
          )}
        </div>
      </div>

      {/* Doctor Details */}
      <div className="flex-1">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <h3 className="text-2xl font-bold text-[#2f4f6f] mb-2 lg:mb-0">
            {doctor.verificationDetails?.fullName || 'Name not available'}
          </h3>
          <span className={getStatusBadgeClass(doctor.registrationStatus)}>
            {doctor.registrationStatus?.replace(/_/g, ' ') || 'Unknown'}
          </span>
        </div>

        {/* Doctor Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <DetailItem 
            label="Specialization"
            value={doctor.verificationDetails?.primarySpecialization || 'Not specified'}
          />
          <DetailItem 
            label="Category"
            value={doctor.verificationDetails?.category || 'Not specified'}
          />
          <DetailItem 
            label="Experience"
            value={`${doctor.verificationDetails?.experienceYears || 'Not specified'} years`}
          />
          <DetailItem 
            label="Consultation Fee"
            value={`₹${doctor.verificationDetails?.consultationFee || 'Not specified'}`}
          />
          <DetailItem 
            label="Email"
            value={doctor.email || 'Not provided'}
          />
          <DetailItem 
            label="Mobile"
            value={doctor.mobileNumber || 'Not provided'}
          />
        </div>

        {/* Additional Information */}
        <div className="space-y-3">
          {doctor.verificationDetails?.about && (
            <div>
              <span className="text-sm font-medium text-gray-600 block mb-1">About:</span>
              <p className="text-gray-800 text-sm leading-relaxed">{doctor.verificationDetails.about}</p>
            </div>
          )}

          {doctor.verificationDetails?.qualifications && doctor.verificationDetails.qualifications.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-600 block mb-1">Qualifications:</span>
              <div className="space-y-1">
                {doctor.verificationDetails.qualifications.map((qual, qualIndex) => (
                  <div key={qualIndex} className="text-sm text-gray-800">
                    • {qual.degree} - {qual.universityCollege} ({qual.year})
                  </div>
                ))}
              </div>
            </div>
          )}

          {doctor.verificationDetails?.location && (
            <div>
              <span className="text-sm font-medium text-gray-600 block mb-1">Location:</span>
              <p className="text-sm text-gray-800">
                {doctor.verificationDetails.location.city}, {doctor.verificationDetails.location.state}
              </p>
            </div>
          )}

          {doctor.verificationDetails?.medicalCouncilRegistrationNumber && (
            <div>
              <span className="text-sm font-medium text-gray-600 block mb-1">Medical Council Registration:</span>
              <p className="text-sm text-gray-800">{doctor.verificationDetails.medicalCouncilRegistrationNumber}</p>
            </div>
          )}
        </div>

        {/* View Details Button */}
        <div className="mt-6">
          <button
            onClick={() => onViewDetails(doctor._id)}
            className="px-6 py-3 bg-[#2f4f6f] text-white rounded-lg font-semibold hover:bg-[#24384e] transition-all duration-200"
          >
            View Full Details
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Detail Item Component
const DetailItem = ({ label, value }) => (
  <div>
    <span className="text-sm text-gray-600 block">{label}:</span>
    <span className="text-base text-gray-800 font-medium">{value}</span>
  </div>
);

// Empty Doctors State Component
const EmptyDoctorsState = () => (
  <div className="text-center py-16">
    <DoctorIcon className="w-20 h-20 text-gray-300 mx-auto mb-6" />
    <h3 className="text-2xl font-semibold text-gray-600 mb-3">No doctors registered</h3>
    <p className="text-gray-500 text-lg">
      This hospital doesn't have any doctors registered yet.
    </p>
  </div>
);

export default HospitalInfo;
