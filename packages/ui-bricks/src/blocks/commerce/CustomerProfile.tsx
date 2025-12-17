"use client";

import { useState } from 'react';
import styles from './CustomerProfile.module.css';
import { User, Package, LogOut } from 'lucide-react';

interface CustomerProfileProps {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
}

export const CustomerProfile = ({
    backgroundColor,
    textColor,
    accentColor
}: CustomerProfileProps) => {
    // Mock data for preview
    const customer = {
        firstName: "Guest",
        email: "guest@example.com"
    };

    const orders = [
        { id: "ORD-123", date: "2023-12-01", total: "$120.00", status: "Delivered" },
        { id: "ORD-124", date: "2023-11-15", total: "$45.00", status: "Processing" }
    ];

    const customStyles = {
        '--profile-bg': backgroundColor,
        '--profile-text': textColor,
        '--profile-accent': accentColor,
    } as React.CSSProperties;

    return (
        <section className={styles.section} style={customStyles}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.avatar}>
                        <User size={32} />
                    </div>
                    <div className={styles.info}>
                        <h2 className={styles.name}>Welcome, {customer.firstName}</h2>
                        <p className={styles.email}>{customer.email}</p>
                    </div>
                    <button className={styles.logoutBtn}>
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>

                <div className={styles.content}>
                    <h3 className={styles.sectionTitle}>Order History</h3>
                    <div className={styles.ordersList}>
                        {orders.map(order => (
                            <div key={order.id} className={styles.orderCard}>
                                <div className={styles.orderHeader}>
                                    <span className={styles.orderId}>#{order.id}</span>
                                    <span className={`${styles.status} ${styles[order.status.toLowerCase()]}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className={styles.orderDetails}>
                                    <span>{order.date}</span>
                                    <span className={styles.total}>{order.total}</span>
                                </div>
                                <button className={styles.viewBtn}>View Details</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
