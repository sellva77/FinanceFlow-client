import { HiAdjustmentsHorizontal, HiArrowPath } from 'react-icons/hi2';

const AnalyticsFilters = ({ 
    showFilters, 
    filters, 
    setFilters, 
    resetFilters, 
    years, 
    months, 
    categories, 
    accounts 
}) => {
    if (!showFilters) return null;

    return (
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <HiAdjustmentsHorizontal style={{ color: '#6366f1' }} />
                    Filter Options
                </h3>
                <button onClick={resetFilters} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    <HiArrowPath size={14} />
                    Reset
                </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                {/* Year Filter */}
                <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Year</label>
                    <select
                        value={filters.year}
                        onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
                        className="input-field"
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>

                {/* Month Filter */}
                <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Month</label>
                    <select
                        value={filters.month}
                        onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                        className="input-field"
                    >
                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                </div>

                {/* Category Filter */}
                <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Category</label>
                    <select
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        className="input-field"
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>

                {/* Account Filter */}
                <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Account</label>
                    <select
                        value={filters.accountId}
                        onChange={(e) => setFilters({ ...filters, accountId: e.target.value })}
                        className="input-field"
                    >
                        <option value="">All Accounts</option>
                        {accounts.map(a => <option key={a._id} value={a._id}>{a.accountName}</option>)}
                    </select>
                </div>

                {/* Type Filter */}
                <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Type</label>
                    <select
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        className="input-field"
                    >
                        <option value="">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                        <option value="transfer">Transfer</option>
                        <option value="investment">Investment</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsFilters;
