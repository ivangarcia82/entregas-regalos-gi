import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import SellerOrderList from "@/components/SellerOrderList";

export default async function SellerOrdersPage() {
    const session = await getServerSession(authOptions);

    const orders = await prisma.order.findMany({
        where: {
            sellerId: session?.user?.id,
        },
        orderBy: {
            createdAt: 'desc' // or any other order
        }
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Mis Entregas Asignadas</h1>

            <SellerOrderList orders={orders} />
        </div>
    );
}
