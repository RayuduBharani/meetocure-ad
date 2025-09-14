import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = 'http://13.232.200.28:8000';

const DoctorDetails = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/docters/${id}`);
        const data = await response.json();
        console.log('Doctor details response:', data);
        if (data.success) {
          // The doctor data comes with populated verificationDetails
          const doctorData = data.data;
          setDoctor(doctorData);
        } else {
          console.error('Error fetching doctor details:', data.message);
        }
      } catch (error) {
        console.error('Error fetching doctor details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [id]);

  const handleDeleteDoctor = async () => {
    try {
      setDeleting(true);
      console.log('Attempting to delete doctor with ID:', id);
      
      const response = await fetch(`${API_URL}/admin/docters/${id}`, {
        method: 'DELETE',
      });
      
      console.log('Delete response status:', response.status);
      const data = await response.json();
      console.log('Delete response data:', data);
      
      if (data.success) {
        alert('Doctor deleted successfully');
        navigate('/doctors');
      } else {
        alert('Failed to delete doctor: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
      alert('Failed to delete doctor. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!doctor) {
    return <div className="p-8">Doctor not found</div>;
  }

  return (
    <div className="p-8">
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Doctor Details</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/doctors/${id}/patients`)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 font-medium"
            >
              View All Patients
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 font-medium"
            >
              Delete Doctor
            </button>
            <button
              onClick={() => navigate('/doctors')}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
            >
              Back to List
            </button>
          </div>
        </div>      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <img
                src={doctor.verificationDetails?.profileImage || '/default-doctor.png'}
                alt={doctor.verificationDetails?.fullName || 'Doctor'}
                className="w-24 h-24 rounded-full object-cover"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{doctor.verificationDetails?.fullName || 'Unknown'}</h2>
                <p className="text-gray-600">{doctor.verificationDetails?.category || 'General'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="text-gray-800">{doctor.verificationDetails?.gender || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="text-gray-800">{doctor.verificationDetails?.dateOfBirth ? new Date(doctor.verificationDetails.dateOfBirth).toLocaleDateString() : 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="text-gray-800">{doctor.verificationDetails?.experienceYears || 'Not specified'} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Consultation Fee</p>
                  <p className="text-gray-800">₹{doctor.verificationDetails?.consultationFee || 'Not specified'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Specializations</h3>
              <div>
                <p className="text-sm text-gray-500">Primary Specialization</p>
                <p className="text-gray-800">{doctor.verificationDetails?.primarySpecialization || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Additional Specializations</p>
                <p className="text-gray-800">{doctor.verificationDetails?.additionalSpecializations || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Additional Details Section */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Registration Details</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Medical Council</p>
                  <p className="text-gray-800">{doctor.verificationDetails?.medicalCouncilName || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Registration Number</p>
                  <p className="text-gray-800">{doctor.verificationDetails?.medicalCouncilRegistrationNumber || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Registration Year</p>
                  <p className="text-gray-800">{doctor.verificationDetails?.yearOfRegistration || 'Not specified'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Qualifications</h3>
              <div className="space-y-4">
                {doctor.verificationDetails?.qualifications?.map((qual, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-md">
                    <p className="font-medium text-gray-800">{qual.degree}</p>
                    <p className="text-sm text-gray-600">{qual.universityCollege}</p>
                    <p className="text-sm text-gray-500">Year: {qual.year}</p>
                  </div>
                )) || <p className="text-gray-500">No qualifications listed</p>}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Hospital Information</h3>
              {doctor.verificationDetails?.hospitalInfo?.map((hospital, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-md">
                  <p className="font-medium text-gray-800">{hospital.hospitalName}</p>
                  <p className="text-sm text-gray-600">{hospital.hospitalAddress}</p>
                  <p className="text-sm text-gray-500">Contact: {hospital.contactNumber}</p>
                </div>
              )) || <p className="text-gray-500">No hospital information available</p>}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">About</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{doctor.verificationDetails?.about || 'No description available'}</p>
        </div>

        {/* Documents Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium text-gray-800 mb-2">Profile Image</h4>
              {doctor.verificationDetails?.profileImage ? (
                <div className="space-y-2">
                  <img 
                    src={doctor.verificationDetails.profileImage} 
                    alt="Profile" 
                    className="w-full h-32 object-cover rounded"
                  />
                  <a 
                    href={doctor.verificationDetails.profileImage} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View Full Size
                  </a>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No profile image available</p>
              )}
            </div>

            <div className="p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium text-gray-800 mb-2">Identity Document</h4>
              {doctor.verificationDetails?.identityDocument ? (
                <div className="space-y-2">
                  <img 
                    src={doctor.verificationDetails.identityDocument} 
                    alt="Identity Document" 
                    className="w-full h-32 object-cover rounded"
                  />
                  <a 
                    href={doctor.verificationDetails.identityDocument} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View Document
                  </a>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No identity document available</p>
              )}
            </div>

            <div className="p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium text-gray-800 mb-2">Medical Council Certificate</h4>
              {doctor.verificationDetails?.medicalCouncilCertificate ? (
                <div className="space-y-2">
                  <img 
                    src={doctor.verificationDetails.medicalCouncilCertificate} 
                    alt="Medical Council Certificate" 
                    className="w-full h-32 object-cover rounded"
                  />
                  <a 
                    href={doctor.verificationDetails.medicalCouncilCertificate} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View Certificate
                  </a>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No medical council certificate available</p>
              )}
            </div>
          </div>

          {/* Qualification Certificates */}
          {doctor.verificationDetails?.qualificationCertificates?.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-800 mb-3">Qualification Certificates</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctor.verificationDetails.qualificationCertificates.map((cert, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-md">
                    <h5 className="font-medium text-gray-700 mb-2">Certificate {index + 1}</h5>
                    <div className="space-y-2">
                      <img 
                        src={cert} 
                        alt={`Qualification Certificate ${index + 1}`} 
                        className="w-full h-32 object-cover rounded"
                      />
                      <a 
                        href={cert} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Certificate
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Location Information */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Location Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">City</p>
              <p className="text-gray-800">{doctor.verificationDetails?.location?.city || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">State</p>
              <p className="text-gray-800">{doctor.verificationDetails?.location?.state || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Government IDs */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Government Identification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Aadhaar Number</p>
              <p className="text-gray-800">{doctor.verificationDetails?.aadhaarNumber || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">PAN Number</p>
              <p className="text-gray-800">{doctor.verificationDetails?.panNumber || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Banking Information */}
        {doctor.verificationDetails?.bankingInfo?.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Banking Information</h3>
              {doctor.verificationDetails.bankingInfo.map((bank, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-md mb-4">
                  <h4 className="font-medium text-gray-800 mb-3">Bank Account {index + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Bank Name</p>
                      <p className="text-gray-800">{bank.bankName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Account Number</p>
                      <p className="text-gray-800">{bank.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">IFSC Code</p>
                      <p className="text-gray-800">{bank.ifscCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Account Holder Name</p>
                      <p className="text-gray-800">{bank.accountHolderName}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Bank Branch</p>
                      <p className="text-gray-800">{bank.bankBranch}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Registration Status */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Registration Status</h3>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              doctor.registrationStatus === 'verified' ? 'bg-green-100 text-green-800' :
              doctor.registrationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {doctor.registrationStatus?.replace(/_/g, ' ').toUpperCase() || 'PENDING VERIFICATION'}
            </span>
            <span className="text-sm text-gray-500">
              Verified: {doctor.verificationDetails?.verified ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{doctor.verificationDetails?.fullName || 'this doctor'}</strong>? 
              This action will permanently remove the doctor and all associated verification details. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDoctor}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Doctor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDetails;