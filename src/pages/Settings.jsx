import { useState, useEffect, useRef, useCallback } from 'react';
import { useCurrency } from '../context/CurrencyContext';

import { useAuth } from '../context/AuthContext';
import { exportService } from '../services/exportService';
import { authService } from '../services/authService';
import { settingsService } from '../services/settingsService';
import { accountService } from '../services/accountService';
import {
    HiCog6Tooth, HiCurrencyDollar, HiCheck, HiMagnifyingGlass, HiChevronDown,
    HiSun, HiBell, HiCalendar, HiArrowsRightLeft,
    HiPlus, HiTrash, HiArrowDownTray, HiArrowUpTray, HiCloudArrowDown,
    HiExclamationTriangle, HiUser, HiLockClosed, HiPencil, HiXMark,
    HiChartPie, HiEye, HiEyeSlash, HiShieldCheck, HiClock, HiBanknotes,
    HiHashtag, HiArrowPath
} from 'react-icons/hi2';

const Settings = () => {
    const { user, setUser } = useAuth();
    const { currency, currencies, updateCurrency, updateExchangeRates, settings, formatCurrency, loading: currencyLoading } = useCurrency();
    
    // UI State
    const [activeTab, setActiveTab] = useState('general');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState(null);
    
    // Exchange Rates State
    const [rates, setRates] = useState({});
    const [showRateForm, setShowRateForm] = useState(false);
    const [rateForm, setRateForm] = useState({ code: '', rate: '' });

    // Export/Import State
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importMode, setImportMode] = useState('merge');
    const [importResult, setImportResult] = useState(null);
    const [importError, setImportError] = useState(null);
    const fileInputRef = useRef(null);

    // Profile State
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: '', email: '' });
    
    // Password State
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    
    // Settings State
    const [localSettings, setLocalSettings] = useState({
        theme: 'dark',
        dateFormat: 'DD/MM/YYYY',
        fiscalYearStart: 4,
        notifications: { budgetAlerts: true, goalReminders: true, transactionAlerts: false },
        dashboardLayout: {
            showNetWorth: true, showRecentTransactions: true, showBudgetOverview: true,
            showGoalsProgress: true, showExpenseChart: true, showIncomeChart: true,
            showAccountBalances: true, showUpcomingRecurring: true
        },
        numberFormat: {
            decimalSeparator: '.',
            thousandSeparator: ',',
            decimalPlaces: 2
        }
    });
    
    // Ref for currency dropdown click-outside
    const currencyDropdownRef = useRef(null);
    
    // Data Summary State
    const [dataSummary, setDataSummary] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [defaultAccount, setDefaultAccount] = useState(null);
    
    // Delete Account State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [clearDataType, setClearDataType] = useState(null);
    const [clearPassword, setClearPassword] = useState('');

    useEffect(() => {
        if (settings?.conversionRates) setRates(settings.conversionRates);
        if (settings?.theme) setLocalSettings(prev => ({ ...prev, theme: settings.theme }));
        if (settings?.dateFormat) setLocalSettings(prev => ({ ...prev, dateFormat: settings.dateFormat }));
        if (settings?.fiscalYearStart) setLocalSettings(prev => ({ ...prev, fiscalYearStart: settings.fiscalYearStart }));
        if (settings?.notifications) setLocalSettings(prev => ({ ...prev, notifications: settings.notifications }));
        if (settings?.dashboardLayout) setLocalSettings(prev => ({ ...prev, dashboardLayout: settings.dashboardLayout }));
        if (settings?.numberFormat) setLocalSettings(prev => ({ ...prev, numberFormat: settings.numberFormat }));
        if (settings?.defaultAccount) setDefaultAccount(settings.defaultAccount);
    }, [settings]);

    useEffect(() => {
        if (user) setProfileForm({ name: user.name || '', email: user.email || '' });
    }, [user]);

    useEffect(() => {
        loadDataSummary();
        loadAccounts();
    }, []);

    // Click-outside handler for currency dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target)) {
                setShowCurrencyDropdown(false);
            }
        };
        
        if (showCurrencyDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showCurrencyDropdown]);

    const loadDataSummary = async () => {
        try {
            const res = await authService.getDataSummary();
            setDataSummary(res.data.data);
        } catch (err) { console.error('Failed to load data summary:', err); }
    };

    const loadAccounts = async () => {
        try {
            const res = await accountService.getAll();
            setAccounts(res.data.data || []);
        } catch (err) { console.error('Failed to load accounts:', err); }
    };

    const showSuccess = (msg) => {
        setSaveSuccess(msg || true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const showError = (msg) => {
        setSaveError(msg);
        setTimeout(() => setSaveError(null), 5000);
    };

    // Currency handlers
    const handleCurrencyChange = async (code) => {
        setIsSaving(true);
        try {
            await updateCurrency(code);
            showSuccess('Currency updated!');
            setShowCurrencyDropdown(false);
        } catch (err) { showError('Failed to update currency'); }
        finally { setIsSaving(false); }
    };

    const handleRateUpdate = async (e) => {
        e.preventDefault();
        if (!rateForm.code || !rateForm.rate) return;
        setIsSaving(true);
        try {
            const newRates = { ...rates, [rateForm.code]: Number(rateForm.rate) };
            await updateExchangeRates(newRates);
            setRates(newRates);
            setRateForm({ code: '', rate: '' });
            setShowRateForm(false);
            showSuccess('Rate saved!');
        } catch (err) { showError('Failed to save rate'); }
        finally { setIsSaving(false); }
    };

    const handleDeleteRate = async (code) => {
        if (!window.confirm(`Remove rate for ${code}?`)) return;
        setIsSaving(true);
        try {
            const newRates = { ...rates };
            delete newRates[code];
            await updateExchangeRates(newRates);
            setRates(newRates);
            showSuccess('Rate removed!');
        } catch (err) { showError('Failed to remove rate'); }
        finally { setIsSaving(false); }
    };

    // Profile handlers
    const handleProfileSave = async () => {
        if (!profileForm.name || !profileForm.email) return showError('Name and email required');
        setIsSaving(true);
        try {
            const res = await authService.updateProfile(profileForm);
            if (res.data.data) setUser(res.data.data);
            setEditingProfile(false);
            showSuccess('Profile updated!');
        } catch (err) { showError(err.response?.data?.message || 'Failed to update profile'); }
        finally { setIsSaving(false); }
    };

    // Password handlers
    const handlePasswordChange = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) return showError('Passwords do not match');
        if (passwordForm.newPassword.length < 6) return showError('Password must be at least 6 characters');
        setIsSaving(true);
        try {
            await authService.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswordForm(false);
            showSuccess('Password changed!');
        } catch (err) { showError(err.response?.data?.message || 'Failed to change password'); }
        finally { setIsSaving(false); }
    };

    // Settings handlers
    const handleSettingChange = async (key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
        try {
            await settingsService.updateSettings({ [key]: value });
            showSuccess('Settings saved!');
        } catch (err) { showError('Failed to save settings'); }
    };

    const handleNotificationChange = async (key, value) => {
        const newNotifications = { ...localSettings.notifications, [key]: value };
        setLocalSettings(prev => ({ ...prev, notifications: newNotifications }));
        try {
            await settingsService.updateSettings({ notifications: newNotifications });
        } catch (err) { showError('Failed to save'); }
    };

    const handleDashboardChange = async (key, value) => {
        const newLayout = { ...localSettings.dashboardLayout, [key]: value };
        setLocalSettings(prev => ({ ...prev, dashboardLayout: newLayout }));
        try {
            await settingsService.updateSettings({ dashboardLayout: newLayout });
        } catch (err) { showError('Failed to save'); }
    };

    const handleDefaultAccountChange = async (accountId) => {
        setDefaultAccount(accountId);
        try {
            await settingsService.updateSettings({ defaultAccount: accountId || null });
            showSuccess('Default account updated!');
        } catch (err) { showError('Failed to save'); }
    };

    const handleNumberFormatChange = async (key, value) => {
        const newFormat = { ...localSettings.numberFormat, [key]: value };
        setLocalSettings(prev => ({ ...prev, numberFormat: newFormat }));
        try {
            await settingsService.updateSettings({ numberFormat: newFormat });
            showSuccess('Number format updated!');
        } catch (err) { showError('Failed to save'); }
    };

    // Export handlers
    const handleExportBackup = async () => {
        setIsExporting(true);
        try {
            const res = await exportService.downloadBackup();
            const blob = new Blob([res.data], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `financeflow_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showSuccess('Backup downloaded!');
        } catch (err) { showError('Export failed'); }
        finally { setIsExporting(false); }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (importMode === 'replace' && !window.confirm('⚠️ Replace mode will DELETE all existing data. Continue?')) {
            e.target.value = '';
            return;
        }
        setIsImporting(true);
        setImportResult(null);
        setImportError(null);
        try {
            const content = await file.text();
            const data = JSON.parse(content);
            if (!data.data) throw new Error('Invalid backup format');
            const res = await exportService.importBackup(data.data, importMode);
            setImportResult(res.data);
            loadDataSummary();
            showSuccess('Import complete!');
        } catch (err) {
            setImportError(err.message || 'Import failed');
        }
        finally {
            setIsImporting(false);
            e.target.value = '';
        }
    };

    // Delete/Clear handlers
    const handleDeleteAccount = async () => {
        if (!deletePassword) return showError('Password required');
        try {
            await authService.deleteAccount(deletePassword);
            authService.logout();
        } catch (err) { showError(err.response?.data?.message || 'Failed to delete account'); }
    };

    const handleClearData = async () => {
        if (!clearPassword) return showError('Password required');
        try {
            await authService.clearData(clearDataType, clearPassword);
            setClearDataType(null);
            setClearPassword('');
            loadDataSummary();
            showSuccess('Data cleared!');
        } catch (err) { showError(err.response?.data?.message || 'Failed to clear data'); }
    };

    const filteredCurrencies = currencies.filter(c => 
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const tabs = [
        { id: 'general', label: 'General', icon: HiCog6Tooth },
        { id: 'profile', label: 'Profile & Security', icon: HiUser },
        { id: 'appearance', label: 'Appearance', icon: HiSun },
        { id: 'data', label: 'Data Management', icon: HiCloudArrowDown }
    ];

    const dateFormats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'MMM DD, YYYY'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const cardStyle = { background: 'rgba(15, 23, 42, 0.6)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem' };
    const cardHeader = (gradient) => ({ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', background: gradient });
    const iconBox = (gradient) => ({ width: 44, height: 44, borderRadius: 12, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' });
    const inputStyle = { width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white' };
    const btnPrimary = { padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 10, color: 'white', fontWeight: 600, cursor: 'pointer' };
    const btnDanger = { ...btnPrimary, background: 'linear-gradient(135deg, #ef4444, #dc2626)' };
    const btnSecondary = { ...btnPrimary, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' };

    return (
        <div className="page-container">
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <HiCog6Tooth size={28} style={{ color: '#818cf8' }} /> Settings
                </h1>
                <p style={{ color: '#94a3b8' }}>Manage your preferences and configuration</p>
            </div>

            {/* Success/Error Messages */}
            {saveSuccess && (
                <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 10, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22c55e' }}>
                    <HiCheck size={20} /> {typeof saveSuccess === 'string' ? saveSuccess : 'Saved successfully!'}
                </div>
            )}
            {saveError && (
                <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 10, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171' }}>
                    <HiExclamationTriangle size={20} /> {saveError}
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                        padding: '0.75rem 1.25rem', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: activeTab === tab.id ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)',
                        color: activeTab === tab.id ? 'white' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500
                    }}>
                        <tab.icon size={18} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {currencyLoading && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <HiArrowPath size={24} style={{ color: '#818cf8', animation: 'spin 1s linear infinite' }} />
                    <span style={{ marginLeft: '0.75rem', color: '#94a3b8' }}>Loading settings...</span>
                </div>
            )}

            {!currencyLoading && (
            <div style={{ maxWidth: 800 }}>
                {/* GENERAL TAB */}
                {activeTab === 'general' && (
                    <>
                        {/* Currency Card */}
                        <div style={cardStyle}>
                            <div style={cardHeader('linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={iconBox('linear-gradient(135deg, #6366f1, #8b5cf6)')}>
                                        <HiCurrencyDollar size={22} color="white" />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Currency</h2>
                                        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Set your preferred currency</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 12, marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#22c55e' }}>
                                            {currency.symbol}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600 }}>{currency.name}</p>
                                            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{currency.code}</p>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#22c55e' }}>{formatCurrency(12345.67)}</p>
                                </div>
                                <div ref={currencyDropdownRef} style={{ position: 'relative' }}>
                                    <button onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)} style={{ ...inputStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                                        <span>{currency.code} - {currency.name}</span>
                                        <HiChevronDown style={{ transform: showCurrencyDropdown ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                                    </button>
                                    {showCurrencyDropdown && (
                                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, maxHeight: 300, overflow: 'hidden', zIndex: 100 }}>
                                            <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={inputStyle} />
                                            </div>
                                            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                                                {filteredCurrencies.map(c => (
                                                    <button key={c.code} onClick={() => handleCurrencyChange(c.code)} style={{ width: '100%', padding: '0.75rem 1rem', background: currency.code === c.code ? 'rgba(99, 102, 241, 0.2)' : 'transparent', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>{c.symbol} {c.code} - {c.name}</span>
                                                        {currency.code === c.code && <HiCheck color="#22c55e" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Date Format */}
                        <div style={cardStyle}>
                            <div style={cardHeader('linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(6, 182, 212, 0.05))')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={iconBox('linear-gradient(135deg, #0ea5e9, #06b6d4)')}>
                                        <HiCalendar size={22} color="white" />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Date & Time</h2>
                                        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Configure date format and fiscal year</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>Date Format</label>
                                <select value={localSettings.dateFormat} onChange={e => handleSettingChange('dateFormat', e.target.value)} style={{ ...inputStyle, cursor: 'pointer', marginBottom: '1rem' }}>
                                    {dateFormats.map(f => <option key={f} value={f} style={{ background: '#1e293b' }}>{f}</option>)}
                                </select>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>Fiscal Year Start Month</label>
                                <select value={localSettings.fiscalYearStart} onChange={e => handleSettingChange('fiscalYearStart', parseInt(e.target.value))} style={{ ...inputStyle, cursor: 'pointer' }}>
                                    {months.map((m, i) => <option key={i} value={i + 1} style={{ background: '#1e293b' }}>{m}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Default Account */}
                        <div style={cardStyle}>
                            <div style={cardHeader('linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.05))')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={iconBox('linear-gradient(135deg, #22c55e, #10b981)')}>
                                        <HiBanknotes size={22} color="white" />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Default Account</h2>
                                        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Default account for new transactions</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                                <select value={defaultAccount || ''} onChange={e => handleDefaultAccountChange(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                                    <option value="" style={{ background: '#1e293b' }}>None (Always ask)</option>
                                    {accounts.map(a => <option key={a._id} value={a._id} style={{ background: '#1e293b' }}>{a.accountName}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Number Format */}
                        <div style={cardStyle}>
                            <div style={cardHeader('linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(139, 92, 246, 0.05)')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={iconBox('linear-gradient(135deg, #a855f7, #8b5cf6)')}>
                                        <HiHashtag size={22} color="white" />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Number Format</h2>
                                        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Configure how numbers are displayed</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>Decimal Separator</label>
                                        <select value={localSettings.numberFormat?.decimalSeparator || '.'} onChange={e => handleNumberFormatChange('decimalSeparator', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                                            <option value="." style={{ background: '#1e293b' }}>Period (.)</option>
                                            <option value="," style={{ background: '#1e293b' }}>Comma (,)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>Thousands Separator</label>
                                        <select value={localSettings.numberFormat?.thousandSeparator || ','} onChange={e => handleNumberFormatChange('thousandSeparator', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                                            <option value="," style={{ background: '#1e293b' }}>Comma (,)</option>
                                            <option value="." style={{ background: '#1e293b' }}>Period (.)</option>
                                            <option value=" " style={{ background: '#1e293b' }}>Space ( )</option>
                                            <option value="" style={{ background: '#1e293b' }}>None</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>Decimal Places</label>
                                    <select value={localSettings.numberFormat?.decimalPlaces ?? 2} onChange={e => handleNumberFormatChange('decimalPlaces', parseInt(e.target.value))} style={{ ...inputStyle, cursor: 'pointer' }}>
                                        {[0, 1, 2, 3, 4].map(n => (
                                            <option key={n} value={n} style={{ background: '#1e293b' }}>{n}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                                    <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Preview: <span style={{ color: '#22c55e', fontWeight: 600 }}>
                                        {(() => {
                                            const dec = localSettings.numberFormat?.decimalSeparator || '.';
                                            const thou = localSettings.numberFormat?.thousandSeparator || ',';
                                            const places = localSettings.numberFormat?.decimalPlaces ?? 2;
                                            const intPart = '12' + thou + '345';
                                            const decPart = places > 0 ? dec + '67'.slice(0, places).padEnd(places, '0') : '';
                                            return currency.symbol + intPart + decPart;
                                        })()}
                                    </span></p>
                                </div>
                            </div>
                        </div>

                        {/* Exchange Rates */}
                        <div style={cardStyle}>
                            <div style={cardHeader('linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(245, 158, 11, 0.05))')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={iconBox('linear-gradient(135deg, #eab308, #f59e0b)')}>
                                        <HiArrowsRightLeft size={22} color="white" />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Exchange Rates</h2>
                                        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Manual currency conversion rates</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                                {Object.entries(rates).map(([code, rate]) => (
                                    <div key={code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, marginBottom: '0.5rem' }}>
                                        <span><strong>{code}</strong> → {rate} {currency.code}</span>
                                        <button onClick={() => handleDeleteRate(code)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><HiTrash size={18} /></button>
                                    </div>
                                ))}
                                {!showRateForm ? (
                                    <button onClick={() => setShowRateForm(true)} style={{ ...btnSecondary, width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <HiPlus /> Add Rate
                                    </button>
                                ) : (
                                    <form onSubmit={handleRateUpdate} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 12, marginTop: '0.5rem' }}>
                                        <select value={rateForm.code} onChange={e => setRateForm({ ...rateForm, code: e.target.value })} style={{ ...inputStyle, marginBottom: '0.75rem' }} required>
                                            <option value="">Select Currency</option>
                                            {currencies.filter(c => c.code !== currency.code && !rates[c.code]).map(c => (
                                                <option key={c.code} value={c.code} style={{ background: '#1e293b' }}>{c.code} - {c.name}</option>
                                            ))}
                                        </select>
                                        <input type="number" step="0.0001" placeholder="Rate" value={rateForm.rate} onChange={e => setRateForm({ ...rateForm, rate: e.target.value })} style={{ ...inputStyle, marginBottom: '0.75rem' }} required />
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button type="submit" style={btnPrimary}>Save</button>
                                            <button type="button" onClick={() => setShowRateForm(false)} style={btnSecondary}>Cancel</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                    <>
                        {/* Profile Card */}
                        <div style={cardStyle}>
                            <div style={cardHeader('linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(34, 197, 94, 0.05))')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={iconBox('linear-gradient(135deg, #10b981, #22c55e)')}>
                                        <HiUser size={22} color="white" />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Profile Information</h2>
                                        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Update your personal details</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                                {!editingProfile ? (
                                    <>
                                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, marginBottom: '0.75rem' }}>
                                            <p style={{ color: '#64748b', fontSize: '0.75rem' }}>Name</p>
                                            <p style={{ fontWeight: 500 }}>{user?.name}</p>
                                        </div>
                                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, marginBottom: '1rem' }}>
                                            <p style={{ color: '#64748b', fontSize: '0.75rem' }}>Email</p>
                                            <p style={{ fontWeight: 500 }}>{user?.email}</p>
                                        </div>
                                        <button onClick={() => setEditingProfile(true)} style={{ ...btnPrimary, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <HiPencil /> Edit Profile
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>Name</label>
                                        <input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} style={{ ...inputStyle, marginBottom: '1rem' }} />
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>Email</label>
                                        <input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} style={{ ...inputStyle, marginBottom: '1rem' }} />
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={handleProfileSave} disabled={isSaving} style={btnPrimary}>{isSaving ? 'Saving...' : 'Save'}</button>
                                            <button onClick={() => { setEditingProfile(false); setProfileForm({ name: user?.name, email: user?.email }); }} style={btnSecondary}>Cancel</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Password Card */}
                        <div style={cardStyle}>
                            <div style={cardHeader('linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={iconBox('linear-gradient(135deg, #6366f1, #8b5cf6)')}>
                                        <HiLockClosed size={22} color="white" />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Change Password</h2>
                                        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Update your password</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                                {!showPasswordForm ? (
                                    <button onClick={() => setShowPasswordForm(true)} style={{ ...btnSecondary, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <HiShieldCheck /> Change Password
                                    </button>
                                ) : (
                                    <>
                                        <div style={{ position: 'relative', marginBottom: '1rem' }}>
                                            <input type={showPasswords.current ? 'text' : 'password'} placeholder="Current Password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} style={inputStyle} />
                                            <button type="button" onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                                                {showPasswords.current ? <HiEyeSlash /> : <HiEye />}
                                            </button>
                                        </div>
                                        <div style={{ position: 'relative', marginBottom: '1rem' }}>
                                            <input type={showPasswords.new ? 'text' : 'password'} placeholder="New Password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} style={inputStyle} />
                                            <button type="button" onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                                                {showPasswords.new ? <HiEyeSlash /> : <HiEye />}
                                            </button>
                                        </div>
                                        <div style={{ position: 'relative', marginBottom: '1rem' }}>
                                            <input type={showPasswords.confirm ? 'text' : 'password'} placeholder="Confirm New Password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} style={inputStyle} />
                                            <button type="button" onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                                                {showPasswords.confirm ? <HiEyeSlash /> : <HiEye />}
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={handlePasswordChange} disabled={isSaving} style={btnPrimary}>{isSaving ? 'Changing...' : 'Change Password'}</button>
                                            <button onClick={() => { setShowPasswordForm(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }} style={btnSecondary}>Cancel</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Delete Account */}
                        <div style={{ ...cardStyle, borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                            <div style={cardHeader('linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={iconBox('linear-gradient(135deg, #ef4444, #dc2626)')}>
                                        <HiTrash size={22} color="white" />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f87171' }}>Delete Account</h2>
                                        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Permanently delete your account and all data</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                                {!showDeleteConfirm ? (
                                    <button onClick={() => setShowDeleteConfirm(true)} style={btnDanger}>Delete My Account</button>
                                ) : (
                                    <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 12 }}>
                                        <p style={{ color: '#f87171', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <HiExclamationTriangle /> This action is irreversible!
                                        </p>
                                        <input type="password" placeholder="Enter your password to confirm" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} style={{ ...inputStyle, marginBottom: '1rem' }} />
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={handleDeleteAccount} style={btnDanger}>Confirm Delete</button>
                                            <button onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }} style={btnSecondary}>Cancel</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* APPEARANCE TAB */}
                {activeTab === 'appearance' && (
                    <>


                        {/* Notifications */}
                        <div style={cardStyle}>
                            <div style={cardHeader('linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(14, 165, 233, 0.05))')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={iconBox('linear-gradient(135deg, #06b6d4, #0ea5e9)')}>
                                        <HiBell size={22} color="white" />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Notifications</h2>
                                        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Configure alert preferences</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                                {[{ key: 'budgetAlerts', label: 'Budget Alerts', desc: 'Get notified when approaching budget limits' },
                                  { key: 'goalReminders', label: 'Goal Reminders', desc: 'Reminders about savings goals' },
                                  { key: 'transactionAlerts', label: 'Transaction Alerts', desc: 'Notifications for new transactions' }].map(n => (
                                    <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, marginBottom: '0.75rem' }}>
                                        <div>
                                            <p style={{ fontWeight: 500 }}>{n.label}</p>
                                            <p style={{ color: '#64748b', fontSize: '0.8rem' }}>{n.desc}</p>
                                        </div>
                                        <label style={{ position: 'relative', width: 48, height: 26, cursor: 'pointer' }}>
                                            <input type="checkbox" checked={localSettings.notifications[n.key]} onChange={e => handleNotificationChange(n.key, e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                                            <span style={{ position: 'absolute', inset: 0, background: localSettings.notifications[n.key] ? '#22c55e' : '#475569', borderRadius: 26, transition: '0.3s' }} />
                                            <span style={{ position: 'absolute', top: 3, left: localSettings.notifications[n.key] ? 25 : 3, width: 20, height: 20, background: 'white', borderRadius: '50%', transition: '0.3s' }} />
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Dashboard Layout */}
                        <div style={cardStyle}>
                            <div style={cardHeader('linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(139, 92, 246, 0.05))')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={iconBox('linear-gradient(135deg, #a855f7, #8b5cf6)')}>
                                        <HiChartPie size={22} color="white" />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Dashboard Layout</h2>
                                        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Choose which widgets to display</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    {[{ key: 'showNetWorth', label: 'Net Worth' }, { key: 'showRecentTransactions', label: 'Recent Transactions' },
                                      { key: 'showBudgetOverview', label: 'Budget Overview' }, { key: 'showGoalsProgress', label: 'Goals Progress' },
                                      { key: 'showExpenseChart', label: 'Expense Chart' }, { key: 'showIncomeChart', label: 'Income Chart' },
                                      { key: 'showAccountBalances', label: 'Account Balances' }, { key: 'showUpcomingRecurring', label: 'Upcoming Recurring' }].map(w => (
                                        <label key={w.key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, cursor: 'pointer' }}>
                                            <input type="checkbox" checked={localSettings.dashboardLayout[w.key]} onChange={e => handleDashboardChange(w.key, e.target.checked)} style={{ accentColor: '#6366f1', width: 18, height: 18 }} />
                                            <span style={{ fontSize: '0.9rem' }}>{w.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* DATA TAB */}
                {activeTab === 'data' && (
                    <>
                        {/* Data Summary */}
                        <div style={cardStyle}>
                            <div style={cardHeader('linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={iconBox('linear-gradient(135deg, #6366f1, #8b5cf6)')}>
                                        <HiChartPie size={22} color="white" />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Data Summary</h2>
                                        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Overview of your stored data</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                                {dataSummary && (
                                    <>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                                            {[{ label: 'Transactions', value: dataSummary.transactions }, { label: 'Accounts', value: dataSummary.accounts },
                                              { label: 'Goals', value: dataSummary.goals }, { label: 'Budgets', value: dataSummary.budgets },
                                              { label: 'Investments', value: dataSummary.investments }, { label: 'Tags', value: dataSummary.tags },
                                              { label: 'Categories', value: dataSummary.categories }, { label: 'Recurring', value: dataSummary.recurringTransactions }].map(d => (
                                                <div key={d.label} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, textAlign: 'center' }}>
                                                    <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#818cf8' }}>{d.value}</p>
                                                    <p style={{ color: '#64748b', fontSize: '0.75rem' }}>{d.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                        {dataSummary.memberSince && (
                                            <p style={{ color: '#64748b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <HiClock /> Member since {new Date(dataSummary.memberSince).toLocaleDateString()}
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Export/Import */}
                        <div style={cardStyle}>
                            <div style={cardHeader('linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.05))')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={iconBox('linear-gradient(135deg, #06b6d4, #3b82f6)')}>
                                        <HiCloudArrowDown size={22} color="white" />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Export & Import</h2>
                                        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Backup or restore your data</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" style={{ display: 'none' }} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <button onClick={handleExportBackup} disabled={isExporting} style={{ ...btnPrimary, background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <HiArrowDownTray /> {isExporting ? 'Exporting...' : 'Export Backup'}
                                    </button>
                                    <button onClick={() => fileInputRef.current?.click()} disabled={isImporting} style={{ ...btnPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <HiArrowUpTray /> {isImporting ? 'Importing...' : 'Import Backup'}
                                    </button>
                                </div>
                                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, marginBottom: '1rem' }}>
                                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Import Mode</p>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                            <input type="radio" name="importMode" value="merge" checked={importMode === 'merge'} onChange={e => setImportMode(e.target.value)} style={{ accentColor: '#22c55e' }} />
                                            <span style={{ color: importMode === 'merge' ? '#22c55e' : '#94a3b8' }}>Merge</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                            <input type="radio" name="importMode" value="replace" checked={importMode === 'replace'} onChange={e => setImportMode(e.target.value)} style={{ accentColor: '#ef4444' }} />
                                            <span style={{ color: importMode === 'replace' ? '#ef4444' : '#94a3b8' }}>Replace (Deletes existing)</span>
                                        </label>
                                    </div>
                                </div>
                                {importError && <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 10, color: '#f87171', marginBottom: '1rem' }}>{importError}</div>}
                                {importResult && <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: 10, color: '#22c55e' }}>{importResult.message}</div>}
                            </div>
                        </div>

                        {/* Clear Data */}
                        <div style={{ ...cardStyle, borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                            <div style={cardHeader('linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={iconBox('linear-gradient(135deg, #ef4444, #dc2626)')}>
                                        <HiTrash size={22} color="white" />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f87171' }}>Clear Data</h2>
                                        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Selectively delete your data</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                    {['transactions', 'accounts', 'goals', 'investments', 'budgets', 'tags', 'categories', 'recurring'].map(type => (
                                        <button key={type} onClick={() => setClearDataType(type)} style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 10, color: '#f87171', cursor: 'pointer', textTransform: 'capitalize' }}>
                                            Clear {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
            )}

            {/* Clear Data Modal */}
            {clearDataType && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#1e293b', borderRadius: 16, padding: '1.5rem', maxWidth: 400, width: '90%' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#f87171' }}>Clear {clearDataType}?</h3>
                        <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>This will permanently delete all your {clearDataType}. Enter your password to confirm.</p>
                        <input type="password" placeholder="Password" value={clearPassword} onChange={e => setClearPassword(e.target.value)} style={{ ...inputStyle, marginBottom: '1rem' }} />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={handleClearData} style={btnDanger}>Clear</button>
                            <button onClick={() => { setClearDataType(null); setClearPassword(''); }} style={btnSecondary}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
