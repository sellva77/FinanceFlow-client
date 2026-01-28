import api from './api';

export const tagService = {
    getAll: () => api.get('/tags'),
    create: (data) => api.post('/tags', data),
    update: (id, data) => api.put(`/tags/${id}`, data),
    delete: (id) => api.delete(`/tags/${id}`)
};
