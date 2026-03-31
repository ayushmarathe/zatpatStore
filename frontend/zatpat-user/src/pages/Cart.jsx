import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Cart() {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [showQR, setShowQR] = useState(false); // 🔥 State for Overlay

    const placeOrder = async (method) => {
        if (cart.length === 0) return;
        setLoading(true);

        try {
            const payload = {
                paymentMethod: method,
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                }))
            };

            const res = await api.post("/api/orders", payload);
            const newOrderId = res.data.orderId || res.data.id;

            localStorage.removeItem("cart");
            setCart([]);
            setShowQR(false); // Close modal if open

            navigate(`/orders/${newOrderId}`);

        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Order failed.");
        } finally {
            setLoading(false);
        }
    };

    // Load cart from LocalStorage
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(stored);
    }, []);

    const updateCart = (newCart) => {
        setCart(newCart);
        localStorage.setItem("cart", JSON.stringify(newCart));
    };

    const increase = (id) => {
        const updated = cart.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item);
        updateCart(updated);
    };

    const decrease = (id) => {
        const updated = cart.map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item).filter(item => item.quantity > 0);
        updateCart(updated);
    };

    const removeItem = (id) => {
        const updated = cart.filter(item => item.id !== id);
        updateCart(updated);
    };

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <button onClick={() => navigate(-1)} style={styles.backBtn}>←</button>
                <div style={styles.headerText}>
                    <h2 style={styles.headerTitle}>Review Cart</h2>
                    <span style={styles.itemCount}>{cart.length} items ready</span>
                </div>
                <div style={{ width: "40px" }} />
            </header>

            {cart.length === 0 ? (
                <div style={styles.emptyBox}>
                    <div style={styles.emptyIcon}>🛍️</div>
                    <h3 style={styles.emptyTitle}>Your bag is empty</h3>
                    <button onClick={() => navigate("/Home")} style={styles.shopBtn}>Browse Store</button>
                </div>
            ) : (
                <div style={styles.mainLayout}>
                    <div style={styles.list}>
                        {cart.map(item => (
                            <div key={item.id} style={styles.card}>
                                <div style={styles.imgWrapper}>
                                    <img src={`http://localhost:8080/uploads/${item.imageUrl}`} alt={item.name} style={styles.image} />
                                </div>
                                <div style={styles.details}>
                                    <h4 style={styles.name}>{item.name}</h4>
                                    <p style={styles.price}>₹{item.price}</p>
                                    <div style={styles.qtyContainer}>
                                        <button style={styles.qtyBtn} onClick={() => decrease(item.id)}>−</button>
                                        <span style={styles.qtyText}>{item.quantity}</span>
                                        <button style={styles.qtyBtn} onClick={() => increase(item.id)}>+</button>
                                    </div>
                                </div>
                                <div style={styles.cardRight}>
                                    <button style={styles.removeIcon} onClick={() => removeItem(item.id)}>✕</button>
                                    <span style={styles.subtotal}>₹{item.price * item.quantity}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={styles.billBox}>
                        <h4 style={styles.billTitle}>Bill Summary</h4>
                        <div style={styles.row}><span>Item Total</span><span>₹{total}</span></div>
                        <div style={styles.row}><span>Delivery</span><span style={{ color: "#22c55e", fontWeight: "800" }}>FREE</span></div>
                        <div style={styles.totalRow}><span>To Pay</span><span>₹{total}</span></div>
                    </div>

                    <div style={styles.paymentBox}>
                        <h4 style={styles.billTitle}>Payment Method</h4>
                        <div style={styles.paymentOptions}>
                            <button style={paymentMethod === "COD" ? styles.activePM : styles.pmBtn} onClick={() => setPaymentMethod("COD")}>💵 COD</button>
                            <button style={paymentMethod === "ONLINE" ? styles.activePM : styles.pmBtn} onClick={() => setPaymentMethod("ONLINE")}>📱 QR Online</button>
                        </div>
                    </div>

                    {/* 🔥 DYNAMIC CHECKOUT BAR */}
                    <div style={styles.checkoutBar}>
                        <div style={styles.priceInfo}>
                            <p style={styles.finalLabel}>GRAND TOTAL</p>
                            <h3 style={styles.finalAmount}>₹{total}</h3>
                        </div>
                        <button
                            style={{ ...styles.checkoutBtn, opacity: loading ? 0.7 : 1 }}
                            onClick={() => {
                                if (paymentMethod === "ONLINE") setShowQR(true); // Open Overlay
                                else placeOrder("COD");
                            }}
                            disabled={loading}
                        >
                            {loading ? "Processing..." : (paymentMethod === "COD" ? "Place Order →" : "Pay & Checkout →")}
                        </button>
                    </div>
                </div>
            )}

            {/* 🔥 QR OVERLAY MODAL */}
            {showQR && (
                <div style={styles.overlay}>
                    <div style={styles.qrCard}>
                        <button style={styles.closeModal} onClick={() => setShowQR(false)}>&times;</button>
                        <h3 style={{ margin: '0 0 10px' }}>Scan to Pay</h3>
                        <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '20px' }}>Zatpat Store Merchant QR</p>
                        
                        <div style={styles.qrBox}>
                            {/* Dummy QR Code Placeholder */}
                            <img 
                                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ZatpatStoreDummyPayment" 
                                alt="Payment QR" 
                                style={styles.qrImg}
                            />
                            <div style={styles.qrOverlayText}>DUMMY QR</div>
                        </div>

                        <div style={styles.paymentNote}>
                            <p>Amount: <strong>₹{total}</strong></p>
                        </div>

                        <button 
                            style={styles.finalPayBtn} 
                            onClick={() => placeOrder("ONLINE")}
                            disabled={loading}
                        >
                            {loading ? "Verifying..." : "I have Paid"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    // ... all your previous styles kept exactly the same ...
    container: { minHeight: "100vh", background: "radial-gradient(circle at top, #1e293b 0%, #020617 100%)", color: "#fff", padding: "24px 16px", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" },
    backBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", width: "45px", height: "45px", borderRadius: "14px", cursor: "pointer", fontSize: "18px" },
    headerText: { textAlign: "center" },
    headerTitle: { margin: 0, fontSize: "20px", fontWeight: "800" },
    itemCount: { fontSize: "12px", color: "#64748b" },
    emptyBox: { textAlign: "center", marginTop: "120px" },
    emptyIcon: { fontSize: "64px", marginBottom: "20px" },
    emptyTitle: { fontSize: "22px", fontWeight: "800", marginBottom: "8px" },
    shopBtn: { background: "#6366f1", border: "none", color: "#fff", padding: "16px 32px", borderRadius: "18px", fontWeight: "700", cursor: "pointer" },
    mainLayout: { maxWidth: "600px", margin: "0 auto", paddingBottom: "160px" },
    list: { display: "flex", flexDirection: "column", gap: "16px" },
    card: { display: "flex", gap: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "24px", padding: "16px", border: "1px solid rgba(255,255,255,0.08)" },
    imgWrapper: { width: "70px", height: "70px", background: "#fff", borderRadius: "16px", padding: "6px" },
    image: { width: "100%", height: "100%", objectFit: "contain" },
    details: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" },
    name: { margin: "0 0 4px 0", fontSize: "15px", fontWeight: "600", color: "#f8fafc" },
    price: { margin: 0, color: "#94a3b8", fontSize: "13px" },
    qtyContainer: { marginTop: "10px", display: "flex", alignItems: "center", gap: "16px", background: "rgba(255,255,255,0.05)", width: "fit-content", padding: "5px 14px", borderRadius: "12px" },
    qtyBtn: { background: "none", border: "none", color: "#fff", fontSize: "18px", cursor: "pointer" },
    qtyText: { fontWeight: "800", fontSize: "14px" },
    cardRight: { display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end" },
    removeIcon: { background: "none", border: "none", color: "#ef4444", fontSize: "14px", cursor: "pointer" },
    subtotal: { fontWeight: "800", fontSize: "16px", color: "#4ade80" },
    billBox: { marginTop: "32px", padding: "24px", background: "rgba(255,255,255,0.02)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)" },
    billTitle: { margin: "0 0 20px 0", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#64748b", fontWeight: "700" },
    row: { display: "flex", justifyContent: "space-between", marginBottom: "14px", fontSize: "15px", color: "#cbd5e1" },
    totalRow: { display: "flex", justifyContent: "space-between", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: "18px", fontWeight: "900" },
    paymentBox: { marginTop: "20px", padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)" },
    paymentOptions: { display: "flex", gap: "10px" },
    pmBtn: { flex: 1, padding: "12px", borderRadius: "12px", background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", cursor: "pointer" },
    activePM: { flex: 1, padding: "12px", borderRadius: "12px", background: "#6366f1", border: "1px solid #6366f1", color: "#fff", cursor: "pointer", fontWeight: "700" },
    checkoutBar: { position: "fixed", bottom: "0", left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "600px", background: "#020617", borderTop: "1px solid rgba(255,255,255,0.1)", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 100, borderTopLeftRadius: "30px", borderTopRightRadius: "30px" },
    priceInfo: { display: "flex", flexDirection: "column" },
    finalLabel: { margin: 0, fontSize: "10px", fontWeight: "800", color: "#64748b" },
    finalAmount: { margin: 0, fontSize: "24px", fontWeight: "900", color: "#4ade80" },
    checkoutBtn: { background: "#6366f1", border: "none", color: "#fff", padding: "16px 36px", borderRadius: "18px", fontWeight: "800", fontSize: "16px", cursor: "pointer" },

    /* 🔥 NEW MODAL STYLES */
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(10px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000
    },
    qrCard: {
        background: "#1e293b",
        width: "90%",
        maxWidth: "360px",
        padding: "30px",
        borderRadius: "32px",
        textAlign: "center",
        position: "relative",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
    },
    closeModal: {
        position: "absolute",
        top: "20px",
        right: "20px",
        background: "none",
        border: "none",
        color: "#fff",
        fontSize: "24px",
        cursor: "pointer"
    },
    qrBox: {
        background: "#fff",
        padding: "15px",
        borderRadius: "20px",
        display: "inline-block",
        position: "relative",
        marginBottom: "20px"
    },
    qrImg: { width: "180px", height: "180px", display: "block" },
    qrOverlayText: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%) rotate(-15deg)",
        background: "rgba(99, 102, 241, 0.9)",
        color: "#fff",
        padding: "4px 10px",
        borderRadius: "5px",
        fontSize: "12px",
        fontWeight: "900",
        pointerEvents: "none"
    },
    paymentNote: { marginBottom: "25px", color: "#fff", fontSize: "16px" },
    finalPayBtn: {
        width: "100%",
        padding: "16px",
        borderRadius: "16px",
        background: "#22c55e",
        border: "none",
        color: "#fff",
        fontWeight: "800",
        fontSize: "16px",
        cursor: "pointer",
        boxShadow: "0 4px 15px rgba(34, 197, 94, 0.3)"
    }
};

export default Cart;