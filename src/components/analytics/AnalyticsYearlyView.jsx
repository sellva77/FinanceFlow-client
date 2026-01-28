import { HiPresentationChartBar, HiChevronUp, HiChevronDown } from 'react-icons/hi2';

const AnalyticsYearlyView = ({ 
    analytics, 
    formatCurrency, 
    currentYear, 
    expandedYears, 
    toggleYearExpand 
}) => {
    return (
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HiPresentationChartBar style={{ color: '#6366f1' }} />
                Year-over-Year Comparison
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {analytics?.yearly?.map((year) => {
                    const isExpanded = expandedYears[year.year];
                    return (
                        <div 
                            key={year.year} 
                            style={{ 
                                background: year.year === currentYear ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.02)',
                                borderRadius: '16px',
                                border: year.year === currentYear ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <div 
                                onClick={() => toggleYearExpand(year.year)}
                                style={{ 
                                    padding: '1.25rem',
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ 
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        color: year.year === currentYear ? '#818cf8' : '#e2e8f0'
                                    }}>{year.year}</span>
                                    {year.year === currentYear && (
                                        <span style={{ 
                                            padding: '0.25rem 0.75rem', 
                                            background: 'rgba(99, 102, 241, 0.2)',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            color: '#818cf8'
                                        }}>Selected</span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ color: '#4ade80', fontWeight: 600 }}>+{formatCurrency(year.income)}</p>
                                        <p style={{ color: '#f87171', fontSize: '0.85rem' }}>-{formatCurrency(year.expense)}</p>
                                    </div>
                                    <div style={{ 
                                        padding: '0.5rem 1rem',
                                        borderRadius: '10px',
                                        background: year.savings >= 0 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                        color: year.savings >= 0 ? '#818cf8' : '#f87171',
                                        fontWeight: 'bold'
                                    }}>
                                        {year.savings >= 0 ? '+' : ''}{formatCurrency(year.savings)}
                                    </div>
                                    {isExpanded ? <HiChevronUp size={20} style={{ color: '#64748b' }} /> : <HiChevronDown size={20} style={{ color: '#64748b' }} />}
                                </div>
                            </div>
                            {isExpanded && (
                                <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                        <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px' }}>
                                            <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Total Income</p>
                                            <p style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '1.1rem' }}>{formatCurrency(year.income)}</p>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>
                                            <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Total Expenses</p>
                                            <p style={{ color: '#f87171', fontWeight: 'bold', fontSize: '1.1rem' }}>{formatCurrency(year.expense)}</p>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px' }}>
                                            <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Net Savings</p>
                                            <p style={{ color: '#818cf8', fontWeight: 'bold', fontSize: '1.1rem' }}>{formatCurrency(year.savings)}</p>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px' }}>
                                            <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Savings Rate</p>
                                            <p style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                {year.income ? ((year.savings / year.income) * 100).toFixed(1) : 0}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                {(!analytics?.yearly || analytics.yearly.length === 0) && (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No yearly data available</p>
                )}
            </div>
        </div>
    );
};

export default AnalyticsYearlyView;
