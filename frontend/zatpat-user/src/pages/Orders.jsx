import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState("LIVE");
    const navigate = useNavigate();

    const fetchOrders = useCallback(async () => {
        try {
            const res = await api.get("/api/orders");
            setOrders(res.data);
        } catch (err) { console.error(err); }
    }, []);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 3000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const cancelOrder = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Cancel this order?")) return;
        try {
            await api.put(`/api/orders/${id}/cancel`);
            fetchOrders();
        } catch (err) { alert("Cancellation failed."); }
    };

    const filteredOrders = orders.filter(o => {
        if (filterStatus === "ALL") return true;
        if (filterStatus === "LIVE") return o.status === "PLACED" || o.status === "SHIPPED";
        if (filterStatus === "COMPLETED") return o.status === "DELIVERED";
        if (filterStatus === "CANCELLED") return o.status === "CANCELLED";
        return true;
    });

    return (
        <div style={styles.container}>
            {/* 🔥 FIXED CLOSE CROSS - NOW REDIRECTS TO /HOME */}
            <button 
                onClick={() => navigate("/home")} 
                style={styles.closeCross}
                title="Back to Home"
            >
                &times;
            </button>

            <div style={styles.centeredWrapper}>
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Zatpat <span style={{color: '#6366f1'}}>Orders</span></h1>
                        <p style={styles.subHeading}>Fresh delivered fast • Live tracking</p>
                    </div>
                    <div style={styles.liveIndicator}>
                        <div style={styles.pulseDot} /> Data is Live
                    </div>
                </header>

                <nav style={styles.tabBar}>
                    {["LIVE", "COMPLETED", "ALL", "CANCELLED"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilterStatus(tab)}
                            style={filterStatus === tab ? styles.activeTab : styles.tab}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>

                <div style={styles.grid}>
                    {filteredOrders.length === 0 ? (
                        <div style={styles.emptyMsg}>No {filterStatus.toLowerCase()} orders at the moment.</div>
                    ) : (
                        filteredOrders.map(o => (
                            <div 
                                key={o.orderId} 
                                style={styles.card}
                                onClick={() => navigate(`/orders/${o.orderId}`)}
                            >
                                <div style={styles.cardHeader}>
                                    <div>
                                        <span style={styles.orderLabel}>ORDER ID</span>
                                        <h3 style={styles.orderId}>#{o.orderId}</h3>
                                    </div>
                                    <div style={getStatusTag(o.status)}>{o.status}</div>
                                </div>

                                <div style={styles.trackerWrapper}>
                                    <div style={styles.trackerLine} />
                                    <div style={{...styles.progressFill, width: getProgress(o.status)}} />
                                    <div style={styles.stepsRow}>
                                        {[0, 1, 2].map((i) => (
                                            <div key={i} style={{
                                                ...styles.dot,
                                                background: isDone(i, o.status) ? "#6366f1" : "#1e293b",
                                                boxShadow: isDone(i, o.status) ? "0 0 8px #6366f1" : "none"
                                            }} />
                                        ))}
                                    </div>
                                </div>

                                <div style={styles.itemsList}>
                                    {o.items.map((item, idx) => (
                                        <div key={idx} style={styles.itemRow}>
                                            <span>{item.productName} <span style={{fontSize: '10px', opacity: 0.6}}>x{item.quantity}</span></span>
                                            <span>₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                <div style={styles.cardFooter}>
                                    <div>
                                        <span style={styles.totalLabel}>Grand Total</span>
                                        <span style={styles.priceText}>₹{o.totalAmount}</span>
                                    </div>
                                    {o.status === "PLACED" && (
                                        <button style={styles.cancelBtn} onClick={(e) => cancelOrder(e, o.orderId)}>
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// --- HELPERS ---
const getProgress = (s) => (s === "PLACED" ? "0%" : s === "SHIPPED" ? "50%" : "100%");
const isDone = (idx, current) => {
    const map = { "PLACED": 0, "SHIPPED": 1, "DELIVERED": 2 };
    return idx <= map[current];
};

const getStatusTag = (status) => {
    const base = { padding: "4px 10px", borderRadius: "8px", fontSize: "10px", fontWeight: "900" };
    if (status === "CANCELLED") return { ...base, background: "rgba(239,68,68,0.1)", color: "#ef4444" };
    if (status === "DELIVERED") return { ...base, background: "rgba(34,197,94,0.1)", color: "#22c55e" };
    return { ...base, background: "rgba(99,102,241,0.1)", color: "#6366f1" };
};

// --- STYLES ---
const styles = {
    container: { minHeight: "100vh", background: "#020617", color: "#fff", padding: "60px 20px", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    centeredWrapper: { maxWidth: "1100px", margin: "0 auto" },
    
    closeCross: { 
        position: "fixed", 
        top: "25px", 
        right: "30px", 
        background: "rgba(255,255,255,0.05)", 
        border: "1px solid rgba(255,255,255,0.1)", 
        color: "#94a3b8", 
        fontSize: "32px", 
        width: "50px", 
        height: "50px", 
        borderRadius: "15px", 
        cursor: "pointer", 
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease"
    },

    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" },
    title: { fontSize: "32px", fontWeight: "900", margin: 0, letterSpacing: "-1px" },
    subHeading: { color: "#64748b", fontSize: "14px", marginTop: "5px" },
    liveIndicator: { display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#64748b", fontWeight: "600" },
    pulseDot: { width: "8px", height: "8px", background: "#22c55e", borderRadius: "50%", boxShadow: "0 0 10px #22c55e" },

    tabBar: { display: "flex", gap: "12px", marginBottom: "32px", background: "rgba(255,255,255,0.03)", padding: "8px", borderRadius: "18px", width: "fit-content" },
    tab: { background: "none", border: "none", color: "#64748b", cursor: "pointer", fontWeight: "700", padding: "12px 24px", borderRadius: "12px", fontSize: "13px" },
    activeTab: { background: "#6366f1", border: "none", color: "#fff", cursor: "pointer", fontWeight: "700", padding: "12px 24px", borderRadius: "12px", fontSize: "13px", boxShadow: "0 8px 15px rgba(99, 102, 241, 0.2)" },

    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" },
    card: { background: "rgba(255,255,255,0.03)", borderRadius: "28px", padding: "24px", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", display: "flex", flexDirection: "column", minHeight: "460px", transition: "transform 0.2s" },
    cardHeader: { display: "flex", justifyContent: "space-between", marginBottom: "24px" },
    orderLabel: { fontSize: "10px", color: "#64748b", fontWeight: "800", letterSpacing: "1.5px" },
    orderId: { margin: "4px 0 0 0", fontSize: "20px", fontWeight: "800" },

    trackerWrapper: { position: "relative", margin: "24px 0" },
    trackerLine: { height: "2px", background: "#1e293b", width: "100%", position: "absolute", top: "4px" },
    progressFill: { height: "2px", background: "#6366f1", position: "absolute", top: "4px", transition: "width 0.8s ease" },
    stepsRow: { display: "flex", justifyContent: "space-between", position: "relative" },
    dot: { width: "10px", height: "10px", borderRadius: "50%", border: "2px solid #020617" },

    itemsList: { flex: 1, background: "rgba(0,0,0,0.3)", borderRadius: "20px", padding: "18px", marginBottom: "24px", overflowY: "auto", maxHeight: "140px", scrollbarWidth: "none" },
    itemRow: { display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "10px", color: "#f1f5f9" },
    
    cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "flex-end" },
    totalLabel: { fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", display: "block", marginBottom: "4px" },
    priceText: { fontSize: "26px", fontWeight: "900", color: "#4ade80" },
    cancelBtn: { background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#ef4444", padding: "10px 18px", borderRadius: "12px", fontWeight: "700", cursor: "pointer", fontSize: "12px" },
    emptyMsg: { textAlign: "center", padding: "100px 0", color: "#475569", gridColumn: "1 / -1", fontSize: "18px" }
};

export default Orders;