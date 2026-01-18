import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle2 } from 'lucide-react'

export function Pay() {
    const [searchParams] = useSearchParams()
    const amount = searchParams.get('amount') || '0'
    const merchantId = searchParams.get('merchant')

    const [phone, setPhone] = useState('254')
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    // Basic validation
    const isValid = amount && merchantId
    const formattedAmount = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(Number(amount))

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!phone.match(/^254\d{9}$/)) {
            setStatus('error')
            setMessage('Please enter a valid M-Pesa number (254...)')
            return
        }

        setIsLoading(true)
        setStatus('processing')
        setMessage('')

        try {
            const response = await fetch('http://localhost:3000/api/payment/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: Number(amount),
                    phone,
                    merchantId
                })
            })

            const data = await response.json()

            if (data.success) {
                setStatus('success')
            } else {
                setStatus('error')
                setMessage(data.message || 'Payment initiation failed')
            }
        } catch (err) {
            setStatus('error')
            setMessage('Network error. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (!isValid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Invalid Link</h1>
                    <p className="text-slate-400">This payment link is missing required information.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>

            <Card className="w-full max-w-md border-indigo-500/20 bg-slate-900/60 backdrop-blur-xl shadow-2xl z-10 animate-slide-up">
                <CardHeader className="text-center border-b border-white/5 pb-8">
                    <div className="mx-auto mb-4 h-16 w-16 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <CardTitle className="text-2xl font-bold text-white mb-2">PayFlow Checkout</CardTitle>
                    <CardDescription className="text-slate-400">
                        Secure M-Pesa payment
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-8 space-y-6">
                    <div className="text-center">
                        <div className="text-sm text-slate-400 uppercase tracking-widest font-semibold mb-2">Amount to Pay</div>
                        <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                            {formattedAmount}
                        </div>
                    </div>

                    {status === 'success' ? (
                        <div className="text-center py-6 animate-fade-in">
                            <div className="mx-auto h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 className="h-8 w-8 text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Check your phone!</h3>
                            <p className="text-slate-400">
                                We've sent an M-Pesa STK push to <span className="text-white font-mono">{phone}</span>.
                                Please enter your PIN to complete the transaction.
                            </p>
                            <Button
                                className="mt-8 w-full bg-slate-800 hover:bg-slate-700"
                                onClick={() => setStatus('idle')}
                            >
                                Send Another Request
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handlePayment} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-slate-300">M-Pesa Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="2547..."
                                    className="bg-slate-950/50 border-slate-700 text-white h-12 text-lg tracking-wide placeholder:text-slate-600 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            {status === 'error' && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center animate-fade-in">
                                    {message}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin" /> Processing...
                                    </span>
                                ) : 'Pay Now'}
                            </Button>
                        </form>
                    )}

                    <div className="text-center">
                        <div className="flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                            {/* Simple M-PESA Logo representation can replace with image if available */}
                            <span className="text-xs font-bold text-white bg-green-600 px-2 py-1 rounded">M-PESA</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-4">
                            Secured by PayFlow.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
