import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    HiHome, HiCreditCard, HiArrowsRightLeft, HiChartBar,
    HiFlag, HiArrowTrendingUp, HiCurrencyRupee, HiCog6Tooth, HiArrowRightOnRectangle, HiBars3, HiXMark, HiBanknotes,
    HiChevronLeft, HiChevronRight, HiChartPie
} from 'react-icons/hi2';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const menuItems = [
        { path: '/', icon: HiHome, label: 'Dashboard' },
        { path: '/investments', icon: HiArrowTrendingUp, label: 'Investments' },
        { path: '/transactions', icon: HiArrowsRightLeft, label: 'Transactions' },
        { path: '/transfers', icon: HiBanknotes, label: 'Transfers' },
        { path: '/analytics', icon: HiChartPie, label: 'Analytics' },
        { path: '/budgets', icon: HiChartBar, label: 'Budgets' },
        { path: '/goals', icon: HiFlag, label: 'Goals' },
        { path: '/accounts', icon: HiCreditCard, label: 'Accounts' },
        { path: '/settings', icon: HiCog6Tooth, label: 'Settings' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const NavLink = ({ path, icon: Icon, label }) => {
        const isActive = location.pathname === path;
        return (
            <Link
                to={path}
                onClick={() => setIsOpen(false)}
                className={`nav-link ${isActive ? 'active' : ''}`}
            >
                <Icon size={20} title={isCollapsed ? label : ''} />
                {!isCollapsed && <span>{label}</span>}
            </Link>
        );
    };

    return (
        <>
            {/* Mobile Header */ }
            <div className="mobile-header">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="mobile-toggle"
                >
                    {isOpen ? <HiXMark size={24} /> : <HiBars3 size={24} />}
                </button>
                <div className="mobile-logo">
                    <HiCurrencyRupee size={24} className="mobile-logo-icon" />
                    <span className="mobile-brand-text">FinanceFlow</span>
                </div>
            </div>

            {isOpen && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }}
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>

                <div 
                    className={`logo-section ${isCollapsed ? 'collapsed' : ''}`} 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="logo-icon" >
                        <HiCurrencyRupee />
                    </div>
                    {!isCollapsed && (
                        <div>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }} className="gradient-text">FinanceFlow</h1>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Personal Finance</p>
                        </div>
                    )}
                </div>

                <nav className="nav-menu">
                    {menuItems.map((item) => (
                        <NavLink key={item.path} {...item} />
                    ))}
                </nav>

                <div className="user-profile">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    {!isCollapsed && (
                        <div className="user-info-text">
                            <p style={{ fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user?.email}</p>
                        </div>
                    )}
                </div>
                    <button onClick={handleLogout} className={`logout-btn ${isCollapsed ? 'collapsed' : ''}`}>
                        <HiArrowRightOnRectangle size={20} title={isCollapsed ? 'Logout' : ''} />
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
