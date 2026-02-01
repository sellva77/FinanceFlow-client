import { useState, useEffect } from 'react';
import { budgetService, categoryService } from '../services';
import { Modal } from '../components';
import { useCurrency } from '../context/CurrencyContext';
import { HiPlus, HiTrash, HiExclamationTriangle } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const Budgets = () => {
    const { formatCurrency, currency } = useCurrency();
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const [formData, setFormData] = useState({
        category: '',
        monthlyLimit: '',
        alertThreshold: 80
    });

    useEffect(() => {
        fetchData();
    }, [selectedMonth]);

    const fetchData = async () => {
        try {
            const [year, month] = selectedMonth.split('-').map(Number);
            const [budgetRes, catRes] = await Promise.all([
                budgetService.getAll({ month, year }),
                categoryService.getAll({ type: 'expense' })
            ]);
            setBudgets(budgetRes.data.data);
            setCategories(catRes.data.data);
        } catch (error) {
            toast.error('Failed to load budgets');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const [year, month] = selectedMonth.split('-').map(Number);
            await budgetService.create({ ...formData, month, year });
            toast.success('Budget created successfully!');
            setShowModal(false);
            setFormData({ category: '', monthlyLimit: '', alertThreshold: 80 });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create budget');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this budget?')) return;
        try {
            await budgetService.delete(id);
            toast.success('Budget deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete budget');
        }
    };

    const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.currentSpent, 0);

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '100vh', width: '100%' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid rgba(99, 102, 241, 0.3)', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="page-header">
                <div className="page-header-content">
                    <div className="page-header-info">
                        <h1 className="page-title">Budgets</h1>
                        <p className="page-subtitle">Control your spending with monthly limits</p>
                    </div>
                    <div className="budget-controls">
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="input-field month-picker"
                        />
                        <button onClick={() => setShowModal(true)} className="btn-primary add-btn">
                            <HiPlus size={20} />
                            <span className="add-btn-text">Add Budget</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Card */}
            <div className="glass budget-summary-card">
                <div className="budget-summary-header">
                    <div className="budget-summary-main">
                        <p className="budget-summary-label">Monthly Budget Overview</p>
                        <div className="budget-summary-values">
                            <span className="gradient-text budget-total-spent">{formatCurrency(totalSpent)}</span>
                            <span className="budget-total-limit">/ {formatCurrency(totalBudget)}</span>
                        </div>
                    </div>
                    <div className="budget-stats-grid">
                        <div className="budget-stat-item">
                            <p className="budget-stat-value success">
                                {formatCurrency(totalBudget - totalSpent)}
                            </p>
                            <p className="budget-stat-label">Remaining</p>
                        </div>
                        <div className="budget-stat-item">
                            <p className="budget-stat-value primary">
                                {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%
                            </p>
                            <p className="budget-stat-label">Used</p>
                        </div>
                    </div>
                </div>
                <div className="progress-bar-container">
                    <div
                        className={`progress-fill ${totalSpent > totalBudget ? 'progress-danger' : 'progress-gradient'}`}
                        style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
                    ></div>
                </div>
            </div>

            {/* Budget Cards */}
            <div className="budget-cards-grid">
                {budgets.map((budget) => (
                    <div key={budget._id} className="glass budget-card">
                        <div className="budget-card-header">
                            <div>
                                <h3 className="budget-card-title">{budget.category}</h3>
                                <p className="budget-card-subtitle">
                                    {formatCurrency(budget.currentSpent)} / {formatCurrency(budget.monthlyLimit)}
                                </p>
                            </div>
                            <div className="budget-card-actions">
                                {(budget.isOverBudget || budget.isNearLimit) && (
                                    <HiExclamationTriangle size={20} color={budget.isOverBudget ? '#ef4444' : '#f59e0b'} />
                                )}
                                <button onClick={() => handleDelete(budget._id)} className="budget-delete-btn">
                                    <HiTrash size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="progress-bar">
                            <div
                                className={`progress-fill ${budget.isOverBudget ? 'progress-danger' : budget.isNearLimit ? 'progress-warning' : 'progress-success'}`}
                                style={{ width: `${Math.min(budget.spentPercent, 100)}%` }}
                            ></div>
                        </div>

                        <div className="budget-card-footer">
                            <span className={`budget-percent ${budget.isOverBudget ? 'danger' : budget.isNearLimit ? 'warning' : 'success'}`}>
                                {budget.spentPercent}% spent
                            </span>
                            <span className="budget-remaining">{formatCurrency(budget.remaining)} left</span>
                        </div>
                    </div>
                ))}
            </div>

            {budgets.length === 0 && (
                <div className="glass empty-state">
                    <p className="empty-state-text">No budgets set for this month</p>
                    <button onClick={() => setShowModal(true)} className="btn-primary">
                        Create Your First Budget
                    </button>
                </div>
            )}

            {/* Add Budget Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Budget">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="input-field"
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.filter(c => !budgets.find(b => b.category === c.name)).map((cat) => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Monthly Limit ({currency.symbol})</label>
                        <input
                            type="number"
                            value={formData.monthlyLimit}
                            onChange={(e) => setFormData({ ...formData, monthlyLimit: e.target.value })}
                            className="input-field"
                            placeholder="5000"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Alert at (%)</label>
                        <input
                            type="number"
                            value={formData.alertThreshold}
                            onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
                            className="input-field"
                            placeholder="80"
                            min="1"
                            max="100"
                        />
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>Get alerted when this % of budget is spent</p>
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Create Budget</button>
                </form>
            </Modal>
        </div>
    );
};

export default Budgets;
