import { useState, useEffect, useMemo } from 'react';
import { transactionService, accountService, categoryService } from '../services';
import { useCurrency } from '../context/CurrencyContext';
import { useAnalyticsInsights } from '../hooks/useAnalyticsInsights';
import { 
    HiChartPie, HiFunnel, HiArrowDownTray, HiDocumentText, 
    HiArrowPath, HiSparkles 
} from 'react-icons/hi2';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// Import sub-components
import AnalyticsFilters from '../components/analytics/AnalyticsFilters';
import AnalyticsOverview from '../components/analytics/AnalyticsOverview';
import AnalyticsTabs from '../components/analytics/AnalyticsTabs';
import AnalyticsInsights from '../components/analytics/AnalyticsInsights';
import AnalyticsMonthlyView from '../components/analytics/AnalyticsMonthlyView';
import AnalyticsCategoryView from '../components/analytics/AnalyticsCategoryView';
import AnalyticsYearlyView from '../components/analytics/AnalyticsYearlyView';
import AnalyticsTransactions from '../components/analytics/AnalyticsTransactions';

const Analytics = () => {
    const { formatCurrency } = useCurrency();
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [activeTab, setActiveTab] = useState('insights');
    const [expandedYears, setExpandedYears] = useState({});

    // Filters
    const [filters, setFilters] = useState({
        year: new Date().getFullYear(),
        month: '',
        category: '',
        accountId: '',
        type: ''
    });

    useEffect(() => {
        fetchData();
    }, [filters.year, filters.month, filters.category, filters.accountId, filters.type]);

    useEffect(() => {
        fetchMasterData();
    }, []);

    const fetchMasterData = async () => {
        try {
            const [accRes, catRes] = await Promise.all([
                accountService.getAll(),
                categoryService.getAll()
            ]);
            setAccounts(accRes.data.data);
            setCategories(catRes.data.data);
        } catch (error) {
            console.error('Error fetching master data:', error);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = { year: filters.year };
            if (filters.month) params.month = filters.month;
            if (filters.category) params.category = filters.category;
            if (filters.accountId) params.accountId = filters.accountId;
            if (filters.type) params.type = filters.type;

            const res = await transactionService.getAnalytics(params);
            setAnalytics(res.data.data);
        } catch (error) {
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    // Generate years for filter (last 10 years)
    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 10 }, (_, i) => currentYear - i);
    }, []);

    const months = [
        { value: '', label: 'All Months' },
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ];

    // Use custom hook for insights
    const insights = useAnalyticsInsights(analytics, formatCurrency, filters.year);

    // Export to CSV
    const exportToCSV = () => {
        if (!analytics?.transactions?.length) {
            return toast.error('No data to export');
        }

        const headers = ['Date', 'Type', 'Category', 'Amount', 'From Account', 'To Account', 'Note', 'Payment Mode'];
        const rows = analytics.transactions.map(tx => [
            format(new Date(tx.transactionDate), 'yyyy-MM-dd'),
            tx.type,
            tx.category,
            tx.amount,
            tx.fromAccount?.accountName || '',
            tx.toAccount?.accountName || '',
            tx.note || '',
            tx.paymentMode
        ]);

        const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `financial_report_${filters.year}${filters.month ? '_' + filters.month : ''}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Report exported successfully!');
    };

    // Export summary to PDF-like text
    const exportSummary = () => {
        if (!analytics) return toast.error('No data to export');

        const summary = `
FINANCIAL ANALYSIS REPORT
=========================
Generated: ${format(new Date(), 'PPP')}
Period: ${filters.year}${filters.month ? ' - ' + months.find(m => m.value === filters.month)?.label : ''}

YEARLY SUMMARY
--------------
Total Income: ${formatCurrency(analytics.yearTotal?.income || 0)}
Total Expenses: ${formatCurrency(analytics.yearTotal?.expense || 0)}
Net Savings: ${formatCurrency(analytics.yearTotal?.savings || 0)}
Investments: ${formatCurrency(analytics.yearTotal?.investment || 0)}
Savings Rate: ${analytics.yearTotal?.income ? ((analytics.yearTotal.savings / analytics.yearTotal.income) * 100).toFixed(1) : 0}%

MONTHLY BREAKDOWN
-----------------
${analytics.monthly?.map(m => `${m.month}: Income ${formatCurrency(m.income)} | Expense ${formatCurrency(m.expense)} | Savings ${formatCurrency(m.savings)}`).join('\n')}

TOP SPENDING CATEGORIES
-----------------------
${analytics.topCategories?.map((c, i) => `${i + 1}. ${c._id}: ${formatCurrency(c.total)} (${c.count} transactions)`).join('\n')}
        `;

        const blob = new Blob([summary], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `financial_summary_${filters.year}.txt`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Summary exported successfully!');
    };

    const resetFilters = () => {
        setFilters({
            year: new Date().getFullYear(),
            month: '',
            category: '',
            accountId: '',
            type: ''
        });
    };

    const toggleYearExpand = (year) => {
        setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '100vh', width: '100%' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid rgba(99, 102, 241, 0.3)', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                    <p style={{ marginTop: '1rem', color: '#94a3b8' }}>Loading analytics...</p>
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
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <HiChartPie style={{ color: '#6366f1' }} />
                            Financial Analytics
                        </h1>
                        <p style={{ color: '#94a3b8' }}>
                            <HiSparkles style={{ display: 'inline', marginRight: '6px' }} />
                            Comprehensive insights into your financial health • {filters.year}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary" style={{ padding: '0.75rem 1.25rem' }}>
                            <HiFunnel size={18} />
                            <span>Filters</span>
                        </button>
                        <button onClick={exportSummary} className="btn-secondary" style={{ padding: '0.75rem 1.25rem' }}>
                            <HiDocumentText size={18} />
                            <span>Summary</span>
                        </button>
                        <button onClick={exportToCSV} className="btn-primary" style={{ padding: '0.75rem 1.25rem' }}>
                            <HiArrowDownTray size={18} />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <AnalyticsFilters 
                showFilters={showFilters}
                filters={filters}
                setFilters={setFilters}
                resetFilters={resetFilters}
                years={years}
                months={months}
                categories={categories}
                accounts={accounts}
            />

            {/* Overview Summary Cards */}
            <AnalyticsOverview 
                analytics={analytics} 
                year={filters.year} 
                formatCurrency={formatCurrency} 
            />

            {/* Tab Navigation */}
            <AnalyticsTabs 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
            />

            {/* Tab Contents */}
            {activeTab === 'insights' && (
                <AnalyticsInsights 
                    insights={insights}
                    analytics={analytics}
                    year={filters.year}
                    formatCurrency={formatCurrency}
                />
            )}

            {activeTab === 'overview' && (
                <AnalyticsMonthlyView 
                    analytics={analytics}
                    formatCurrency={formatCurrency}
                    year={filters.year}
                />
            )}

            {activeTab === 'categories' && (
                <AnalyticsCategoryView 
                    analytics={analytics}
                    formatCurrency={formatCurrency}
                />
            )}

            {activeTab === 'yearly' && (
                <AnalyticsYearlyView 
                    analytics={analytics}
                    formatCurrency={formatCurrency}
                    currentYear={filters.year}
                    expandedYears={expandedYears}
                    toggleYearExpand={toggleYearExpand}
                />
            )}

            {activeTab === 'transactions' && (
                <AnalyticsTransactions 
                    analytics={analytics}
                    exportToCSV={exportToCSV}
                />
            )}
        </div>
    );
};

export default Analytics;
