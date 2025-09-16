import React, { useState, useEffect } from 'react';
import Badge from '../components/ui/Badge.jsx';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import UserModal from '../components/UserModal';

const SettingsCard = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">{title}</h2>
        {children}
    </div>
);

const Settings = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [settings, setSettings] = useState({
        general: {
            language: 'English',
            notificationsEnabled: true
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [userLoading, setUserLoading] = useState(false);

    // Auto-clear error and success messages
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [settingsResponse, usersResponse] = await Promise.all([
                apiService.getSettings(),
                apiService.getUsers()
            ]);

            console.log('Settings Response:', settingsResponse);
            console.log('Users Response:', usersResponse);

            // Handle settings data
            if (settingsResponse?.success && settingsResponse.data) {
                setSettings(settingsResponse.data);
            } else if (settingsResponse && typeof settingsResponse === 'object') {
                setSettings(settingsResponse);
            }

            // Handle users data
            if (usersResponse?.success && Array.isArray(usersResponse.data)) {
                setUsers(usersResponse.data);
            } else if (Array.isArray(usersResponse)) {
                setUsers(usersResponse);
            } else {
                console.error('Invalid users response format:', usersResponse);
                setUsers([]);
                setError('Failed to load users data');
            }

        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data: ' + (err.message || 'Unknown error'));
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLanguageChange = async (language) => {
        try {
            const response = await apiService.updateGeneralSettings({
                ...settings.general,
                language
            });

            if (response?.success || response) {
                setSettings(prev => ({
                    ...prev,
                    general: {
                        ...prev.general,
                        language
                    }
                }));
                setSuccess('Language updated successfully');
            }
        } catch (err) {
            console.error('Language update error:', err);
            setError('Failed to update language setting');
        }
    };

    const handleNotificationsToggle = async () => {
        try {
            const newValue = !settings.general.notificationsEnabled;
            const response = await apiService.updateGeneralSettings({
                ...settings.general,
                notificationsEnabled: newValue
            });

            if (response?.success || response) {
                setSettings(prev => ({
                    ...prev,
                    general: {
                        ...prev.general,
                        notificationsEnabled: newValue
                    }
                }));
                setSuccess('Notifications setting updated successfully');
            }
        } catch (err) {
            console.error('Notifications update error:', err);
            setError('Failed to update notification setting');
        }
    };

    const handleAddUser = async (userData) => {
        try {
            setUserLoading(true);
            setError(null);

            console.log('Creating user with data:', userData);
            const response = await apiService.createUser(userData);
            
            console.log('Create user response:', response);

            if (response?.success && response.data) {
                setUsers(prevUsers => [...prevUsers, response.data]);
                setSuccess('User created successfully');
                return true;
            } else if (response && !response.success) {
                throw new Error(response.message || 'Failed to create user');
            } else {
                // Handle case where response doesn't have success flag but has user data
                setUsers(prevUsers => [...prevUsers, response]);
                setSuccess('User created successfully');
                return true;
            }
        } catch (err) {
            console.error('Create user error:', err);
            setError('Failed to create user: ' + (err.message || 'Unknown error'));
            return false;
        } finally {
            setUserLoading(false);
        }
    };

    const handleUpdateUser = async (userData) => {
        try {
            setUserLoading(true);
            setError(null);

            if (!selectedUser?._id) {
                throw new Error('No user selected for update');
            }

            console.log('Updating user:', selectedUser._id, 'with data:', userData);
            const response = await apiService.updateUser(selectedUser._id, userData);
            
            console.log('Update user response:', response);

            if (response?.success && response.data) {
                setUsers(prevUsers => 
                    prevUsers.map(u => u._id === selectedUser._id ? response.data : u)
                );
                setSuccess('User updated successfully');
                return true;
            } else if (response && !response.success) {
                throw new Error(response.message || 'Failed to update user');
            } else {
                // Handle case where response doesn't have success flag but has user data
                setUsers(prevUsers => 
                    prevUsers.map(u => u._id === selectedUser._id ? response : u)
                );
                setSuccess('User updated successfully');
                return true;
            }
        } catch (err) {
            console.error('Update user error:', err);
            setError('Failed to update user: ' + (err.message || 'Unknown error'));
            return false;
        } finally {
            setUserLoading(false);
        }
    };

    const handleUserSubmit = async (userData) => {
        let success = false;
        
        if (selectedUser) {
            success = await handleUpdateUser(userData);
        } else {
            success = await handleAddUser(userData);
        }
        
        if (success) {
            setIsModalOpen(false);
            setSelectedUser(null);
        }
    };

    const handleEditUser = (userToEdit) => {
        console.log('Editing user:', userToEdit);
        setSelectedUser(userToEdit);
        setIsModalOpen(true);
        setError(null); // Clear any existing errors
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
        setError(null); // Clear errors when closing modal
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            setUserLoading(true);
            setError(null);

            await apiService.deleteUser(userId);
            setUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
            setSuccess('User deleted successfully');
        } catch (err) {
            console.error('Delete user error:', err);
            setError('Failed to delete user: ' + (err.message || 'Unknown error'));
        } finally {
            setUserLoading(false);
        }
    };

    const handleToggleStatus = async (userItem) => {
        try {
            setUserLoading(true);
            setError(null);

            const newStatus = userItem.status === 'Active' ? 'Inactive' : 'Active';
            const response = await apiService.updateUser(userItem._id, { 
                ...userItem,
                status: newStatus 
            });

            if (response?.success && response.data) {
                setUsers(prevUsers => 
                    prevUsers.map(u => u._id === userItem._id ? response.data : u)
                );
            } else {
                setUsers(prevUsers => 
                    prevUsers.map(u => u._id === userItem._id ? { ...u, status: newStatus } : u)
                );
            }
            setSuccess(`User status updated to ${newStatus}`);
        } catch (err) {
            console.error('Update status error:', err);
            setError('Failed to update user status: ' + (err.message || 'Unknown error'));
        } finally {
            setUserLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <span className="ml-4 text-lg text-gray-600">Loading settings...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>

            {/* General Settings Card */}
            <SettingsCard title="General Settings">
                <div className="space-y-6">
                    {/* Language Setting */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Language
                        </label>
                        <select
                            value={settings.general.language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        >
                            <option value="English">English</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                            <option value="German">German</option>
                        </select>
                    </div>

                    {/* Notifications Setting */}
                    <div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={settings.general.notificationsEnabled}
                                onChange={handleNotificationsToggle}
                                className="rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">
                                Enable Notifications
                            </span>
                        </label>
                    </div>
                </div>
            </SettingsCard>

            {/* User Management Card */}
            <SettingsCard title="User Management">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-gray-600">
                        Manage system users and their permissions
                    </p>
                    <button 
                        onClick={() => {
                            setSelectedUser(null);
                            setIsModalOpen(true);
                            setError(null);
                        }}
                        className="bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow hover:opacity-90 transition-opacity"
                        disabled={userLoading}
                    >
                        Add New User
                    </button>
                </div>

                {users.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No users found.</p>
                        <button 
                            onClick={fetchData}
                            className="mt-2 text-primary hover:underline"
                        >
                            Reload
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b bg-gray-50 text-sm text-gray-600 uppercase">
                                    <th className="p-4 font-semibold">Name</th>
                                    <th className="p-4 font-semibold">Email</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold">Created</th>
                                    <th className="p-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(userItem => (
                                    <tr key={userItem._id} className="border-b hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-900">
                                            {userItem.name || 'N/A'}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {userItem.email || 'N/A'}
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleToggleStatus(userItem)}
                                                disabled={userLoading || userItem._id === user?._id}
                                                className="cursor-pointer"
                                            >
                                                <Badge 
                                                    text={userItem.status || 'Unknown'} 
                                                    type={userItem.status === 'Active' ? 'success' : 'danger'} 
                                                />
                                            </button>
                                        </td>
                                        <td className="p-4 text-gray-600 text-sm">
                                            {userItem.createdAt 
                                                ? new Date(userItem.createdAt).toLocaleDateString()
                                                : 'N/A'
                                            }
                                        </td>
                                        <td className="p-4">
                                            <button 
                                                onClick={() => handleEditUser(userItem)}
                                                className="text-primary hover:opacity-80 font-semibold mr-3"
                                                disabled={userLoading}
                                            >
                                                Edit
                                            </button>
                                            {userItem._id !== user?._id && (
                                                <button 
                                                    onClick={() => handleDeleteUser(userItem._id)}
                                                    className="text-red-600 hover:opacity-80 font-semibold text-sm"
                                                    disabled={userLoading}
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SettingsCard>
            
            <UserModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleUserSubmit}
                user={selectedUser}
                loading={userLoading}
            />

            {/* Success Toast */}
            {success && (
                <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md shadow-lg z-50">
                    <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {success}
                    </div>
                </div>
            )}

            {/* Error Toast */}
            {error && (
                <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-lg z-50 max-w-md">
                    <div className="flex items-start">
                        <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="font-medium">Error</p>
                            <p className="text-sm">{error}</p>
                        </div>
                        <button 
                            onClick={() => setError(null)}
                            className="ml-2 text-red-400 hover:text-red-600"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .toggle-checkbox:checked { right: 0; border-color: #0b4b67; }
                .toggle-checkbox:checked + .toggle-label { background-color: #0b4b67; }
            `}</style>
        </div>
    );
};

export default Settings;
