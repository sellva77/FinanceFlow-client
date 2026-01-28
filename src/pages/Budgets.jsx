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
            <div className="dashboard-header">
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Budgets</h1>
                    <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Control your spending with monthly limits</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="input-field"
                        style={{ width: 'auto' }}
                    />
                    <button onClick={() => setShowModal(true)} className="btn-primary">
                        <HiPlus size={20} />
                        <span>Add Budget</span>
                    </button>
                </div>
            </div>

            {/* Summary Card */}
            <div className="dashboard-section glass">
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                    <div>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Monthly Budget Overview</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <span className="gradient-text" style={{ fontSize: '2rem', fontWeight: 700 }}>{formatCurrency(totalSpent)}</span>
                            <span style={{ color: '#94a3b8', fontSize: '1.25rem' }}>/ {formatCurrency(totalBudget)}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4ade80' }}>
                                {formatCurrency(totalBudget - totalSpent)}
                            </p>
                            <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Remaining</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#818cf8' }}>
                                {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%
                            </p>
                            <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Used</p>
                        </div>
                    </div>
                </div>
                <div className="progress-bar" style={{ height: '12px', marginTop: '1.5rem', background: 'rgba(255,255,255,0.05)' }}>
                    <div
                        className={`progress-fill ${totalSpent > totalBudget ? 'progress-danger' : 'progress-gradient'}`}
                        style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
                    ></div>
                </div>
            </div>

            {/* Budget Cards */}
            <div className="grid-3">
                {budgets.map((budget) => (
                    <div key={budget._id} className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.2s', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontWeight: 600, color: 'white', fontSize: '1.1rem' }}>{budget.category}</h3>
                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
                                    {formatCurrency(budget.currentSpent)} / {formatCurrency(budget.monthlyLimit)}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {(budget.isOverBudget || budget.isNearLimit) && (
                                    <HiExclamationTriangle size={20} color={budget.isOverBudget ? '#ef4444' : '#f59e0b'} />
                                )}
                                <button onClick={() => handleDelete(budget._id)} style={{ color: '#64748b' }} className="hover:text-red-400">
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

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span style={{
                                fontWeight: 500,
                                color: budget.isOverBudget ? '#ef4444' : budget.isNearLimit ? '#f59e0b' : '#4ade80'
                            }}>
                                {budget.spentPercent}% spent
                            </span>
                            <span style={{ color: '#94a3b8' }}>{formatCurrency(budget.remaining)} left</span>
                        </div>
                    </div>
                ))}
            </div>

            {budgets.length === 0 && (
                <div className="glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: '24px' }}>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '1.1rem' }}>No budgets set for this month</p>
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
