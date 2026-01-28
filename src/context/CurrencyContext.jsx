import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsService } from '../services/';

const CurrencyContext = createContext(null);

const defaultCurrency = {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    locale: 'en-IN'
};

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState(defaultCurrency);
    const [settings, setSettings] = useState(null);
    const [currencies, setCurrencies] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const [settingsRes, currenciesRes] = await Promise.all([
                        settingsService.getSettings(),
                        settingsService.getCurrencies()
                    ]);
                    
                    if (settingsRes.data?.data?.currency) {
                        setCurrency(settingsRes.data.data.currency);
                    }
                    setSettings(settingsRes.data?.data);
                    setCurrencies(currenciesRes.data?.data || []);
                }
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    // Update currency setting
    const updateCurrency = useCallback(async (currencyCode) => {
        try {
            const res = await settingsService.updateSettings({ 
                currency: { code: currencyCode } 
            });
            if (res.data?.data?.currency) {
                setCurrency(res.data.data.currency);
                setSettings(res.data.data);
            }
            return res.data;
        } catch (error) {
            console.error('Failed to update currency:', error);
            throw error;
        }
    }, []);

    // Update exchange rates
    const updateExchangeRates = useCallback(async (rates) => {
        try {
            const res = await settingsService.updateSettings({ 
                conversionRates: rates 
            });
            setSettings(res.data.data);
            return res.data;
        } catch (error) {
            console.error('Failed to update exchange rates:', error);
            throw error;
        }
    }, []);

    // Convert amount helper
    const convertAmount = useCallback((amount, fromCurrencyCode) => {
        if (!amount) return 0;
        if (!fromCurrencyCode || fromCurrencyCode === currency.code) return amount;
        
        // precise math not strictly required here, floating point is okay for display
        const rates = settings?.conversionRates || {};
        const rate = rates[fromCurrencyCode];
        
        if (rate) {
            return amount * rate;
        }
        
        // Fallback: if no rate is defined, return amount as is (or handle error)
        // For now returning original amount to prevent 0s, but maybe should highlight?
        return amount; 
    }, [currency.code, settings]);

    // Format currency helper
    const formatCurrency = useCallback((amount) => {
        if (amount === null || amount === undefined) return `${currency.symbol}0`;
        
        try {
            return new Intl.NumberFormat(currency.locale, {
                style: 'currency',
                currency: currency.code,
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }).format(amount);
        } catch (error) {
            // Fallback formatting
            return `${currency.symbol}${Number(amount).toLocaleString()}`;
        }
    }, [currency]);

    // Format compact currency (for large numbers)
    const formatCompactCurrency = useCallback((amount) => {
        if (amount === null || amount === undefined) return `${currency.symbol}0`;
        
        const absAmount = Math.abs(amount);
        const sign = amount < 0 ? '-' : '';
        
        // Use Indian number system for INR
        if (currency.code === 'INR') {
            if (absAmount >= 10000000) return `${sign}${currency.symbol}${(absAmount / 10000000).toFixed(2)}Cr`;
            if (absAmount >= 100000) return `${sign}${currency.symbol}${(absAmount / 100000).toFixed(1)}L`;
            if (absAmount >= 1000) return `${sign}${currency.symbol}${(absAmount / 1000).toFixed(1)}K`;
        } else {
            // International number system
            if (absAmount >= 1000000000) return `${sign}${currency.symbol}${(absAmount / 1000000000).toFixed(2)}B`;
            if (absAmount >= 1000000) return `${sign}${currency.symbol}${(absAmount / 1000000).toFixed(1)}M`;
            if (absAmount >= 1000) return `${sign}${currency.symbol}${(absAmount / 1000).toFixed(1)}K`;
        }
        
        return formatCurrency(amount);
    }, [currency, formatCurrency]);

    // Refresh settings
    const refreshSettings = useCallback(async () => {
        try {
            const [settingsRes, currenciesRes] = await Promise.all([
                settingsService.getSettings(),
                settingsService.getCurrencies()
            ]);
            
            if (settingsRes.data?.data?.currency) {
                setCurrency(settingsRes.data.data.currency);
            }
            setSettings(settingsRes.data?.data);
            setCurrencies(currenciesRes.data?.data || []);
        } catch (error) {
            console.error('Failed to refresh settings:', error);
        }
    }, []);

    return (
        <CurrencyContext.Provider value={{ 
            currency, 
            currencies,
            settings, 
            loading, 
            updateCurrency, 
            updateExchangeRates,
            formatCurrency, 
            formatCompactCurrency,
            convertAmount,
            refreshSettings 
        }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
