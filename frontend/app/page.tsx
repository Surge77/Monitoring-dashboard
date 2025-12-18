'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Activity, BarChart3, Bell, Shield } from 'lucide-react';

export default function Home() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

                <div className="relative max-w-6xl mx-auto px-6 py-24">
                    <nav className="flex items-center justify-between mb-20">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-semibold">MetricsDash</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/login')}
                                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => router.push('/login?mode=register')}
                                className="px-5 py-2.5 gradient-primary rounded-lg font-medium hover:opacity-90 transition-opacity"
                            >
                                Get Started
                            </button>
                        </div>
                    </nav>

                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                            Monitor Your Systems
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                                In Real-Time
                            </span>
                        </h1>
                        <p className="text-xl text-muted-foreground mb-10">
                            Collect metrics, visualize trends, and get alerted when things go wrong.
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => router.push('/login?mode=register')}
                                className="px-8 py-3.5 gradient-primary rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity"
                            >
                                Start Free
                            </button>
                            <button
                                onClick={() => router.push('/login')}
                                className="px-8 py-3.5 border border-border rounded-xl font-semibold text-lg hover:bg-secondary/50 transition-colors"
                            >
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-24">
                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<BarChart3 className="w-8 h-8" />}
                        title="Real-Time Charts"
                        description="Visualize your metrics with interactive charts and aggregated views."
                    />
                    <FeatureCard
                        icon={<Bell className="w-8 h-8" />}
                        title="Threshold Alerts"
                        description="Set up alert rules and get notified when metrics cross thresholds."
                    />
                    <FeatureCard
                        icon={<Shield className="w-8 h-8" />}
                        title="Secure"
                        description="JWT authentication and HTTP-only cookies for security."
                    />
                </div>
            </div>

            <footer className="border-t border-border py-8">
                <div className="max-w-6xl mx-auto px-6 text-center text-muted-foreground">
                    <p>Built with Next.js, Express, and SQLite</p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 text-white">
                {icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    );
}
