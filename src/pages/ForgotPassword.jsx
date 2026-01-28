import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HiEnvelope, HiKey, HiLockClosed, HiEye, HiEyeSlash, HiArrowLeft } from 'react-icons/hi2';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: email, 2: answer question, 3: new password
    const [email, setEmail] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Step 1: Get security question
    const handleGetQuestion = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('/api/auth/forgotpassword', { email });
            setSecurityQuestion(res.data.data.securityQuestion);
            setStep(2);
            toast.success('Security question retrieved');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Email not found');
        } finally {
            setLoading(false);
        }
    };

    // Step 2 & 3: Reset password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await axios.post('/api/auth/resetpassword', {
                email,
                securityAnswer,
                newPassword
            });
            toast.success('Password reset successfully!');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-wrapper">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }} className="gradient-text">
                            Reset Password
                        </h1>
                        <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
                            {step === 1 && 'Enter your email to get started'}
                            {step === 2 && 'Answer your security question'}
                        </p>
                    </div>

                    {/* Step indicators */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        {[1, 2].map((s) => (
                            <div
                                key={s}
                                style={{
                                    width: '2.5rem',
                                    height: '0.25rem',
                                    borderRadius: '9999px',
                                    backgroundColor: step >= s ? '#6366f1' : '#334155',
                                    transition: 'background-color 0.3s'
                                }}
                            />
                        ))}
                    </div>

                    {step === 1 && (
                        <form onSubmit={handleGetQuestion}>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div className="input-group">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-field"
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                                style={{ width: '100%', marginTop: '1rem' }}
                            >
                                {loading ? 'Finding...' : 'Continue'}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleResetPassword}>
                            <div className="form-group">
                                <label className="form-label">Security Question</label>
                                <div style={{ 
                                    padding: '0.75rem 1rem', 
                                    backgroundColor: '#1e293b', 
                                    borderRadius: '0.5rem',
                                    color: '#e2e8f0',
                                    marginBottom: '1rem'
                                }}>
                                    {securityQuestion}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Your Answer</label>
                                <input
                                    type="text"
                                    value={securityAnswer}
                                    onChange={(e) => setSecurityAnswer(e.target.value)}
                                    className="input-field"
                                    placeholder="Enter your answer"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <div className="input-group">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="input-field"
                                        placeholder="••••••••"
                                        style={{ paddingRight: '2.5rem' }}
                                        required
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
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input-field"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                                style={{ width: '100%', marginTop: '1rem' }}
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="btn-secondary"
                                style={{ width: '100%', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                <HiArrowLeft size={18} /> Back
                            </button>
                        </form>
                    )}

                    <p className="auth-footer">
                        Remember your password?{' '}
                        <Link to="/login" className="link-primary">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
