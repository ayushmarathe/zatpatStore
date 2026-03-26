import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

function Bill() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);

    // 🔥 Navigation Guard
    useEffect(() => {
        window.history.pushState(null, null, window.location.pathname);
        const handlePopState = () => {
            navigate("/orders");
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [navigate]);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await api.get(`/api/orders/${id}`);
                setOrder(res.data);
            } catch (err) {
                console.error("Error fetching order:", err);
            }
        };
        fetchOrder();
    }, [id]);

    if (!order) return <div style={styles.loader}>Generating Invoice...</div>;

    return (
        <div style={styles.container}>
            {/* ❌ Close Cross Button */}
            <button onClick={() => navigate("/orders")} style={styles.closeCross} title="Exit to Orders">
                &times;
            </button>

            {/* 🖨️ Print Action Bar */}
            <div style={styles.noPrintNav}>
                <button onClick={() => window.print()} style={styles.printBtn}>
                    <span>🖨️</span> Print Invoice
                </button>
            </div>

            {/* 📄 The Bill (Paper Style) */}
            <div style={styles.billCard} className="printable-content">
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.brand}>ZATPAT STORE</h1>
                        <p style={styles.subText}>Narhe, Pune</p>
                        <p style={styles.subText}>support@zatpatstore.com</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <h2 style={styles.invoiceTitle}>INVOICE</h2>
                        <p style={styles.invoiceId}>#{order.orderId}</p>
                        <p style={styles.subText}>Issued: {order.orderDate?.split('T')[0]}</p>
                    </div>
                </header>

                <div style={styles.divider} />

                <div style={styles.billingRow}>
                    <div>
                        <h4 style={styles.sectionLabel}>Customer Details</h4>
                        <p style={styles.detailText}><strong>ID:</strong> {order.customerId || "Walk-in Customer"}</p>
                        <p style={styles.detailText}><strong>Order Status:</strong> {order.status}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <h4 style={styles.sectionLabel}>Payment Summary</h4>
                        <p style={styles.detailText}><strong>Method:</strong> {order.paymentMethod}</p>
                        <p style={styles.detailText}><strong>Status:</strong> {order.paymentStatus}</p>
                    </div>
                </div>

                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={{ ...styles.th, textAlign: "left" }}>Item Description</th>
                            <th style={styles.th}>Price</th>
                            <th style={styles.th}>Qty</th>
                            <th style={{ ...styles.th, textAlign: "right" }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item, index) => (
                            <tr key={index} style={styles.tableRow}>
                                <td style={{ ...styles.td, fontWeight: "600" }}>{item.productName}</td>
                                <td style={styles.td}>₹{item.price}</td>
                                <td style={styles.td}>{item.quantity}</td>
                                <td style={{ ...styles.td, textAlign: "right", fontWeight: "700" }}>₹{item.subtotal}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={styles.totalSection}>
                    <div style={styles.totalContainer}>
                        <div style={styles.finalRow}>
                            <span>Amount Payable</span>
                            <span style={styles.finalPrice}>₹{order.totalAmount}</span>
                        </div>
                    </div>
                </div>

                <footer style={styles.footer}>
                    <p style={styles.thanks}>Thank you for your business!</p>
                    <p style={styles.legal}>This is a computer-generated document and does not require a physical signature.</p>
                </footer>
            </div>

            {/* Simple CSS to hide buttons when printing */}
            <style>
                {`
                    @media print {
                        body { background: white !important; }
                        button, .no-print { display: none !important; }
                        div { box-shadow: none !important; margin: 0 !important; padding: 0 !important; }
                        .printable-content { width: 100% !important; border: none !important; }
                    }
                `}
            </style>
        </div>
    );
}

const styles = {
    container: { position: "relative", padding: "80px 20px", background: "#0f172a", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "'Inter', sans-serif" },
    closeCross: { position: "fixed", top: "25px", right: "30px", background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", fontSize: "32px", width: "45px", height: "45px", borderRadius: "50%", cursor: "pointer", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" },
    noPrintNav: { width: "100%", maxWidth: "800px", display: "flex", justifyContent: "flex-end", marginBottom: "20px" },
    printBtn: { background: "#6366f1", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },
    billCard: { background: "#fff", color: "#1e293b", width: "100%", maxWidth: "800px", padding: "60px", borderRadius: "4px", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" },
    header: { display: "flex", justifyContent: "space-between", marginBottom: "40px" },
    brand: { margin: 0, color: "#6366f1", fontSize: "28px", fontWeight: "900" },
    invoiceTitle: { margin: 0, fontSize: "32px", fontWeight: "300", color: "#94a3b8" },
    invoiceId: { fontSize: "18px", fontWeight: "700", margin: "5px 0" },
    subText: { fontSize: "12px", color: "#64748b", margin: "2px 0" },
    divider: { height: "2px", background: "#f1f5f9", margin: "20px 0 40px" },
    billingRow: { display: "flex", justifyContent: "space-between", marginBottom: "50px" },
    sectionLabel: { fontSize: "11px", textTransform: "uppercase", color: "#6366f1", letterSpacing: "1px", marginBottom: "10px" },
    detailText: { fontSize: "14px", margin: "4px 0" },
    table: { width: "100%", borderCollapse: "collapse" },
    tableHeader: { borderBottom: "2px solid #1e293b" },
    th: { padding: "15px 10px", fontSize: "13px", color: "#64748b", textTransform: "uppercase" },
    td: { padding: "15px 10px", borderBottom: "1px solid #f1f5f9", fontSize: "14px" },
    totalSection: { display: "flex", justifyContent: "flex-end", marginTop: "40px" },
    totalContainer: { width: "250px", borderTop: "2px solid #1e293b", paddingTop: "20px" },
    finalRow: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "16px", fontWeight: "800" },
    finalPrice: { fontSize: "24px", color: "#6366f1" },
    footer: { marginTop: "80px", textAlign: "center", borderTop: "1px solid #f1f5f9", paddingTop: "30px" },
    thanks: { fontSize: "16px", fontWeight: "700", color: "#1e293b", margin: 0 },
    legal: { fontSize: "11px", color: "#94a3b8", marginTop: "10px" },
    loader: { color: "#fff", marginTop: "100px", fontSize: "18px" }
};

export default Bill;