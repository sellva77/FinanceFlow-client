import { HiArrowTrendingUp, HiArrowTrendingDown } from 'react-icons/hi2';

const AnalyticsCategoryView = ({ analytics, formatCurrency }) => {
    
    // Calculate percentage
    const getPercentage = (value, total) => {
        if (!total || total === 0) return 0;
        return Math.min((value / total) * 100, 100);
    };

    // Get category color
    const getCategoryColor = (index) => {
        const colors = [
            '#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
            '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
        ];
        return colors[index % colors.length];
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Expense Categories */}
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HiArrowTrendingDown style={{ color: '#ef4444' }} />
                    Top Spending Categories
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {analytics?.topCategories?.map((cat, idx) => {
                        const maxTotal = analytics.topCategories[0]?.total || 1;
                        return (
                            <div key={cat._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ 
                                    width: '36px', 
                                    height: '36px', 
                                    borderRadius: '10px', 
                                    background: `${getCategoryColor(idx)}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: getCategoryColor(idx),
                                    fontWeight: 'bold',
                                    fontSize: '0.85rem'
                                }}>
                                    {idx + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span style={{ fontWeight: 500, color: '#e2e8f0' }}>{cat._id}</span>
                                        <span style={{ color: '#f87171', fontWeight: 600 }}>{formatCurrency(cat.total)}</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            width: `${getPercentage(cat.total, maxTotal)}%`,
                                            height: '100%',
                                            background: getCategoryColor(idx),
                                            borderRadius: '3px',
                                            transition: 'width 0.5s ease'
                                        }}></div>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{cat.count} transactions • Avg: {formatCurrency(cat.avgAmount)}</span>
                                </div>
                            </div>
                        );
                    })}
                    {(!analytics?.topCategories || analytics.topCategories.length === 0) && (
                        <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No expense data available</p>
                    )}
                </div>
            </div>

            {/* Income Categories */}
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HiArrowTrendingUp style={{ color: '#22c55e' }} />
                    Income Sources
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {analytics?.categories?.filter(c => c._id.type === 'income').map((cat, idx) => {
                        const incomeCategories = analytics.categories.filter(c => c._id.type === 'income');
                        const maxTotal = incomeCategories[0]?.total || 1;
                        return (
                            <div key={cat._id.category} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ 
                                    width: '36px', 
                                    height: '36px', 
                                    borderRadius: '10px', 
                                    background: 'rgba(34, 197, 94, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#22c55e',
                                    fontWeight: 'bold',
                                    fontSize: '0.85rem'
                                }}>
                                    {idx + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span style={{ fontWeight: 500, color: '#e2e8f0' }}>{cat._id.category}</span>
                                        <span style={{ color: '#4ade80', fontWeight: 600 }}>{formatCurrency(cat.total)}</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            width: `${getPercentage(cat.total, maxTotal)}%`,
                                            height: '100%',
                                            background: 'linear-gradient(90deg, #22c55e, #4ade80)',
                                            borderRadius: '3px',
                                            transition: 'width 0.5s ease'
                                        }}></div>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{cat.count} transactions</span>
                                </div>
                            </div>
                        );
                    })}
                    {(!analytics?.categories?.filter(c => c._id.type === 'income').length) && (
                        <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No income data available</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsCategoryView;
