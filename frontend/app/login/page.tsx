'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Activity, Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register, user, isLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get('mode') === 'register') {
            setIsRegister(true);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!isLoading && user) {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegister) {
                await register(email, password);
            } else {
                await login(email, password);
            }
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background to-accent/20" />
                <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/40 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/30 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col justify-center p-12">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                            <Activity className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold">MetricsDash</span>
                    </div>

                    <h2 className="text-4xl font-bold mb-4">
                        Metrics Monitoring
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                            Made Simple
                        </span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-md">
                        Collect, visualize, and alert on your metrics.
                    </p>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center gap-3 mb-12 justify-center">
                        <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold">MetricsDash</span>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">
                            {isRegister ? 'Create Account' : 'Welcome Back'}
                        </h1>
                        <p className="text-muted-foreground">
                            {isRegister ? 'Sign up to get started' : 'Sign in to your account'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary outline-none transition-all"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary outline-none transition-all"
                                    placeholder={isRegister ? 'Min 8 characters' : '••••••••'}
                                    required
                                    minLength={isRegister ? 8 : 1}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 gradient-primary rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                            {isRegister ? 'Create Account' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => setIsRegister(!isRegister)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {isRegister ? (
                                <>Already have an account? <span className="text-primary font-medium">Sign in</span></>
                            ) : (
                                <>Don&apos;t have an account? <span className="text-primary font-medium">Sign up</span></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
