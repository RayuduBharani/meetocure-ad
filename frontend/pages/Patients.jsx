import React, { useState, useMemo, useEffect } from 'react';
import Badge from '../components/ui/Badge.jsx';
import { useNavigate } from 'react-router-dom';

const Patients = ({ searchQuery = '' }) => {
    const navigate = useNavigate()
    const [patientsData, setPatientsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [registerLoading, setRegisterLoading] = useState(false);
    const [registerForm, setRegisterForm] = useState({
        phone: '',
        name: '',
        dob: '',
        gender: 'Other'
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [patientProfile, setPatientProfile] = useState(null);

    // Fetch patients from backend
    const fetchPatients = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8000/admin/patients');
            const data = await response.json();
            
            if (data.success) {
                setPatientsData(data.data);
            } else {
                setError(data.message || 'Failed to fetch patients');
            }
        } catch (err) {
            setError('Failed to connect to server');
            console.error('Error fetching patients:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    // Register new patient
    const handleRegisterPatient = async (e) => {
        e.preventDefault();
        setRegisterLoading(true);
        
        try {
            const response = await fetch('http://localhost:8000/admin/patients/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerForm),
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Reset form and close modal
                setRegisterForm({ phone: '', name: '', dob: '', gender: 'Other' });
                setShowRegisterModal(false);
                // Refresh patients list
                await fetchPatients();
                alert('Patient registered successfully!');
            } else {
                alert(data.message || 'Failed to register patient');
            }
        } catch (err) {
            console.error('Error registering patient:', err);
            alert('Failed to connect to server');
        } finally {
            setRegisterLoading(false);
        }
    };

    // Delete patient
    const handleDeletePatient = async () => {
        if (!patientToDelete) return;
        
        setDeleteLoading(true);
        
        try {
            const response = await fetch(`http://localhost:8000/admin/patients/${patientToDelete.patientId}`, {
                method: 'DELETE',
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Close modal and refresh patients list
                setShowDeleteModal(false);
                setPatientToDelete(null);
                await fetchPatients();
                alert('Patient deleted successfully!');
            } else {
                alert(data.message || 'Failed to delete patient');
            }
        } catch (err) {
            console.error('Error deleting patient:', err);
            alert('Failed to connect to server');
        } finally {
            setDeleteLoading(false);
        }
    };

    // Open delete confirmation modal
    const openDeleteModal = (patient) => {
        setPatientToDelete(patient);
        setShowDeleteModal(true);
    };

    // Fetch patient profile and appointments
    const fetchPatientProfile = async (patient) => {
        setProfileLoading(true);
        setPatientProfile(null);
        
        try {
            const response = await fetch(`http://localhost:8000/admin/patients/${patient.patientId}/appointments`);
            const data = await response.json();
            
            if (data.success) {
                setPatientProfile(data.data);
                setShowProfileModal(true);
            } else {
                alert(data.message || 'Failed to fetch patient profile');
            }
        } catch (err) {
            console.error('Error fetching patient profile:', err);
            alert('Failed to connect to server');
        } finally {
            setProfileLoading(false);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Format time for display
    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    // Get status badge type
    const getAppointmentStatusType = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'confirmed': return 'info';
            case 'pending': return 'warning';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    };

    // Get file type icon
    const getFileIcon = (record) => {
        if (record.isPdf) return '📄';
        if (record.isImage) return '🖼️';
        if (record.fileExtension === 'doc' || record.fileExtension === 'docx') return '📝';
        if (record.fileExtension === 'xls' || record.fileExtension === 'xlsx') return '📊';
        if (record.fileExtension === 'txt') return '📃';
        return '📎';
    };

    // Get record type display name
    const getRecordTypeDisplay = (recordType) => {
        switch (recordType) {
            case 'prescription': return 'Prescription';
            case 'ct_scan': return 'CT Scan';
            case 'xray': return 'X-Ray';
            case 'other': return 'Other Document';
            default: return recordType.charAt(0).toUpperCase() + recordType.slice(1);
        }
    };

    // Format file size (if available)
    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown size';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    // Get registration status badge type
    const getRegistrationStatusType = (status) => {
        switch (status) {
            case 'verified': return 'success';
            case 'under admin approval': return 'warning';
            case 'under review by hospital': return 'info';
            case 'pending_verification': return 'secondary';
            case 'rejected': return 'danger';
            default: return 'secondary';
        }
    };

    // Format registration status for display
    const formatRegistrationStatus = (status) => {
        switch (status) {
            case 'verified': return 'Verified';
            case 'under_admin_approval': return 'Under Admin Approval';
            case 'under_review_by_hospital': return 'Under Hospital Review';
            case 'pending_verification': return 'Pending Verification';
            case 'rejected': return 'Rejected';
            default: return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
        }
    };


    const filteredPatients = useMemo(() => {
        if (!searchQuery) {
            return patientsData; // Return all patients if no search query
        }
        
        const searchLower = searchQuery.toLowerCase();
        return patientsData.filter(patient => {
            return patient.name.toLowerCase().includes(searchLower) || 
                   patient.id.toLowerCase().includes(searchLower) ||
                   patient.contact.toLowerCase().includes(searchLower);
        });
    }, [searchQuery, patientsData]);

    const getStatusType = (status) => {
        return status === 'Enrolled' ? 'success' : 'danger';
    };

    if (loading) {
        return (
            <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Patients</h1>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading patients...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Patients</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="text-red-500 text-6xl mb-4">⚠️</div>
                            <p className="text-red-600 text-lg mb-2">Error loading patients</p>
                            <p className="text-gray-600">{error}</p>
                            <button 
                                onClick={() => window.location.reload()} 
                                className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:opacity-80"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Patients</h1>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                        Total: {patientsData.length} patients
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">

                {filteredPatients.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">👥</div>
                        <p className="text-gray-600 text-lg">No patients found</p>
                        <p className="text-gray-500">Try adjusting your filters or check back later.</p>
                    </div>
                ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b bg-gray-50 text-sm text-gray-600 uppercase">
                                <th className="p-4 font-semibold">Name</th>
                                <th className="p-4 font-semibold">Contact</th>
                                <th className="p-4 font-semibold">Appointments</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPatients.map((patient, index) => (
                                    <tr key={patient.patientId || index} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium flex items-center text-gray-900">
                                        <img src={patient.avatar} alt={patient.name} className="w-10 h-10 rounded-full mr-4" />
                                        {patient.name}
                                    </td>
                                    <td className="p-4 text-gray-600">{patient.contact}</td>
                                    <td className="p-4 text-gray-600">{patient.appointments}</td>
                                    <td className="p-4">
                                        <Badge text={patient.status} type={getStatusType(patient.status)} />
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-4">
                                                <button 
                                                    onClick={() => {
                                                        console.log('Patient data:', patient);
                                                        navigate(`/patients/${patient._id || patient.patientId}`);
                                                    }}
                                                    className="text-primary hover:opacity-80 font-semibold text-sm cursor-pointer"
                                                >
                                                    View Profile
                                                </button>
                                                <button 
                                                    onClick={() => openDeleteModal(patient)}
                                                    className="text-red-600 hover:opacity-80 font-semibold text-sm"
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
                )}
            </div>

            {/* Registration Modal */}
            {showRegisterModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Register New Patient</h2>
                            <button
                                onClick={() => setShowRegisterModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <form onSubmit={handleRegisterPatient} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={registerForm.phone}
                                    onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Enter phone number"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={registerForm.name}
                                    onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Enter full name"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    value={registerForm.dob}
                                    onChange={(e) => setRegisterForm({...registerForm, dob: e.target.value})}
                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Gender
                                </label>
                                <select
                                    value={registerForm.gender}
                                    onChange={(e) => setRegisterForm({...registerForm, gender: e.target.value})}
                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowRegisterModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={registerLoading}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:opacity-80 disabled:opacity-50"
                                >
                                    {registerLoading ? 'Registering...' : 'Register Patient'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && patientToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Delete Patient</h2>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setPatientToDelete(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="mb-6">
                            <div className="text-red-500 text-6xl mb-4 text-center">⚠️</div>
                            <p className="text-gray-700 text-center mb-2">
                                Are you sure you want to delete this patient?
                            </p>
                            <div className="bg-gray-50 p-3 rounded-md">
                                <p className="font-semibold text-gray-800">{patientToDelete.name}</p>
                                <p className="text-sm text-gray-600">Contact: {patientToDelete.contact}</p>
                            </div>
                            <p className="text-red-600 text-sm text-center mt-3">
                                This action cannot be undone.
                            </p>
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setPatientToDelete(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeletePatient}
                                disabled={deleteLoading}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete Patient'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Patient Profile Modal */}
            {showProfileModal && patientProfile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b p-6 rounded-t-lg">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-800">Patient Profile</h2>
                                <button
                                    onClick={() => {
                                        setShowProfileModal(false);
                                        setPatientProfile(null);
                                    }}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            {/* Patient Information */}
                            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                                <div className="flex items-center gap-6">
                                    <img 
                                        src={patientProfile.patient.photo || `https://i.pravatar.cc/80?img=1`} 
                                        alt={patientProfile.patient.name} 
                                        className="w-20 h-20 rounded-full object-cover"
                                    />
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-800">{patientProfile.patient.name}</h3>
                                        <p className="text-gray-600">Phone: {patientProfile.patient.phone}</p>
                                        <p className="text-gray-600">Gender: {patientProfile.patient.gender}</p>
                                        {patientProfile.patient.dob && (
                                            <p className="text-gray-600">DOB: {formatDate(patientProfile.patient.dob)}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Summary Section */}
                            <div className="bg-blue-50 rounded-lg p-4 mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Summary</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{patientProfile.totalAppointments}</div>
                                        <div className="text-gray-600">Total Appointments</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {patientProfile.appointments.reduce((total, apt) => total + (apt.medicalRecords?.length || 0), 0)}
                                        </div>
                                        <div className="text-gray-600">Total Documents</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {patientProfile.appointments.filter(apt => apt.status === 'completed').length}
                                        </div>
                                        <div className="text-gray-600">Completed</div>
                                    </div>
                                </div>
                            </div>

                            {/* Appointments Section */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-800">Appointments</h3>
                                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">
                                        {patientProfile.totalAppointments} Total
                                    </span>
                                </div>

                                {patientProfile.appointments.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                                        <div className="text-gray-400 text-6xl mb-4">📅</div>
                                        <p className="text-gray-600 text-lg">No appointments found</p>
                                        <p className="text-gray-500">This patient hasn't booked any appointments yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {patientProfile.appointments.map((appointment) => (
                                            <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-4">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-800">
                                                                Dr. {appointment.doctor.name}
                                                            </h4>
                                                            <p className="text-sm text-gray-600">
                                                                {appointment.doctor.primarySpecialization || appointment.doctor.category || 'General Medicine'}
                                                            </p>
                                                            {appointment.doctor.registrationStatus && (
                                                                <Badge 
                                                                    text={formatRegistrationStatus(appointment.doctor.registrationStatus)} 
                                                                    type={getRegistrationStatusType(appointment.doctor.registrationStatus)} 
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Badge 
                                                        text={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)} 
                                                        type={getAppointmentStatusType(appointment.status)} 
                                                    />
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <span className="font-medium text-gray-700">Date:</span>
                                                        <p className="text-gray-600">{formatDate(appointment.appointmentDate)}</p>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-700">Time:</span>
                                                        <p className="text-gray-600">{formatTime(appointment.appointmentTime)}</p>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-700">Type:</span>
                                                        <p className="text-gray-600 capitalize">{appointment.appointmentType}</p>
                                                    </div>
                                                </div>

                                                {appointment.reason && (
                                                    <div className="mt-3">
                                                        <span className="font-medium text-gray-700">Reason:</span>
                                                        <p className="text-gray-600 mt-1">{appointment.reason}</p>
                                                    </div>
                                                )}

                                                {/* Doctor Details Section */}
                                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                                    <h5 className="font-semibold text-gray-800 mb-2">Doctor Details</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                        {appointment.doctor.email && (
                                                            <div>
                                                                <span className="font-medium text-gray-700">Email:</span>
                                                                <p className="text-gray-600">{appointment.doctor.email}</p>
                                                            </div>
                                                        )}
                                                        {appointment.doctor.mobileNumber && (
                                                            <div>
                                                                <span className="font-medium text-gray-700">Phone:</span>
                                                                <p className="text-gray-600">{appointment.doctor.mobileNumber}</p>
                                                            </div>
                                                        )}
                                                        {appointment.doctor.consultationFee && (
                                                            <div>
                                                                <span className="font-medium text-gray-700">Consultation Fee:</span>
                                                                <p className="text-gray-600">${appointment.doctor.consultationFee}</p>
                                                            </div>
                                                        )}
                                                        {appointment.doctor.experienceYears && (
                                                            <div>
                                                                <span className="font-medium text-gray-700">Experience:</span>
                                                                <p className="text-gray-600">{appointment.doctor.experienceYears} years</p>
                                                            </div>
                                                        )}
                                                        {appointment.doctor.location && (
                                                            <div>
                                                                <span className="font-medium text-gray-700">Location:</span>
                                                                <p className="text-gray-600">
                                                                    {appointment.doctor.location.city && appointment.doctor.location.state 
                                                                        ? `${appointment.doctor.location.city}, ${appointment.doctor.location.state}`
                                                                        : appointment.doctor.location.city || appointment.doctor.location.state || 'Not specified'
                                                                    }
                                                                </p>
                                                            </div>
                                                        )}
                                                        {appointment.doctor.additionalSpecializations && (
                                                            <div className="md:col-span-2">
                                                                <span className="font-medium text-gray-700">Additional Specializations:</span>
                                                                <p className="text-gray-600">{appointment.doctor.additionalSpecializations}</p>
                                                            </div>
                                                        )}
                                                        {appointment.doctor.about && (
                                                            <div className="md:col-span-2">
                                                                <span className="font-medium text-gray-700">About:</span>
                                                                <p className="text-gray-600 mt-1">{appointment.doctor.about}</p>
                                                            </div>
                                                        )}
                                                        {appointment.doctor.qualifications && appointment.doctor.qualifications.length > 0 && (
                                                            <div className="md:col-span-2">
                                                                <span className="font-medium text-gray-700">Qualifications:</span>
                                                                <div className="mt-1 space-y-1">
                                                                    {appointment.doctor.qualifications.map((qual, index) => (
                                                                        <div key={index} className="text-gray-600 text-sm">
                                                                            <span className="font-medium">{qual.degree}</span>
                                                                            {qual.universityCollege && (
                                                                                <span> - {qual.universityCollege}</span>
                                                                            )}
                                                                            {qual.year && (
                                                                                <span className="text-gray-500"> ({qual.year})</span>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {appointment.payment && (
                                                    <div className="mt-3 p-3 bg-gray-50 rounded">
                                                        <span className="font-medium text-gray-700">Payment:</span>
                                                        <div className="flex items-center gap-4 mt-1">
                                                            <span className="text-gray-600">
                                                                ${appointment.payment.amount} {appointment.payment.currency}
                                                            </span>
                                                            <Badge 
                                                                text={appointment.payment.status.charAt(0).toUpperCase() + appointment.payment.status.slice(1)} 
                                                                type={appointment.payment.status === 'paid' ? 'success' : 'warning'} 
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {appointment.medicalRecords && appointment.medicalRecords.length > 0 && (
                                                    <div className="mt-4">
                                                        <span className="font-medium text-gray-700 mb-2 block">Medical Records & Documents:</span>
                                                        <div className="space-y-2">
                                                            {appointment.medicalRecords.map((record, index) => (
                                                                <div key={record.id || index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="text-2xl">{getFileIcon(record)}</span>
                                                                            <div>
                                                                                <p className="font-medium text-gray-800 text-sm">
                                                                                    {getRecordTypeDisplay(record.recordType)}
                                                                                </p>
                                                                                <p className="text-xs text-gray-600">
                                                                                    {record.fileName}
                                                                                </p>
                                                                                <p className="text-xs text-gray-500">
                                                                                    Uploaded: {formatDate(record.uploadDate)}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <a
                                                                                href={record.fileUrl}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                                                            >
                                                                                View
                                                                            </a>
                                                                            <a
                                                                                href={record.fileUrl}
                                                                                download={record.fileName}
                                                                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                                                            >
                                                                                Download
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                    {record.description && record.description !== record.fileName && (
                                                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                                                            <p className="text-xs text-gray-600">
                                                                                <span className="font-medium">Description:</span> {record.description}
                                                                            </p>
                                                                        </div>
                                                                    )}
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
                </div>
            )}
        </div>
    );
};

export default Patients;
