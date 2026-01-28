import api from './api';

export const investmentService = {
    getAll: () => api.get('/investments'),
    getById: (id) => api.get(`/investments/${id}`),
    create: (data) => api.post('/investments', data),
    update: (id, data) => api.put(`/investments/${id}`, data),
    delete: (id) => api.delete(`/investments/${id}`),
    
    getPortfolioSummary: () => api.get('/investments/portfolio-summary')
};
