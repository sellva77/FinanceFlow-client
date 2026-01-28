import api from './api';

export const goalService = {
    getAll: (params) => api.get('/goals', { params }),
    getSummary: () => api.get('/goals/summary'),
    getById: (id) => api.get(`/goals/${id}`),
    create: (data) => api.post('/goals', data),
    update: (id, data) => api.put(`/goals/${id}`, data),
    delete: (id) => api.delete(`/goals/${id}`),
    
    // Add amount to goal
    addToGoal: (id, amount) => api.put(`/goals/${id}/add`, { amount })
};
