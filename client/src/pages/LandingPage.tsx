import { useState } from 'react';
import Navbar from '../components/Navbar';
import { ArrowRight, Globe, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    const [quoteAmount, setQuoteAmount] = useState('5000');

    // Mock calculation
    const sourceAmount = parseFloat(quoteAmount) || 0;
    const rate = 127.00; // PayFlow Rate
    const bankRate = 123.50; // Typical Bank Rate
    const received = sourceAmount * rate;
    const bankReceived = sourceAmount * bankRate;
    const lost = received - bankReceived;

    return (
        <div className="min-h-screen bg-slate-900 bg-hero-pattern bg-cover bg-fixed">
            <div className="absolute inset-0 bg-slate-900/90"></div>

            <div className="relative z-10">
                <Navbar />

                {/* Hero Section */}
                <section className="pt-32 pb-20 px-4">
                    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                Live in Kenya, China, UAE & India
                            </div>
                            <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
                                Stop Losing <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">5-10%</span> on Global Payments
                            </h1>
                            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                                Pay suppliers and receive payments globally in 24 hours.
                                Real mid-market rates. No hidden fees.
                                Built for Kenyan Importers & Exporters.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/login" className="glass-button text-lg px-8 py-4 flex justify-center items-center gap-2">
                                    Start Saving Now <ArrowRight />
                                </Link>
                                <div className="flex items-center gap-4 text-sm text-gray-400 px-4 py-3">
                                    <div className="flex -space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-slate-900"></div>
                                        <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-slate-900"></div>
                                        <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-slate-800">+2k</div>
                                    </div>
                                    <p>Trusted by 2,000+ businesses</p>
                                </div>
                            </div>
                        </div>

                        {/* Live Quote Card */}
                        <div className="glass-card p-6 md:p-8 transform hover:scale-[1.02] transition-transform duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Instance FX Quote</h3>
                                <div className="text-accent text-sm flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                                    Live Rates
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                                    <label className="text-xs text-gray-400 uppercase font-semibold">You Send</label>
                                    <div className="flex justify-between items-center mt-2">
                                        <input
                                            type="number"
                                            value={quoteAmount}
                                            onChange={(e) => setQuoteAmount(e.target.value)}
                                            className="bg-transparent text-3xl font-bold text-white outline-none w-full"
                                        />
                                        <div className="flex items-center gap-2 bg-slate-700 px-3 py-1 rounded-lg">
                                            <span className="text-2xl">🇺🇸</span>
                                            <span className="font-bold">USD</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative flex justify-center -my-3 z-10">
                                    <div className="bg-slate-700 p-2 rounded-full border-4 border-slate-800">
                                        <ArrowRight className="w-4 h-4 text-gray-300 rotate-90" />
                                    </div>
                                </div>

                                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                                    <label className="text-xs text-gray-400 uppercase font-semibold">Recipient Gets</label>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-3xl font-bold text-accent">
                                            {received.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </span>
                                        <div className="flex items-center gap-2 bg-slate-700 px-3 py-1 rounded-lg">
                                            <span className="text-2xl">🇰🇪</span>
                                            <span className="font-bold">KES</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Exchange Rate</span>
                                        <span className="text-white font-mono">1 USD = {rate.toFixed(2)} KES</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Processing Fee</span>
                                        <span className="text-white font-mono">$5.00</span>
                                    </div>
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg mt-4">
                                        <p className="text-emerald-400 text-sm font-medium flex items-center justify-center gap-2">
                                            <Zap className="w-4 h-4 fill-current" />
                                            You save approx. KES {lost.toLocaleString(undefined, { maximumFractionDigits: 0 })} vs Banks
                                        </p>
                                    </div>
                                </div>

                                <button className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl mt-4 transition-colors">
                                    Get This Rate
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section id="features" className="py-20 bg-slate-900/50">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Importers Choose PayFlow</h2>
                            <p className="text-gray-400 max-w-2xl mx-auto">Traditional banks are slow and expensive. We built a modern financial rail for global trade.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <Zap className="w-8 h-8 text-yellow-400" />,
                                    title: "Instant Settlement",
                                    desc: "M-Pesa payments settle instantly. Bank transfers arrive within 24 hours, not 3-7 days."
                                },
                                {
                                    icon: <Shield className="w-8 h-8 text-emerald-400" />,
                                    title: "Bank-Grade Security",
                                    desc: "Your funds are held in safeguarded accounts. We use 256-bit encryption and strict KYC."
                                },
                                {
                                    icon: <Globe className="w-8 h-8 text-blue-400" />,
                                    title: "Global Reach",
                                    desc: "Send to China (Alipay/WeChat), India, UAE, UK, Europe and USA directly from Kenya."
                                }
                            ].map((feature, idx) => (
                                <div key={idx} className="glass-card p-8 hover:bg-white/5 transition-colors">
                                    <div className="bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 px-4">
                    <div className="max-w-5xl mx-auto glass-card p-12 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to scale your imports?</h2>
                        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Join 2,000+ Kenyan businesses saving millions on FX fees every month.</p>
                        <Link to="/register" className="glass-button text-lg px-10 py-4 inline-flex items-center gap-2">
                            Create Free Account <ArrowRight />
                        </Link>
                        <p className="mt-6 text-sm text-gray-500">No credit card required • KYC verified in 2 hours</p>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 bg-slate-950 border-t border-white/5">
                    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
                        <div className="flex items-center gap-2 mb-4 md:mb-0">
                            <Globe className="w-5 h-5 text-gray-600" />
                            <span>© 2026 PayFlow Global. Nairobi, Kenya.</span>
                        </div>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Support</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default LandingPage;
