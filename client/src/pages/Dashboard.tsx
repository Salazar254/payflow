import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Globe,
    LogOut,
    Home,
    CreditCard,
    Users,
    Settings,
    ArrowRight,
    TrendingUp,
    DollarSign,
    Activity,
    Plus,
    Menu,
    X
} from 'lucide-react';
import axios from 'axios';

interface User {
    name: string;
    email: string;
    company?: string;
}

interface Payment {
    id: string;
    amount: number;
    currency: string;
    recipient: string;
    status: 'pending' | 'completed' | 'failed';
    date: string;
}

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [quoteAmount, setQuoteAmount] = useState('1000');
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            navigate('/login');
            return;
        }

        setUser(JSON.parse(userData));

        // Fetch payments
        fetchPayments(token);
    }, [navigate]);

    const fetchPayments = async (token: string) => {
        try {
            const response = await axios.get('http://localhost:3000/api/payments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayments(response.data);
        } catch (error) {
            console.error('Failed to fetch payments:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const rate = 127.00;
    const sourceAmount = parseFloat(quoteAmount) || 0;
    const received = sourceAmount * rate;

    const stats = [
        {
            icon: <DollarSign className="w-6 h-6 text-blue-400" />,
            label: 'Total Sent',
            value: '$45,230',
            change: '+12.5%',
            positive: true
        },
        {
            icon: <TrendingUp className="w-6 h-6 text-green-400" />,
            label: 'Saved vs Banks',
            value: 'KES 234,500',
            change: '+8.2%',
            positive: true
        },
        {
            icon: <Activity className="w-6 h-6 text-purple-400" />,
            label: 'Active Payments',
            value: '12',
            change: '3 pending',
            positive: false
        }
    ];

    const menuItems = [
        { id: 'dashboard', icon: <Home className="w-5 h-5" />, label: 'Dashboard' },
        { id: 'payments', icon: <CreditCard className="w-5 h-5" />, label: 'Payments' },
        { id: 'beneficiaries', icon: <Users className="w-5 h-5" />, label: 'Beneficiaries' },
        { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' }
    ];

    return (
        <div className="min-h-screen bg-slate-900 bg-hero-pattern bg-cover bg-fixed">
            <div className="absolute inset-0 bg-slate-900/90"></div>

            <div className="relative z-10 flex">
                {/* Sidebar */}
                <aside className={`fixed inset-y-0 left-0 z-50 w-64 glass-card rounded-none border-r border-white/10 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex flex-col h-full">
                        {/* Logo */}
                        <div className="p-6 border-b border-white/10">
                            <Link to="/" className="flex items-center gap-3">
                                <div className="bg-primary/20 p-2 rounded-lg">
                                    <Globe className="text-primary w-6 h-6" />
                                </div>
                                <span className="text-xl font-bold text-white">
                                    PayFlow <span className="text-primary">Global</span>
                                </span>
                            </Link>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4 space-y-2">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id
                                            ? 'bg-primary text-white'
                                            : 'text-gray-300 hover:bg-white/5'
                                        }`}
                                >
                                    {item.icon}
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            ))}
                        </nav>

                        {/* User Profile */}
                        <div className="p-4 border-t border-white/10">
                            <div className="glass-card p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{user?.name}</p>
                                        <p className="text-gray-400 text-xs truncate">{user?.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden fixed top-4 left-4 z-50 p-2 glass-card rounded-lg"
                >
                    {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                {/* Main Content */}
                <main className="flex-1 lg:ml-64 p-4 lg:p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
                        </h1>
                        <p className="text-gray-400">Here's what's happening with your payments today.</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="glass-card p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="bg-slate-800 p-3 rounded-xl">
                                        {stat.icon}
                                    </div>
                                    <span className={`text-sm font-medium ${stat.positive ? 'text-green-400' : 'text-gray-400'}`}>
                                        {stat.change}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Quick Actions & FX Quote */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Quick Actions */}
                            <div className="glass-card p-6">
                                <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <button className="glass-button py-4 flex items-center justify-center gap-2">
                                        <Plus className="w-5 h-5" />
                                        New Payment
                                    </button>
                                    <button className="bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2">
                                        <Users className="w-5 h-5" />
                                        Add Beneficiary
                                    </button>
                                </div>
                            </div>

                            {/* Recent Transactions */}
                            <div className="glass-card p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
                                    <button className="text-primary text-sm hover:text-primary/80">View All</button>
                                </div>
                                <div className="space-y-3">
                                    {payments.length > 0 ? (
                                        payments.slice(0, 5).map((payment) => (
                                            <div key={payment.id} className="bg-slate-800/50 p-4 rounded-lg border border-white/5 flex justify-between items-center">
                                                <div>
                                                    <p className="text-white font-medium">{payment.recipient}</p>
                                                    <p className="text-gray-400 text-sm">{new Date(payment.date).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-white font-bold">${payment.amount.toLocaleString()}</p>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${payment.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                                                            payment.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                                                                'bg-red-500/10 text-red-400'
                                                        }`}>
                                                        {payment.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-400">
                                            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p>No transactions yet</p>
                                            <p className="text-sm">Start by creating your first payment</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* FX Quote Widget */}
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Quick FX Quote</h2>
                            <div className="space-y-4">
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                                    <label className="text-xs text-gray-400 uppercase font-semibold">You Send</label>
                                    <div className="flex justify-between items-center mt-2">
                                        <input
                                            type="number"
                                            value={quoteAmount}
                                            onChange={(e) => setQuoteAmount(e.target.value)}
                                            className="bg-transparent text-2xl font-bold text-white outline-none w-full"
                                        />
                                        <div className="flex items-center gap-2 bg-slate-700 px-3 py-1 rounded-lg">
                                            <span className="text-xl">🇺🇸</span>
                                            <span className="font-bold text-sm">USD</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative flex justify-center -my-2 z-10">
                                    <div className="bg-slate-700 p-2 rounded-full border-4 border-slate-800">
                                        <ArrowRight className="w-4 h-4 text-gray-300 rotate-90" />
                                    </div>
                                </div>

                                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                                    <label className="text-xs text-gray-400 uppercase font-semibold">Recipient Gets</label>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-2xl font-bold text-accent">
                                            {received.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </span>
                                        <div className="flex items-center gap-2 bg-slate-700 px-3 py-1 rounded-lg">
                                            <span className="text-xl">🇰🇪</span>
                                            <span className="font-bold text-sm">KES</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Rate</span>
                                        <span className="text-white font-mono">1 USD = {rate.toFixed(2)} KES</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Fee</span>
                                        <span className="text-white font-mono">$5.00</span>
                                    </div>
                                </div>

                                <button className="glass-button w-full py-3 mt-4">
                                    Create Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
