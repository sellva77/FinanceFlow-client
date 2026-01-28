import { HiArrowTrendingUp, HiArrowTrendingDown, HiBanknotes, HiPresentationChartBar } from 'react-icons/hi2';

const AnalyticsOverview = ({ analytics, year, formatCurrency }) => {
    return (
        <div className="analytics-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {/* Total Income */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: '20px',
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '50%' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HiArrowTrendingUp size={24} style={{ color: '#22c55e' }} />
                    </div>
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Total Income</span>
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#4ade80', marginBottom: '0.25rem' }}>
                    {formatCurrency(analytics?.yearTotal?.income || 0)}
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{year} Annual</p>
            </div>

            {/* Total Expenses */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '20px',
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HiArrowTrendingDown size={24} style={{ color: '#ef4444' }} />
                    </div>
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Total Expenses</span>
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#f87171', marginBottom: '0.25rem' }}>
                    {formatCurrency(analytics?.yearTotal?.expense || 0)}
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{year} Annual</p>
            </div>

            {/* Net Savings */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '20px',
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HiBanknotes size={24} style={{ color: '#6366f1' }} />
                    </div>
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Net Savings</span>
                </div>
                <h2 style={{ 
                    fontSize: '1.75rem', 
                    fontWeight: 'bold', 
                    color: (analytics?.yearTotal?.savings || 0) >= 0 ? '#818cf8' : '#f87171',
                    marginBottom: '0.25rem' 
                }}>
                    {formatCurrency(analytics?.yearTotal?.savings || 0)}
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {analytics?.yearTotal?.income ? ((analytics.yearTotal.savings / analytics.yearTotal.income) * 100).toFixed(1) : 0}% savings rate
                </p>
            </div>

            {/* Investments */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: '20px',
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HiPresentationChartBar size={24} style={{ color: '#f59e0b' }} />
                    </div>
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Investments</span>
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#fbbf24', marginBottom: '0.25rem' }}>
                    {formatCurrency(analytics?.yearTotal?.investment || 0)}
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{year} Total</p>
            </div>
        </div>
    );
};

export default AnalyticsOverview;
