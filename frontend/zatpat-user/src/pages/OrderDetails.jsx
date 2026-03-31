import React, { useEffect, useState, useCallback } from "react"; // Added useCallback
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🔥 1. Wrap fetch in useCallback so it's stable for the interval
    const fetchOrder = useCallback((isInitial = false) => {
        if (isInitial) setLoading(true);
        
        api.get(`/api/orders/${id}`)
            .then(res => {
                setOrder(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Tracking error:", err);
                // Only redirect on initial failure to avoid kicking user out during a temporary glitch
                if (isInitial) {
                    alert("Order not found");
                    navigate("/");
                }
            });
    }, [id, navigate]);

    // 🔥 2. Effect for Initial Load & Polling
    useEffect(() => {
        window.scrollTo(0, 0);
        
        // Initial fetch
        fetchOrder(true);

        // Set up the 3-second refresh interval
        const interval = setInterval(() => {
            fetchOrder(false); // background refresh (no loading spinner)
        }, 3000);

        // 🔥 3. Cleanup: This stops the timer when the user leaves the page
        return () => clearInterval(interval);
    }, [fetchOrder]);

    const handleCancel = () => {
        if (window.confirm("Are you sure you want to cancel this order?")) {
            api.put(`/api/orders/${id}/cancel`)
                .then(() => {
                    alert("Order Cancelled Successfully");
                    fetchOrder(false); // Refresh data immediately after action
                })
                .catch(() => alert("Cancellation failed. Item might already be shipped."));
        }
    };

    if (loading) return <div style={styles.loading}>Connecting to Zatpat Tracker...</div>;
    if (!order) return null; // Safety check

    const getStatusInfo = (status) => {
        switch (status) {
            case "PLACED": return { msg: "Zatpat partner is packing your items", progress: "20%", icon: "📦" };
            case "SHIPPED": return { msg: "Out for delivery! Arriving soon", progress: "65%", icon: "🚴" };
            case "DELIVERED": return { msg: "Order delivered! Enjoy your meal", progress: "100%", icon: "🏠" };
            case "CANCELLED": return { msg: "Order was cancelled", progress: "0%", icon: "❌" };
            default: return { msg: "Processing...", progress: "0%", icon: "⏳" };
        }
    };

    const info = getStatusInfo(order.status);

    return (
        <div style={styles.container}>
            {/* ... rest of your UI code remains exactly the same ... */}
            <div style={styles.wrapper}>
                <header style={styles.header}>
                    <button onClick={() => navigate(-1)} style={styles.backBtn}>←</button>
                    <h2 style={styles.orderIdText}>Order #{order.orderId || order.id}</h2>
                </header>

                <div style={styles.trackerCard}>
                    <div style={styles.mapSimulation}>
                        <div style={styles.mapLine} />
                        <div style={{
                            ...styles.riderIcon,
                            left: info.progress,
                            animation: order.status === "SHIPPED" ? "bikeTilt 1s infinite" : "none"
                        }}>
                            <span style={{ fontSize: '32px' }}>{info.icon}</span>
                            <div style={styles.pulse} />
                        </div>
                    </div>
                    <div style={styles.statusContent}>
                        <h3 style={styles.statusMsg}>{info.msg}</h3>
                        <p style={styles.statusSub}>
                            Status: <span style={{ color: '#818cf8', fontWeight: 'bold' }}>{order.status}</span>
                        </p>
                    </div>
                </div>
                {/* ... item mapping and totals ... */}
                {order.status === "PLACED" && (
                     <button style={styles.cancelBtn} onClick={handleCancel}>Cancel Order</button>
                )}

                <div style={styles.itemsSection}>
                    <h4 style={styles.sectionTitle}>Order Summary</h4>
                    {order.items?.map((item, index) => (
                        <div key={item.id || index} style={styles.itemRow}>
                            <div style={styles.itemImgWrapper}>
                                <img
                                    src={`http://localhost:8080/uploads/${item.imageUrl || item.productImageUrl}`}
                                    alt=""
                                    style={styles.itemImg}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentNode.style.background = '#1e293b';
                                    }}
                                />
                            </div>
                            <div style={styles.itemMeta}>
                                <span style={styles.itemName}>{item.productName || item.name}</span>
                                <span style={styles.itemQty}>x{item.quantity}</span>
                            </div>
                            <span style={styles.itemPrice}>
                                ₹{(item.priceAtPurchase || item.price || 0) * item.quantity}
                            </span>
                        </div>
                    ))}

                    <div style={styles.divider} />

                    <div style={styles.totalRow}>
                        <span>Total Bill</span>
                        <span>₹{order.totalAmount}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Styles remain the same...
const styles = {
    // ... paste your existing styles here ...
    container: { minHeight: "100vh", background: "#020617", color: "#fff", padding: "24px 16px", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    wrapper: { maxWidth: "500px", margin: "0 auto" },
    header: { display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px" },
    backBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", width: "45px", height: "45px", borderRadius: "50%", cursor: "pointer", fontSize: "18px" },
    orderIdText: { fontSize: "20px", fontWeight: "800", margin: 0 },
    trackerCard: { background: "rgba(255,255,255,0.03)", borderRadius: "28px", padding: "24px", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "20px" },
    mapSimulation: { position: "relative", height: "100px", background: "rgba(0,0,0,0.3)", borderRadius: "20px", marginBottom: "24px", display: "flex", alignItems: "center", padding: "0 30px" },
    mapLine: { width: "100%", height: "2px", background: "rgba(255,255,255,0.1)", borderRadius: "2px" },
    riderIcon: { position: "absolute", transition: "left 2s ease-in-out", display: "flex", flexDirection: "column", alignItems: "center", transform: "translateX(-50%)" },
    pulse: { width: "8px", height: "8px", background: "#6366f1", borderRadius: "50%", marginTop: "4px", boxShadow: "0 0 12px #6366f1" },
    statusContent: { textAlign: "center" },
    statusMsg: { fontSize: "18px", fontWeight: "800", marginBottom: "8px", lineHeight: '1.4' },
    statusSub: { fontSize: "14px", color: "#64748b" },
    cancelBtn: { width: "100%", padding: "18px", borderRadius: "18px", background: "rgba(239, 68, 68, 0.05)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)", fontWeight: "700", cursor: "pointer", marginBottom: "32px", fontSize: "15px" },
    itemsSection: { background: "rgba(255,255,255,0.02)", borderRadius: "28px", padding: "24px", border: "1px solid rgba(255,255,255,0.03)" },
    sectionTitle: { fontSize: "12px", color: "#64748b", textTransform: "uppercase", marginBottom: "24px", letterSpacing: "1.5px", fontWeight: "700" },
    itemRow: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" },
    itemImgWrapper: { width: "50px", height: "50px", borderRadius: "12px", background: "#fff", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' },
    itemImg: { width: "100%", height: "100%", objectFit: "contain" },
    itemMeta: { flex: 1, display: "flex", flexDirection: "column", gap: '2px' },
    itemName: { fontSize: "14px", fontWeight: "600", color: "#f1f5f9" },
    itemQty: { fontSize: "12px", color: "#64748b" },
    itemPrice: { fontWeight: "700", fontSize: "14px" },
    divider: { height: "1px", background: "rgba(255,255,255,0.05)", margin: "20px 0" },
    totalRow: { display: "flex", justifyContent: "space-between", fontSize: "20px", fontWeight: "800", color: "#4ade80" },
    loading: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", color: "#818cf8", fontWeight: "bold" }
};

export default OrderDetails;