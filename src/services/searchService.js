import api from './api';

export const searchService = {
    // Global search across all entities
    searchAll: (query) => api.get('/search', { params: { q: query } }),

    // Advanced transaction search
    searchTransactions: (params) => api.get('/search/transactions', { params }),

    // Search accounts
    searchAccounts: (query) => api.get('/search/accounts', { params: { q: query } }),

    // Get autocomplete suggestions
    getSuggestions: (query) => api.get('/search/suggestions', { params: { q: query } })
};
