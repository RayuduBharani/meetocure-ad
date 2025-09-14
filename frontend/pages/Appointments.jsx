import React, { useState, useMemo, useEffect } from 'react';
import { PencilIcon } from '../components/icons/PencilIcon.jsx';
import { XIcon } from '../components/icons/XIcon.jsx';
import apiService from '../services/api.js';

const EditAppointmentModal = ({ appointment, onClose, onUpdate }) => {
    console.log(appointment);
    const [formData, setFormData] = useState({
        appointment_time: appointment.time || '',
        appointment_type: appointment.type || 'virtual',
        status: (appointment.status || 'pending').toLowerCase(),
        reason: appointment.reason || '',
        patientInfo: {
            name: appointment.patientInfo?.name || appointment.patient || '',
            age: appointment.patientInfo?.age || '',
            gender: appointment.patientInfo?.gender || '',
            phone: appointment.patientInfo?.phone || '',
            blood_group: appointment.patientInfo?.blood_group || '',
            medical_history_summary: appointment.patientInfo?.medical_history_summary || appointment.originalData?.patientInfo?.medical_history_summary || '',
        },
        payment: {
            amount: Number(appointment.payment?.amount) || 0,
            currency: appointment.payment?.currency || 'INR',
            status: appointment.payment?.status || 'pending'
        }
    });

    const handleChange = (e, section, field) => {
        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: e.target.value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [e.target.name]: e.target.value
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Edit Appointment</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Appointment Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Appointment Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Time</label>
                                <input
                                    type="time"
                                    name="appointment_time"
                                    value={formData.appointment_time}
                                    onChange={(e) => handleChange(e)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Type</label>
                                <select
                                    name="appointment_type"
                                    value={formData.appointment_type}
                                    onChange={(e) => handleChange(e)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                >
                                    <option value="virtual">Virtual</option>
                                    <option value="in-person">In-Person</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Patient Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Patient Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    value={formData.patientInfo.name}
                                    onChange={(e) => handleChange(e, 'patientInfo', 'name')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Age</label>
                                <input
                                    type="number"
                                    value={formData.patientInfo.age}
                                    onChange={(e) => handleChange(e, 'patientInfo', 'age')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gender</label>
                                <select
                                    value={formData.patientInfo.gender}
                                    onChange={(e) => handleChange(e, 'patientInfo', 'gender')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.patientInfo.phone}
                                    onChange={(e) => handleChange(e, 'patientInfo', 'phone')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                                <select
                                    value={formData.patientInfo.blood_group}
                                    onChange={(e) => handleChange(e, 'patientInfo', 'blood_group')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                >
                                    <option value="">Select Blood Group</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Medical History</label>
                            <textarea
                                value={formData.patientInfo.medical_history_summary}
                                onChange={(e) => handleChange(e, 'patientInfo', 'medical_history_summary')}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Payment Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Amount</label>
                                <input
                                    type="number"
                                    value={formData.payment.amount}
                                    onChange={(e) => handleChange(e, 'payment', 'amount')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                                <select
                                    value={formData.payment.status}
                                    onChange={(e) => handleChange(e, 'payment', 'status')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="failed">Failed</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Other Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Other Details</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Reason for Visit</label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={(e) => handleChange(e)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Appointment Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={(e) => handleChange(e)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                            >
                                <option value="pending">Pending</option>
                                <option value="accepted">Accepted</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                        >
                            Update Appointment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Helper function to format date for API
const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Helper function to convert API date to JavaScript Date
const parseAPIDate = (dateString, timeString) => {
    try {
        if (!dateString || !timeString) {
            return new Date();
        }
        // Handle "HH:MM AM/PM" format
        const timeParts = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeParts) {
            let [_, hours, minutes, period] = timeParts;
            hours = parseInt(hours);
            minutes = parseInt(minutes);
            
            // Convert to 24-hour format
            if (period.toUpperCase() === 'PM' && hours < 12) {
                hours += 12;
            } else if (period.toUpperCase() === 'AM' && hours === 12) {
                hours = 0;
            }
            
            const date = new Date(dateString);
            date.setHours(hours, minutes, 0, 0);
            return date;
        }
        // Fallback to simple HH:MM format
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date(dateString);
        date.setHours(hours, minutes, 0, 0);
        return date;
    } catch (error) {
        console.error('Error parsing date:', error);
        return new Date();
    }
};


const Appointments = () => {
    const [view, setView] = useState('Calendar View');
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedFilterDate, setSelectedFilterDate] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [filters, setFilters] = useState({
        date: null,
        status: null,
    });
    
    // Fetch appointments from API
    const fetchAppointments = async (filterParams = {}) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getAppointments(filterParams);
            
            if (response.success) {
                console.log('Raw appointment data:', response.data); // Debug log
                // Transform API data to match frontend format
                const transformedAppointments = response.data.map(appt => {
                    // Safely parse date
                    let appointmentDate;
                    try {
                        appointmentDate = parseAPIDate(appt.appointmentDate, appt.appointmentTime);
                    } catch (error) {
                        console.error('Error parsing date for appointment:', appt.id, error);
                        appointmentDate = new Date();
                    }

                    // Helper function to capitalize first letter
                    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

                    return {
                        id: appt._id || appt.id,
                        patient: appt.patientInfo?.name || appt.patient?.name || 'Unknown Patient',
                        doctor: appt.doctor?.name || 'Unknown Doctor',
                        date: appointmentDate,
                        time: appt.appointmentTime || 'Time not set',
                        status: capitalize(appt.status || 'pending'),
                        type: appt.appointmentType || 'virtual',
                        reason: appt.reason || 'No reason provided',
                        patientInfo: {
                            name: appt.patientInfo?.name || appt.patient?.name || 'Unknown Patient',
                            age: appt.patientInfo?.age || appt.patient?.age || 'N/A',
                            gender: capitalize(appt.patientInfo?.gender || appt.patient?.gender || 'not specified'),
                            phone: appt.patientInfo?.phone || appt.patient?.phone || 'No phone',
                            blood_group: appt.patientInfo?.blood_group || appt.patient?.blood_group || 'Not specified',
                            medical_history_summary: appt.patientInfo?.medical_history_summary || ''
                        },
                        payment: {
                            amount: appt.payment?.amount || 0,
                            status: appt.payment?.status || 'pending',
                            currency: appt.payment?.currency || 'INR'
                        },
                        medicalRecords: Array.isArray(appt.medicalRecords) ? appt.medicalRecords : [],
                        originalData: appt
                    };
                });
                setAppointments(transformedAppointments);
            } else {
                setError('Failed to fetch appointments');
            }
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setError('Error loading appointments. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Load appointments on component mount
    useEffect(() => {
        fetchAppointments();
    }, []);

    // Load appointments when selected date changes
    useEffect(() => {
        const filterParams = {};
        if (selectedFilterDate) {
            filterParams.date = formatDateForAPI(selectedFilterDate);
        }
        fetchAppointments(filterParams);
    }, [selectedFilterDate]);
    
    const getStatusClasses = (status) => {
        switch (status.toLowerCase()) {
            case 'accepted': return 'bg-status-green-bg text-status-green-text';
            case 'pending': return 'bg-status-yellow-bg text-status-yellow-text';
            case 'cancelled': return 'bg-status-red-bg text-status-red-text';
            case 'completed': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const handleStatusChange = async (id, newStatus) => {
        try {
            const appointment = appointments.find(appt => appt.id === id);
            if (!appointment) return;

            // Update status via API
            const response = await apiService.updateAppointmentStatus(id, newStatus.toLowerCase());
            
            if (response.success) {
                // Update local state
                setAppointments(appointments.map(appt => 
                    appt.id === id ? { ...appt, status: newStatus } : appt
                ));
            } else {
                setError('Failed to update appointment status');
            }
        } catch (err) {
            console.error('Error updating appointment status:', err);
            setError('Error updating appointment status');
        }
    };

    const handleCancelAppointment = (id) => {
        handleStatusChange(id, 'Cancelled');
    };

    const [editingAppointment, setEditingAppointment] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const handleEditAppointment = (id) => {
        const appointment = appointments.find(appt => appt.id === id);
        if (appointment) {
            setEditingAppointment(appointment);
            setShowEditModal(true);
        }
    };

    const handleUpdateAppointment = async (updatedData) => {
        try {
            const response = await apiService.updateAppointment(editingAppointment.id, updatedData);
            if (response.success) {
                // Update the appointments list
                setAppointments(appointments.map(appt => 
                    appt.id === editingAppointment.id 
                        ? { ...appt, ...updatedData }
                        : appt
                ));
                setShowEditModal(false);
                setEditingAppointment(null);
            } else {
                setError('Failed to update appointment');
            }
        } catch (err) {
            console.error('Error updating appointment:', err);
            setError('Error updating appointment details');
        }
    };

    const handleDeleteAppointment = async (id) => {
        if (window.confirm('Are you sure you want to delete this appointment?')) {
            try {
                const response = await apiService.deleteAppointment(id);
                if (response.success) {
                    setAppointments(appointments.filter(appt => appt.id !== id));
                } else {
                    setError('Failed to delete appointment');
                }
            } catch (err) {
                console.error('Error deleting appointment:', err);
                setError('Error deleting appointment');
            }
        }
    };

    const changeMonth = (offset) => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const handleDateFilter = (date) => {
        setFilters(prev => ({
            ...prev,
            date: date,
            start_date: null,
            end_date: null
        }));
    };

    const handleStatusFilter = (status) => {
        setSelectedStatus(status === 'all' ? null : status);
    };

    const clearFilters = () => {
        setSelectedFilterDate(null);
        setSelectedStatus(null);
    };

    // Calculate appointment statistics
    const appointmentStats = useMemo(() => {
        return appointments.reduce((stats, appt) => {
            const status = appt.status.toLowerCase();
            stats[status] = (stats[status] || 0) + 1;
            stats.total += 1;
            return stats;
        }, { total: 0 });
    }, [appointments]);

    const filteredAppointments = useMemo(() => {
        return appointments
            .filter(appt => {
                // Date filter
                if (selectedFilterDate) {
                    const apptDate = new Date(appt.date);
                    const filterDate = new Date(selectedFilterDate);
                    if (
                        apptDate.getFullYear() !== filterDate.getFullYear() ||
                        apptDate.getMonth() !== filterDate.getMonth() ||
                        apptDate.getDate() !== filterDate.getDate()
                    ) {
                        return false;
                    }
                }
                
                // Status filter
                if (selectedStatus && selectedStatus !== 'all') {
                    return appt.status === selectedStatus;
                }
                
                return true;
            })
            .sort((a, b) => {
                // Sort by date and time
                const dateCompare = new Date(a.date) - new Date(b.date);
                if (dateCompare === 0) {
                    // If same date, sort by time
                    return a.time.localeCompare(b.time);
                }
                return dateCompare;
            });
    }, [appointments, selectedFilterDate, selectedStatus]);

    const formattedSelectedDate = selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Appointments Management</h1>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                    <button 
                        onClick={() => setError(null)} 
                        className="float-right text-red-700 hover:text-red-900"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date Filter */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Select Date</h3>
                        <div className="flex items-center gap-4">
                            <input
                                type="date"
                                value={selectedFilterDate ? formatDateForAPI(selectedFilterDate) : ''}
                                onChange={(e) => setSelectedFilterDate(e.target.value ? new Date(e.target.value) : null)}
                                className="border border-gray-300 rounded-md px-3 py-2"
                            />
                            {selectedFilterDate && (
                                <button
                                    onClick={() => setSelectedFilterDate(null)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                                >
                                    Clear Date
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Filter by Status</h3>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleStatusFilter('all')}
                                className={`px-4 py-2 rounded-full text-sm font-medium ${
                                    !selectedStatus ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                All
                            </button>
                            {['Pending', 'Accepted', 'Completed', 'Cancelled'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusFilter(status)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                                        selectedStatus === status 
                                            ? getStatusClasses(status) 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
        
            
            {/* Appointment Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h4 className="text-sm text-gray-500 mb-1">Total Appointments</h4>
                    <p className="text-2xl font-bold">{appointmentStats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h4 className="text-sm text-gray-500 mb-1">Pending</h4>
                    <p className="text-2xl font-bold text-yellow-600">{appointmentStats.pending || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h4 className="text-sm text-gray-500 mb-1">Completed</h4>
                    <p className="text-2xl font-bold text-green-600">{appointmentStats.completed || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h4 className="text-sm text-gray-500 mb-1">Cancelled</h4>
                    <p className="text-2xl font-bold text-red-600">{appointmentStats.cancelled || 0}</p>
                </div>
            </div>

            {view === 'Calendar View' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">
                        {selectedFilterDate 
                            ? `Appointments for ${new Date(selectedFilterDate).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}`
                            : 'All Appointments'}
                        {selectedStatus && ` - ${selectedStatus}`}
                    </h2>
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            <span className="ml-2 text-gray-600">Loading...</span>
                        </div>
                    ) : filteredAppointments.length > 0 ? (
                        <div className="space-y-4">
                            {filteredAppointments.map((appt) => (
                                <div key={appt.id} className="flex flex-col p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-lg">{appt.patient}</h3>
                                                <span className="text-sm text-gray-500">
                                                    ({appt.patientInfo.gender}, {appt.patientInfo.age} yrs)
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">📞 {appt.patientInfo.phone}</p>
                                            {appt.patientInfo.blood_group && (
                                                <p className="text-sm text-gray-600">🩸 {appt.patientInfo.blood_group}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-800">{appt.time}</p>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClasses(appt.status)}`}>
                                                {appt.status}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t border-b py-2 my-2">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">Dr. {appt.doctor}</p>
                                                <p className="text-sm text-gray-600">{appt.type} appointment</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">💰 ₹{appt.payment.amount}</p>
                                                <p className="text-xs text-gray-500">{appt.payment.status}</p>
                                            </div>
                                        </div>
                                        {appt.reason && (
                                            <p className="text-sm text-gray-600 mt-2">
                                                <span className="font-medium">Reason:</span> {appt.reason}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex justify-end items-center gap-2 mt-2">
                                        <select
                                            value={appt.status}
                                            onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                                            className="border rounded px-2 py-1 text-sm"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Accepted">Accepted</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                        <button onClick={() => handleEditAppointment(appt.id)} className="text-gray-400 hover:text-gray-600">
                                            <PencilIcon className="w-5 h-5"/>
                                        </button>
                                        <button onClick={() => handleDeleteAppointment(appt.id)} className="text-gray-400 hover:text-red-600">
                                            <XIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No appointments scheduled for this day.</p>
                    )}
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingAppointment && (
                <EditAppointmentModal
                    appointment={editingAppointment}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingAppointment(null);
                    }}
                    onUpdate={handleUpdateAppointment}
                />
            )}
        </div>
    );
};

export default Appointments;
