import api from './api';

export const budgetService = {
    getAll: (params) => api.get('/budgets', { params }),
    getById: (id) => api.get(`/budgets/${id}`),
    create: (data) => api.post('/budgets', data),
    update: (id, data) => api.put(`/budgets/${id}`, data),
    delete: (id) => api.delete(`/budgets/${id}`),
    
    checkBudgetStatus: (month, year) => api.get(`/budgets/status`, { params: { month, year } })
};
