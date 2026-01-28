import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsService } from '../services/';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark'); // 'dark', 'light', 'system'
    const [resolvedTheme, setResolvedTheme] = useState('dark'); // actual theme applied
    const [loading, setLoading] = useState(true);

    // Detect system theme preference
    const getSystemTheme = useCallback(() => {
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'dark';
    }, []);

    // Apply theme to document
    const applyTheme = useCallback((themeToApply) => {
        const root = document.documentElement;
        const body = document.body;
        
        // Remove existing theme classes
        root.classList.remove('theme-dark', 'theme-light');
        body.classList.remove('theme-dark', 'theme-light');
        
        // Add new theme class
        root.classList.add(`theme-${themeToApply}`);
        body.classList.add(`theme-${themeToApply}`);
        
        // Update CSS variables based on theme
        if (themeToApply === 'light') {
            root.style.setProperty('--dark-bg', '#f8fafc');
            root.style.setProperty('--dark-surface', '#ffffff');
            root.style.setProperty('--light-text', '#0f172a');
            root.style.setProperty('--gray-text', '#475569');
            root.style.setProperty('--glass-border', 'rgba(0, 0, 0, 0.1)');
            root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.7)');
            body.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
            body.style.color = '#0f172a';
        } else {
            // Dark theme (default)
            root.style.setProperty('--dark-bg', '#0f172a');
            root.style.setProperty('--dark-surface', '#1e293b');
            root.style.setProperty('--light-text', '#f8fafc');
            root.style.setProperty('--gray-text', '#94a3b8');
            root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.1)');
            root.style.setProperty('--glass-bg', 'rgba(30, 41, 59, 0.7)');
            body.style.background = `
                radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 20%),
                radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 20%),
                linear-gradient(135deg, #0f172a 0%, #020617 100%)
            `;
            body.style.color = '#f8fafc';
        }
        
        setResolvedTheme(themeToApply);
    }, []);

    // Resolve and apply theme
    const resolveTheme = useCallback((themeSetting) => {
        let themeToApply = themeSetting;
        
        if (themeSetting === 'system') {
            themeToApply = getSystemTheme();
        }
        
        applyTheme(themeToApply);
    }, [getSystemTheme, applyTheme]);

    // Listen for system theme changes
    useEffect(() => {
        if (theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            const handleChange = (e) => {
                applyTheme(e.matches ? 'dark' : 'light');
            };
            
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme, applyTheme]);

    // Fetch theme from settings on mount
    useEffect(() => {
        const fetchTheme = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const res = await settingsService.getSettings();
                    const savedTheme = res.data?.data?.theme || 'dark';
                    setTheme(savedTheme);
                    resolveTheme(savedTheme);
                } else {
                    // No token, check localStorage for theme preference
                    const localTheme = localStorage.getItem('theme') || 'dark';
                    setTheme(localTheme);
                    resolveTheme(localTheme);
                }
            } catch (error) {
                console.error('Failed to fetch theme:', error);
                // Fallback to dark theme
                resolveTheme('dark');
            } finally {
                setLoading(false);
            }
        };

        fetchTheme();
    }, [resolveTheme]);

    // Update theme
    const updateTheme = useCallback(async (newTheme) => {
        try {
            setTheme(newTheme);
            resolveTheme(newTheme);
            
            // Save to localStorage as fallback
            localStorage.setItem('theme', newTheme);
            
            // Save to backend if logged in
            const token = localStorage.getItem('token');
            if (token) {
                await settingsService.updateSettings({ theme: newTheme });
            }
        } catch (error) {
            console.error('Failed to update theme:', error);
        }
    }, [resolveTheme]);

    return (
        <ThemeContext.Provider value={{
            theme,
            resolvedTheme,
            loading,
            updateTheme,
            isDark: resolvedTheme === 'dark'
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
