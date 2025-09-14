import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Badge from '../components/ui/Badge.jsx';

const API_URL = 'http://localhost:8000';

const DoctorPatients = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`${API_URL}/admin/docters/${id}/patients`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadgeType = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'confirmed': return 'info';
      case 'cancelled': return 'danger';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-8 text-center">No data available</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Dr. {data.doctor.name}'s Patients
          </h1>
          <p className="text-gray-600 mt-2">
            {data.doctor.specialization} • {data.totalPatients} Patients • {data.totalAppointments} Total Appointments
          </p>
        </div>
        <button
          onClick={() => navigate(`/doctors/${id}`)}
          className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200"
        >
          Back to Doctor Details
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        {data.patients.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            No patients found for this doctor
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-3">Patient Details</th>
                  <th className="px-6 py-3">Age/Gender</th>
                  <th className="px-6 py-3">Total Visits</th>
                  <th className="px-6 py-3">Last Visit</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.patients.map((patient) => (
                  <tr key={patient.patientId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {patient.patientInfo.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {patient.patientInfo.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {patient.patientInfo.age} yrs / {patient.patientInfo.gender}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {patient.appointments.length} appointments
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(patient.appointments[0]?.date)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        text={patient.appointments[0]?.status} 
                        type={getStatusBadgeType(patient.appointments[0]?.status)}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => navigate(`/patients/${patient.patientInfo.id}`)}
                        className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800 rounded-md transition-colors font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPatients;