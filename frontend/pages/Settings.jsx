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

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [settingsData, usersData] = await Promise.all([
                    apiService.getSettings(),
                    apiService.getUsers()
                ]);
                setSettings(settingsData);
                setUsers(usersData);
                setLoading(false);
            } catch (err) {
                setError('Failed to load settings');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleLanguageChange = async (language) => {
        try {
            await apiService.updateGeneralSettings({
                ...settings.general,
                language
            });
            setSettings(prev => ({
                ...prev,
                general: {
                    ...prev.general,
                    language
                }
            }));
        } catch (err) {
            setError('Failed to update language setting');
        }
    };

    const handleNotificationsToggle = async () => {
        try {
            const newValue = !settings.general.notificationsEnabled;
            await apiService.updateGeneralSettings({
                ...settings.general,
                notificationsEnabled: newValue
            });
            setSettings(prev => ({
                ...prev,
                general: {
                    ...prev.general,
                    notificationsEnabled: newValue
                }
            }));
        } catch (err) {
            setError('Failed to update notification setting');
        }
    };

    const handleAddUser = async (userData) => {
        try {
            const newUser = await apiService.createUser(userData);
            setUsers([...users, newUser]);
        } catch (err) {
            setError('Failed to add user');
        }
    };

    const handleUpdateUser = async (userData) => {
        try {
            const updatedUser = await apiService.updateUser(selectedUser._id, userData);
            setUsers(users.map(u => u._id === selectedUser._id ? updatedUser : u));
        } catch (err) {
            setError('Failed to update user');
        }
    };

    const handleUserSubmit = (userData) => {
        if (selectedUser) {
            handleUpdateUser(userData);
        } else {
            handleAddUser(userData);
        }
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleEditUser = (userToEdit) => {
        setSelectedUser(userToEdit);
        setIsModalOpen(true);
    };

    if (loading) {
        return <div className="p-8">Loading settings...</div>;
    }

    if (error) {
        return <div className="p-8 text-red-500">{error}</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>

            <SettingsCard title="General Settings">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <select 
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900"
                            value={settings.general.language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                        >
                            <option>English</option>
                            <option>Hindi</option>
                            <option>Telugu</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notification Preferences</label>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Receive notifications for important events.</span>
                            <div className="relative inline-block w-10 ml-2 align-middle select-none transition duration-200 ease-in">
                                <input 
                                    type="checkbox" 
                                    name="toggle" 
                                    id="toggle" 
                                    checked={settings.general.notificationsEnabled}
                                    onChange={handleNotificationsToggle}
                                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                />
                                <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsCard>
            
            <SettingsCard title="User Management">
                <div className="flex justify-end mb-4">
                    <button 
                        onClick={() => {
                            setSelectedUser(null);
                            setIsModalOpen(true);
                        }}
                        className="bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow hover:opacity-90 transition-opacity"
                    >
                        Add New User
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b bg-gray-50 text-sm text-gray-600 uppercase">
                                <th className="p-4 font-semibold">Name</th>
                                <th className="p-4 font-semibold">Email</th>
                                <th className="p-4 font-semibold">Role</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(userItem => (
                                <tr key={userItem._id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-900">{userItem.name}</td>
                                    <td className="p-4 text-gray-600">{userItem.email}</td>
                                    <td className="p-4 text-gray-600">{userItem.role}</td>
                                    <td className="p-4">
                                        <Badge 
                                            text={userItem.status} 
                                            type={userItem.status === 'Active' ? 'success' : 'danger'} 
                                        />
                                    </td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => handleEditUser(userItem)}
                                            className="text-primary hover:opacity-80 font-semibold"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SettingsCard>
            
            <UserModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedUser(null);
                }}
                onSubmit={handleUserSubmit}
                user={selectedUser}
            />



            {error && (
                <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
                    {error}
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
