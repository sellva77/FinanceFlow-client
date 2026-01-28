import api from './api';

export const exportService = {
    // Export transactions CSV
    downloadTransactionsCSV: (params) => api.get('/export/transactions/csv', { 
        params,
        responseType: 'blob' // Important for file download
    }),

    // Export transactions JSON
    downloadTransactionsJSON: (params) => api.get('/export/transactions/json', { 
        params,
        responseType: 'blob'
    }),

    // Export accounts CSV
    downloadAccountsCSV: () => api.get('/export/accounts/csv', { 
        responseType: 'blob'
    }),

    // Full backup
    downloadBackup: () => api.get('/export/backup', { 
        responseType: 'blob'
    }),

    // Generate PDF Report
    generateReport: (year, month) => api.get('/export/report/pdf', { 
        params: { year, month } 
    }),

    // Import backup data
    importBackup: (data, mode = 'merge') => api.post('/export/import', { data, mode })
};
