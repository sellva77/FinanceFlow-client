import { useState, useEffect } from 'react';
import { goalService } from '../services';
import { Modal } from '../components';
import { useCurrency } from '../context/CurrencyContext';
import { HiPlus, HiFlag, HiCheck, HiTrash, HiPlusCircle } from 'react-icons/hi2';
import { format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';

const Goals = () => {
    const { formatCurrency, currency } = useCurrency();
    const [goals, setGoals] = useState([]);
    const [summary, setSummary] = useState({ active: 0, completed: 0, totalTarget: 0, totalSaved: 0 });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [addAmount, setAddAmount] = useState('');
    const [filter, setFilter] = useState('active');

    const [formData, setFormData] = useState({
        goalName: '',
        description: '',
        targetAmount: '',
        deadline: '',
        priority: 'medium'
    });

    useEffect(() => {
        fetchData();
    }, [filter]);

    const fetchData = async () => {
        try {
            const [goalsRes, summaryRes] = await Promise.all([
                goalService.getAll({ status: filter }),
                goalService.getSummary()
            ]);
            setGoals(goalsRes.data.data);
            setSummary(summaryRes.data.data);
        } catch (error) {
            toast.error('Failed to load goals');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await goalService.create(formData);
            toast.success('Goal created successfully!');
            setShowModal(false);
            setFormData({ goalName: '', description: '', targetAmount: '', deadline: '', priority: 'medium' });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create goal');
        }
    };

    const handleAddToGoal = async (e) => {
        e.preventDefault();
        try {
            await goalService.addToGoal(selectedGoal._id, parseFloat(addAmount));
            toast.success('Amount added to goal!');
            setShowAddModal(false);
            setAddAmount('');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add amount');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this goal?')) return;
        try {
            await goalService.delete(id);
            toast.success('Goal deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete goal');
        }
    };

    const openAddModal = (goal) => {
        setSelectedGoal(goal);
        setShowAddModal(true);
    };

    const getPriorityColor = (priority) => {
        const colors = { low: '#4ade80', medium: '#fbbf24', high: '#ef4444' };
        return colors[priority] || colors.medium;
    };

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
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Savings Goals</h1>
                    <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Track your financial goals</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary">
                    <HiPlus size={20} />
                    <span>New Goal</span>
                </button>
            </div>

            {/* Summary Grid */}
            <div className="grid-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="glass" style={{ padding: '1.5rem' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Active Goals</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#818cf8', marginTop: '0.5rem' }}>{summary.active}</p>
                </div>
                <div className="glass" style={{ padding: '1.5rem' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Completed</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4ade80', marginTop: '0.5rem' }}>{summary.completed}</p>
                </div>
                <div className="glass" style={{ padding: '1.5rem' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Total Target</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginTop: '0.5rem' }}>{formatCurrency(summary.totalTarget)}</p>
                </div>
                <div className="glass" style={{ padding: '1.5rem' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Total Saved</p>
                    <p className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{formatCurrency(summary.totalSaved)}</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['active', 'completed', 'cancelled'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '10px',
                            textTransform: 'capitalize',
                            fontWeight: 500,
                            background: filter === status ? '#6366f1' : 'rgba(255,255,255,0.05)',
                            color: filter === status ? 'white' : '#94a3b8',
                            border: '1px solid ' + (filter === status ? 'transparent' : 'rgba(255,255,255,0.1)'),
                            transition: 'all 0.2s'
                        }}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Goals Grid */}
            <div className="grid-3">
                {goals.map((goal) => {
                    const daysLeft = differenceInDays(new Date(goal.deadline), new Date());
                    return (
                        <div key={goal._id} className="glass" style={{ padding: '1.5rem', position: 'relative', transition: 'transform 0.2s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: goal.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)'
                                    }}>
                                        {goal.status === 'completed' ? (
                                            <HiCheck size={20} color="#4ade80" />
                                        ) : (
                                            <HiFlag size={20} color="#818cf8" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 style={{ fontWeight: 600, color: 'white' }}>{goal.goalName}</h3>
                                        <p style={{ fontSize: '0.75rem', textTransform: 'capitalize', color: getPriorityColor(goal.priority) }}>
                                            {goal.priority} priority
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    {goal.status === 'active' && (
                                        <button onClick={() => openAddModal(goal)} style={{ padding: '6px', borderRadius: '6px', color: '#818cf8' }} className="hover:bg-white/10">
                                            <HiPlusCircle size={20} />
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(goal._id)} style={{ padding: '6px', borderRadius: '6px', color: '#94a3b8' }} className="hover:text-red-400">
                                        <HiTrash size={16} />
                                    </button>
                                </div>
                            </div>

                            {goal.description && (
                                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem' }}>{goal.description}</p>
                            )}

                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                    <span style={{ color: '#94a3b8' }}>Progress</span>
                                    <span style={{ color: 'white', fontWeight: 500 }}>{goal.progress}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className={`progress-fill ${goal.status === 'completed' ? 'progress-success' : 'progress-gradient'}`}
                                        style={{ width: `${goal.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <div>
                                    <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Saved</p>
                                    <p style={{ color: 'white', fontWeight: 500 }}>{formatCurrency(goal.savedAmount)}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Target</p>
                                    <p style={{ color: 'white', fontWeight: 500 }}>{formatCurrency(goal.targetAmount)}</p>
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                <span style={{ color: '#64748b' }}>
                                    Deadline: {format(new Date(goal.deadline), 'MMM d, yyyy')}
                                </span>
                                {goal.status === 'active' && (
                                    <span style={{ color: daysLeft < 30 ? '#ef4444' : '#94a3b8' }}>
                                        {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {goals.length === 0 && (
                <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: '24px' }}>
                    <HiFlag size={48} color="#64748b" style={{ margin: '0 auto 1rem auto', display: 'block' }} />
                    <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>No {filter} goals found</p>
                    {filter === 'active' && (
                        <button onClick={() => setShowModal(true)} className="btn-primary">
                            Create Your First Goal
                        </button>
                    )}
                </div>
            )}

            {/* Create Goal Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Savings Goal">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                        <label className="form-label">Goal Name</label>
                        <input
                            type="text"
                            value={formData.goalName}
                            onChange={(e) => setFormData({ ...formData, goalName: e.target.value })}
                            className="input-field"
                            placeholder="New Car, Emergency Fund, Vacation..."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input-field"
                            placeholder="Optional description"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Target Amount ({currency.symbol})</label>
                            <input
                                type="number"
                                value={formData.targetAmount}
                                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                                className="input-field"
                                placeholder="100000"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Deadline</label>
                            <input
                                type="date"
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Priority</label>
                        <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            className="input-field"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Create Goal</button>
                </form>
            </Modal>

            {/* Add to Goal Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add to Goal">
                <form onSubmit={handleAddToGoal} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                        <p style={{ color: '#818cf8', fontWeight: 500 }}>{selectedGoal?.goalName}</p>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                            {formatCurrency(selectedGoal?.savedAmount || 0)} / {formatCurrency(selectedGoal?.targetAmount || 0)}
                        </p>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Amount to Add ({currency.symbol})</label>
                        <input
                            type="number"
                            value={addAmount}
                            onChange={(e) => setAddAmount(e.target.value)}
                            className="input-field"
                            placeholder="1000"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Add Amount</button>
                </form>
            </Modal>
        </div>
    );
};

export default Goals;
