import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
    title: 'Metrics Dashboard',
    description: 'Metrics monitoring and alerting dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="antialiased">
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
