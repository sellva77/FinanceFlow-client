import { HiCalendarDays } from 'react-icons/hi2';

const AnalyticsMonthlyView = ({ analytics, formatCurrency, year }) => {
    // Calculate percentage for progress bars
    const getPercentage = (value, total) => {
        if (!total || total === 0) return 0;
        return Math.min((value / total) * 100, 100);
    };

    return (
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HiCalendarDays style={{ color: '#6366f1' }} />
                Monthly Breakdown - {year}
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {analytics?.monthly?.map((month) => {
                    const maxValue = Math.max(...(analytics.monthly.map(m => Math.max(m.income, m.expense))));
                    return (
                        <div key={month.month} style={{ 
                            padding: '1rem 1.25rem',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '14px',
                            border: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ 
                                        width: '50px', 
                                        fontWeight: 600, 
                                        color: '#e2e8f0',
                                        fontSize: '0.95rem'
                                    }}>{month.month}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem' }}>
                                    <span style={{ color: '#4ade80' }}>+{formatCurrency(month.income)}</span>
                                    <span style={{ color: '#f87171' }}>-{formatCurrency(month.expense)}</span>
                                    <span style={{ 
                                        color: month.savings >= 0 ? '#818cf8' : '#f87171',
                                        fontWeight: 600 
                                    }}>
                                        {month.savings >= 0 ? '+' : ''}{formatCurrency(month.savings)}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {/* Income Bar */}
                                <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ 
                                        width: `${getPercentage(month.income, maxValue)}%`,
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #22c55e, #4ade80)',
                                        borderRadius: '4px',
                                        transition: 'width 0.5s ease'
                                    }}></div>
                                </div>
                                {/* Expense Bar */}
                                <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ 
                                        width: `${getPercentage(month.expense, maxValue)}%`,
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #ef4444, #f87171)',
                                        borderRadius: '4px',
                                        transition: 'width 0.5s ease'
                                    }}></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(90deg, #22c55e, #4ade80)' }}></div>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Income</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(90deg, #ef4444, #f87171)' }}></div>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Expense</span>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsMonthlyView;
