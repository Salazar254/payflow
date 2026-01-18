import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Check, ExternalLink, Link as LinkIcon, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface GeneratedLink {
    id: string
    amount: string
    url: string
    code: string
    createdAt: Date
}

export function PaymentLinks() {
    const { user } = useAuth()
    const [amount, setAmount] = useState('')
    const [links, setLinks] = useState<GeneratedLink[]>([])
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault()
        if (!amount) return

        const url = `${window.location.origin}/pay?merchant=${user?.merchantId}&amount=${amount}`
        const code = `
<!-- PayFlow Widget -->
<script src="${window.location.origin}/widget/payflow-widget.js"></script>
<button onclick="PayFlow.checkout({
    merchantId: '${user?.merchantId}',
    amount: ${amount}
})">
    Pay with M-Pesa
</button>`.trim()

        const newLink: GeneratedLink = {
            id: crypto.randomUUID(),
            amount,
            url,
            code,
            createdAt: new Date()
        }

        setLinks([newLink, ...links])
        setAmount('')
    }

    const copyToClipboard = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedId(id)
            setTimeout(() => setCopiedId(null), 2000)
        } catch (err) {
            console.error('Failed to copy', err)
        }
    }

    const deleteLink = (id: string) => {
        setLinks(links.filter(link => link.id !== id))
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-white">Payment Links</h2>
                <p className="text-slate-400 mt-1">Generate and manage your payment links.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Generator Form */}
                <Card className="border-white/5 bg-slate-900/40 backdrop-blur-sm h-fit lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-white">Create New Link</CardTitle>
                        <CardDescription className="text-slate-400">
                            Enter the amount you want to collect.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleGenerate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount" className="text-slate-300">Amount (KES)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="e.g. 1000"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                    className="bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Generate Link
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Results List */}
                <div className="lg:col-span-2 space-y-4">
                    {links.length === 0 ? (
                        <Card className="border-dashed border-slate-800 bg-transparent flex flex-col items-center justify-center p-12 text-slate-500">
                            <LinkIcon size={48} className="mb-4 opacity-50" />
                            <p>No active links. Generate one to get started.</p>
                        </Card>
                    ) : (
                        <div className="space-y-4 animate-fade-in">
                            {links.map((link) => (
                                <Card key={link.id} className="border-indigo-500/20 bg-indigo-500/5 backdrop-blur-sm overflow-hidden">
                                    <CardHeader className="pb-3 border-b border-white/5 flex flex-row items-center justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-white text-lg">
                                                {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(Number(link.amount))}
                                            </CardTitle>
                                            <CardDescription className="text-xs text-slate-400">
                                                Created {link.createdAt.toLocaleTimeString()}
                                            </CardDescription>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                            onClick={() => deleteLink(link.id)}
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <Tabs defaultValue="link" className="w-full">
                                            <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 h-9">
                                                <TabsTrigger value="link" className="text-xs">Direct Link</TabsTrigger>
                                                <TabsTrigger value="code" className="text-xs">Embed Code</TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="link" className="space-y-3 mt-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 p-2.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono truncate">
                                                        {link.url}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 border-slate-700 hover:bg-slate-800 text-slate-300 h-8 text-xs"
                                                        onClick={() => copyToClipboard(link.url, link.id + '-url')}
                                                    >
                                                        {copiedId === link.id + '-url' ? <Check size={14} className="mr-1.5 text-green-400" /> : <Copy size={14} className="mr-1.5" />}
                                                        {copiedId === link.id + '-url' ? 'Copied' : 'Copy URL'}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white h-8 text-xs"
                                                        onClick={() => window.open(link.url, '_blank')}
                                                    >
                                                        <ExternalLink size={14} className="mr-1.5" />
                                                        Open
                                                    </Button>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="code" className="space-y-3 mt-3">
                                                <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre h-24 custom-scrollbar">
                                                    {link.code}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full border-slate-700 hover:bg-slate-800 text-slate-300 h-8 text-xs"
                                                    onClick={() => copyToClipboard(link.code, link.id + '-code')}
                                                >
                                                    {copiedId === link.id + '-code' ? <Check size={14} className="mr-1.5 text-green-400" /> : <Copy size={14} className="mr-1.5" />}
                                                    {copiedId === link.id + '-code' ? 'Copied' : 'Copy Code'}
                                                </Button>
                                            </TabsContent>
                                        </Tabs>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
