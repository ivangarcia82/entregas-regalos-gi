import Sidebar from '@/components/Sidebar';
import Providers from '@/components/Providers';
import { Toaster } from 'sonner';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Providers>
            <Toaster position="top-right" richColors />
            <div className="flex h-screen bg-gray-100">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                        {children}
                    </main>
                </div>
            </div>
        </Providers>
    );
}
