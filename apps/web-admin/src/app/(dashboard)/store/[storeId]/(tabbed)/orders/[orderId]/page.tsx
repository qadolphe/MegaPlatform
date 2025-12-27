"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Package, MapPin, CreditCard, Truck, CheckCircle } from "lucide-react";
import Link from "next/link";

type OrderDetail = {
    id: string;
    created_at: string;
    updated_at: string;
    total_amount: number;
    subtotal_amount: number;
    shipping_amount: number;
    tax_amount: number;
    currency: string;
    status: string;
    payment_status: string;
    fulfillment_status: string;
    shipping_address: any;
    billing_address: any;
    stripe_payment_intent_id: string | null;
    customer: {
        id: string;
        email: string;
        first_name: string | null;
        last_name: string | null;
        phone: string | null;
    } | null;
    order_items: {
        id: string;
        quantity: number;
        price_at_purchase: number;
        product_name: string;
        variant_name: string | null;
        image_url: string | null;
        product_id: string | null;
    }[];
};

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    paid: "bg-green-100 text-green-800 border-green-200",
    fulfilled: "bg-blue-100 text-blue-800 border-blue-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    refunded: "bg-gray-100 text-gray-800 border-gray-200",
    unfulfilled: "bg-orange-100 text-orange-800 border-orange-200",
};

export default function OrderDetail() {
    const params = useParams();
    const router = useRouter();
    const storeId = params.storeId as string;
    const orderId = params.orderId as string;
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        const { data, error } = await supabase
            .from("orders")
            .select(`
        *,
        customer:customers(id, email, first_name, last_name, phone),
        order_items(id, quantity, price_at_purchase, product_name, variant_name, image_url, product_id)
      `)
            .eq("id", orderId)
            .single();

        if (error) {
            console.error("Error fetching order:", error);
            router.push(`/store/${storeId}/orders`);
        } else {
            setOrder(data);
        }
        setLoading(false);
    };

    const updateStatus = async (field: string, value: string) => {
        const { error } = await supabase
            .from("orders")
            .update({ [field]: value, updated_at: new Date().toISOString() })
            .eq("id", orderId);

        if (error) {
            alert("Error updating order: " + error.message);
        } else {
            fetchOrder();
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (amount: number, currency: string = "usd") => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency.toUpperCase(),
        }).format(amount / 100);
    };

    const formatAddress = (address: any) => {
        if (!address) return null;
        return [
            address.line1,
            address.line2,
            `${address.city}, ${address.state} ${address.postal_code}`,
            address.country,
        ]
            .filter(Boolean)
            .join("\n");
    };

    if (loading) return <div className="p-8">Loading order...</div>;
    if (!order) return <div className="p-8">Order not found</div>;

    return (
        <div className="max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/store/${storeId}/orders`}
                        className="p-2 hover:bg-slate-100 rounded-full transition"
                    >
                        <ArrowLeft size={20} className="text-slate-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 font-mono">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                        </h1>
                        <p className="text-slate-500 text-sm">{formatDate(order.created_at)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[order.payment_status] || "bg-gray-100"
                            }`}
                    >
                        {order.payment_status}
                    </span>
                    <select
                        value={order.fulfillment_status}
                        onChange={(e) => updateStatus("fulfillment_status", e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm font-medium border cursor-pointer ${statusColors[order.fulfillment_status] || "bg-gray-100"
                            }`}
                    >
                        <option value="unfulfilled">Unfulfilled</option>
                        <option value="fulfilled">Fulfilled</option>
                        <option value="partial">Partial</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Order Items */}
                <div className="col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                            <Package size={18} className="text-slate-400" />
                            <h2 className="font-semibold text-slate-900">Order Items</h2>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {order.order_items.map((item) => (
                                <div key={item.id} className="p-4 flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <Package size={24} className="text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900">{item.product_name}</p>
                                        {item.variant_name && (
                                            <p className="text-sm text-slate-500">{item.variant_name}</p>
                                        )}
                                        <p className="text-sm text-slate-400">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-slate-900">
                                            {formatCurrency(item.price_at_purchase * item.quantity, order.currency)}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {formatCurrency(item.price_at_purchase, order.currency)} each
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Totals */}
                        <div className="bg-slate-50 px-6 py-4 space-y-2 border-t border-slate-200">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Subtotal</span>
                                <span className="text-slate-900">
                                    {formatCurrency(order.subtotal_amount, order.currency)}
                                </span>
                            </div>
                            {order.shipping_amount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Shipping</span>
                                    <span className="text-slate-900">
                                        {formatCurrency(order.shipping_amount, order.currency)}
                                    </span>
                                </div>
                            )}
                            {order.tax_amount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Tax</span>
                                    <span className="text-slate-900">
                                        {formatCurrency(order.tax_amount, order.currency)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-slate-200">
                                <span className="text-slate-900">Total</span>
                                <span className="text-slate-900">
                                    {formatCurrency(order.total_amount, order.currency)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline / Actions */}
                    {order.fulfillment_status === "unfulfilled" && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Truck size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">Ready to fulfill?</p>
                                        <p className="text-sm text-slate-500">
                                            Mark this order as fulfilled when shipped
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => updateStatus("fulfillment_status", "fulfilled")}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                                >
                                    <CheckCircle size={16} />
                                    Mark Fulfilled
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-900 text-sm">Customer</h3>
                        </div>
                        <div className="p-4">
                            {order.customer ? (
                                <div>
                                    <p className="font-medium text-slate-900">
                                        {order.customer.first_name} {order.customer.last_name}
                                    </p>
                                    <p className="text-sm text-slate-500">{order.customer.email}</p>
                                    {order.customer.phone && (
                                        <p className="text-sm text-slate-500">{order.customer.phone}</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-slate-400 text-sm">Guest checkout</p>
                            )}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shipping_address && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                                <MapPin size={14} className="text-slate-400" />
                                <h3 className="font-semibold text-slate-900 text-sm">Shipping Address</h3>
                            </div>
                            <div className="p-4">
                                <p className="text-sm text-slate-600 whitespace-pre-line">
                                    {formatAddress(order.shipping_address)}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Payment */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                            <CreditCard size={14} className="text-slate-400" />
                            <h3 className="font-semibold text-slate-900 text-sm">Payment</h3>
                        </div>
                        <div className="p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Status</span>
                                <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[order.payment_status] || "bg-gray-100"
                                        }`}
                                >
                                    {order.payment_status}
                                </span>
                            </div>
                            {order.stripe_payment_intent_id && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Payment ID</span>
                                    <span className="font-mono text-xs text-slate-600">
                                        {order.stripe_payment_intent_id.slice(0, 12)}...
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
