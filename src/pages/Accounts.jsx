import { useState, useEffect } from 'react';
import { accountService } from '../services';
import { Modal } from '../components';
import { useCurrency } from '../context/CurrencyContext';
import { HiPlus, HiWallet, HiPencil, HiTrash, HiCheckCircle, HiSparkles, HiArrowPath, HiXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

// Predefined color palette
const colorOptions = [
    { value: '#22c55e', label: 'Green', gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' },
    { value: '#ef4444', label: 'Red', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
    { value: '#6366f1', label: 'Indigo', gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' },
    { value: '#f59e0b', label: 'Gold', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    { value: '#06b6d4', label: 'Cyan', gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' },
    { value: '#8b5cf6', label: 'Purple', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
    { value: '#ec4899', label: 'Pink', gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' },
    { value: '#f97316', label: 'Orange', gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' },
    { value: '#14b8a6', label: 'Teal', gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' },
    { value: '#64748b', label: 'Slate', gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)' }
];

// Predefined icons
const iconOptions = [
    '💰', '💵', '💳', '🏦', '💎', '🪙', '📈', '💼',
    '🏠', '🚗', '✈️', '🎓', '🏥', '🛒', '🎁', '⭐',
    '🔥', '💡', '🎯', '🚀', '💪', '🌟', '💫', '🎨'
];

// Account type presets
const accountTypePresets = [
    { type: 'salary', label: 'Salary', icon: '💼', color: '#22c55e', description: 'Income from work' },
    { type: 'expense', label: 'Expense', icon: '💳', color: '#ef4444', description: 'Daily spending' },
    { type: 'savings', label: 'Savings', icon: '🏦', color: '#6366f1', description: 'Emergency fund' },
    { type: 'investment', label: 'Investment', icon: '📈', color: '#f59e0b', description: 'Stocks, mutual funds' },
    { type: 'business', label: 'Business', icon: '💼', color: '#8b5cf6', description: 'Business income' },
    { type: 'travel', label: 'Travel', icon: '✈️', color: '#06b6d4', description: 'Vacation fund' },
    { type: 'education', label: 'Education', icon: '🎓', color: '#ec4899', description: 'Learning fund' },
    { type: 'custom', label: 'Custom', icon: '⭐', color: '#64748b', description: 'Create your own' }
];

const Accounts = () => {
    const { formatCurrency: formatGlobalCurrency, currency: globalCurrency, currencies, convertAmount } = useCurrency();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [showTrash, setShowTrash] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    const [formData, setFormData] = useState({
        accountName: '',
        accountType: 'savings',
        balance: '',
        description: '',
        color: '#6366f1',
        icon: '💰',
        currencyCode: globalCurrency.code
    });

    useEffect(() => {
        fetchAccounts();
    }, [showTrash]);

    // Update form default currency when global currency changes, but only if not editing
    useEffect(() => {
        if (!isEditing && globalCurrency.code) {
            setFormData(prev => ({ ...prev, currencyCode: globalCurrency.code }));
        }
    }, [globalCurrency.code, isEditing]);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            let res;
            if (showTrash) {
                res = await accountService.getDeleted();
            } else {
                res = await accountService.getAll();
            }
            setAccounts(res.data.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load accounts');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Find selected currency object
            const selectedCurrency = currencies.find(c => c.code === formData.currencyCode);
            const submissionData = {
                ...formData,
                currency: selectedCurrency ? {
                    code: selectedCurrency.code,
                    symbol: selectedCurrency.symbol,
                    name: selectedCurrency.name,
                    locale: selectedCurrency.locale
                } : undefined
            };

            if (isEditing) {
                await accountService.update(selectedAccount._id, submissionData);
                toast.success('Account updated successfully!');
            } else {
                await accountService.create(submissionData);
                toast.success('Account created successfully!');
            }
            setShowModal(false);
            resetForm();
            fetchAccounts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const resetForm = () => {
        setFormData({
            accountName: '',
            accountType: 'savings',
            balance: '',
            description: '',
            color: '#6366f1',
            icon: '💰',
            currencyCode: globalCurrency.code
        });
        setIsEditing(false);
        setSelectedAccount(null);
        setShowColorPicker(false);
        setShowIconPicker(false);
        setShowDeleteModal(false);
        setDeleteConfirmation('');
    };

    const handleEdit = (account) => {
        setSelectedAccount(account);
        setFormData({
            accountName: account.accountName,
            accountType: account.accountType,
            balance: account.balance,
            description: account.description || '',
            color: account.color || '#6366f1',
            icon: account.icon || '💰',
            currencyCode: account.currency?.code || globalCurrency.code
        });
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (e, account) => {
        if (e) e.stopPropagation();
        if (showTrash) return;
        
        if (account.balance > 0) {
            return toast.error('Please transfer funds before deleting (Balance must be 0)');
        }

        try {
            await accountService.softDelete(account._id);
            toast.success('Wallet moved to trash');
            setShowDeleteModal(false);
            setShowModal(false);
            setDeleteConfirmation('');
            fetchAccounts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Delete failed');
        }
    };

    const handleRestore = async (e, account) => {
        e.stopPropagation();
        try {
            await accountService.restore(account._id);
            toast.success('Wallet restored successfully');
            fetchAccounts();
        } catch (error) {
            toast.error('Restore failed');
        }
    };

    const handlePermanentDelete = async (e, account) => {
        e.stopPropagation();
        if (window.confirm('This action cannot be undone. Are you sure?')) {
            try {
                await accountService.permanentDelete(account._id);
                toast.success('Wallet permanently deleted');
                fetchAccounts();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Permanent delete failed');
            }
        }
    };

    const selectPreset = (preset) => {
        setFormData({
            ...formData,
            accountType: preset.type,
            icon: preset.icon,
            color: preset.color
        });
    };

    const getGradient = (color) => {
        const colorOption = colorOptions.find(c => c.value === color);
        // Desaturate if in trash
        if (showTrash) {
            return `linear-gradient(135deg, #64748b 0%, #475569 100%)`;
        }
        return colorOption?.gradient || `linear-gradient(135deg, ${color} 0%, ${color} 100%)`;
    };

    const totalBalance = accounts.reduce((sum, acc) => {
        return sum + convertAmount(acc.balance || 0, acc.currency?.code);
    }, 0);

    // Helper to format currency for specific account
    const formatAccountCurrency = (amount, currencyData) => {
        if (!currencyData) return formatGlobalCurrency(amount);
        
        try {
            return new Intl.NumberFormat(currencyData.locale || 'en-US', {
                style: 'currency',
                currency: currencyData.code || 'USD',
                maximumFractionDigits: 0
            }).format(amount || 0);
        } catch (error) {
            return `${currencyData.symbol || '$'}${Number(amount).toLocaleString()}`;
        }
    };

    // Helper for form preview
    const getPreviewCurrencySymbol = () => {
        const selected = currencies.find(c => c.code === formData.currencyCode);
        return selected ? selected.symbol : globalCurrency.symbol;
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '100vh', width: '100%' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid rgba(99, 102, 241, 0.3)', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                    <p style={{ marginTop: '1rem', color: '#94a3b8' }}>Loading accounts...</p>
                </div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{showTrash ? 'Trash Bin' : 'My Wallets'}</h1>
                    <p style={{ color: '#94a3b8' }}>{showTrash ? 'Manage deleted wallets' : 'Create and manage unlimited custom accounts'}</p>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                        onClick={() => setShowTrash(!showTrash)} 
                        className="btn-secondary" 
                        style={{ 
                            padding: '0.875rem 1.5rem',
                            background: showTrash ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
                            color: showTrash ? '#818cf8' : '#94a3b8',
                            border: showTrash ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <HiTrash size={20} />
                        <span>{showTrash ? 'View Active' : 'Trashed Wallets'}</span>
                    </button>
                    
                    {!showTrash && (
                        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary" style={{ padding: '0.875rem 1.5rem' }}>
                            <HiPlus size={20} />
                            <span>New Wallet</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Total Balance Hero - Displays in Global Default Currency (Only in active view) */}
            {!showTrash && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(236, 72, 153, 0.05) 100%)',
                    borderRadius: '24px',
                    padding: '2rem',
                    marginBottom: '2rem',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '-50px',
                        right: '-50px',
                        width: '200px',
                        height: '200px',
                        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
                        borderRadius: '50%'
                    }}></div>
                    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                        <div>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Net Worth (Approx)</p>
                            <h2 style={{ fontSize: '3rem', fontWeight: 'bold' }} className="gradient-text">{formatGlobalCurrency(totalBalance)}</h2>
                        </div>
                        <div style={{ display: 'flex', gap: '2rem' }}>
                            <div style={{ textAlign: 'center', padding: '1rem 2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{accounts.length}</p>
                                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Wallets</p>
                            </div>
                            <Link to="/transfers" style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                padding: '1rem 2rem', 
                                background: 'rgba(99, 102, 241, 0.2)', 
                                borderRadius: '16px',
                                textDecoration: 'none',
                                color: 'white',
                                transition: 'background 0.2s'
                            }}>
                                <HiSparkles size={24} style={{ marginBottom: '4px' }} />
                                <p style={{ fontSize: '0.85rem' }}>Transfer</p>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Account Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {accounts.map((account) => (
                    <div
                        key={account._id}
                        onClick={() => !showTrash && handleEdit(account)}
                        style={{
                            background: getGradient(account.color || '#6366f1'),
                            borderRadius: '20px',
                            padding: '1.5rem',
                            cursor: showTrash ? 'default' : 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            position: 'relative',
                            overflow: 'hidden',
                            minHeight: '180px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            opacity: showTrash ? 0.8 : 1
                        }}
                    >
                        {/* Decorative circle */}
                        <div style={{
                            position: 'absolute',
                            top: '-30px',
                            right: '-30px',
                            width: '120px',
                            height: '120px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '50%'
                        }}></div>
                        
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '14px',
                                background: 'rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem'
                            }}>
                                {account.icon || '💰'}
                            </div>
                            <span style={{
                                padding: '4px 12px',
                                background: 'rgba(255,255,255,0.2)',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                textTransform: 'capitalize'
                            }}>
                                {account.accountType}
                            </span>
                        </div>

                        {/* Balance - Uses Account Specific Currency */}
                        <div style={{ position: 'relative' }}>
                            <p style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '4px' }}>{account.accountName}</p>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
                                {formatAccountCurrency(account.balance, account.currency)}
                            </h3>
                        </div>

                        {/* Actions */}
                        <div style={{
                            position: 'absolute',
                            bottom: '1rem',
                            right: '1rem',
                            display: 'flex',
                            gap: '0.5rem'
                        }}>
                            {showTrash ? (
                                <>
                                    <button
                                        onClick={(e) => handleRestore(e, account)}
                                        title="Restore Wallet"
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: 'rgba(34, 197, 94, 0.2)',
                                            border: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.3)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)'}
                                    >
                                        <HiArrowPath size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => handlePermanentDelete(e, account)}
                                        title="Delete Permanently"
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: 'rgba(239, 68, 68, 0.2)',
                                            border: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                    >
                                        <HiXMark size={16} />
                                    </button>
                                </>
                            ) : (
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: 0.9,
                                    cursor: 'pointer'
                                }}>
                                    <HiPencil size={14} />
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Add New Card (Only show in active view) */}
                {!showTrash && (
                    <div
                        onClick={() => { resetForm(); setShowModal(true); }}
                        style={{
                            border: '2px dashed rgba(99, 102, 241, 0.3)',
                            borderRadius: '20px',
                            minHeight: '180px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            gap: '1rem',
                            background: 'rgba(99, 102, 241, 0.05)'
                        }}
                    >
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: 'rgba(99, 102, 241, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <HiPlus size={24} style={{ color: '#818cf8' }} />
                        </div>
                        <span style={{ color: '#818cf8', fontWeight: 500 }}>Create New Wallet</span>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal isOpen={showModal} onClose={() => { setShowModal(false); setDeleteConfirmation(''); setShowDeleteModal(false); }} title={showDeleteModal ? 'Delete Wallet' : (isEditing ? 'Edit Wallet' : 'Create New Wallet')}>
                {showDeleteModal ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ 
                            padding: '1rem', 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            border: '1px solid rgba(239, 68, 68, 0.2)', 
                            borderRadius: '12px',
                            color: '#fca5a5'
                        }}>
                             <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '0.5rem', borderRadius: '8px' }}>
                                    <HiTrash size={20} color="#ef4444" />
                                </div>
                                <div>
                                    <h3 style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '0.25rem' }}>Unexpected Bad Things Will Happen!</h3>
                                    <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                                        This will move the wallet <strong>{selectedAccount?.accountName}</strong> to the trash bin. 
                                        You can restore it later if needed, but it will be disabled for now.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.9rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>
                                To confirm, type <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px', color: 'white' }}>{selectedAccount?.accountName}</span> below:
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                className="input-field"
                                placeholder="Type wallet name to confirm"
                                style={{ borderColor: deleteConfirmation === selectedAccount?.accountName ? '#22c55e' : '' }}
                                autoFocus
                            />
                        </div>

                        <button 
                            type="button" 
                            onClick={(e) => handleDelete(e, selectedAccount)}
                            disabled={deleteConfirmation !== selectedAccount?.accountName}
                            style={{ 
                                padding: '1rem',
                                background: deleteConfirmation === selectedAccount?.accountName ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'rgba(239, 68, 68, 0.1)',
                                color: deleteConfirmation === selectedAccount?.accountName ? 'white' : 'rgba(239, 68, 68, 0.5)',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                cursor: deleteConfirmation === selectedAccount?.accountName ? 'pointer' : 'not-allowed',
                                transition: 'all 0.2s',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <HiTrash size={20} />
                            I understand, move to trash
                        </button>

                        <button 
                            type="button" 
                            onClick={() => { setShowDeleteModal(false); setDeleteConfirmation(''); }}
                            style={{ 
                                padding: '0.75rem',
                                background: 'transparent',
                                color: '#94a3b8',
                                border: 'none',
                                cursor: 'pointer',
                                width: '100%'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {/* Quick Presets - Only show when creating */}
                        {!isEditing && (
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.75rem' }}>Quick Start</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                    {accountTypePresets.map((preset) => (
                                        <button
                                            key={preset.type}
                                            type="button"
                                            onClick={() => selectPreset(preset)}
                                            style={{
                                                padding: '0.75rem 0.5rem',
                                                borderRadius: '10px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '4px',
                                                background: formData.accountType === preset.type ? `${preset.color}20` : 'rgba(255,255,255,0.03)',
                                                border: `2px solid ${formData.accountType === preset.type ? preset.color : 'rgba(255,255,255,0.1)'}`,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <span style={{ fontSize: '1.25rem' }}>{preset.icon}</span>
                                            <span style={{ fontSize: '0.7rem', color: formData.accountType === preset.type ? 'white' : '#94a3b8' }}>{preset.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Wallet Name */}
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Wallet Name</label>
                            <input
                                type="text"
                                value={formData.accountName}
                                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                                className="input-field"
                                placeholder="e.g. My Savings Account"
                                required
                            />
                        </div>

                        {/* Account Type (Custom) */}
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Account Type</label>
                            <input
                                type="text"
                                value={formData.accountType}
                                onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                                className="input-field"
                                placeholder="e.g. savings, travel, emergency"
                                required
                            />
                        </div>

                        {/* Currency Selection */}
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Currency</label>
                            <select
                                value={formData.currencyCode}
                                onChange={(e) => setFormData({ ...formData, currencyCode: e.target.value })}
                                className="input-field"
                                required
                                disabled={currencies.length === 0}
                            >
                                {currencies.length === 0 ? (
                                    <option value="">Loading currencies...</option>
                                ) : (
                                    currencies.map((curr) => (
                                        <option key={curr.code} value={curr.code}>
                                            {curr.code} - {curr.name} ({curr.symbol})
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        {/* Initial Balance */}
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>
                                {isEditing ? 'Current Balance' : 'Initial Balance'} ({getPreviewCurrencySymbol()})
                            </label>
                            <input
                                type="number"
                                value={formData.balance}
                                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                                className="input-field"
                                placeholder="0"
                                required
                            />
                        </div>

                        {/* Color Selection */}
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.75rem' }}>Card Color</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {colorOptions.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color: color.value })}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '10px',
                                            background: color.gradient,
                                            border: formData.color === color.value ? '3px solid white' : '2px solid transparent',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {formData.color === color.value && <HiCheckCircle size={18} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Icon Selection */}
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.75rem' }}>Card Icon</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {iconOptions.map((icon) => (
                                    <button
                                        key={icon}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, icon })}
                                        style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '10px',
                                            fontSize: '1.25rem',
                                            background: formData.icon === icon ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.05)',
                                            border: formData.icon === icon ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', padding: '1rem' }}>
                            <HiCheckCircle size={20} />
                            {isEditing ? 'Update Wallet' : 'Create Wallet'}
                        </button>

                        {/* Danger Zone - GitHub Style */}
                        {isEditing && (
                            <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <h3 style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Danger Zone</h3>
                                <div style={{ 
                                    border: '1px solid rgba(239, 68, 68, 0.2)', 
                                    borderRadius: '12px', 
                                    padding: '1rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: 'rgba(239, 68, 68, 0.05)'
                                }}>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Delete this wallet</p>
                                        <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Once deleted, it will be moved to trash.</p>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowDeleteModal(true)}
                                        style={{ 
                                            padding: '0.5rem 1rem', 
                                            background: 'rgba(239, 68, 68, 0.1)', 
                                            color: '#ef4444', 
                                            border: '1px solid rgba(239, 68, 68, 0.2)', 
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                    >
                                        Delete Wallet
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default Accounts;
