import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { RefreshCw, TrendingUp, Users, DollarSign } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface Transaction {
    id: string
    amount: number
    phone: string
    status: string
    timestamp: string
}

export function Dashboard() {
    const { user } = useAuth()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState({
        totalTransactions: 0,
        totalAmount: 0,
        successfulTransactions: 0,
    })

    const fetchTransactions = async () => {
        if (!user) return

        setIsLoading(true)
        try {
            const response = await fetch('http://localhost:3000/api/transactions', {
                headers: {
                    'x-api-key': user.merchantId, // Using merchantId as key for MVP compatibility
                },
            })
            const data = await response.json()

            if (data.success) {
                setTransactions(data.transactions)

                // Calculate stats
                const total = data.transactions.length
                const successful = data.transactions.filter((t: Transaction) => t.status === 'completed').length
                const totalAmount = data.transactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0)

                setStats({
                    totalTransactions: total,
                    totalAmount,
                    successfulTransactions: successful,
                })
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchTransactions()
        const interval = setInterval(fetchTransactions, 5000) // Poll every 5 seconds
        return () => clearInterval(interval)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
        }).format(amount)
    }

    const formatDate = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('en-KE', {
            dateStyle: 'medium',
            timeStyle: 'short',
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white">Overview</h2>
                    <p className="text-slate-400 mt-1">Welcome back, {user?.name || 'Customer'}</p>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={fetchTransactions}
                    className="border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300"
                >
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-indigo-500/20 bg-indigo-500/5 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-indigo-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalAmount)}</div>
                        <p className="text-xs text-slate-400 mt-1">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card className="border-purple-500/20 bg-purple-500/5 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300">Transactions</CardTitle>
                        <Users className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.totalTransactions}</div>
                        <p className="text-xs text-slate-400 mt-1">
                            {stats.successfulTransactions} successful
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300">Success Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {stats.totalTransactions > 0
                                ? Math.round((stats.successfulTransactions / stats.totalTransactions) * 100)
                                : 0}%
                        </div>
                        <p className="text-xs text-slate-400 mt-1">+2% from last week</p>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Table */}
            <Card className="border-white/5 bg-slate-900/40 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-white">Recent Transactions</CardTitle>
                    <CardDescription className="text-slate-400">
                        Real-time transaction updates from your payment links.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-slate-500">Loading transactions...</div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            No transactions yet. Create a payment link to get started!
                        </div>
                    ) : (
                        <div className="rounded-md border border-slate-800">
                            <Table>
                                <TableHeader className="bg-slate-950/50">
                                    <TableRow className="border-slate-800 hover:bg-transparent">
                                        <TableHead className="text-slate-400">Status</TableHead>
                                        <TableHead className="text-slate-400">Amount</TableHead>
                                        <TableHead className="text-slate-400">Phone</TableHead>
                                        <TableHead className="text-slate-400 text-right">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((transaction) => (
                                        <TableRow key={transaction.id} className="border-slate-800 hover:bg-slate-800/30">
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.status === 'completed'
                                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                            : transaction.status === 'pending'
                                                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                        }`}
                                                >
                                                    {transaction.status === 'completed' ? 'Success' : transaction.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-medium text-white">
                                                {formatCurrency(transaction.amount)}
                                            </TableCell>
                                            <TableCell className="text-slate-400 font-mono text-xs">
                                                {transaction.phone}
                                            </TableCell>
                                            <TableCell className="text-slate-400 text-right">
                                                {formatDate(transaction.timestamp)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

