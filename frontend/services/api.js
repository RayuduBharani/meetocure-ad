const API_BASE_URL = 'http://localhost:8000/admin';

class ApiService {
    // Generic fetch method with error handling
    async fetchData(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Appointments API methods
    async getAppointments(filters = {}) {
        const queryParams = new URLSearchParams();
        
        // Add filters to query params
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, value);
            }
        });

        const url = `${API_BASE_URL}/appointments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return this.fetchData(url);
    }

    async getAppointmentById(id) {
        const url = `${API_BASE_URL}/appointments/${id}`;
        return this.fetchData(url);
    }

    async updateAppointmentStatus(id, status) {
        const url = `${API_BASE_URL}/appointments/${id}/status`;
        return this.fetchData(url, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }

    async updateAppointment(id, appointmentData) {
        const url = `${API_BASE_URL}/appointments/${id}`;
        return this.fetchData(url, {
            method: 'PUT',
            body: JSON.stringify(appointmentData),
        });
    }

    async deleteAppointment(id) {
        const url = `${API_BASE_URL}/appointments/${id}`;
        return this.fetchData(url, {
            method: 'DELETE',
        });
    }

    // Patients API methods
    async getPatients() {
        const url = `${API_BASE_URL}/patients`;
        return this.fetchData(url);
    }

    async getPatientById(id) {
        const url = `${API_BASE_URL}/patients/${id}`;
        return this.fetchData(url);
    }

    // Doctors API methods
    async getDoctors() {
        const url = `${API_BASE_URL}/docters`;
        return this.fetchData(url);
    }

    async getDoctorById(id) {
        const url = `${API_BASE_URL}/docters/${id}`;
        return this.fetchData(url);
    }

    // Hospitals API methods
    async getHospitals() {
        const url = `${API_BASE_URL}/hospitals`;
        return this.fetchData(url);
    }

    async getHospitalById(id) {
        const url = `${API_BASE_URL}/hospitals/${id}`;
        return this.fetchData(url);
    }

    // Settings API methods
    async getSettings() {
        const url = `${API_BASE_URL}/settings`;
        return this.fetchData(url);
    }

    async updateGeneralSettings(settings) {
        const url = `${API_BASE_URL}/settings/general`;
        return this.fetchData(url, {
            method: 'PATCH',
            body: JSON.stringify(settings),
        });
    }





    // Admin User Management API methods
    async getUsers() {
        const url = `${API_BASE_URL}/users`;
        return this.fetchData(url);
    }

    async createUser(userData) {
        const url = `${API_BASE_URL}/users`;
        return this.fetchData(url, {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async updateUser(id, userData) {
        const url = `${API_BASE_URL}/users/${id}`;
        return this.fetchData(url, {
            method: 'PATCH',
            body: JSON.stringify(userData),
        });
    }

    async deleteUser(id) {
        const url = `${API_BASE_URL}/users/${id}`;
        return this.fetchData(url, {
            method: 'DELETE',
        });
    }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
