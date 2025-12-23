'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import ValidationActions from '@/components/ValidationActions';
import { Search, User, Gift, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface Order {
    id: string;
    customerName: string;
    company: string;
    giftType: string | null;
    status: string;
    evidenceUrl: string | null;
    updatedAt: Date;
    seller: {
        name: string | null;
        email: string;
    };
}

export default function AdminOrderList({ orders, sellers }: { orders: Order[], sellers: string[] }) {
    const [activeTab, setActiveTab] = useState<'PENDING' | 'VALIDATED'>('PENDING');
    const [search, setSearch] = useState('');
    const [sellerFilter, setSellerFilter] = useState('ALL');

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const matchesTab = activeTab === 'PENDING' ? order.status === 'IN_REVIEW' : order.status === 'VALIDATED';

            const matchesSearch =
                order.customerName.toLowerCase().includes(search.toLowerCase()) ||
                order.company.toLowerCase().includes(search.toLowerCase());

            const matchesSeller = sellerFilter === 'ALL' || order.seller.name === sellerFilter;

            return matchesTab && matchesSearch && matchesSeller;
        });
    }, [orders, activeTab, search, sellerFilter]);

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('PENDING')}
                        className={clsx(
                            activeTab === 'PENDING'
                                ? "border-orange-500 text-orange-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                            "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center"
                        )}
                    >
                        <Clock className="mr-2 h-4 w-4" />
                        Pendientes por Validar
                        <span className={clsx(
                            "ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium",
                            activeTab === 'PENDING' ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-900"
                        )}>
                            {orders.filter(o => o.status === 'IN_REVIEW').length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('VALIDATED')}
                        className={clsx(
                            activeTab === 'VALIDATED'
                                ? "border-orange-500 text-orange-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                            "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center"
                        )}
                    >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Validados
                        <span className={clsx(
                            "ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium",
                            activeTab === 'VALIDATED' ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-900"
                        )}>
                            {orders.filter(o => o.status === 'VALIDATED').length}
                        </span>
                    </button>
                </nav>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        placeholder="Buscar por cliente o empresa..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="sm:w-64">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                            value={sellerFilter}
                            onChange={(e) => setSellerFilter(e.target.value)}
                            className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md border"
                        >
                            <option value="ALL">Todos los vendedores</option>
                            {sellers.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {filteredOrders.length === 0 ? (
                    <div className="px-4 py-12 text-center text-gray-500">
                        No hay pedidos que coincidan con los criterios.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {filteredOrders.map(order => (
                            <li key={order.id} className="p-6">
                                <div className="flex flex-col lg:flex-row gap-6">
                                    <div className="flex-shrink-0 relative w-full lg:w-48 h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-inner">
                                        {order.evidenceUrl ? (
                                            <div className="relative w-full h-full group cursor-pointer" onClick={() => window.open(order.evidenceUrl!, '_blank')}>
                                                <Image
                                                    src={order.evidenceUrl}
                                                    alt="Evidence"
                                                    fill
                                                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all">
                                                    <Search className="text-white opacity-0 group-hover:opacity-100 h-8 w-8" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400 italic text-sm">Sin evidencia fotográfica</div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                                    {order.customerName}
                                                </h3>
                                                <p className="text-sm font-medium text-gray-500 flex items-center mt-1">
                                                    <Gift className="h-4 w-4 mr-1.5" />
                                                    {order.giftType}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={clsx(
                                                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                                    order.status === 'VALIDATED' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                                )}>
                                                    {order.status === 'VALIDATED' ? 'Validado' : 'En Revisión'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-md">
                                            <div className="flex items-start">
                                                <User className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                                                <div>
                                                    <p className="text-gray-500 font-semibold">Vendedor</p>
                                                    <p className="text-gray-900 font-medium">{order.seller.name || 'N/A'}</p>
                                                    <p className="text-xs text-gray-400">{order.seller.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <AlertCircle className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                                                <div>
                                                    <p className="text-gray-500 font-semibold">Empresa</p>
                                                    <p className="text-gray-900 font-medium">{order.company}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {activeTab === 'PENDING' && (
                                            <div className="flex justify-end pt-2 border-t border-gray-100">
                                                <ValidationActions orderId={order.id} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
