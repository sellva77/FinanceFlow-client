import { useState, useEffect } from 'react';
import { transactionService, accountService, categoryService, tagService } from '../services';
import { Modal } from '../components';
import { useCurrency } from '../context/CurrencyContext';
import { 
    HiPlus, HiPencil, HiArrowTrendingUp, HiArrowTrendingDown, 
    HiArrowsRightLeft, HiFunnel, HiMagnifyingGlass, HiXMark,
    HiShoppingBag, HiHome, HiTruck, HiFilm, HiAcademicCap,
    HiHeart, HiBolt, HiDevicePhoneMobile, HiGift, HiBanknotes,
    HiClock, HiCalendarDays, HiCreditCard, HiCheckCircle, HiTag
} from 'react-icons/hi2';
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import toast from 'react-hot-toast';

// Category icons mapping
const categoryIcons = {
    'Food & Dining': HiShoppingBag,
    'Shopping': HiShoppingBag,
    'Transport': HiTruck,
    'Entertainment': HiFilm,
    'Education': HiAcademicCap,
    'Health': HiHeart,
    'Utilities': HiBolt,
    'Mobile': HiDevicePhoneMobile,
    'Gifts': HiGift,
    'Salary': HiBanknotes,
    'Investment': HiArrowTrendingUp,
    'Rent': HiHome,
    'default': HiCreditCard
};

