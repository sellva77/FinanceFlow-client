import api from './api';

export const settingsService = {
    getSettings: () => api.get('/settings'),
    updateSettings: (data) => api.put('/settings', data),
    
    // Get all available currencies
    getCurrencies: () => api.get('/settings/currencies'),
    
    // Currency, Theme, Notification preferences
    updatePreferences: (data) => api.put('/settings/preferences', data)
};
