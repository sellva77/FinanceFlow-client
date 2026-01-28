import api from './api';

export const recurringService = {
    // Get all recurring transactions
    getAll: (params) => api.get('/recurring', { params }),

    // Get upcoming scheduled transactions
    getUpcoming: (days = 30) => api.get('/recurring/upcoming', { params: { days } }),

    // Create new recurring transaction
    create: (data) => api.post('/recurring', data),

    // Get single recurring transaction
    getById: (id) => api.get(`/recurring/${id}`),

    // Update recurring transaction
    update: (id, data) => api.put(`/recurring/${id}`, data),

    // Delete recurring transaction
    delete: (id) => api.delete(`/recurring/${id}`),

    // Pause/Resume
    togglePause: (id) => api.put(`/recurring/${id}/toggle-pause`),

    // Execute manually now
    executeNow: (id) => api.post(`/recurring/${id}/execute`)
};
