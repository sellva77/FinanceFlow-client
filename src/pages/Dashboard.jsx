import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { accountService, transactionService, budgetService, goalService, investmentService } from '../services';
import {
    HiArrowTrendingUp, HiArrowTrendingDown, HiBanknotes, HiChartBar,
    HiExclamationTriangle, HiPlus, HiArrowRight, HiCreditCard, HiArrowsRightLeft,
    HiSparkles, HiCalendarDays, HiWallet, HiArrowPath, HiClock, HiCheckCircle
} from 'react-icons/hi2';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const { formatCurrency, formatCompactCurrency, convertAmount } = useCurrency();
    const [accounts, setAccounts] = useState([]);
    const [summary, setSummary] = useState({ income: { total: 0 }, expense: { total: 0 }, netSavings: 0 });
    const [categoryBreakdown, setCategoryBreakdown] = useState([]);
    const [budgetAlerts, setBudgetAlerts] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [goals, setGoals] = useState([]);
    const [investments, setInvestments] = useState({ totalInvested: 0, totalCurrent: 0, totalProfitLoss: 0 });
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const now = new Date();
            const month = now.getMonth() + 1;
            const year = now.getFullYear();

            const [accountsRes, summaryRes, breakdownRes, alertsRes, transactionsRes, goalsRes, investmentsRes] = await Promise.all([
                accountService.getAll(),
                transactionService.getSummary({ month, year }),
                transactionService.getCategoryBreakdown({ month, year, type: 'expense' }),
                budgetService.getAlerts(),
                transactionService.getAll({ limit: 5 }),
                goalService.getAll(),
                investmentService.getAll({ status: 'active' })
            ]);

            setAccounts(accountsRes.data.data);
            setSummary(summaryRes.data.data);
            setCategoryBreakdown(breakdownRes.data.data);
            setBudgetAlerts(alertsRes.data.data);
            setRecentTransactions(transactionsRes.data.data);
            setGoals(goalsRes.data.data || []);
            // Calculate investment totals with proper currency conversion
            const investmentList = investmentsRes.data.data || [];
            const investmentTotals = investmentList.reduce((acc, inv) => {
                const currencyCode = inv.accountId?.currency?.code;
                acc.totalInvested += convertAmount(inv.investedAmount || 0, currencyCode);
                acc.totalCurrent += convertAmount(inv.currentValue || 0, currencyCode);
                return acc;
            }, { totalInvested: 0, totalCurrent: 0 });
            
            investmentTotals.totalProfitLoss = investmentTotals.totalCurrent - investmentTotals.totalInvested;
            
            setInvestments(investmentTotals);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTotalBalance = () => {
        return accounts.reduce((sum, acc) => {
            const amount = acc.balance || 0;
            const accCurrency = acc.currency?.code;
            return sum + convertAmount(amount, accCurrency);
        }, 0);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '100vh', width: '100%' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '4px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                    <p style={{ marginTop: '1rem', color: '#94a3b8' }}>Loading your finances...</p>
                </div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="dashboard-container dashboard-page">
            <style>{`
                .dashboard-page .dash-cards-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                .dashboard-page .dash-main-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }
                
                @media (max-width: 1024px) {
                    .dashboard-page .dash-cards-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .dashboard-page .dash-main-grid {
                        grid-template-columns: 1fr;
                    }
                }
                


                .dashboard-page .expense-chart-container {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                }

                @media (max-width: 640px) {
                    .dashboard-page .dash-cards-grid {
                        grid-template-columns: 1fr;
                    }
                    .dashboard-page .hero-section {
                        flex-direction: column;
                        align-items: stretch !important;
                    }
                    .dashboard-page .hero-net-worth {
                        width: 100%;
                        min-width: unset !important;
                    }
                    .dashboard-page .expense-chart-container {
                        flex-direction: column;
                        gap: 1.5rem;
                        align-items: stretch;
                        text-align: center;
                    }
                    .dashboard-page .expense-chart-wrapper {
                        margin: 0 auto;
                    }
                    .dashboard-page .dashboard-section {
                        padding: 1.25rem !important;
                    }
                }
            `}</style>
            {/* Hero Section */}
            <div className="hero-section" style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(236, 72, 153, 0.05) 100%)',
                borderRadius: '24px',
                padding: '2rem',
                marginBottom: '2rem',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative elements */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '200px',
                    height: '200px',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
                    borderRadius: '50%'
                }}></div>
                <div style={{
                    position: 'absolute',
                    bottom: '-30px',
                    left: '30%',
                    width: '150px',
                    height: '150px',
                    background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)',
                    borderRadius: '50%'
                }}></div>
                
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <HiSparkles style={{ color: '#fbbf24' }} />
                            <span style={{ color: '#fbbf24', fontSize: '0.875rem', fontWeight: 500 }}>{getGreeting()}</span>
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            Welcome, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>!
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8' }}>
                            <HiCalendarDays size={18} />
                            <span>{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
                        </div>
                    </div>
                    
                    {/* Total Net Worth */}
                    <div className="hero-net-worth" style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '1.5rem 2rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        minWidth: '280px'
                    }}>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Net Worth</p>
                        <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{formatCurrency(getTotalBalance())}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                background: summary.netSavings >= 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: summary.netSavings >= 0 ? '#4ade80' : '#f87171'
                            }}>
                                {summary.netSavings >= 0 ? <HiArrowTrendingUp size={14} /> : <HiArrowTrendingDown size={14} />}
                                {summary.netSavings >= 0 ? '+' : ''}{formatCompactCurrency(summary.netSavings)} this month
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <Link to="/transactions" className="btn-primary" style={{ flex: 1, minWidth: '150px', justifyContent: 'center' }}>
                    <HiPlus size={20} />
                    <span>Add Transaction</span>
                </Link>
                <Link to="/transfers" className="btn-secondary" style={{ flex: 1, minWidth: '150px', justifyContent: 'center' }}>
                    <HiArrowsRightLeft size={20} />
                    <span>Transfer</span>
                </Link>
                <Link to="/investments" className="btn-secondary" style={{ flex: 1, minWidth: '150px', justifyContent: 'center' }}>
                    <HiArrowTrendingUp size={20} />
                    <span>Invest</span>
                </Link>
            </div>

            {/* Financial Summary Cards */}
            <div className="dash-cards-grid">
                {/* Income Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiArrowTrendingUp size={20} />
                        </div>
                        <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>Income</span>
                    </div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{formatCurrency(summary.income?.total)}</h3>
                    <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.5rem' }}>This month</p>
                </div>

                {/* Expense Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiArrowTrendingDown size={20} />
                        </div>
                        <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>Expense</span>
                    </div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{formatCurrency(summary.expense?.total)}</h3>
                    <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.5rem' }}>This month</p>
                </div>

                {/* Savings Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiBanknotes size={20} />
                        </div>
                        <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>Savings</span>
                    </div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{formatCurrency(summary.netSavings)}</h3>
                    <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.5rem' }}>Net this month</p>
                </div>

                {/* Investments Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiChartBar size={20} />
                        </div>
                        <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>Investments</span>
                    </div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{formatCurrency(investments.totalCurrent)}</h3>
                    <p style={{ 
                        fontSize: '0.75rem', 
                        marginTop: '0.5rem',
                        color: investments.totalProfitLoss >= 0 ? '#bbf7d0' : '#fecaca'
                    }}>
                        {investments.totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(investments.totalProfitLoss)} P/L
                    </p>
                </div>
            </div>

            {/* Account Overview Section */}
            <div className="dashboard-section glass" style={{ marginBottom: '2rem' }}>
                <div className="section-header">
                    <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <HiWallet style={{ color: '#6366f1' }} />
                        Your Accounts
                    </h3>
                    <Link to="/accounts" style={{ fontSize: '0.875rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        View All <HiArrowRight size={14} />
                    </Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    {accounts.map((account, index) => {
                        const gradients = {
                            salary: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                            expense: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            savings: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                            investment: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                        };
                        const icons = { salary: '💼', expense: '💳', savings: '🏦', investment: '📈' };
                        return (
                            <div
                                key={account._id}
                                style={{
                                    background: gradients[account.accountType] || gradients.savings,
                                    borderRadius: '16px',
                                    padding: '1.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    transition: 'transform 0.2s'
                                }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem'
                                }}>
                                    {icons[account.accountType] || '💰'}
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>{account.accountName}</p>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{formatAccountCurrency(account.balance, account)}</h4>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="dash-main-grid">
                {/* Expense Breakdown */}
                <div className="dashboard-section glass">
                    <div className="section-header">
                        <h3 className="section-title">Expense Breakdown</h3>
                        <div style={{ padding: '6px 14px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '20px', fontSize: '0.8rem', color: '#818cf8', fontWeight: 500 }}>
                            {format(new Date(), 'MMMM yyyy')}
                        </div>
                    </div>

                    {categoryBreakdown.length > 0 ? (
                        <div className="expense-chart-container">
                            <div className="expense-chart-wrapper" style={{ width: '200px', height: '200px', flexShrink: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryBreakdown}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={80}
                                            paddingAngle={4}
                                            dataKey="total"
                                            nameKey="_id"
                                            stroke="none"
                                        >
                                            {categoryBreakdown.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {categoryBreakdown.slice(0, 5).map((item, index) => (
                                    <div key={item._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: COLORS[index % COLORS.length] }}></div>
                                            <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{item._id}</span>
                                        </div>
                                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{formatCurrency(item.total)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-center" style={{ height: '200px', flexDirection: 'column', gap: '1rem', color: '#64748b' }}>
                            <HiChartBar size={40} style={{ opacity: 0.4 }} />
                            <p>No expenses recorded this month</p>
                        </div>
                    )}
                </div>

                {/* Budget Alerts */}
                <div className="dashboard-section glass">
                    <div className="section-header">
                        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <HiExclamationTriangle style={{ color: '#f59e0b' }} />
                            Budget Status
                        </h3>
                    </div>
                    {budgetAlerts.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {budgetAlerts.slice(0, 3).map((alert, index) => (
                                <div key={index} style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    background: alert.isOverBudget ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                    border: `1px solid ${alert.isOverBudget ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{alert.category}</span>
                                        <span style={{
                                            fontSize: '0.8rem', fontWeight: 'bold',
                                            color: alert.isOverBudget ? '#f87171' : '#fbbf24'
                                        }}>
                                            {alert.spentPercent}%
                                        </span>
                                    </div>
                                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${Math.min(alert.spentPercent, 100)}%`,
                                            background: alert.isOverBudget ? '#ef4444' : '#f59e0b',
                                            borderRadius: '3px'
                                        }}></div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                                        <span>{formatCurrency(alert.spent)}</span>
                                        <span>{formatCurrency(alert.limit)}</span>
                                    </div>
                                </div>
                            ))}
                            <Link to="/budgets" style={{ color: '#818cf8', fontSize: '0.875rem', textAlign: 'center', display: 'block' }}>
                                View all budgets →
                            </Link>
                        </div>
                    ) : (
                        <div className="flex-center" style={{ height: '180px', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <HiCheckCircle size={30} style={{ color: '#10b981' }} />
                            </div>
                            <p style={{ fontWeight: 500 }}>All budgets on track! 🎉</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="dashboard-section glass">
                <div className="section-header">
                    <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <HiClock style={{ color: '#6366f1' }} />
                        Recent Transactions
                    </h3>
                    <Link to="/transactions" className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                        View All <HiArrowRight size={14} />
                    </Link>
                </div>
                {recentTransactions.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {recentTransactions.map((tx) => (
                            <div key={tx._id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                transition: 'background 0.2s'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '12px',
                                        background: tx.type === 'income' ? 'rgba(34, 197, 94, 0.15)' : tx.type === 'expense' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {tx.type === 'income' ? (
                                            <HiArrowTrendingUp size={20} style={{ color: '#22c55e' }} />
                                        ) : tx.type === 'expense' ? (
                                            <HiArrowTrendingDown size={20} style={{ color: '#ef4444' }} />
                                        ) : (
                                            <HiArrowsRightLeft size={20} style={{ color: '#6366f1' }} />
                                        )}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 600, marginBottom: '2px' }}>{tx.category}</p>
                                        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                            {format(new Date(tx.transactionDate), 'MMM d, yyyy')} • {tx.paymentMode}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{
                                        fontSize: '1.1rem',
                                        fontWeight: 'bold',
                                        color: tx.type === 'income' ? '#4ade80' : tx.type === 'expense' ? '#f87171' : '#818cf8'
                                    }}>
                                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                    </p>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        background: tx.type === 'income' ? 'rgba(34, 197, 94, 0.15)' : tx.type === 'expense' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                                        color: tx.type === 'income' ? '#4ade80' : tx.type === 'expense' ? '#f87171' : '#818cf8'
                                    }}>
                                        {tx.type}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-center" style={{ height: '160px', flexDirection: 'column', gap: '1rem', color: '#64748b' }}>
                        <p>No transactions yet</p>
                        <Link to="/transactions" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                            Add Your First Transaction
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
