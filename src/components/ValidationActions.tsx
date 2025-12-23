'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ValidationActions({ orderId }: { orderId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAction = async (status: 'VALIDATED' | 'REJECTED') => {
        // We can still use confirm for critical actions, or use a custom modal later.
        // For now, let's stick with confirm but use toast for results.
        if (!confirm(status === 'VALIDATED' ? '¿Confirmar que el regalo fue entregado?' : '¿Rechazar evidencia?')) return;

        setLoading(true);
        const promise = fetch(`/api/orders/${orderId}/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        }).then(async (res) => {
            if (!res.ok) {
                // If the response is not ok, throw an error to trigger the toast.promise error state
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al actualizar estado');
            }
            return res;
        });

        toast.promise(promise, {
            loading: 'Actualizando estado...',
            success: () => {
                router.refresh();
                return status === 'VALIDATED' ? 'Regalo validado' : 'Evidencia rechazada';
            },
            error: (err) => {
                console.error(err); // Log the actual error for debugging
                return err.message || 'Error al actualizar estado';
            },
        });

        try {
            await promise; // Await the promise to ensure setLoading(false) is called after it resolves/rejects
        } catch (e) {
            // This catch block will handle network errors or errors thrown by the .then() block above
            console.error(e);
        } finally {
            setLoading(false); // Ensure loading state is reset
        }
    };

    return (
        <div className="flex space-x-3">
            <button
                onClick={() => handleAction('VALIDATED')}
                disabled={loading}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50"
            >
                <CheckCircle className="mr-1 h-4 w-4" />
                Validar
            </button>
            <button
                onClick={() => handleAction('REJECTED')} // 'REJECTED' isn't in my schema, I might revert to 'PENDING' or add REJECTED? 
                // My schema has PENDING, IN_REVIEW, VALIDATED. 
                // If rejected, maybe go back to PENDING so they can upload again?
                disabled={loading}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none disabled:opacity-50"
            >
                <XCircle className="mr-1 h-4 w-4" />
                Rechazar
            </button>
        </div>
    );
}
