import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, MapPin, Building, Phone, Mail } from "lucide-react";
import EvidenceUploadForm from "@/components/EvidenceUploadForm";
import { notFound } from "next/navigation";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    const { id } = await params;

    const order = await prisma.order.findUnique({
        where: {
            id: id,
        },
        include: {
            seller: true
        }
    });

    if (!order) {
        notFound();
    }

    // Security check: only seller or admin can view
    if (session?.user?.role !== 'ADMIN' && order.sellerId !== session?.user?.id) {
        return <div>No autorizado</div>;
    }

    let details: any = {};
    try {
        details = JSON.parse(order.details);
    } catch (e) {
        details = {};
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/seller/orders" className="p-2 rounded-full hover:bg-gray-200">
                    <ArrowLeft className="h-6 w-6 text-gray-600" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Detalles de Entrega</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className="bg-white shadow rounded-lg p-6 space-y-4">
                    <div className="border-b pb-4">
                        <h2 className="text-xl font-semibold text-gray-800">{order.customerName}</h2>
                        <div className="flex items-center text-gray-600 mt-1">
                            <Building className="h-4 w-4 mr-2" />
                            <span>{order.company}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-start">
                            <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                            <p className="text-sm text-gray-600">{order.address}</p>
                        </div>
                        {details['Número de Teléfono'] && (
                            <div className="flex items-center">
                                <Phone className="h-5 w-5 text-gray-400 mr-2" />
                                <p className="text-sm text-gray-600">{details['Número de Teléfono']}</p>
                            </div>
                        )}
                        {details['Correo Electrónico'] && (
                            <div className="flex items-center">
                                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                                <p className="text-sm text-gray-600">{details['Correo Electrónico']}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md">
                        <h3 className="text-sm font-medium text-gray-900">Tipo de Regalo</h3>
                        <p className="mt-1 text-sm text-gray-600">{order.giftType}</p>

                        {details['¿Qué quieres hacer con tu regalo?'] && (
                            <p className="mt-2 text-xs text-gray-500">Preferencia: {details['¿Qué quieres hacer con tu regalo?']}</p>
                        )}
                    </div>
                </div>

                {/* Upload Section */}
                <EvidenceUploadForm order={order} />
            </div>
        </div>
    );
}
