import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HospitalIcon } from '../components/icons/HospitalIcon.jsx';
import { DoctorIcon } from '../components/icons/DoctorIcon.jsx';
import { SearchIcon } from '../components/icons/SearchIcon.jsx';
import { XIcon } from '../components/icons/XIcon.jsx';

const Hospitals = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hospitalToDelete, setHospitalToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchHospitals();
    fetchStats();
  }, []);

  // Debug hospital data changes
  useEffect(() => {
    console.log('Current hospitals state:', hospitals);
    hospitals.forEach((hospital, index) => {
      console.log(`Hospital ${index + 1} (${hospital.hospitalName}):`, {
        doctorsCount: hospital.docters?.length || 0,
        doctorsData: hospital.docters
      });
    });
  }, [hospitals]);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching hospitals...');
      const response = await fetch('http://localhost:8000/admin/hospitals');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.success) {
        setHospitals(data.data);
        console.log('Successfully set hospitals:', data.data.length);
      } else {
        setError(data.message || 'Failed to fetch hospitals');
      }
    } catch (err) {
      const errorMessage = 'Failed to fetch hospitals: ' + err.message;
      setError(errorMessage);
      console.error('Error fetching hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('Fetching stats...');
      const response = await fetch('http://localhost:8000/admin/hospitals/stats');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Stats Response:', data);
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.contact?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewHospitalInfo = (hospitalId) => {
    navigate(`/hospitals/${hospitalId}`);
  };

  const handleViewDoctors = (hospitalId) => {
    navigate(`/hospitals/${hospitalId}/doctors`);
  };

  const handleDeleteHospital = (hospital) => {
    setHospitalToDelete(hospital);
    setShowDeleteModal(true);
  };

  const confirmDeleteHospital = async () => {
    if (!hospitalToDelete) return;

    try {
      setDeleting(true);
      const response = await fetch(
        `http://localhost:8000/admin/hospitals/${hospitalToDelete._id}`,
        {
          method: 'DELETE',
        }
      );
      const data = await response.json();

      if (data.success) {
        setHospitals(hospitals.filter(h => h._id !== hospitalToDelete._id));
        fetchStats();
        setShowDeleteModal(false);
        setHospitalToDelete(null);
        alert(`Hospital "${hospitalToDelete.hospitalName}" has been deleted successfully.`);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error('Error deleting hospital:', err);
      alert('Failed to delete hospital. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setHospitalToDelete(null);
  };

  const refreshData = () => {
    fetchHospitals();
    fetchStats();
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
          <p className="text-red-600 mb-2">{error}</p>
          <button 
            onClick={fetchHospitals}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Hospitals Management
          </h1>
          <p className="text-gray-600">
            Manage and view all hospitals and their associated doctors
          </p>
        </div>
        <button
          onClick={refreshData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>🔄</span>
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HospitalIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Hospitals</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalHospitals || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DoctorIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Doctors</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalDoctors || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <HospitalIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">With Doctors</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.hospitalsWithDoctors || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <HospitalIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Without Doctors</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.hospitalsWithoutDoctors || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search hospitals by name, address, or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Hospitals Grid - FIXED HEIGHT CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredHospitals.map((hospital) => (
          <div 
            key={hospital._id} 
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow h-[420px] flex flex-col"
          >
            {/* Hospital Image - Fixed Height */}
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
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
              <HospitalIcon 
                className="w-16 h-16 text-white" 
                style={{ display: 'none' }} 
              />
            </div>

            {/* Hospital Details - Flex Grow with Scroll */}
            <div className="p-6 flex-1 flex flex-col overflow-hidden">
              <h3 className="text-xl font-bold text-gray-800 mb-2 flex-shrink-0">
                {hospital.hospitalName}
              </h3>
              
              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto mb-4">
                <div className="space-y-2 mb-4">
                  <div className="flex items-start">
                    <span className="text-sm text-gray-600 w-16 flex-shrink-0">
                      Address:
                    </span>
                    <span className="text-sm text-gray-800 flex-1">
                      {hospital.address}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 w-16 flex-shrink-0">
                      Contact:
                    </span>
                    <span className="text-sm text-gray-800">
                      {hospital.contact}
                    </span>
                  </div>

                  {hospital.location && (hospital.location.city || hospital.location.state) && (
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 w-16 flex-shrink-0">
                        Location:
                      </span>
                      <span className="text-sm text-gray-800">
                        {[hospital.location.city, hospital.location.state]
                          .filter(Boolean)
                          .join(', ')
                        }
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 w-16 flex-shrink-0">
                        Doctors:
                      </span>
                      <span className="text-sm text-gray-800 font-medium">
                        {hospital.totalDoctors || 0}
                      </span>
                      {hospital.totalDoctors > 0 && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({hospital.verifiedDoctors} verified)
                        </span>
                      )}
                    </div>
                  </div>
                </div>


                {/* Specialties */}
                {hospital.specialties && hospital.specialties.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Specialties:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {hospital.specialties.slice(0, 3).map((specialty, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                      {hospital.specialties.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{hospital.specialties.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {hospital.description && (
                  <p className="text-sm text-gray-600 mb-4">
                    {hospital.description}
                  </p>
                )}
              </div>

              {/* Actions - Fixed at Bottom */}
              <div className="flex space-x-2 flex-shrink-0">
                <button
                  onClick={() => handleViewHospitalInfo(hospital._id)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDeleteHospital(hospital)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={hospital.totalDoctors > 0}
                  title={
                    hospital.totalDoctors > 0
                      ? "Cannot delete hospital with registered doctors" 
                      : "Delete hospital"
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredHospitals.length === 0 && !loading && (
        <div className="text-center py-12">
          <HospitalIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            No hospitals found
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'No hospitals are currently registered'
            }
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && hospitalToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-red-100 rounded-lg mr-3">
                <XIcon className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Delete Hospital
              </h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{' '}
              <strong>{hospitalToDelete.hospitalName}</strong>? 
              This action cannot be undone.
            </p>

            {hospitalToDelete.docters && hospitalToDelete.docters.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  <strong>Warning:</strong> This hospital has{' '}
                  {hospitalToDelete.docters.length} registered doctors. 
                  You cannot delete a hospital with registered doctors.
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={closeDeleteModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteHospital}
                disabled={
                  deleting || 
                  (hospitalToDelete.docters && hospitalToDelete.docters.length > 0)
                }
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete Hospital'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hospitals;
