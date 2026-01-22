import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, ArrowRight, Mail, Lock } from 'lucide-react';
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrors({});
        setApiError('');

        // Validation
        const newErrors: Record<string, string> = {};
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:3000/api/auth/login', {
                email: formData.email,
                password: formData.password
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                navigate('/dashboard');
            }
        } catch (error: any) {
            setApiError(error.response?.data?.error || 'Login failed. Please check your credentials.');
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

                {/* Login Card */}
                <div className="glass-card p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                        <p className="text-gray-400">Sign in to your PayFlow account</p>
                    </div>

                    {apiError && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                            <p className="text-red-400 text-sm">{apiError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
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

                        {/* Password */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Password
                                </label>
                                <a href="#" className="text-xs text-primary hover:text-primary/80">
                                    Forgot password?
                                </a>
                            </div>
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
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={formData.rememberMe}
                                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                                className="w-4 h-4 text-primary bg-slate-800 border-gray-600 rounded focus:ring-primary focus:ring-2"
                            />
                            <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-300">
                                Remember me for 30 days
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="glass-button w-full py-3 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing In...' : 'Sign In'} <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary hover:text-primary/80 font-medium">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Trust Badge */}
                <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                        <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-gray-500 border-2 border-slate-900"></div>
                            <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-slate-900"></div>
                            <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-slate-800">+2k</div>
                        </div>
                        <p>Trusted by 2,000+ businesses</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
