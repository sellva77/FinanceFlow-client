import api from './api';

export const investmentService = {
    getAll: (params) => api.get('/investments', { params }),
    getById: (id) => api.get(`/investments/${id}`),
    create: (data) => api.post('/investments', data),
    update: (id, data) => api.put(`/investments/${id}`, data),
    delete: (id) => api.delete(`/investments/${id}`),
    
    // Analytics endpoints
    getAnalytics: (params) => api.get('/investments/analytics', { params }),
    getDividendSummary: () => api.get('/investments/dividends'),
    
    // Transaction endpoints
    addTransaction: (id, data) => api.post(`/investments/${id}/transaction`, data),
    
    getPortfolioSummary: () => api.get('/investments/portfolio-summary')
};
