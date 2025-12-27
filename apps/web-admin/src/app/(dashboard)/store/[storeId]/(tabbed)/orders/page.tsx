"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Search, Package, Eye, ChevronDown } from "lucide-react";
import Link from "next/link";

type Order = {
    id: string;
    created_at: string;
    total_amount: number;
    currency: string;
    status: string;
    payment_status: string;
    fulfillment_status: string;
    customer: {
        email: string;
        first_name: string | null;
        last_name: string | null;
    } | null;
    order_items: {
        id: string;
        quantity: number;
        product_name: string;
        image_url: string | null;
    }[];
};

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    fulfilled: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
    unfulfilled: "bg-orange-100 text-orange-800",
};

export default function OrdersList() {
    const params = useParams();
    const storeId = params.storeId as string;
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const supabase = createClient();

    useEffect(() => {
        fetchOrders();
    }, [storeId]);

    const fetchOrders = async () => {
        const { data, error } = await supabase
            .from("orders")
            .select(`
        *,
        customer:customers(email, first_name, last_name),
        order_items(id, quantity, product_name, image_url)
      `)
            .eq("store_id", storeId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching orders:", error);
        } else {
            setOrders(data || []);
        }
        setLoading(false);
    };

    const updateOrderStatus = async (orderId: string, field: string, value: string) => {
        const { error } = await supabase
            .from("orders")
            .update({ [field]: value })
            .eq("id", orderId);

        if (error) {
            alert("Error updating order: " + error.message);
        } else {
            fetchOrders();
        }
    };

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || order.fulfillment_status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency.toUpperCase(),
        }).format(amount / 100);
    };

    if (loading) return <div className="p-8">Loading orders...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
                    <p className="text-slate-500 text-sm mt-1">{orders.length} total orders</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-200 flex gap-4 items-center">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by order ID or customer..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="unfulfilled">Unfulfilled</option>
                        <option value="fulfilled">Fulfilled</option>
                    </select>
                </div>

                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Order
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Payment
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Fulfillment
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                                Total
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex -space-x-2">
                                            {order.order_items.slice(0, 2).map((item, idx) => (
                                                <div
                                                    key={item.id}
                                                    className="h-10 w-10 rounded-lg bg-slate-100 border-2 border-white overflow-hidden flex items-center justify-center"
                                                    style={{ zIndex: 2 - idx }}
                                                >
                                                    {item.image_url ? (
                                                        <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Package size={16} className="text-slate-400" />
                                                    )}
                                                </div>
                                            ))}
                                            {order.order_items.length > 2 && (
                                                <div className="h-10 w-10 rounded-lg bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600">
                                                    +{order.order_items.length - 2}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 font-mono text-sm">
                                                #{order.id.slice(0, 8).toUpperCase()}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {order.order_items.reduce((sum, i) => sum + i.quantity, 0)} items
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{formatDate(order.created_at)}</td>
                                <td className="px-6 py-4">
                                    {order.customer ? (
                                        <div>
                                            <p className="font-medium text-slate-900 text-sm">
                                                {order.customer.first_name} {order.customer.last_name}
                                            </p>
                                            <p className="text-xs text-slate-500">{order.customer.email}</p>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 text-sm">Guest</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.payment_status] || "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        {order.payment_status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        value={order.fulfillment_status}
                                        onChange={(e) => updateOrderStatus(order.id, "fulfillment_status", e.target.value)}
                                        className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${statusColors[order.fulfillment_status] || "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        <option value="unfulfilled">Unfulfilled</option>
                                        <option value="fulfilled">Fulfilled</option>
                                        <option value="partial">Partial</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 text-right font-semibold text-slate-900">
                                    {formatCurrency(order.total_amount, order.currency)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link
                                        href={`/store/${storeId}/orders/${order.id}`}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                    >
                                        <Eye size={14} /> View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {filteredOrders.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                    {orders.length === 0 ? "No orders yet" : "No orders match your search"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
