import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminOrderList from "@/components/AdminOrderList";

export default async function ValidationsPage() {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    const allOrders = await prisma.order.findMany({
        where: {
            status: {
                in: ['IN_REVIEW', 'VALIDATED']
            }
        },
        include: {
            seller: {
                select: {
                    name: true,
                    email: true,
                }
            }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    // Get unique sellers for the filter
    const uniqueSellers = Array.from(new Set(allOrders.map((o: any) => o.seller.name).filter(Boolean))) as string[];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Validación de Entregas</h1>
            </div>

            <AdminOrderList orders={allOrders} sellers={uniqueSellers} />
        </div>
    );
}
