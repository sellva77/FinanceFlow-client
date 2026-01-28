import { 
    HiLightBulb, HiCalendarDays, HiChartPie, 
    HiPresentationChartBar, HiTableCells 
} from 'react-icons/hi2';

const AnalyticsTabs = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'insights', label: 'Smart Insights', shortLabel: 'Insights', icon: HiLightBulb },
        { id: 'overview', label: 'Monthly Overview', shortLabel: 'Monthly', icon: HiCalendarDays },
        { id: 'categories', label: 'Category Analysis', shortLabel: 'Categories', icon: HiChartPie },
        { id: 'yearly', label: 'Year-over-Year', shortLabel: 'Yearly', icon: HiPresentationChartBar },
        { id: 'transactions', label: 'Transactions', shortLabel: 'Transactions', icon: HiTableCells }
    ];

    return (
        <div className="glass analytics-tabs" style={{ 
            padding: '0.5rem', 
            borderRadius: '16px', 
            marginBottom: '1.5rem', 
            display: 'flex', 
            gap: '0.5rem', 
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
        }}>
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                        flex: '0 0 auto',
                        minWidth: 'fit-content',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        background: activeTab === tab.id 
                            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0.15) 100%)' 
                            : 'transparent',
                        border: `1px solid ${activeTab === tab.id ? 'rgba(99, 102, 241, 0.5)' : 'transparent'}`,
                        color: activeTab === tab.id ? '#a5b4fc' : '#94a3b8',
                        fontWeight: activeTab === tab.id ? 600 : 500,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <tab.icon size={18} />
                    <span>{tab.label}</span>
                </button>
            ))}
        </div>
    );
};

export default AnalyticsTabs;
