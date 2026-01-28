import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiCurrencyRupee, HiEye, HiEyeSlash } from 'react-icons/hi2';

const SECURITY_QUESTIONS = [
    "What is your pet's name?",
    "What is your mother's maiden name?",
    "What city were you born in?",
    "What is your favorite movie?",
    "What was the name of your first school?",
    "What is your favorite food?"
];

const Register = () => {
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        confirmPassword: '',
        securityQuestion: '',
        securityAnswer: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return toast.error('Passwords do not match');
        }

        if (formData.password.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }

        setLoading(true);
        try {
            await register(formData.name, formData.email, formData.password, formData.securityQuestion, formData.securityAnswer);
            toast.success('Account created successfully!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-wrapper">
                {/* Logo */}
                

                {/* Form Card */}
                <div className="auth-card">
                    <div className="auth-header">
                        <h1 className="gradient-text" style={{ fontSize: '2rem' }}>FinanceFlow</h1>
                        <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Start Your Financial Journey</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input-field"
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input-field"
                                placeholder="your@email.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="input-group">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input-field"
                                    placeholder="••••••••"
                                    required
                                    style={{ paddingRight: '40px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="input-icon-btn"
                                >
                                    {showPassword ? <HiEyeSlash size={20} /> : <HiEye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="input-field"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Security Question</label>
                            <select
                                value={formData.securityQuestion}
                                onChange={(e) => setFormData({ ...formData, securityQuestion: e.target.value })}
                                className="input-field"
                                required
                            >
                                <option value="">Select a security question</option>
                                {SECURITY_QUESTIONS.map((q, i) => (
                                    <option key={i} value={q}>{q}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Security Answer</label>
                            <input
                                type="text"
                                value={formData.securityAnswer}
                                onChange={(e) => setFormData({ ...formData, securityAnswer: e.target.value })}
                                className="input-field"
                                placeholder="Your answer (for password recovery)"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                            style={{ width: '100%', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Already have an account?{' '}
                            <Link to="/login" className="link-primary">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
