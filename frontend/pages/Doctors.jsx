import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/ui/Badge.jsx';

const API_URL = 'http://localhost:8000'; // adjust this to match your backend URL

const fetchDoctors = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/doctors`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Raw API response:', data); // Debug log

    if (data.success && Array.isArray(data.data)) {
      const mappedDoctors = data.data.map(doctor => {
        const result = {
          name: doctor.fullName || 'Unknown',
          specialization: doctor.primarySpecialization || doctor.category || 'Not specified',
          city: doctor.location?.city || 'Not specified',
          status: doctor.status || 'pending_verification',
          earnings: doctor.earnings || 0,
          consultationFee: doctor.consultationFee || 0,
          patientsConsulted: doctor.patientsConsulted?.length || 0,
          id: doctor._id,
        };
        // console.log('Mapped doctor:', result); // Debug log for each mapped doctor
        return result;
      });
      // console.log('All mapped doctors:', mappedDoctors); // Debug log for final array
      return mappedDoctors;
    } else {
      console.error('Invalid data format received:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw new Error('Failed to fetch doctors. Please try again.');
  }
};

const deleteDoctor = async (doctorId) => {
  try {
    // console.log('Attempting to delete doctor with ID:', doctorId);
    const response = await fetch(`${API_URL}/admin/doctors/${doctorId}`, {
      method: 'DELETE',
    });

    // console.log('Delete response status:', response.status);
    const data = await response.json();
    // console.log('Delete response data:', data);

    if (!data.success) {
      throw new Error(data.message || 'Failed to delete doctor');
    }
    return true;
  } catch (error) {
    console.error('Error deleting doctor:', error);
    throw error;
  }
};

const getUniqueValues = (data, field) => {
  return ['All', ...new Set(data.map(d => d[field]).filter(Boolean))];
};

const Doctors = ({ searchQuery = '' }) => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Status');
  const [specFilter, setSpecFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchDoctors();
        // console.log('Loaded doctors:', data); // Debug log
        setDoctors(data);
      } catch (err) {
        console.error('Error loading doctors:', err);
        setError(err.message || 'Failed to load doctors. Please check your network connection and try again.');
        // Show more specific error messages based on response status
        if (err.message.includes('404')) {
          setError('No doctors found. The server endpoint might have changed.');
        } else if (err.message.includes('500')) {
          setError('Server error occurred while loading doctors. Please try again later.');
        } else if (err.message.includes('Network')) {
          setError('Network error. Please check your internet connection.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadDoctors();
  }, []);

  const specializations = useMemo(() => getUniqueValues(doctors, 'specialization'), [doctors]);
  const cities = useMemo(() => getUniqueValues(doctors, 'city'), [doctors]);

  const filteredDoctors = useMemo(() => {
    // console.log('Filtering doctors:', { 
    //   totalDoctors: doctors.length,
    //   searchQuery,
    //   statusFilter,
    //   specFilter,
    //   cityFilter
    // });

    const filtered = doctors.filter(doctor => {
      if (!doctor) return false;

      const matchesSearch = !searchQuery ||
        (doctor.name && doctor.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'Status' || doctor.status === statusFilter;
      const matchesSpec = specFilter === 'All' ||
        (doctor.specialization && doctor.specialization === specFilter);
      const matchesCity = cityFilter === 'All' ||
        (doctor.city && doctor.city === cityFilter);

      const matches = matchesSearch && matchesStatus && matchesSpec && matchesCity;
      // console.log('Doctor filtering:', { 
      //   name: doctor.name,
      //   matches,
      //   matchesSearch,
      //   matchesStatus,
      //   matchesSpec,
      //   matchesCity
      // });

      return matches;
    });

    // console.log('Filtered results:', filtered);
    return filtered;
  }, [doctors, searchQuery, statusFilter, specFilter, cityFilter]);
  // console.log('Filtered doctors:', filteredDoctors); // Debug log

  const handleDeleteDoctor = async (doctor) => {
    if (window.confirm(`Are you sure you want to delete ${doctor.name}? This action will permanently remove the doctor and all associated verification details. This action cannot be undone.`)) {
      try {
        await deleteDoctor(doctor.id);
        setDoctors(doctors.filter(doc => doc.id !== doctor.id));
        alert('Doctor deleted successfully');
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete doctor: ' + error.message);
      }
    }
  };

  const getStatusType = (status) => {
    switch (status) {
      case 'verified': return 'success';
      case 'pending_verification':
      case 'under review by hospital':
      case 'under admin approval':
        return 'warning';
      case 'rejected': return 'danger';
      default: return 'default';
    }
  };


  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Doctors Management</h1>
      {isLoading && (
        <div className="text-center py-4">
          <p className="text-gray-600">Loading doctors...</p>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error: {error}</p>
        </div>
      )}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-end mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <select value={specFilter} onChange={(e) => setSpecFilter(e.target.value)} className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900">
              {specializations.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900">
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50 text-sm text-gray-600 uppercase">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Specialization</th>
                <th className="p-4 font-semibold">City</th>
                <th className="p-4 font-semibold">Fee (₹)</th>
                <th className="p-4 font-semibold">Earnings (₹)</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((doctor, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{doctor.name}</td>
                  <td className="p-4 text-gray-600">{doctor.specialization}</td>
                  <td className="p-4 text-gray-600">{doctor.city}</td>
                  <td className="p-4 text-gray-600 text-right">{doctor.consultationFee.toLocaleString()}</td>
                  <td className="p-4 text-gray-600 text-right">{doctor.earnings.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/doctors/${doctor.id}`)}
                        className="text-xs bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded hover:bg-blue-200"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => navigate(`/doctors/${doctor.id}/patients`)}
                        className="text-xs bg-green-100 text-green-700 font-semibold px-3 py-1 rounded hover:bg-green-200"
                      >
                        Patients
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doctor)}
                        className="text-xs bg-red-100 text-red-700 font-semibold px-3 py-1 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Doctors;
