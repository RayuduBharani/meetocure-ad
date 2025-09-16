import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Badge from '../components/ui/Badge.jsx';

const API_URL = 'http://13.232.200.28:8000';

const PatientProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patientProfile, setPatientProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPatientProfile = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/admin/patients/${id}/appointments`);
                const data = await response.json();
                
                if (data.success) {
                    setPatientProfile(data.data);
                } else {
                    throw new Error(data.message || 'Failed to fetch patient profile');
                }
            } catch (err) {
                setError(err.message);
                console.error('Error fetching patient profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPatientProfile();
    }, [id]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const getAppointmentStatusType = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'confirmed': return 'info';
            case 'pending': return 'warning';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading patient profile...</div>;
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

    if (!patientProfile) {
        return <div className="p-8 text-center">Patient not found</div>;
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Patient Profile</h1>
                <button
                    onClick={() => navigate('/patients')}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                >
                    Back to Patients
                </button>
            </div>

            {/* Patient Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex items-start gap-6">
                    <img 
                        src={patientProfile.patient.photo || `https://i.pravatar.cc/120?img=1`}
                        alt={patientProfile.patient.name}
                        className="w-32 h-32 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {patientProfile.patient.name}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Phone</p>
                                <p className="text-gray-800">{patientProfile.patient.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Gender</p>
                                <p className="text-gray-800">{patientProfile.patient.gender}</p>
                            </div>
                            {patientProfile.patient.dob && (
                                <div>
                                    <p className="text-sm text-gray-600">Date of Birth</p>
                                    <p className="text-gray-800">{formatDate(patientProfile.patient.dob)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-6">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                        {patientProfile.totalAppointments}
                    </div>
                    <p className="text-gray-600">Total Appointments</p>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                        {patientProfile.appointments.filter(apt => apt.status === 'completed').length}
                    </div>
                    <p className="text-gray-600">Completed Appointments</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                        {patientProfile.appointments.reduce((total, apt) => total + (apt.medicalRecords?.length || 0), 0)}
                    </div>
                    <p className="text-gray-600">Medical Records</p>
                </div>
            </div>

            {/* Appointments List */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b">
                    <h3 className="text-xl font-bold text-gray-800">Appointments History</h3>
                </div>
                
                <div className="p-6">
                    {patientProfile.appointments.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">No appointments found</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {patientProfile.appointments.map((appointment) => (
                                <div key={appointment.id} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="font-semibold text-gray-800">
                                                Dr. {appointment.doctor.name}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {appointment.doctor.primarySpecialization || 'General Medicine'}
                                            </p>
                                        </div>
                                        <Badge 
                                            text={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)} 
                                            type={getAppointmentStatusType(appointment.status)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Date</p>
                                            <p className="text-gray-800">{formatDate(appointment.appointmentDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Time</p>
                                            <p className="text-gray-800">{formatTime(appointment.appointmentTime)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Type</p>
                                            <p className="text-gray-800 capitalize">{appointment.appointmentType}</p>
                                        </div>
                                    </div>

                                    {appointment.reason && (
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-600">Reason for Visit</p>
                                            <p className="text-gray-800">{appointment.reason}</p>
                                        </div>
                                    )}

                                    {appointment.payment && (
                                        <div className="bg-gray-50 p-3 rounded mb-4">
                                            <p className="text-sm text-gray-600 mb-1">Payment Details</p>
                                            <div className="flex items-center gap-4">
                                                <p className="text-gray-800">
                                                    Amount: ${appointment.payment.amount} {appointment.payment.currency}
                                                </p>
                                                <Badge 
                                                    text={appointment.payment.status} 
                                                    type={appointment.payment.status === 'paid' ? 'success' : 'warning'}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {appointment.medicalRecords && appointment.medicalRecords.length > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">Medical Records</p>
                                            <div className="space-y-2">
                                                {appointment.medicalRecords.map((record, index) => (
                                                    <div key={record.id || index} className="flex items-center justify-between border p-2 rounded">
                                                        <div>
                                                            <p className="font-medium text-gray-800">{record.fileName}</p>
                                                            <p className="text-sm text-gray-600">
                                                                Uploaded on {formatDate(record.uploadDate)}
                                                            </p>
                                                        </div>
                                                        <a
                                                            href={record.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                                        >
                                                            View
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientProfile;