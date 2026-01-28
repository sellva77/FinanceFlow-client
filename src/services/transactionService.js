import api from './api';

export const transactionService = {
    getAll: (params) => api.get('/transactions', { params }),
    getById: (id) => api.get(`/transactions/${id}`),
    create: (data) => api.post('/transactions', data),
    update: (id, data) => api.put(`/transactions/${id}`, data),
    delete: (id) => api.delete(`/transactions/${id}`),

    // Specific endpoints
    getAnalytics: (params) => api.get('/transactions/analytics', { params }),
    getSummary: (params) => api.get('/transactions/summary', { params }),
    importTransactions: (data) => api.post('/transactions/import', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    bulkDelete: (ids) => api.post('/transactions/bulk-delete', { ids })
};
