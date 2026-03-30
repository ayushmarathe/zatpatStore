import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

function UserOrders() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [productImages, setProductImages] = useState({});

    // 🔥 Navigation Guard
    useEffect(() => {
        window.history.pushState(null, null, window.location.pathname);
        const handlePopState = () => {
            navigate("/users");
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [navigate]);

    const fetchOrders = async () => {
        try {
            const res = await api.get(`/api/orders/users/${username}`);
            setOrders(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchProductImage = async (productId) => {
        if (productImages[productId]) return;
        try {
            const res = await api.get(`/api/products/${productId}`);
            setProductImages((prev) => ({ ...prev, [productId]: res.data.imageUrl }));
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchOrders(); }, [username]);

    const userSummary = useMemo(() => ({
        count: orders.length,
        total: orders.reduce((sum, o) => sum + o.totalAmount, 0)
    }), [orders]);

    return (
        <div style={styles.container}>
            {/* ❌ Close Cross Button */}
            <button onClick={() => navigate("/users")} style={styles.closeCross} title="Back to Users">&times;</button>

            <header style={styles.header}>
                <div>
                    <h2 style={styles.heading}>Orders of <span style={{color: '#fff'}}>{username}</span></h2>
                    <p style={styles.subHeading}>Reviewing historical transaction data.</p>
                </div>
                <div style={styles.statsRow}>
                    <div style={styles.statItem}><span style={styles.statVal}>{userSummary.count}</span> Orders</div>
                    <div style={styles.statItem}><span style={{...styles.statVal, color: '#22c55e'}}>₹{userSummary.total.toLocaleString()}</span> Total Spent</div>
                </div>
            </header>

            <div style={styles.orderGrid}>
                {orders.length === 0 ? (
                    <div style={styles.emptyContainer}>No orders found for this user.</div>
                ) : (
                    orders.map(o => (
                        <div key={o.orderId} style={styles.card}>
                            <div style={styles.cardHeader}>
                                <div>
                                    <div style={styles.orderId}>Order #{o.orderId}</div>
                                    <div style={styles.orderDate}>{o.orderDate?.split('T')[0]}</div>
                                </div>
                                <span style={getStatusStyle(o.status)}>{o.status}</span>
                            </div>

                            <div style={styles.itemsBox}>
                                {o.items?.map((item) => {
                                    fetchProductImage(item.productId);
                                    return (
                                        <div key={item.productId} style={styles.itemRow}>
                                            <img 
                                                src={`http://localhost:8080/uploads/${productImages[item.productId]}`} 
                                                alt="" 
                                                style={styles.itemImage} 
                                                onError={e => e.target.src = "https://via.placeholder.com/50"} 
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div style={styles.itemName}>{item.productName}</div>
                                                <div style={styles.itemMeta}>{item.quantity} × ₹{item.price}</div>
                                            </div>
                                            <div style={styles.itemSubtotal}>₹{item.subtotal}</div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={styles.cardFooter}>
                                <div>
                                    <span style={styles.label}>Total Amount</span>
                                    <span style={styles.totalText}>₹{o.totalAmount}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

const getStatusStyle = (status) => {
    switch (status) {
        case "PLACED": return styles.placed;
        case "SHIPPED": return styles.shipped;
        case "DELIVERED": return styles.delivered;
        case "CANCELLED": return styles.cancelled;
        default: return {};
    }
};

const styles = {
    container: { position: "relative", padding: "60px 5% 40px", background: "#0f172a", minHeight: "100vh", color: "#f8fafc", fontFamily: "'Inter', sans-serif" },
    closeCross: { position: "fixed", top: "20px", right: "30px", background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", fontSize: "32px", width: "45px", height: "45px", borderRadius: "50%", cursor: "pointer", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" },
    heading: { fontSize: "28px", fontWeight: "800", margin: 0, color: "#64748b" },
    subHeading: { color: "#64748b", fontSize: "14px", marginTop: "4px" },
    statsRow: { display: "flex", gap: "12px" },
    statItem: { background: "#1e293b", padding: "10px 18px", borderRadius: "12px", border: "1px solid #334155", fontSize: "13px", color: "#94a3b8" },
    statVal: { color: "#fff", fontWeight: "800", fontSize: "16px", marginRight: "4px" },
    
    orderGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "25px" },
    card: { background: "#1e293b", borderRadius: "20px", padding: "24px", border: "1px solid #334155" }, // 🔥 Removed cursor and transition
    cardHeader: { display: "flex", justifyContent: "space-between", marginBottom: "20px", borderBottom: "1px solid #334155", paddingBottom: "12px" },
    orderId: { fontWeight: "700", color: "#fff" },
    orderDate: { fontSize: "11px", color: "#64748b" },
    
    itemsBox: { background: "#0f172a", padding: "12px", borderRadius: "14px", marginBottom: "20px" },
    itemRow: { display: "flex", alignItems: "center", gap: "12px", padding: "8px 0", borderBottom: "1px solid #1e293b" },
    itemImage: { width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px" },
    itemName: { fontSize: "13px", fontWeight: "600", color: "#f8fafc" },
    itemMeta: { fontSize: "11px", color: "#64748b" },
    itemSubtotal: { fontSize: "13px", fontWeight: "700", color: "#cbd5e1" },
    
    cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "flex-end" },
    label: { fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "700", display: "block", marginBottom: "4px" },
    totalText: { fontSize: "20px", fontWeight: "800", color: "#fff" },
    
    emptyContainer: { textAlign: "center", padding: "100px", color: "#475569", width: '100%' },
    placed: { background: "rgba(250, 204, 21, 0.1)", color: "#facc15", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "800" },
    shipped: { background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "800" },
    delivered: { background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "800" },
    cancelled: { background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "800" },
};

export default UserOrders;