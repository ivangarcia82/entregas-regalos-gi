'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, PackageCheck, AlertCircle, Search, Filter } from 'lucide-react';

interface Order {
    id: string;
    customerName: string;
    company: string;
    giftType: string | null;
    status: string;
    createdAt: Date;
}

export default function SellerOrderList({ orders }: { orders: Order[] }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const matchesSearch =
                order.customerName.toLowerCase().includes(search.toLowerCase()) ||
                order.company.toLowerCase().includes(search.toLowerCase());

            const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [orders, search, statusFilter]);

    return (
        <div className="space-y-4">
            {/* Filter Bar */}
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
                <div className="sm:w-48">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md border"
                    >
                        <option value="ALL">Todos los estados</option>
                        <option value="PENDING">Pendientes</option>
                        <option value="IN_REVIEW">En Validación</option>
                        <option value="VALIDATED">Entregados</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                    {filteredOrders.length === 0 ? (
                        <li className="px-4 py-8 text-center text-gray-500">
                            No se encontraron registros con los filtros seleccionados.
                        </li>
                    ) : (
                        filteredOrders.map((order) => (
                            <li key={order.id}>
                                <Link href={`/seller/orders/${order.id}`} className="block hover:bg-gray-50">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-orange-600 truncate">{order.customerName}</p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${order.status === 'VALIDATED' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'}`}>
                                                    {order.status === 'VALIDATED' ? 'Entregado' :
                                                        order.status === 'IN_REVIEW' ? 'En Validación' : 'Pendiente'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    <PackageCheck className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                                    {order.giftType}
                                                </p>
                                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                    <AlertCircle className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                                    {order.company}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <ChevronRight className="h-5 w-5 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}
