'use client';

import { useState } from 'react';
import { Upload, X, Check } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function EvidenceUploadForm({ order }: { order: any }) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(order.evidenceUrl || null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('orderId', order.id);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                toast.success('Evidencia enviada correctamente');
                router.refresh();
            } else {
                toast.error('Error al subir evidencia');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error en la conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Evidencia de Entrega</h3>

            {order.status === 'VALIDATED' ? (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-green-300 border-dashed rounded-md bg-green-50">
                    <Check className="h-12 w-12 text-green-500 mb-2" />
                    <p className="text-green-700 font-medium">Evidencia Validada</p>
                    {preview && (
                        <div className="mt-4 relative w-full h-64">
                            <Image src={preview} alt="Evidence" layout="fill" objectFit="contain" />
                        </div>
                    )}
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    {!preview ? (
                        <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors">
                            <div className="space-y-1 text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <label
                                        htmlFor="file-upload"
                                        className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none"
                                    >
                                        <span>Sube un archivo</span>
                                        <input
                                            id="file-upload"
                                            name="file-upload"
                                            type="file"
                                            className="sr-only"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                    <p className="pl-1">o arrastra y suelta</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="relative w-full h-64 bg-gray-100 rounded-md overflow-hidden">
                                <Image src={preview} alt="Preview" layout="fill" objectFit="contain" />
                            </div>
                            {order.status !== 'VALIDATED' && (
                                <button
                                    type="button"
                                    onClick={() => { setFile(null); setPreview(null); }}
                                    className="absolute top-2 right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    )}

                    {file && (
                        <div className="mt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                            >
                                {loading ? 'Subiendo...' : 'Enviar Evidencia'}
                            </button>
                            <p className="text-xs text-gray-500 mt-2 text-center">Al enviar, el estado cambiará a "En Validación".</p>
                        </div>
                    )}

                    {order.status === 'IN_REVIEW' && !file && (
                        <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                            <p className="text-sm text-yellow-700">Tu evidencia está siendo revisada por el administrador.</p>
                        </div>
                    )}
                </form>
            )}
        </div>
    );
}
