import api from './api';

export const categoryService = {
    getAll: (params) => api.get('/categories', { params }),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
    
    // Get categories by type (income/expense)
    getByType: (type) => api.get(`/categories/type/${type}`)
};
