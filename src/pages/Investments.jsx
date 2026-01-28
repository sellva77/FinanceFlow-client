import { useState, useEffect } from 'react';
import { investmentService, accountService } from '../services';
import { useCurrency } from '../context/CurrencyContext';
import {
    HiPlus, HiPencil, HiTrash, HiArrowTrendingUp, HiArrowTrendingDown,
    HiChartBar, HiBanknotes, HiCalendarDays, HiMagnifyingGlass,
    HiXMark, HiCheck, HiClock, HiChartPie, HiCurrencyDollar,
    HiArrowPath, HiExclamationTriangle, HiSparkles
} from 'react-icons/hi2';
import { format, differenceInDays } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444', '#84cc16'];

const Investments = () => {
    const { formatCurrency } = useCurrency();
    const [investments, setInvestments] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [editingInvestment, setEditingInvestment] = useState(null);
    const [selectedInvestment, setSelectedInvestment] = useState(null);
    const [activeTab, setActiveTab] = useState('portfolio');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');

    const [formData, setFormData] = useState({
        name: '', symbol: '', type: 'stocks', accountId: '',
        investedAmount: '', currentValue: '', units: '', buyPrice: '',
        purchaseDate: format(new Date(), 'yyyy-MM-dd'), maturityDate: '',
        interestRate: '', dividendEnabled: false, dividendFrequency: 'quarterly',
        notes: '', status: 'active'
    });

    const [txnFormData, setTxnFormData] = useState({
        type: 'dividend', date: format(new Date(), 'yyyy-MM-dd'),
        units: '', pricePerUnit: '', amount: '', notes: ''
    });

    const investmentTypes = [
        { value: 'stocks', label: 'Stocks', icon: '📈' },
        { value: 'mutual_funds', label: 'Mutual Funds', icon: '💹' },
        { value: 'sip', label: 'SIP', icon: '📊' },
        { value: 'etf', label: 'ETF', icon: '📉' },
        { value: 'bonds', label: 'Bonds', icon: '📜' },
        { value: 'fixed_deposit', label: 'Fixed Deposit', icon: '🏦' },
        { value: 'ppf', label: 'PPF', icon: '🏛️' },
        { value: 'nps', label: 'NPS', icon: '👴' },
        { value: 'gold', label: 'Gold', icon: '🥇' },
        { value: 'crypto', label: 'Crypto', icon: '₿' },
        { value: 'real_estate', label: 'Real Estate', icon: '🏠' },
        { value: 'other', label: 'Other', icon: '💰' }
    ];

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [investmentsRes, accountsRes, analyticsRes] = await Promise.all([
                investmentService.getAll(),
                accountService.getAll(),
                investmentService.getAnalytics()
            ]);
            setInvestments(investmentsRes.data.data || []);
            setAccounts(accountsRes.data.data?.filter(a => !a.isDeleted) || []);
            setAnalytics(analyticsRes.data.data || null);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                investedAmount: parseFloat(formData.investedAmount) || 0,
                currentValue: parseFloat(formData.currentValue) || parseFloat(formData.investedAmount) || 0,
                units: parseFloat(formData.units) || 0,
                buyPrice: parseFloat(formData.buyPrice) || 0,
                interestRate: parseFloat(formData.interestRate) || 0,
                maturityDate: formData.maturityDate || null
            };

            if (editingInvestment) {
                await investmentService.update(editingInvestment._id, payload);
                toast.success('Investment updated!');
            } else {
                await investmentService.create(payload);
                toast.success('Investment added!');
            }
            fetchData();
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving investment');
        }
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        if (!selectedInvestment) return;
        try {
            await investmentService.addTransaction(selectedInvestment._id, {
                ...txnFormData,
                units: parseFloat(txnFormData.units) || 0,
                pricePerUnit: parseFloat(txnFormData.pricePerUnit) || 0,
                amount: parseFloat(txnFormData.amount) || 0
            });
            toast.success(`${txnFormData.type.charAt(0).toUpperCase() + txnFormData.type.slice(1)} recorded!`);
            fetchData();
            setShowTransactionModal(false);
            setSelectedInvestment(null);
            setTxnFormData({ type: 'dividend', date: format(new Date(), 'yyyy-MM-dd'), units: '', pricePerUnit: '', amount: '', notes: '' });
        } catch (error) {
            toast.error('Error adding transaction');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this investment?')) return;
        try {
            await investmentService.delete(id);
            toast.success('Investment deleted');
            fetchData();
        } catch (error) {
            toast.error('Error deleting investment');
        }
    };

    const openEditModal = (inv) => {
        setEditingInvestment(inv);
        setFormData({
            name: inv.name || '', symbol: inv.symbol || '', type: inv.type || 'stocks',
            accountId: inv.accountId?._id || inv.accountId || '',
            investedAmount: inv.investedAmount || '', currentValue: inv.currentValue || '',
            units: inv.units || '', buyPrice: inv.buyPrice || '',
            purchaseDate: inv.purchaseDate ? format(new Date(inv.purchaseDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
            maturityDate: inv.maturityDate ? format(new Date(inv.maturityDate), 'yyyy-MM-dd') : '',
            interestRate: inv.interestRate || '', dividendEnabled: inv.dividendEnabled || false,
            dividendFrequency: inv.dividendFrequency || 'quarterly', notes: inv.notes || '', status: inv.status || 'active'
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingInvestment(null);
        setFormData({ name: '', symbol: '', type: 'stocks', accountId: '', investedAmount: '', currentValue: '', units: '', buyPrice: '', purchaseDate: format(new Date(), 'yyyy-MM-dd'), maturityDate: '', interestRate: '', dividendEnabled: false, dividendFrequency: 'quarterly', notes: '', status: 'active' });
    };

    const openTransactionModal = (inv) => {
        setSelectedInvestment(inv);
        setShowTransactionModal(true);
    };

    const filteredInvestments = investments.filter(inv => {
        const matchesSearch = inv.name?.toLowerCase().includes(searchTerm.toLowerCase()) || inv.symbol?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
        const matchesType = filterType === 'all' || inv.type === filterType;
        return matchesSearch && matchesStatus && matchesType;
    });

    const getTypeIcon = (type) => investmentTypes.find(t => t.value === type)?.icon || '💰';
    const getTypeLabel = (type) => investmentTypes.find(t => t.value === type)?.label || type;

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '100vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid rgba(99, 102, 241, 0.3)', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                    <p style={{ marginTop: '1rem', color: '#94a3b8' }}>Loading investments...</p>
                </div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <HiChartBar style={{ color: '#6366f1' }} /> Investment Portfolio
                    </h1>
                    <p style={{ color: '#94a3b8' }}>Track, analyze and grow your investments</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                    <HiPlus size={20} /> <span>Add Investment</span>
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                {[{ id: 'portfolio', label: 'Portfolio', icon: HiChartPie }, { id: 'analytics', label: 'Analytics', icon: HiChartBar }, { id: 'dividends', label: 'Dividends', icon: HiCurrencyDollar }].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                        padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: activeTab === tab.id ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'rgba(255,255,255,0.05)',
                        color: activeTab === tab.id ? 'white' : '#94a3b8', fontWeight: 600, transition: 'all 0.3s'
                    }}>
                        <tab.icon size={18} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Summary Cards */}
            {analytics && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <SummaryCard icon={HiBanknotes} label="Total Invested" value={formatCurrency(analytics.summary.totalInvested)} color="#6366f1" />
                    <SummaryCard icon={HiChartBar} label="Current Value" value={formatCurrency(analytics.summary.totalCurrentValue)} color="#22c55e" />
                    <SummaryCard icon={analytics.summary.totalProfitLoss >= 0 ? HiArrowTrendingUp : HiArrowTrendingDown} label="Total P/L" value={`${analytics.summary.totalProfitLoss >= 0 ? '+' : ''}${formatCurrency(analytics.summary.totalProfitLoss)}`} subValue={`${analytics.summary.overallReturnPercent >= 0 ? '+' : ''}${analytics.summary.overallReturnPercent.toFixed(2)}%`} color={analytics.summary.totalProfitLoss >= 0 ? '#22c55e' : '#ef4444'} />
                    <SummaryCard icon={HiCurrencyDollar} label="Dividends Received" value={formatCurrency(analytics.summary.totalDividends)} color="#f59e0b" />
                </div>
            )}

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && (
                <>
                    {/* Filters */}
                    <div className="glass" style={{ padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                            <HiMagnifyingGlass style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input type="text" placeholder="Search investments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field" style={{ paddingLeft: '40px' }} />
                        </div>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field" style={{ width: 'auto', minWidth: '130px' }}>
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="sold">Sold</option>
                            <option value="matured">Matured</option>
                        </select>
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field" style={{ width: 'auto', minWidth: '150px' }}>
                            <option value="all">All Types</option>
                            {investmentTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>

                    {/* Portfolio Allocation Chart */}
                    {analytics?.allocation?.length > 0 && (
                        <div className="glass" style={{ borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <HiChartPie style={{ color: '#6366f1' }} /> Portfolio Allocation
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', alignItems: 'center' }}>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie data={analytics.allocation} dataKey="currentValue" nameKey="type" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                                            {analytics.allocation.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                    {analytics.allocation.map((item, i) => (
                                        <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '150px' }}>
                                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: COLORS[i % COLORS.length] }}></div>
                                            <span style={{ fontSize: '0.85rem' }}>{getTypeLabel(item.type)}</span>
                                            <span style={{ fontSize: '0.85rem', color: '#94a3b8', marginLeft: 'auto' }}>{item.percentage.toFixed(1)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Investments List */}
                    <div className="glass" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                        {filteredInvestments.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {filteredInvestments.map((inv, index) => {
                                    const profitLoss = (inv.currentValue || 0) - (inv.investedAmount || 0) + (inv.totalDividendsReceived || 0);
                                    const profitLossPercent = inv.investedAmount > 0 ? (profitLoss / inv.investedAmount * 100) : 0;
                                    const daysHeld = differenceInDays(new Date(), new Date(inv.purchaseDate));
                                    const years = daysHeld / 365;
                                    const cagr = years >= 0.1 && inv.investedAmount > 0 ? (Math.pow((inv.currentValue + (inv.totalDividendsReceived || 0)) / inv.investedAmount, 1 / years) - 1) * 100 : 0;

                                    return (
                                        <div key={inv._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: index < filteredInvestments.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', gap: '1rem', flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '200px' }}>
                                                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{getTypeIcon(inv.type)}</div>
                                                <div>
                                                    <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>{inv.name} {inv.symbol && <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>({inv.symbol})</span>}</h4>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: '#64748b' }}>
                                                        <span style={{ padding: '2px 8px', background: inv.status === 'active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(148, 163, 184, 0.15)', color: inv.status === 'active' ? '#4ade80' : '#94a3b8', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>{inv.status}</span>
                                                        <span>{getTypeLabel(inv.type)}</span>
                                                        {inv.dividendEnabled && <span style={{ color: '#f59e0b' }}>💰 Dividend</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                                                <div style={{ textAlign: 'center', minWidth: '90px' }}>
                                                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' }}>Invested</p>
                                                    <p style={{ fontWeight: 600 }}>{formatCurrency(inv.investedAmount)}</p>
                                                </div>
                                                <div style={{ textAlign: 'center', minWidth: '90px' }}>
                                                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' }}>Current</p>
                                                    <p style={{ fontWeight: 600, color: '#818cf8' }}>{formatCurrency(inv.currentValue)}</p>
                                                </div>
                                                <div style={{ textAlign: 'center', minWidth: '100px' }}>
                                                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' }}>P/L</p>
                                                    <p style={{ fontWeight: 600, color: profitLoss >= 0 ? '#4ade80' : '#f87171' }}>
                                                        {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)}
                                                        <span style={{ fontSize: '0.75rem', marginLeft: '4px' }}>({profitLoss >= 0 ? '+' : ''}{profitLossPercent.toFixed(1)}%)</span>
                                                    </p>
                                                </div>
                                                <div style={{ textAlign: 'center', minWidth: '70px' }}>
                                                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' }}>CAGR</p>
                                                    <p style={{ fontWeight: 600, color: cagr >= 0 ? '#4ade80' : '#f87171' }}>{cagr >= 0 ? '+' : ''}{cagr.toFixed(1)}%</p>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => openTransactionModal(inv)} className="btn-secondary" style={{ padding: '0.5rem' }} title="Add Transaction"><HiPlus size={18} /></button>
                                                    <button onClick={() => openEditModal(inv)} className="btn-secondary" style={{ padding: '0.5rem' }}><HiPencil size={18} /></button>
                                                    <button onClick={() => handleDelete(inv._id)} className="btn-secondary" style={{ padding: '0.5rem', color: '#f87171' }}><HiTrash size={18} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex-center" style={{ height: '300px', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HiChartBar size={40} style={{ color: '#6366f1' }} /></div>
                                <h3 style={{ fontWeight: 600, fontSize: '1.25rem' }}>No investments found</h3>
                                <p style={{ color: '#64748b' }}>Start building your portfolio today!</p>
                                <button onClick={() => setShowModal(true)} className="btn-primary" style={{ marginTop: '0.5rem' }}><HiPlus size={20} /> <span>Add Your First Investment</span></button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && analytics && (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {/* Top Performers */}
                    <div className="glass" style={{ borderRadius: '20px', padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><HiArrowTrendingUp style={{ color: '#22c55e' }} /> Top Performers</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {analytics.topPerformers?.map((inv, i) => (
                                <div key={inv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.1)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#22c55e' }}>{i + 1}</span>
                                        <span style={{ fontWeight: 500 }}>{inv.name}</span>
                                    </div>
                                    <span style={{ color: '#4ade80', fontWeight: 600 }}>+{inv.profitLossPercent?.toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Upcoming Maturities */}
                    {analytics.upcomingMaturities?.length > 0 && (
                        <div className="glass" style={{ borderRadius: '20px', padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><HiClock style={{ color: '#f59e0b' }} /> Upcoming Maturities (90 days)</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {analytics.upcomingMaturities.map(inv => (
                                    <div key={inv._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                                        <span style={{ fontWeight: 500 }}>{inv.name}</span>
                                        <span style={{ color: '#fbbf24' }}>{format(new Date(inv.maturityDate), 'MMM dd, yyyy')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Dividends Tab */}
            {activeTab === 'dividends' && (
                <div className="glass" style={{ borderRadius: '20px', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><HiCurrencyDollar style={{ color: '#f59e0b' }} /> Dividend Earning Investments</h3>
                    {investments.filter(i => i.dividendEnabled || i.totalDividendsReceived > 0).length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {investments.filter(i => i.dividendEnabled || i.totalDividendsReceived > 0).map(inv => (
                                <div key={inv._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                                    <div>
                                        <span style={{ fontWeight: 500 }}>{inv.name}</span>
                                        <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>{inv.dividendFrequency}</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontWeight: 600, color: '#fbbf24' }}>{formatCurrency(inv.totalDividendsReceived || 0)}</p>
                                        {inv.lastDividendDate && <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Last: {format(new Date(inv.lastDividendDate), 'MMM dd')}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No dividend investments yet. Add transactions to track dividends.</p>
                    )}
                </div>
            )}

            {/* Add/Edit Investment Modal */}
            {showModal && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="glass" style={{ width: '100%', maxWidth: '550px', maxHeight: '90vh', overflow: 'auto', borderRadius: '24px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{editingInvestment ? 'Edit' : 'Add'} Investment</h2>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><HiXMark size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                <div><label style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" placeholder="e.g., Reliance Industries" required /></div>
                                <div><label style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Symbol</label><input type="text" value={formData.symbol} onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })} className="input-field" placeholder="RELIANCE" /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div><label style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Type *</label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="input-field" required>{investmentTypes.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}</select></div>
                                <div><label style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Account</label><select value={formData.accountId} onChange={(e) => setFormData({ ...formData, accountId: e.target.value })} className="input-field"><option value="">Select Account</option>{accounts.map(acc => <option key={acc._id} value={acc._id}>{acc.accountName}</option>)}</select></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div><label style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Invested Amount *</label><input type="number" step="0.01" value={formData.investedAmount} onChange={(e) => setFormData({ ...formData, investedAmount: e.target.value })} className="input-field" required /></div>
                                <div><label style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Current Value</label><input type="number" step="0.01" value={formData.currentValue} onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })} className="input-field" /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div><label style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Units</label><input type="number" step="0.0001" value={formData.units} onChange={(e) => setFormData({ ...formData, units: e.target.value })} className="input-field" /></div>
                                <div><label style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Buy Price/Unit</label><input type="number" step="0.01" value={formData.buyPrice} onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })} className="input-field" /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div><label style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Purchase Date</label><input type="date" value={formData.purchaseDate} onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })} className="input-field" /></div>
                                <div><label style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Maturity Date</label><input type="date" value={formData.maturityDate} onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })} className="input-field" /></div>
                            </div>
                            {['fixed_deposit', 'bonds', 'ppf'].includes(formData.type) && (
                                <div><label style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Interest Rate (%)</label><input type="number" step="0.01" value={formData.interestRate} onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })} className="input-field" /></div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={formData.dividendEnabled} onChange={(e) => setFormData({ ...formData, dividendEnabled: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                                    <span style={{ fontSize: '0.9rem' }}>Dividend Enabled</span>
                                </label>
                                {formData.dividendEnabled && (
                                    <select value={formData.dividendFrequency} onChange={(e) => setFormData({ ...formData, dividendFrequency: e.target.value })} className="input-field" style={{ width: 'auto' }}>
                                        <option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="semi-annually">Semi-Annually</option><option value="annually">Annually</option>
                                    </select>
                                )}
                            </div>
                            <div><label style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Notes</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="input-field" rows={2} style={{ resize: 'vertical' }} /></div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button type="button" onClick={closeModal} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}><HiCheck size={20} /> <span>{editingInvestment ? 'Update' : 'Add'}</span></button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Transaction Modal */}
            {showTransactionModal && selectedInvestment && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="glass" style={{ width: '100%', maxWidth: '450px', borderRadius: '24px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Add Transaction - {selectedInvestment.name}</h2>
                            <button onClick={() => { setShowTransactionModal(false); setSelectedInvestment(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><HiXMark size={24} /></button>
                        </div>
                        <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div><label style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Type *</label>
                                <select value={txnFormData.type} onChange={(e) => setTxnFormData({ ...txnFormData, type: e.target.value })} className="input-field">
                                    <option value="dividend">💰 Dividend</option><option value="buy">📈 Buy More</option><option value="sell">📉 Sell</option><option value="bonus">🎁 Bonus</option><option value="split">✂️ Split</option>
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div><label style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Date</label><input type="date" value={txnFormData.date} onChange={(e) => setTxnFormData({ ...txnFormData, date: e.target.value })} className="input-field" /></div>
                                <div><label style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Amount *</label><input type="number" step="0.01" value={txnFormData.amount} onChange={(e) => setTxnFormData({ ...txnFormData, amount: e.target.value })} className="input-field" required /></div>
                            </div>
                            {['buy', 'sell', 'bonus', 'split'].includes(txnFormData.type) && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div><label style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Units</label><input type="number" step="0.0001" value={txnFormData.units} onChange={(e) => setTxnFormData({ ...txnFormData, units: e.target.value })} className="input-field" /></div>
                                    <div><label style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Price/Unit</label><input type="number" step="0.01" value={txnFormData.pricePerUnit} onChange={(e) => setTxnFormData({ ...txnFormData, pricePerUnit: e.target.value })} className="input-field" /></div>
                                </div>
                            )}
                            <div><label style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Notes</label><input type="text" value={txnFormData.notes} onChange={(e) => setTxnFormData({ ...txnFormData, notes: e.target.value })} className="input-field" /></div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button type="button" onClick={() => { setShowTransactionModal(false); setSelectedInvestment(null); }} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}><HiCheck size={20} /> <span>Add</span></button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Summary Card Component
const SummaryCard = ({ icon: Icon, label, value, subValue, color }) => (
    <div style={{ background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`, border: `1px solid ${color}30`, borderRadius: '20px', padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: `${color}15`, borderRadius: '50%' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={20} style={{ color }} /></div>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{label}</span>
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color }}>{value}</h2>
        {subValue && <p style={{ fontSize: '0.85rem', color, marginTop: '0.25rem' }}>{subValue}</p>}
    </div>
);

export default Investments;
