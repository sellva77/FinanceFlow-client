import { useState, useEffect } from 'react';
import { transactionService, accountService } from '../services';
import { Modal } from '../components';
import { useCurrency } from '../context/CurrencyContext';
import { HiArrowsRightLeft, HiArrowRight, HiClock, HiBanknotes, HiCheckCircle } from 'react-icons/hi2';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Transfers = () => {
    const { formatCurrency: formatGlobalCurrency, currency: globalCurrency } = useCurrency();
    const [accounts, setAccounts] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    const [formData, setFormData] = useState({
        fromAccount: '',
        toAccount: '',
        amount: '',
        conversionRate: '',
        note: '',
        transactionDate: format(new Date(), 'yyyy-MM-dd')
    });

    // Helper to format currency for specific account
    const formatAccountCurrency = (amount, account) => {
        const currencyData = account?.currency;
        if (!currencyData) return formatGlobalCurrency(amount);
        
        try {
            return new Intl.NumberFormat(currencyData.locale || 'en-US', {
                style: 'currency',
                currency: currencyData.code || 'USD',
                maximumFractionDigits: 2
            }).format(amount || 0);
        } catch (error) {
            return `${currencyData.symbol || '$'}${Number(amount).toLocaleString()}`;
        }
    };

    // Get currency symbol for a specific account
    const getAccountCurrencySymbol = (account) => {
        return account?.currency?.symbol || globalCurrency.symbol;
    };

    // Get currency code for a specific account
    const getAccountCurrencyCode = (account) => {
        return account?.currency?.code || globalCurrency.code;
    };

    // Check if two accounts have different currencies
    const hasDifferentCurrencies = () => {
        const fromAcc = getAccountById(formData.fromAccount);
        const toAcc = getAccountById(formData.toAccount);
        if (!fromAcc || !toAcc) return false;
        
        const fromCurrency = fromAcc.currency?.code || globalCurrency.code;
        const toCurrency = toAcc.currency?.code || globalCurrency.code;
        return fromCurrency !== toCurrency;
    };

    // Calculate converted amount
    const getConvertedAmount = () => {
        if (!formData.amount || !formData.conversionRate) return 0;
        return parseFloat(formData.amount) * parseFloat(formData.conversionRate);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [accRes, txRes] = await Promise.all([
                accountService.getAll(),
                transactionService.getAll({ type: 'transfer' })
            ]);
            setAccounts(accRes.data.data);
            setTransfers(txRes.data.data);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.fromAccount || !formData.toAccount) {
            return toast.error('Please select both accounts');
        }
        if (formData.fromAccount === formData.toAccount) {
            return toast.error('Cannot transfer to the same account');
        }
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            return toast.error('Please enter a valid amount');
        }

        // Check if currency conversion rate is needed
        if (hasDifferentCurrencies() && (!formData.conversionRate || parseFloat(formData.conversionRate) <= 0)) {
            return toast.error('Please enter a valid conversion rate');
        }

        // Check balance
        const sourceAccount = accounts.find(a => a._id === formData.fromAccount);
        if (sourceAccount && sourceAccount.balance < parseFloat(formData.amount)) {
            return toast.error(`Insufficient balance in ${sourceAccount.accountName}`);
        }

        setProcessing(true);
        try {
            const toAccount = accounts.find(a => a._id === formData.toAccount);
            const isDifferentCurrency = hasDifferentCurrencies();
            
            const transferData = {
                type: 'transfer',
                fromAccount: formData.fromAccount,
                toAccount: formData.toAccount,
                amount: parseFloat(formData.amount),
                category: 'Internal Transfer',
                paymentMode: 'bank_transfer',
                note: formData.note || `Transfer from ${sourceAccount?.accountName}`,
                transactionDate: formData.transactionDate,
                // Include conversion info if different currencies
                ...(isDifferentCurrency && {
                    conversionRate: parseFloat(formData.conversionRate),
                    convertedAmount: getConvertedAmount(),
                    fromCurrency: getAccountCurrencyCode(sourceAccount),
                    toCurrency: getAccountCurrencyCode(toAccount)
                })
            };

            await transactionService.create(transferData);
            toast.success('Transfer completed successfully!');
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Transfer failed');
        } finally {
            setProcessing(false);
        }
    };

    const resetForm = () => {
        setFormData({
            fromAccount: '',
            toAccount: '',
            amount: '',
            conversionRate: '',
            note: '',
            transactionDate: format(new Date(), 'yyyy-MM-dd')
        });
    };

    const getAccountById = (id) => {
        return accounts.find(a => a._id === id);
    };

    const getAccountGradient = (type) => {
        const gradients = {
            salary: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            expense: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            savings: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            investment: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        };
        return gradients[type] || gradients.savings;
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '100vh', width: '100%' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid rgba(99, 102, 241, 0.3)', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="page-header">
                <div className="page-header-content">
                    <div className="page-header-info">
                        <h1 className="page-title">Account Transfers</h1>
                        <p className="page-subtitle">Allocate funds between your accounts</p>
                    </div>
                    <button onClick={() => setShowModal(true)} className="btn-primary add-btn">
                        <HiArrowsRightLeft size={20} />
                        <span className="add-btn-text">New Transfer</span>
                    </button>
                </div>
            </div>

            {/* Quick Transfer Cards */}
            <div className="dashboard-section">
                <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>
                    <HiBanknotes size={20} />
                    <span>Your Accounts</span>
                </h2>
                <div className="account-cards-grid">
                    {accounts.map((account) => (
                        <div 
                            key={account._id} 
                            className="account-card" 
                            style={{ background: getAccountGradient(account.accountType) }}
                            onClick={() => {
                                setFormData(prev => ({ ...prev, fromAccount: account._id }));
                                setShowModal(true);
                            }}
                        >
                            <p className="account-card-type">{account.accountType}</p>
                            <h3 className="account-card-balance">
                                {formatAccountCurrency(account.balance, account)}
                            </h3>
                            <p className="account-card-name">{account.accountName}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Transfers */}
            <div className="dashboard-section">
                <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>
                    <HiClock size={20} />
                    <span>Recent Transfers</span>
                </h2>
                
                {transfers.length === 0 ? (
                    <div className="glass empty-state">
                        <HiArrowsRightLeft size={48} style={{ color: '#6366f1', margin: '0 auto 1rem' }} />
                        <p>No transfers yet. Start by allocating funds between accounts.</p>
                    </div>
                ) : (
                    <div className="transfer-list">
                        {transfers.slice(0, 10).map((transfer) => {
                            const fromAcc = transfer.fromAccount;
                            const toAcc = transfer.toAccount;
                            return (
                                <div 
                                    key={transfer._id} 
                                    className="glass transfer-card"
                                >
                                    <div className="transfer-card-main">
                                        <div className="transfer-card-icon">
                                            <HiArrowsRightLeft size={24} color="white" />
                                        </div>
                                        <div className="transfer-card-details">
                                            <div className="transfer-card-accounts">
                                                <span className="transfer-from">
                                                    {fromAcc?.accountName || 'Unknown'}
                                                </span>
                                                <HiArrowRight size={16} className="transfer-arrow" />
                                                <span className="transfer-to">
                                                    {toAcc?.accountName || 'Unknown'}
                                                </span>
                                            </div>
                                            <p className="transfer-card-note">
                                                {transfer.note || 'Internal Transfer'} • {format(new Date(transfer.transactionDate), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="transfer-card-amount-section">
                                        <p className="transfer-card-amount">
                                            {formatGlobalCurrency(transfer.amount)}
                                        </p>
                                        <div className="transfer-card-status">
                                            <HiCheckCircle size={14} style={{ color: '#22c55e' }} />
                                            <span>Completed</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Transfer Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Transfer Funds">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Visual Transfer Indicator */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: '1rem',
                        padding: '1.5rem',
                        background: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '16px',
                        border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}>
                        <div style={{ 
                            flex: 1, 
                            padding: '1rem', 
                            background: 'rgba(248, 113, 113, 0.1)', 
                            borderRadius: '12px',
                            textAlign: 'center',
                            border: '1px solid rgba(248, 113, 113, 0.2)'
                        }}>
                            <p style={{ fontSize: '0.75rem', color: '#f87171', marginBottom: '0.5rem' }}>FROM</p>
                            <p style={{ fontWeight: 600, color: 'white' }}>
                                {formData.fromAccount ? getAccountById(formData.fromAccount)?.accountName : 'Select Account'}
                            </p>
                            {formData.fromAccount && (
                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                    Balance: {formatAccountCurrency(getAccountById(formData.fromAccount)?.balance || 0, getAccountById(formData.fromAccount))}
                                </p>
                            )}
                        </div>
                        
                        <div style={{ 
                            width: '48px', 
                            height: '48px', 
                            borderRadius: '50%', 
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <HiArrowRight size={24} color="white" />
                        </div>
                        
                        <div style={{ 
                            flex: 1, 
                            padding: '1rem', 
                            background: 'rgba(74, 222, 128, 0.1)', 
                            borderRadius: '12px',
                            textAlign: 'center',
                            border: '1px solid rgba(74, 222, 128, 0.2)'
                        }}>
                            <p style={{ fontSize: '0.75rem', color: '#4ade80', marginBottom: '0.5rem' }}>TO</p>
                            <p style={{ fontWeight: 600, color: 'white' }}>
                                {formData.toAccount ? getAccountById(formData.toAccount)?.accountName : 'Select Account'}
                            </p>
                            {formData.toAccount && (
                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                    Balance: {formatAccountCurrency(getAccountById(formData.toAccount)?.balance || 0, getAccountById(formData.toAccount))}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Account Selection */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">From Account</label>
                            <select
                                value={formData.fromAccount}
                                onChange={(e) => setFormData({ ...formData, fromAccount: e.target.value })}
                                className="input-field"
                                required
                            >
                                <option value="">Select Source</option>
                                {accounts.map((acc) => (
                                    <option key={acc._id} value={acc._id} disabled={acc._id === formData.toAccount}>
                                        {acc.accountName} ({formatAccountCurrency(acc.balance, acc)})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">To Account</label>
                            <select
                                value={formData.toAccount}
                                onChange={(e) => setFormData({ ...formData, toAccount: e.target.value })}
                                className="input-field"
                                required
                            >
                                <option value="">Select Destination</option>
                                {accounts.filter(a => a._id !== formData.fromAccount).map((acc) => (
                                    <option key={acc._id} value={acc._id}>
                                        {acc.accountName} ({formatAccountCurrency(acc.balance, acc)})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Amount and Date */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Amount ({getAccountCurrencySymbol(getAccountById(formData.fromAccount))})</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="input-field"
                                placeholder="Enter amount"
                                min="1"
                                required
                                style={{ fontSize: '1.25rem', fontWeight: 'bold' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Date</label>
                            <input
                                type="date"
                                value={formData.transactionDate}
                                onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>
                    </div>

                    {/* Currency Conversion Rate - Only show when currencies differ */}
                    {hasDifferentCurrencies() && (
                        <div style={{
                            padding: '1.25rem',
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.05))',
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                            borderRadius: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: 'rgba(245, 158, 11, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <HiArrowsRightLeft size={16} style={{ color: '#f59e0b' }} />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 600, color: '#fbbf24', fontSize: '0.9rem' }}>Currency Conversion</p>
                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                        {getAccountCurrencyCode(getAccountById(formData.fromAccount))} → {getAccountCurrencyCode(getAccountById(formData.toAccount))}
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'end' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ color: '#fbbf24' }}>
                                        Conversion Rate
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ 
                                            position: 'absolute', 
                                            left: '12px', 
                                            top: '50%', 
                                            transform: 'translateY(-50%)', 
                                            fontSize: '0.85rem',
                                            color: '#94a3b8'
                                        }}>
                                            1 {getAccountCurrencyCode(getAccountById(formData.fromAccount))} =
                                        </span>
                                        <input
                                            type="number"
                                            value={formData.conversionRate}
                                            onChange={(e) => setFormData({ ...formData, conversionRate: e.target.value })}
                                            className="input-field"
                                            placeholder="0.00"
                                            step="0.001"
                                            min="0.001"
                                            required
                                            style={{ 
                                                paddingLeft: '85px',
                                                background: 'rgba(0,0,0,0.3)',
                                                borderColor: 'rgba(245, 158, 11, 0.3)'
                                            }}
                                        />
                                        <span style={{ 
                                            position: 'absolute', 
                                            right: '12px', 
                                            top: '50%', 
                                            transform: 'translateY(-50%)', 
                                            fontSize: '0.85rem',
                                            color: '#fbbf24',
                                            fontWeight: 600
                                        }}>
                                            {getAccountCurrencyCode(getAccountById(formData.toAccount))}
                                        </span>
                                    </div>
                                </div>

                                <div style={{
                                    padding: '1rem',
                                    background: 'rgba(0,0,0,0.2)',
                                    borderRadius: '12px',
                                    textAlign: 'center'
                                }}>
                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                                        Recipient Gets
                                    </p>
                                    <p style={{ 
                                        fontSize: '1.5rem', 
                                        fontWeight: 'bold', 
                                        color: '#4ade80'
                                    }}>
                                        {formData.amount && formData.conversionRate 
                                            ? formatAccountCurrency(getConvertedAmount(), getAccountById(formData.toAccount))
                                            : `${getAccountCurrencySymbol(getAccountById(formData.toAccount))} 0.00`
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* Conversion hint */}
                            <p style={{ 
                                fontSize: '0.75rem', 
                                color: '#64748b', 
                                marginTop: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                💡 Enter the current exchange rate. Example: 1 USD = 83.5 INR
                            </p>
                        </div>
                    )}

                    {/* Note */}
                    <div className="form-group">
                        <label className="form-label">Note (Optional)</label>
                        <input
                            type="text"
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            className="input-field"
                            placeholder="e.g., Monthly savings allocation"
                        />
                    </div>

                    {/* Quick Amount Buttons */}
                    {formData.fromAccount && (
                        <div>
                            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Quick amounts:</p>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {[1000, 5000, 10000, 25000, 50000].map((amt) => {
                                    const sourceBalance = getAccountById(formData.fromAccount)?.balance || 0;
                                    const isDisabled = amt > sourceBalance;
                                    return (
                                        <button
                                            key={amt}
                                            type="button"
                                            disabled={isDisabled}
                                            onClick={() => setFormData({ ...formData, amount: amt.toString() })}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '8px',
                                                background: formData.amount === amt.toString() 
                                                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' 
                                                    : 'rgba(255,255,255,0.05)',
                                                color: isDisabled ? '#64748b' : 'white',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                opacity: isDisabled ? 0.5 : 1,
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            {getAccountCurrencySymbol(getAccountById(formData.fromAccount))}{amt.toLocaleString()}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className="btn-primary" 
                        disabled={processing}
                        style={{ 
                            marginTop: '0.5rem',
                            opacity: processing ? 0.7 : 1,
                            cursor: processing ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {processing ? (
                            <>
                                <div style={{ 
                                    width: '20px', 
                                    height: '20px', 
                                    border: '2px solid rgba(255,255,255,0.3)', 
                                    borderTopColor: 'white',
                                    borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite'
                                }}></div>
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <HiArrowsRightLeft size={20} />
                                <span>Transfer Funds</span>
                            </>
                        )}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Transfers;