const Transactions = () => {
    const { formatCurrency, currency } = useCurrency();
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [summary, setSummary] = useState({ income: 0, expense: 0, transfer: 0 });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTx, setSelectedTx] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({ type: '', category: '', month: '', year: '', tags: '' });
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [searchQuery, setSearchQuery] = useState('');
    
    const [showTagStats, setShowTagStats] = useState(false);
    const [tagStats, setTagStats] = useState([]);
    const [showTagInput, setShowTagInput] = useState(false);
    const [newTagName, setNewTagName] = useState('');

    // Helper to format currency for specific account
    const formatAccountCurrency = (amount, account) => {
        const currencyData = account?.currency;
        if (!currencyData) return formatCurrency(amount);
        
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

    const fetchTagStats = async () => {
        try {
            const res = await tagService.getAnalytics();
            setTagStats(res.data.data);
            setShowTagStats(true);
        } catch (error) {
            toast.error('Failed to load tag stats');
        }
    };

    const [formData, setFormData] = useState({
        type: 'expense',
        amount: '',
        category: '',
        fromAccount: '',
        toAccount: '',
        paymentMode: 'upi',
        note: '',
        transactionDate: format(new Date(), 'yyyy-MM-dd'),
        tags: []
    });

    const [editData, setEditData] = useState({
        amount: '',
        category: '',
        paymentMode: '',
        note: '',
        transactionDate: '',
        reason: '',
        tags: []
    });

    const paymentModes = [
        { value: 'upi', label: 'UPI', icon: '📱' },
        { value: 'cash', label: 'Cash', icon: '💵' },
        { value: 'card', label: 'Card', icon: '💳' },
        { value: 'bank_transfer', label: 'Bank', icon: '🏦' }
    ];

    useEffect(() => {
        fetchData();
    }, [filters, pagination.page]);

    const fetchData = async () => {
        try {
            // Load tags safely - don't crash if fails
            let tagsData = [];
            try {
                const tagRes = await tagService.getAll();
                tagsData = tagRes.data.data;
            } catch (error) {
                console.warn('Tags failed to load (server might need restart)', error);
            }

            const [txRes, accRes, catRes, summaryRes] = await Promise.all([
                transactionService.getAll({ ...filters, page: pagination.page }),
                accountService.getAll(),
                categoryService.getAll(),
                transactionService.getSummary({ month: new Date().getMonth() + 1, year: new Date().getFullYear() })
            ]);

            setTransactions(txRes.data.data);
            setPagination({ page: txRes.data.page, pages: txRes.data.pages, total: txRes.data.total });
            setAccounts(accRes.data.data);
            setCategories(catRes.data.data);
            setTags(tagsData);
            setSummary({
                income: summaryRes.data.data.income?.total || 0,
                expense: summaryRes.data.data.expense?.total || 0,
                transfer: summaryRes.data.data.transfer?.total || 0
            });
        } catch (error) {
            console.error(error);
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;
        try {
            const res = await tagService.create({ name: newTagName.trim() });
            setTags([...tags, res.data.data]);
            setNewTagName('');
            setShowTagInput(false);
            toast.success('Tag created');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create tag');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const cleanedData = { ...formData };
            if (!cleanedData.fromAccount || cleanedData.fromAccount === '') {
                delete cleanedData.fromAccount;
            }
            if (!cleanedData.toAccount || cleanedData.toAccount === '') {
                delete cleanedData.toAccount;
            }
            
            await transactionService.create(cleanedData);
            toast.success('Transaction added successfully!');
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add transaction');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editData.reason) {
            return toast.error('Please provide a reason for modification');
        }
        try {
            await transactionService.update(selectedTx._id, editData);
            toast.success('Transaction updated!');
            setShowEditModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update');
        }
    };

    const openEditModal = (tx) => {
        setSelectedTx(tx);
        setEditData({
            amount: tx.amount,
            category: tx.category,
            paymentMode: tx.paymentMode,
            note: tx.note || '',
            transactionDate: format(new Date(tx.transactionDate), 'yyyy-MM-dd'),
            reason: '',
            tags: tx.tags ? tx.tags.map(t => t._id) : []
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            type: 'expense',
            amount: '',
            category: '',
            fromAccount: '',
            toAccount: '',
            paymentMode: 'upi',
            note: '',
            transactionDate: format(new Date(), 'yyyy-MM-dd'),
            tags: []
        });
    };

    const getDateLabel = (dateStr) => {
        const date = new Date(dateStr);
        if (isToday(date)) return 'Today';
        if (isYesterday(date)) return 'Yesterday';
        if (isThisWeek(date)) return format(date, 'EEEE');
        if (isThisMonth(date)) return format(date, 'MMM d');
        return format(date, 'MMM d, yyyy');
    };

    const getCategoryIcon = (category) => {
        const Icon = categoryIcons[category] || categoryIcons.default;
        return Icon;
    };

    const filteredTransactions = transactions.filter(tx => {
        if (!searchQuery) return true;
        return tx.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
               tx.note?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // Group transactions by date
    const groupedTransactions = filteredTransactions.reduce((groups, tx) => {
        const dateKey = format(new Date(tx.transactionDate), 'yyyy-MM-dd');
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(tx);
        return groups;
    }, {});

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '100vh', width: '100%' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid rgba(99, 102, 241, 0.3)', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                    <p style={{ marginTop: '1rem', color: '#94a3b8' }}>Loading transactions...</p>
                </div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Transactions</h1>
                        <p style={{ color: '#94a3b8' }}>
                            <HiClock style={{ display: 'inline', marginRight: '6px' }} />
                            {pagination.total} transactions • {format(new Date(), 'MMMM yyyy')}
                        </p>
                    </div>
                    <button onClick={() => setShowModal(true)} className="btn-primary" style={{ padding: '0.875rem 1.5rem' }}>
                        <HiPlus size={20} />
                        <span>New Transaction</span>
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    borderRadius: '16px',
                    padding: '1.25rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiArrowTrendingUp size={18} style={{ color: '#22c55e' }} />
                        </div>
                        <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Income</span>
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4ade80' }}>{formatCurrency(summary.income)}</h3>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '16px',
                    padding: '1.25rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiArrowTrendingDown size={18} style={{ color: '#ef4444' }} />
                        </div>
                        <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Expenses</span>
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f87171' }}>{formatCurrency(summary.expense)}</h3>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: '16px',
                    padding: '1.25rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiArrowsRightLeft size={18} style={{ color: '#6366f1' }} />
                        </div>
                        <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Transfers</span>
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#818cf8' }}>{formatCurrency(summary.transfer)}</h3>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="glass" style={{ padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Search */}
                    <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                        <HiMagnifyingGlass size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field"
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>

                    {/* Quick Type Filters */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['', 'income', 'expense', 'transfer'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilters({ ...filters, type })}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    background: filters.type === type 
                                        ? (type === 'income' ? '#22c55e' : type === 'expense' ? '#ef4444' : type === 'transfer' ? '#6366f1' : 'white')
                                        : 'rgba(255,255,255,0.05)',
                                    color: filters.type === type ? (type === '' ? '#0f172a' : 'white') : '#94a3b8',
                                    border: '1px solid ' + (filters.type === type ? 'transparent' : 'rgba(255,255,255,0.1)'),
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {type === '' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* More Filters Toggle */}
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '10px',
                            background: showFilters ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
                            color: showFilters ? '#818cf8' : '#94a3b8',
                            border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        <HiFunnel size={16} />
                        Filters
                    </button>

                    {/* Tag Stats Button */}
                    <button 
                        onClick={fetchTagStats}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '10px',
                            background: showTagStats ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
                            color: showTagStats ? '#818cf8' : '#94a3b8',
                            border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        <HiTag size={16} />
                        Stats
                    </button>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '150px' }}>
                            <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Month</label>
                            <input
                                type="month"
                                value={filters.month && filters.year ? `${filters.year}-${String(filters.month).padStart(2, '0')}` : ''}
                                onChange={(e) => {
                                    const [year, month] = e.target.value.split('-');
                                    setFilters({ ...filters, year, month });
                                }}
                                className="input-field"
                            />
                        </div>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Tags</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {tags.map(tag => (
                                    <button
                                        key={tag._id}
                                        onClick={() => {
                                            const currentTags = filters.tags ? filters.tags.split(',') : [];
                                            const newTags = currentTags.includes(tag._id)
                                                ? currentTags.filter(t => t !== tag._id)
                                                : [...currentTags, tag._id];
                                            setFilters({ ...filters, tags: newTags.join(',') });
                                        }}
                                        style={{
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            background: filters.tags?.split(',').includes(tag._id) ? tag.color : 'rgba(255,255,255,0.05)',
                                            color: filters.tags?.split(',').includes(tag._id) ? 'white' : '#94a3b8',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button 
                            onClick={() => setFilters({ type: '', category: '', month: '', year: '', tags: '' })}
                            className="btn-secondary"
                            style={{ alignSelf: 'flex-end' }}
                        >
                            <HiXMark size={16} />
                            Clear All
                        </button>
                    </div>
                )}
            </div>

            {/* Transactions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {Object.keys(groupedTransactions).length > 0 ? (
                    Object.entries(groupedTransactions).map(([dateKey, txList]) => (
                        <div key={dateKey}>
                            {/* Date Header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div style={{ 
                                    padding: '6px 12px', 
                                    background: 'rgba(99, 102, 241, 0.1)', 
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <HiCalendarDays size={14} style={{ color: '#818cf8' }} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#818cf8' }}>
                                        {getDateLabel(dateKey)}
                                    </span>
                                </div>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
                            </div>

                            {/* Transactions for this date */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {txList.map((tx) => {
                                    const CategoryIcon = getCategoryIcon(tx.category);
                                    return (
                                        <div
                                            key={tx._id}
                                            className="glass"
                                            style={{
                                                padding: '1rem 1.25rem',
                                                borderRadius: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '1rem',
                                                cursor: 'pointer',
                                                transition: 'transform 0.2s, box-shadow 0.2s'
                                            }}
                                            onClick={() => openEditModal(tx)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                {/* Icon */}
                                                <div style={{
                                                    width: '48px',
                                                    height: '48px',
                                                    borderRadius: '14px',
                                                    background: tx.type === 'income' 
                                                        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))'
                                                        : tx.type === 'expense'
                                                        ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))'
                                                        : 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.1))',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <CategoryIcon 
                                                        size={22} 
                                                        style={{ 
                                                            color: tx.type === 'income' ? '#22c55e' : tx.type === 'expense' ? '#ef4444' : '#6366f1' 
                                                        }} 
                                                    />
                                                </div>

                                                {/* Details */}
                                                <div>
                                                    <h4 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '2px' }}>{tx.category}</h4>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                                                        <span>{tx.fromAccount?.accountName || tx.toAccount?.accountName || '-'}</span>
                                                        <span>•</span>
                                                        <span style={{ textTransform: 'capitalize' }}>{tx.paymentMode?.replace('_', ' ')}</span>
                                                        {tx.note && (
                                                            <>
                                                                <span>•</span>
                                                                <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.note}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    {/* Tags */}
                                                    {tx.tags && tx.tags.length > 0 && (
                                                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                                                            {tx.tags.map(tag => (
                                                                <span key={tag._id} style={{
                                                                    fontSize: '0.65rem',
                                                                    padding: '2px 6px',
                                                                    borderRadius: '8px',
                                                                    background: `${tag.color}20`,
                                                                    color: tag.color,
                                                                    border: `1px solid ${tag.color}40`,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '2px'
                                                                }}>
                                                                    {tag.icon && <span>{tag.icon}</span>}
                                                                    {tag.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Amount & Actions */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={{
                                                        fontSize: '1.1rem',
                                                        fontWeight: 'bold',
                                                        color: tx.type === 'income' ? '#4ade80' : tx.type === 'expense' ? '#f87171' : '#818cf8'
                                                    }}>
                                                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                                    </p>
                                                    {tx.wasEdited && (
                                                        <span style={{ fontSize: '0.7rem', color: '#fbbf24' }}>edited</span>
                                                    )}
                                                </div>
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '8px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#64748b'
                                                }}>
                                                    <HiPencil size={14} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: '20px' }}>
                        <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '50%', 
                            background: 'rgba(99, 102, 241, 0.1)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem'
                        }}>
                            <HiCreditCard size={36} style={{ color: '#6366f1' }} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No transactions found</h3>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Start tracking your finances by adding your first transaction</p>
                        <button onClick={() => setShowModal(true)} className="btn-primary">
                            <HiPlus size={18} />
                            Add Transaction
                        </button>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                    {Array.from({ length: pagination.pages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setPagination({ ...pagination, page: i + 1 })}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                fontWeight: 600,
                                background: pagination.page === i + 1 ? '#6366f1' : 'rgba(255,255,255,0.05)',
                                color: pagination.page === i + 1 ? 'white' : '#94a3b8',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* Add Transaction Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Transaction">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Transaction Type */}
                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.75rem' }}>Transaction Type</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                            {[
                                { type: 'income', label: 'Income', icon: HiArrowTrendingUp, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
                                { type: 'expense', label: 'Expense', icon: HiArrowTrendingDown, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
                                { type: 'transfer', label: 'Transfer', icon: HiArrowsRightLeft, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)' }
                            ].map(({ type, label, icon: Icon, color, bg }) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type, fromAccount: '', toAccount: '' })}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        background: formData.type === type ? bg : 'rgba(255,255,255,0.03)',
                                        border: `2px solid ${formData.type === type ? color : 'rgba(255,255,255,0.1)'}`,
                                        color: formData.type === type ? color : '#94a3b8',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Icon size={24} />
                                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Amount */}
                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Amount</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.5rem', color: '#64748b' }}>{currency.symbol}</span>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="input-field"
                                style={{ paddingLeft: '48px', fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'left' }}
                                placeholder="0"
                                required
                            />
                        </div>
                    </div>

                    {/* Category and Date */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="input-field"
                                required
                            >
                                <option value="">Select</option>
                                {categories.filter(c => formData.type === 'transfer' || c.type === formData.type).map((cat) => (
                                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Date</label>
                            <input
                                type="date"
                                value={formData.transactionDate}
                                onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>
                    </div>

                    {/* Payment Mode */}
                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.75rem' }}>Payment Method</label>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {paymentModes.map(({ value, label, icon }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, paymentMode: value })}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '4px',
                                        background: formData.paymentMode === value ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${formData.paymentMode === value ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                                        color: formData.paymentMode === value ? 'white' : '#94a3b8',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <span style={{ fontSize: '1.25rem' }}>{icon}</span>
                                    <span style={{ fontSize: '0.75rem' }}>{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Account Selection */}
                    {(formData.type === 'expense' || formData.type === 'transfer') && (
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>From Account</label>
                            <select
                                value={formData.fromAccount}
                                onChange={(e) => setFormData({ ...formData, fromAccount: e.target.value })}
                                className="input-field"
                                required
                            >
                                <option value="">Select Account</option>
                                {accounts.map((acc) => (
                                    <option key={acc._id} value={acc._id}>{acc.accountName} ({formatAccountCurrency(acc.balance, acc)})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {(formData.type === 'income' || formData.type === 'transfer') && (
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>To Account</label>
                            <select
                                value={formData.toAccount}
                                onChange={(e) => setFormData({ ...formData, toAccount: e.target.value })}
                                className="input-field"
                                required
                            >
                                <option value="">Select Account</option>
                                {accounts.filter(a => a._id !== formData.fromAccount).map((acc) => (
                                    <option key={acc._id} value={acc._id}>{acc.accountName} ({formatAccountCurrency(acc.balance, acc)})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Note */}
                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Note (Optional)</label>
                        <input
                            type="text"
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            className="input-field"
                            placeholder="Add a note..."
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span>Tags (Optional)</span>
                            <button type="button" onClick={() => setShowTagInput(!showTagInput)} style={{ fontSize: '0.75rem', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' }}>
                                + Create Tag
                            </button>
                        </label>
                        
                        {showTagInput && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <input
                                    type="text"
                                    value={newTagName}
                                    onChange={(e) => setNewTagName(e.target.value)}
                                    placeholder="Enter tag name"
                                    className="input-field"
                                    autoFocus
                                />
                                <button type="button" onClick={handleCreateTag} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Add</button>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', minHeight: '40px' }}>
                            {tags.map(tag => {
                                const isSelected = formData.tags?.includes(tag._id);
                                return (
                                    <button
                                        key={tag._id}
                                        type="button"
                                        onClick={() => {
                                            const currentTags = formData.tags || [];
                                            const newTags = isSelected
                                                ? currentTags.filter(t => t !== tag._id)
                                                : [...currentTags, tag._id];
                                            setFormData({ ...formData, tags: newTags });
                                        }}
                                        style={{
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            background: isSelected ? tag.color : 'rgba(255,255,255,0.05)',
                                            color: isSelected ? 'white' : '#94a3b8',
                                            border: '1px solid ' + (isSelected ? 'transparent' : 'rgba(255,255,255,0.1)'),
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {tag.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Submit */}
                    <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', padding: '1rem', fontSize: '1rem' }}>
                        <HiCheckCircle size={20} />
                        Add Transaction
                    </button>
                </form>
            </Modal>

            {/* Edit Transaction Modal */}
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Transaction">
                <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px' }}>
                        <p style={{ color: '#fbbf24', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <HiPencil size={16} />
                            Editing creates an audit log. Original data is preserved.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Amount ({currency.symbol})</label>
                            <input
                                type="number"
                                value={editData.amount}
                                onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Date</label>
                            <input
                                type="date"
                                value={editData.transactionDate}
                                onChange={(e) => setEditData({ ...editData, transactionDate: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Category</label>
                        <input
                            type="text"
                            value={editData.category}
                            onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                            className="input-field"
                            required
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Note</label>
                        <input
                            type="text"
                            value={editData.note}
                            onChange={(e) => setEditData({ ...editData, note: e.target.value })}
                            className="input-field"
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Tags</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', minHeight: '40px' }}>
                            {tags.map(tag => {
                                const isSelected = editData.tags?.includes(tag._id);
                                return (
                                    <button
                                        key={tag._id}
                                        type="button"
                                        onClick={() => {
                                            const currentTags = editData.tags || [];
                                            const newTags = isSelected
                                                ? currentTags.filter(t => t !== tag._id)
                                                : [...currentTags, tag._id];
                                            setEditData({ ...editData, tags: newTags });
                                        }}
                                        style={{
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            background: isSelected ? tag.color : 'rgba(255,255,255,0.05)',
                                            color: isSelected ? 'white' : '#94a3b8',
                                            border: '1px solid ' + (isSelected ? 'transparent' : 'rgba(255,255,255,0.1)'),
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {tag.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#ef4444', display: 'block', marginBottom: '0.5rem' }}>Reason for Edit *</label>
                        <input
                            type="text"
                            value={editData.reason}
                            onChange={(e) => setEditData({ ...editData, reason: e.target.value })}
                            className="input-field"
                            placeholder="Why are you editing this?"
                            style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Update Transaction</button>
                </form>
            </Modal>

            {/* Tag Stats Modal */}
            <Modal isOpen={showTagStats} onClose={() => setShowTagStats(false)} title="Tag Analytics">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {tagStats.length > 0 ? (
                        tagStats.map(stat => (
                            <div key={stat._id} className="glass" style={{
                                padding: '1rem',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: `${stat.color}20`,
                                        color: stat.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.25rem'
                                    }}>
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <h4 style={{ fontWeight: 600, fontSize: '1rem', color: 'white' }}>{stat.name}</h4>
                                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{stat.transactionCount} transactions</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontWeight: 'bold', fontSize: '1rem', color: 'white' }}>{formatCurrency(stat.totalAmount)}</p>
                                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.7rem' }}>
                                        {stat.incomeAmount > 0 && <span style={{ color: '#4ade80' }}>+{formatCurrency(stat.incomeAmount)}</span>}
                                        {stat.expenseAmount > 0 && <span style={{ color: '#f87171' }}>-{formatCurrency(stat.expenseAmount)}</span>}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No tag usage data found.</p>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default Transactions;
