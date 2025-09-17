import React, { useState, useEffect } from 'react';
import { DoctorIcon } from '../components/icons/DoctorIcon.jsx';
import { HospitalIcon } from '../components/icons/HospitalIcon.jsx';
import { SearchIcon } from '../components/icons/SearchIcon.jsx';

const HospitalDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchDoctors();
  }, []); 

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/admin/hospitals/doctors/all');
      const data = await response.json();
      
      if (data.success) {
        setDoctors(data.data);
        setStats({
          totalDoctors: data.count,
          totalHospitals: data.totalHospitals
        });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch doctors');
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique specializations for filter
  const specializations = [...new Set(doctors
    .map(doctor => doctor.verificationDetails?.primarySpecialization)
    .filter(Boolean)
  )];

  // Filter doctors based on search and filters
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = 
      doctor.verificationDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.mobileNumber?.includes(searchTerm) ||
      doctor.hospitalInfo?.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialization = 
      !filterSpecialization || 
      doctor.verificationDetails?.primarySpecialization === filterSpecialization;

    const matchesStatus = 
      !filterStatus || 
      doctor.registrationStatus === filterStatus;

    return matchesSearch && matchesSpecialization && matchesStatus;
  });

  // Group doctors by status for stats
  const statusCounts = doctors.reduce((acc, doctor) => {
    const status = doctor.registrationStatus || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="p-8 bg-[#f5f7fa] min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2f4f6f]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-[#f5f7fa] min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-red-600 font-sans">{error}</p>
          <button 
            onClick={fetchDoctors}
            className="mt-3 px-5 py-2 bg-[#2f4f6f] text-white rounded hover:bg-[#253f57] font-sans transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2f4f6f] text-white p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-8">Dashboard</h2>
        <nav className="flex flex-col space-y-4">
          <a href="#" className="hover:underline">Hospitals</a>
          <a href="#" className="hover:underline">Settings</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#2f4f6f] mb-3">Hospital Doctors</h1>
          <p className="text-gray-600 text-lg">View all doctors from all hospitals with their complete details</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-[#e0e4e8] rounded-lg">
                <DoctorIcon className="w-6 h-6 text-[#2f4f6f]" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-700">Total Doctors</p>
                <p className="text-3xl font-bold text-[#2f4f6f]">{stats.totalDoctors || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-[#e0e4e8] rounded-lg">
                <HospitalIcon className="w-6 h-6 text-[#2f4f6f]" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-700">Total Hospitals</p>
                <p className="text-3xl font-bold text-[#2f4f6f]">{stats.totalHospitals || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-[#e0e4e8] rounded-lg">
                <DoctorIcon className="w-6 h-6 text-[#2f4f6f]" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-700">Verified Doctors</p>
                <p className="text-3xl font-bold text-[#2f4f6f]">{statusCounts.verified || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-[#e0e4e8] rounded-lg">
                <DoctorIcon className="w-6 h-6 text-[#2f4f6f]" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-700">Pending Verification</p>
                <p className="text-3xl font-bold text-[#2f4f6f]">{statusCounts.pending_verification || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-5 max-w-4xl">
          {/* Search Bar */}
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctors by name, email, mobile, or hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-5 py-3 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2f4f6f] focus:border-transparent transition"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-5 max-w-4xl">
            <select
              value={filterSpecialization}
              onChange={(e) => setFilterSpecialization(e.target.value)}
              className="px-5 py-3 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2f4f6f] focus:border-transparent transition flex-1 min-w-[200px]"
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-5 py-3 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2f4f6f] focus:border-transparent transition flex-1 min-w-[200px]"
            >
              <option value="">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="under review by hospital">Under Review</option>
              <option value="under admin approval">Under Admin Approval</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredDoctors.map((doctor) => (
            <div key={doctor._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Doctor Header */}
              <div className="h-48 bg-[#e0e4e8] flex items-center justify-center">
                {console.log(doctor)}
                {doctor.verificationDetails?.profileImage ? (
                  <img 
                    src={doctor.verificationDetails.profileImage || "https://media-cdn.tripadvisor.com/media/photo-s/16/d0/ed/49/the-img-hospital-is-a.jpg"} 
                    alt={doctor.verificationDetails.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <DoctorIcon className="w-16 h-16 text-[#2f4f6f]" />
                )}
              </div>

              {/* Doctor Details */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-semibold text-[#2f4f6f]">
                    {doctor.verificationDetails?.fullName || 'Name not available'}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    doctor.registrationStatus === 'verified' 
                      ? 'bg-green-100 text-green-800'
                      : doctor.registrationStatus === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {doctor.registrationStatus?.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="space-y-3 mb-6 text-gray-700 text-sm">
                  <div className="flex items-center">
                    <span className="w-24 font-medium">Specialization:</span>
                    <span className="font-normal">
                      {doctor.verificationDetails?.primarySpecialization || 'Not specified'}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-24 font-medium">Category:</span>
                    <span>
                      {doctor.verificationDetails?.category || 'Not specified'}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-24 font-medium">Experience:</span>
                    <span>
                      {doctor.verificationDetails?.experienceYears || 'Not specified'}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-24 font-medium">Fee:</span>
                    <span className="font-semibold">
                      ₹{doctor.verificationDetails?.consultationFee || 'Not specified'}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-24 font-medium">Email:</span>
                    <span>{doctor.email}</span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-24 font-medium">Mobile:</span>
                    <span>{doctor.mobileNumber}</span>
                  </div>
                </div>

                {/* Hospital Info */}
                <div className="mb-6 p-4 bg-[#f9fafb] rounded-lg border border-gray-200">
                  <div className="flex items-center mb-3 text-gray-600">
                    <HospitalIcon className="w-5 h-5 mr-3" />
                    <span className="font-semibold">Hospital</span>
                  </div>
                  <p className="text-gray-800 font-semibold text-lg mb-1">
                    {doctor.hospitalInfo?.hospitalName || 'Unknown Hospital'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {doctor.hospitalInfo?.hospitalAddress || 'Address not available'}
                  </p>
                  {doctor.hospitalInfo?.hospitalLocation && (
                    <p className="text-sm text-gray-600">
                      {doctor.hospitalInfo.hospitalLocation.city}, {doctor.hospitalInfo.hospitalLocation.state}
                    </p>
                  )}
                </div>

                {/* About Section */}
                {doctor.verificationDetails?.about && (
                  <div className="mb-6">
                    <p className="text-gray-600 mb-2 font-medium">About:</p>
                    <p className="text-gray-800 line-clamp-2 text-sm">
                      {doctor.verificationDetails.about}
                    </p>
                  </div>
                )}

                {/* Qualifications */}
                {doctor.verificationDetails?.qualifications && doctor.verificationDetails.qualifications.length > 0 && (
                  <div>
                    <p className="text-gray-600 mb-3 font-medium">Qualifications:</p>
                    <div className="space-y-1 text-gray-700 text-xs">
                      {doctor.verificationDetails.qualifications.slice(0, 2).map((qual, index) => (
                        <div key={index}>
                          {qual.degree} - {qual.universityCollege}
                        </div>
                      ))}
                      {doctor.verificationDetails.qualifications.length > 2 && (
                        <div className="text-gray-500">
                          +{doctor.verificationDetails.qualifications.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredDoctors.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-500">
            <DoctorIcon className="w-16 h-16 mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-3">No doctors found</h3>
            <p className="max-w-md mx-auto">
              {searchTerm || filterSpecialization || filterStatus 
                ? 'Try adjusting your search terms or filters' 
                : 'No doctors are currently registered in any hospital'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default HospitalDoctors;
