import api from './api';

export const authService = {
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }
        return response;
    },

    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }
        return response;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        window.location.href = '/login';
    },

    getMe: async () => {
        return api.get('/auth/me');
    },

    updateProfile: async (data) => {
        const response = await api.put('/auth/updatedetails', data);
        if (response.data.data) {
            localStorage.setItem('user', JSON.stringify(response.data.data));
        }
        return response;
    },

    changePassword: async (data) => {
        return api.put('/auth/updatepassword', data);
    },

    deleteAccount: async (password) => {
        return api.delete('/auth/deleteaccount', { data: { password } });
    },

    getDataSummary: async () => {
        return api.get('/auth/datasummary');
    },

    clearData: async (type, password) => {
        return api.delete(`/auth/cleardata/${type}`, { data: { password } });
    }
};
