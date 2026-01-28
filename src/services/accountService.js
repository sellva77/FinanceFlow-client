import api from './api';

export const accountService = {
    getAll: () => api.get('/accounts'),
    getById: (id) => api.get(`/accounts/${id}`),
    create: (data) => api.post('/accounts', data),
    update: (id, data) => api.put(`/accounts/${id}`, data),
    delete: (id) => api.delete(`/accounts/${id}`),
    
    // Additional account specific endpoints
    getBalance: (id) => api.get(`/accounts/${id}/balance`),
    transfer: (data) => api.post('/accounts/transfer', data),
    getHistory: (id, params) => api.get(`/accounts/${id}/history`, { params })
};
