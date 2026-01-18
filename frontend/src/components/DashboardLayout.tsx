import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Receipt, Link as LinkIcon, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

export function DashboardLayout() {
    const { logout } = useAuth()
    const location = useLocation()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const navItems = [
        { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
        { href: '/dashboard/transactions', label: 'Transactions', icon: Receipt },
        { href: '/dashboard/payment-links', label: 'Payment Links', icon: LinkIcon },
    ]

    const NavLink = ({ item }: { item: typeof navItems[0] }) => {
        const isActive = location.pathname === item.href
        const Icon = item.icon
        return (
            <Link
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                        ? 'bg-indigo-500/10 text-indigo-400'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                onClick={() => setIsSidebarOpen(false)}
            >
                <Icon size={18} />
                {item.label}
            </Link>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-white/5 transform transition-transform duration-200 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-full flex flex-col">
                    <div className="h-16 flex items-center px-6 border-b border-white/5">
                        <span className="text-xl font-bold tracking-tight text-white">
                            <span className="text-indigo-400">Pay</span>Flow
                        </span>
                        <button
                            className="ml-auto lg:hidden text-slate-400"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 px-4 py-6 space-y-1">
                        {navItems.map((item) => (
                            <NavLink key={item.href} item={item} />
                        ))}
                    </div>

                    <div className="p-4 border-t border-white/5">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={logout}
                        >
                            <LogOut size={18} className="mr-3" />
                            Log Out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-16 border-b border-white/5 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between px-4 lg:px-8">
                    <button
                        className="lg:hidden text-slate-400"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>

                    <div className="ml-auto flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs ring-2 ring-indigo-500/20">
                            PF
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
