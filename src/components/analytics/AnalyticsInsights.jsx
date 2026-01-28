import { 
    HiExclamationTriangle, HiLightBulb, HiShieldCheck, 
    HiFire, HiTrophy, HiHandThumbUp, HiBolt,
    HiPresentationChartBar, HiArrowTrendingUp, HiArrowTrendingDown
} from 'react-icons/hi2';

const AnalyticsInsights = ({ insights, analytics, year, formatCurrency }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Quick Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', textAlign: 'center' }}>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Avg Monthly Income</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4ade80' }}>
                        {formatCurrency(insights.stats.avgMonthlyIncome || 0)}
                    </p>
                </div>
                <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', textAlign: 'center' }}>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Avg Monthly Expense</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f87171' }}>
                        {formatCurrency(insights.stats.avgMonthlyExpense || 0)}
                    </p>
                </div>
                <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', textAlign: 'center' }}>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Savings Rate</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: (insights.stats.savingsRate || 0) >= 20 ? '#4ade80' : (insights.stats.savingsRate || 0) >= 10 ? '#fbbf24' : '#f87171' }}>
                        {(insights.stats.savingsRate || 0).toFixed(1)}%
                    </p>
                </div>
                {insights.stats.bestMonth && (
                    <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', textAlign: 'center' }}>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Best Month</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#818cf8' }}>
                            {insights.stats.bestMonth.month}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: '#4ade80' }}>
                            +{formatCurrency(insights.stats.bestMonth.savings)}
                        </p>
                    </div>
                )}
            </div>

            {/* Warnings Section */}
            {insights.warnings.length > 0 && (
                <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f87171' }}>
                        <HiExclamationTriangle size={24} />
                        Areas Needing Attention
                        <span style={{ 
                            background: 'rgba(239, 68, 68, 0.2)', 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '20px', 
                            fontSize: '0.85rem' 
                        }}>
                            {insights.warnings.length}
                        </span>
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {insights.warnings.map((warning, idx) => (
                            <div key={idx} style={{
                                padding: '1.25rem',
                                background: warning.type === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                borderRadius: '14px',
                                border: `1px solid ${warning.type === 'critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: warning.type === 'critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <warning.icon size={24} style={{ color: warning.type === 'critical' ? '#ef4444' : '#f59e0b' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem', color: warning.type === 'critical' ? '#f87171' : '#fbbf24' }}>
                                            {warning.title}
                                        </h4>
                                        <p style={{ color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                                            {warning.message}
                                        </p>
                                        {warning.action && (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.75rem 1rem',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                borderRadius: '10px',
                                                fontSize: '0.85rem'
                                            }}>
                                                <HiLightBulb style={{ color: '#fbbf24', flexShrink: 0 }} />
                                                <span style={{ color: '#94a3b8' }}><strong style={{ color: '#e2e8f0' }}>Action:</strong> {warning.action}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Celebrations Section */}
            {insights.celebrations.length > 0 && (
                <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#4ade80' }}>
                        <HiTrophy size={24} />
                        What You're Doing Well
                        <span style={{ 
                            background: 'rgba(34, 197, 94, 0.2)', 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '20px', 
                            fontSize: '0.85rem' 
                        }}>
                            {insights.celebrations.length}
                        </span>
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {insights.celebrations.map((celebration, idx) => (
                            <div key={idx} style={{
                                padding: '1.25rem',
                                background: 'rgba(34, 197, 94, 0.1)',
                                borderRadius: '14px',
                                border: '1px solid rgba(34, 197, 94, 0.2)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: 'rgba(34, 197, 94, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <celebration.icon size={24} style={{ color: '#22c55e' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem', color: '#4ade80' }}>
                                            {celebration.title}
                                        </h4>
                                        <p style={{ color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                                            {celebration.message}
                                        </p>
                                        {celebration.highlight && (
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '0.5rem 1rem',
                                                background: 'rgba(34, 197, 94, 0.2)',
                                                borderRadius: '8px',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                color: '#4ade80'
                                            }}>
                                                🎉 {celebration.highlight}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tips Section */}
            {insights.tips.length > 0 && (
                <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#818cf8' }}>
                        <HiLightBulb size={24} />
                        Tips & Suggestions
                        <span style={{ 
                            background: 'rgba(99, 102, 241, 0.2)', 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '20px', 
                            fontSize: '0.85rem' 
                        }}>
                            {insights.tips.length}
                        </span>
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {insights.tips.map((tip, idx) => (
                            <div key={idx} style={{
                                padding: '1.25rem',
                                background: 'rgba(99, 102, 241, 0.08)',
                                borderRadius: '14px',
                                border: '1px solid rgba(99, 102, 241, 0.15)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: 'rgba(99, 102, 241, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <tip.icon size={24} style={{ color: '#818cf8' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem', color: '#a5b4fc' }}>
                                            {tip.title}
                                        </h4>
                                        <p style={{ color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                                            {tip.message}
                                        </p>
                                        {tip.action && (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.75rem 1rem',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                borderRadius: '10px',
                                                fontSize: '0.85rem'
                                            }}>
                                                <HiBolt style={{ color: '#fbbf24', flexShrink: 0 }} />
                                                <span style={{ color: '#94a3b8' }}><strong style={{ color: '#e2e8f0' }}>Try this:</strong> {tip.action}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Financial Health Score */}
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <HiShieldCheck style={{ color: '#6366f1' }} />
                    Financial Health Summary
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    {/* Score Card */}
                    <div style={{
                        padding: '1.5rem',
                        background: insights.warnings.filter(w => w.type === 'critical').length > 0 
                            ? 'rgba(239, 68, 68, 0.1)' 
                            : insights.warnings.length > 0 
                                ? 'rgba(245, 158, 11, 0.1)'
                                : 'rgba(34, 197, 94, 0.1)',
                        borderRadius: '16px',
                        textAlign: 'center'
                    }}>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Overall Status</p>
                        <p style={{ 
                            fontSize: '2rem', 
                            fontWeight: 'bold',
                            color: insights.warnings.filter(w => w.type === 'critical').length > 0 
                                ? '#ef4444' 
                                : insights.warnings.length > 0 
                                    ? '#f59e0b'
                                    : '#22c55e'
                        }}>
                            {insights.warnings.filter(w => w.type === 'critical').length > 0 
                                ? '⚠️ Needs Work' 
                                : insights.warnings.length > 0 
                                    ? '🔔 Fair'
                                    : '✅ Healthy'}
                        </p>
                    </div>
                    
                    {/* Summary Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', textAlign: 'center' }}>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f87171' }}>{insights.warnings.length}</p>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Warnings</p>
                        </div>
                        <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', textAlign: 'center' }}>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4ade80' }}>{insights.celebrations.length}</p>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Wins</p>
                        </div>
                        <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', textAlign: 'center' }}>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#818cf8' }}>{insights.tips.length}</p>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tips</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Year-over-Year Comparison */}
            {analytics?.yearly && analytics.yearly.length >= 2 && (() => {
                const currentYearData = analytics.yearly.find(y => y.year === year);
                const prevYearData = analytics.yearly.find(y => y.year === year - 1);
                
                if (!currentYearData || !prevYearData) return null;
                
                const incomeChange = currentYearData.income - prevYearData.income;
                const incomeChangePercent = prevYearData.income ? ((incomeChange / prevYearData.income) * 100) : 0;
                
                const expenseChange = currentYearData.expense - prevYearData.expense;
                const expenseChangePercent = prevYearData.expense ? ((expenseChange / prevYearData.expense) * 100) : 0;
                
                const savingsChange = currentYearData.savings - prevYearData.savings;
                const savingsChangePercent = prevYearData.savings ? ((savingsChange / prevYearData.savings) * 100) : 0;
                
                return (
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <HiPresentationChartBar style={{ color: '#6366f1' }} />
                            Year-over-Year Comparison
                            <span style={{ 
                                fontSize: '0.9rem', 
                                fontWeight: 400, 
                                color: '#64748b',
                                marginLeft: 'auto'
                            }}>
                                {year} vs {year - 1}
                            </span>
                        </h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {/* Income Comparison */}
                            <div style={{
                                padding: '1.5rem',
                                background: 'rgba(34, 197, 94, 0.05)',
                                borderRadius: '16px',
                                border: '1px solid rgba(34, 197, 94, 0.1)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: 'rgba(34, 197, 94, 0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <HiArrowTrendingUp size={20} style={{ color: '#22c55e' }} />
                                    </div>
                                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>Total Income</span>
                                </div>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>{year}</p>
                                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4ade80' }}>
                                            {formatCurrency(currentYearData.income)}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>{year - 1}</p>
                                        <p style={{ fontSize: '1.1rem', color: '#94a3b8' }}>
                                            {formatCurrency(prevYearData.income)}
                                        </p>
                                    </div>
                                </div>
                                
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1rem',
                                    background: incomeChange >= 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                    borderRadius: '10px'
                                }}>
                                    {incomeChange >= 0 ? (
                                        <HiArrowTrendingUp style={{ color: '#22c55e' }} />
                                    ) : (
                                        <HiArrowTrendingDown style={{ color: '#ef4444' }} />
                                    )}
                                    <span style={{ 
                                        fontWeight: 600, 
                                        color: incomeChange >= 0 ? '#4ade80' : '#f87171'
                                    }}>
                                        {incomeChange >= 0 ? '+' : ''}{formatCurrency(incomeChange)}
                                    </span>
                                    <span style={{ 
                                        fontSize: '0.85rem',
                                        color: incomeChange >= 0 ? '#22c55e' : '#ef4444'
                                    }}>
                                        ({incomeChangePercent >= 0 ? '+' : ''}{incomeChangePercent.toFixed(1)}%)
                                    </span>
                                </div>
                            </div>

                            {/* Expense Comparison */}
                            <div style={{
                                padding: '1.5rem',
                                background: 'rgba(239, 68, 68, 0.05)',
                                borderRadius: '16px',
                                border: '1px solid rgba(239, 68, 68, 0.1)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: 'rgba(239, 68, 68, 0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <HiArrowTrendingDown size={20} style={{ color: '#ef4444' }} />
                                    </div>
                                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>Total Expenses</span>
                                </div>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>{year}</p>
                                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f87171' }}>
                                            {formatCurrency(currentYearData.expense)}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>{year - 1}</p>
                                        <p style={{ fontSize: '1.1rem', color: '#94a3b8' }}>
                                            {formatCurrency(prevYearData.expense)}
                                        </p>
                                    </div>
                                </div>
                                
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1rem',
                                    background: expenseChange <= 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                    borderRadius: '10px'
                                }}>
                                    {expenseChange <= 0 ? (
                                        <HiArrowTrendingDown style={{ color: '#22c55e' }} />
                                    ) : (
                                        <HiArrowTrendingUp style={{ color: '#ef4444' }} />
                                    )}
                                    <span style={{ 
                                        fontWeight: 600, 
                                        color: expenseChange <= 0 ? '#4ade80' : '#f87171'
                                    }}>
                                        {expenseChange >= 0 ? '+' : ''}{formatCurrency(expenseChange)}
                                    </span>
                                    <span style={{ 
                                        fontSize: '0.85rem',
                                        color: expenseChange <= 0 ? '#22c55e' : '#ef4444'
                                    }}>
                                        ({expenseChangePercent >= 0 ? '+' : ''}{expenseChangePercent.toFixed(1)}%)
                                    </span>
                                </div>
                            </div>

                            {/* Savings Comparison */}
                            <div style={{
                                padding: '1.5rem',
                                background: 'rgba(99, 102, 241, 0.05)',
                                borderRadius: '16px',
                                border: '1px solid rgba(99, 102, 241, 0.1)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: 'rgba(99, 102, 241, 0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <HiShieldCheck size={20} style={{ color: '#6366f1' }} />
                                    </div>
                                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>Net Savings</span>
                                </div>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>{year}</p>
                                        <p style={{ 
                                            fontSize: '1.5rem', 
                                            fontWeight: 'bold', 
                                            color: currentYearData.savings >= 0 ? '#818cf8' : '#f87171' 
                                        }}>
                                            {formatCurrency(currentYearData.savings)}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>{year - 1}</p>
                                        <p style={{ fontSize: '1.1rem', color: '#94a3b8' }}>
                                            {formatCurrency(prevYearData.savings)}
                                        </p>
                                    </div>
                                </div>
                                
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1rem',
                                    background: savingsChange >= 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                    borderRadius: '10px'
                                }}>
                                    {savingsChange >= 0 ? (
                                        <HiArrowTrendingUp style={{ color: '#22c55e' }} />
                                    ) : (
                                        <HiArrowTrendingDown style={{ color: '#ef4444' }} />
                                    )}
                                    <span style={{ 
                                        fontWeight: 600, 
                                        color: savingsChange >= 0 ? '#4ade80' : '#f87171'
                                    }}>
                                        {savingsChange >= 0 ? '+' : ''}{formatCurrency(savingsChange)}
                                    </span>
                                    {prevYearData.savings !== 0 && (
                                        <span style={{ 
                                            fontSize: '0.85rem',
                                            color: savingsChange >= 0 ? '#22c55e' : '#ef4444'
                                        }}>
                                            ({savingsChangePercent >= 0 ? '+' : ''}{savingsChangePercent.toFixed(1)}%)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Yearly Verdict */}
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1.25rem',
                            background: savingsChange >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '14px',
                            border: `1px solid ${savingsChange >= 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                            textAlign: 'center'
                        }}>
                            <p style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: 600,
                                color: savingsChange >= 0 ? '#4ade80' : '#f87171',
                                marginBottom: '0.5rem'
                            }}>
                                {savingsChange >= 0 
                                    ? `🎉 You're doing better than ${year - 1}!`
                                    : `⚠️ Your finances need attention compared to ${year - 1}`
                                }
                            </p>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                {savingsChange >= 0 
                                    ? `You've saved ${formatCurrency(savingsChange)} more this year. Keep it up!`
                                    : `You've saved ${formatCurrency(Math.abs(savingsChange))} less this year. Review your spending patterns.`
                                }
                            </p>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default AnalyticsInsights;
