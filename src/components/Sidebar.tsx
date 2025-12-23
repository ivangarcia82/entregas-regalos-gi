'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, User, LogOut, CheckSquare } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import clsx from 'clsx';

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const user = session?.user;

    const links = [
        { name: 'Mis Pedidos', href: '/dashboard', icon: Package, role: 'SELLER' },
        { name: 'Validaciones', href: '/admin/validations', icon: CheckSquare, role: 'ADMIN' },
    ];

    return (
        <div className="flex h-full flex-col bg-gray-900 w-64 text-white">
            <div className="flex h-16 items-center justify-center border-b border-gray-800 bg-orange-600 text-white shadow-md">
                <h1 className="text-xl font-bold">Generando Ideas</h1>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-2">

                    {user?.role === 'SELLER' && (
                        <Link
                            href="/seller/orders"
                            className={clsx(
                                "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                                pathname.startsWith('/seller') ? "bg-orange-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                            )}
                        >
                            <Package className="mr-3 h-6 w-6" />
                            Mis Entregas
                        </Link>
                    )}

                    {user?.role === 'ADMIN' && (
                        <Link
                            href="/admin/validations"
                            className={clsx(
                                "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                                pathname.startsWith('/admin') ? "bg-orange-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                            )}
                        >
                            <CheckSquare className="mr-3 h-6 w-6" />
                            Validaciones
                        </Link>
                    )}

                </nav>
            </div>
            <div className="border-t border-gray-800 p-4">
                <div className="flex items-center">
                    <div className="ml-3">
                        <p className="text-sm font-medium text-white">{user?.name}</p>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="mt-4 flex w-full items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}
