import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const predictColleges = async (data) => {
    try {
        const response = await api.post('/predict', data);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Server connection failed. Please ensure the backend is running.';
    }
};

export const getBranches = async () => {
    try {
        const response = await api.get('/predict/branches');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch branches.';
    }
};

export default api;
