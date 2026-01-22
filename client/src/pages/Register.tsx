import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, ArrowRight, Mail, Lock, User, Building2, CheckCircle2, XCircle } from 'lucide-react';
import axios from 'axios';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const validatePassword = (password: string) => {
        const minLength = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        return { minLength, hasUpper, hasLower, hasNumber };
    };

    const passwordStrength = validatePassword(formData.password);
    const isPasswordValid = Object.values(passwordStrength).every(Boolean);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrors({});
        setApiError('');

        // Validation
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.company) newErrors.company = 'Company name is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (!isPasswordValid) newErrors.password = 'Password does not meet requirements';
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:3000/api/auth/register', {
                name: formData.name,
                email: formData.email,
                company: formData.company,
                password: formData.password
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                navigate('/dashboard');
            }
        } catch (error: any) {
            setApiError(error.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 bg-hero-pattern bg-cover bg-fixed flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/90"></div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <Link to="/" className="flex items-center justify-center gap-3 mb-8">
                    <div className="bg-primary/20 p-2 rounded-lg">
                        <Globe className="text-primary w-8 h-8" />
                    </div>
                    <span className="text-3xl font-bold text-white">
                        PayFlow <span className="text-primary">Global</span>
                    </span>
                </Link>

                {/* Register Card */}
                <div className="glass-card p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                        <p className="text-gray-400">Join 2,000+ businesses saving on FX fees</p>
                    </div>

                    {apiError && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                            <p className="text-red-400 text-sm">{apiError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="glass-input w-full pl-11"
                                    placeholder="John Doe"
                                />
                            </div>
                            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="glass-input w-full pl-11"
                                    placeholder="john@company.com"
                                />
                            </div>
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                        </div>

                        {/* Company */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Company Name
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className="glass-input w-full pl-11"
                                    placeholder="Acme Ltd"
                                />
                            </div>
                            {errors.company && <p className="text-red-400 text-xs mt-1">{errors.company}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="glass-input w-full pl-11"
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}

                            {/* Password Strength */}
                            {formData.password && (
                                <div className="mt-3 space-y-2">
                                    <p className="text-xs text-gray-400">Password must contain:</p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className={`flex items-center gap-1 ${passwordStrength.minLength ? 'text-green-400' : 'text-gray-500'}`}>
                                            {passwordStrength.minLength ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            8+ characters
                                        </div>
                                        <div className={`flex items-center gap-1 ${passwordStrength.hasUpper ? 'text-green-400' : 'text-gray-500'}`}>
                                            {passwordStrength.hasUpper ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            Uppercase letter
                                        </div>
                                        <div className={`flex items-center gap-1 ${passwordStrength.hasLower ? 'text-green-400' : 'text-gray-500'}`}>
                                            {passwordStrength.hasLower ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            Lowercase letter
                                        </div>
                                        <div className={`flex items-center gap-1 ${passwordStrength.hasNumber ? 'text-green-400' : 'text-gray-500'}`}>
                                            {passwordStrength.hasNumber ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            Number
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="glass-input w-full pl-11"
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="glass-button w-full py-3 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Trust Badge */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>🔒 Your data is encrypted and secure</p>
                </div>
            </div>
        </div>
    );
};

export default Register;
