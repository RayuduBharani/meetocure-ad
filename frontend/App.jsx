import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DoctorDetails from './pages/DoctorDetails.jsx';
import DoctorPatients from './pages/DoctorPatients.jsx';
import Doctors from './pages/Doctors.jsx';
import PatientProfile from './pages/PatientProfile.jsx';
import Patients from './pages/Patients.jsx';
import Hospitals from './pages/Hospitals.jsx';
import HospitalInfo from './pages/HospitalInfo.jsx';
import HospitalDoctors from './pages/HospitalDoctors.jsx';
import Analytics from './pages/Analytics.jsx';
import Moderation from './pages/Moderation.jsx';
import Settings from './pages/Settings.jsx';
import Appointments from './pages/Appointments.jsx';
import Login from './pages/Login.jsx';

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Root redirect */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="doctors/:id" element={<DoctorDetails />} />
          <Route path="doctors/:id/patients" element={<DoctorPatients />} />
          <Route path="hospitals" element={<Hospitals />} />
          <Route path="hospitals/:id" element={<HospitalInfo />} />
          {/* <Route path="hospital-doctors" element={<HospitalDoctors />} /> */}
          <Route path="patients" element={<Patients />} />
          <Route path="patients/:id" element={<PatientProfile />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="moderation" element={<Moderation />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;
