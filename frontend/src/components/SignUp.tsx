import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function SignUp() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        business: '',
        email: '',
        phone: '',
        password: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (data.success) {
                login(data.token, data.merchantId)
                navigate('/dashboard')
            } else {
                setError(data.message || 'Registration failed')
            }
        } catch (err) {
            setError('Failed to connect to server')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>

            <Card className="w-full max-w-lg border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-2xl z-10">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex items-center justify-center mb-6">
                        <span className="text-2xl font-bold tracking-tight text-white">
                            <span className="text-indigo-400">Pay</span>Flow
                        </span>
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">
                        Create an account
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Start accepting instant M-Pesa payments today
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                                <Input id="name" name="name" placeholder="John Doe" required
                                    className="bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-indigo-500 focus:border-indigo-500"
                                    onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="business" className="text-slate-300">Business Name</Label>
                                <Input id="business" name="business" placeholder="John's Shop" required
                                    className="bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-indigo-500 focus:border-indigo-500"
                                    onChange={handleChange} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="john@example.com" required
                                className="bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-indigo-500 focus:border-indigo-500"
                                onChange={handleChange} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
                            <Input id="phone" name="phone" type="tel" placeholder="0712345678" required
                                className="bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-indigo-500 focus:border-indigo-500"
                                onChange={handleChange} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300">Password</Label>
                            <Input id="password" name="password" type="password" required
                                className="bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-indigo-500 focus:border-indigo-500"
                                onChange={handleChange} />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <Button type="submit" disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-6 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all">
                            {isLoading ? 'Creating Account...' : 'Get Started'}
                        </Button>

                        <div className="text-center text-sm text-slate-400 mt-4">
                            Already have an account?{' '}
                            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
