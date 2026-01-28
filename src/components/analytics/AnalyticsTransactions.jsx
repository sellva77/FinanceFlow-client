import { HiTableCells, HiArrowDownTray } from 'react-icons/hi2';
import { format } from 'date-fns';

const AnalyticsTransactions = ({ analytics, exportToCSV }) => {
    return (
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HiTableCells style={{ color: '#6366f1' }} />
                    Transaction Details ({analytics?.transactions?.length || 0})
                </h3>
                <button onClick={exportToCSV} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    <HiArrowDownTray size={14} />
                    Export
                </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 500, fontSize: '0.85rem' }}>Date</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 500, fontSize: '0.85rem' }}>Type</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 500, fontSize: '0.85rem' }}>Category</th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: '#94a3b8', fontWeight: 500, fontSize: '0.85rem' }}>Amount</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 500, fontSize: '0.85rem' }}>Account</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 500, fontSize: '0.85rem' }}>Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        {analytics?.transactions?.slice(0, 100).map((tx) => (
                            <tr key={tx._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem', color: '#e2e8f0', fontSize: '0.9rem' }}>
                                    {format(new Date(tx.transactionDate), 'MMM dd, yyyy')}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ 
                                        padding: '0.25rem 0.75rem', 
                                        borderRadius: '20px', 
                                        fontSize: '0.75rem',
                                        background: tx.type === 'income' ? 'rgba(34, 197, 94, 0.1)' : 
                                                    tx.type === 'expense' ? 'rgba(239, 68, 68, 0.1)' : 
                                                    tx.type === 'investment' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                        color: tx.type === 'income' ? '#4ade80' : 
                                                tx.type === 'expense' ? '#f87171' : 
                                                tx.type === 'investment' ? '#fbbf24' : '#818cf8'
                                    }}>
                                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', color: '#e2e8f0', fontSize: '0.9rem' }}>{tx.category}</td>
                                <td style={{ padding: '1rem', textAlign: 'right', color: tx.type === 'income' ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                                    {tx.type === 'expense' ? '-' : '+'}{tx.amount}
                                </td>
                                <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                                    {tx.fromAccount?.accountName || tx.toAccount?.accountName}
                                </td>
                                <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.9rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {tx.note || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!analytics?.transactions || analytics.transactions.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        No transactions found for this period
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsTransactions;
