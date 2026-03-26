import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function Orders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const [productImages, setProductImages] = useState({});
  // 🔥 1. Navigation Guard (Block Back/Forward)
  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);
    const handlePopState = () => {
      if (window.confirm("Do you want to leave the Order Management page?")) {
        navigate("/dashboard");
      } else {
        window.history.pushState(null, null, window.location.pathname);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/orders/${id}/status?status=${status}`);
      fetchOrders();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleClose = () => {
    navigate("/dashboard");
  };

  const fetchProductImage = async (productId) => {
    if (productImages[productId]) return;

    try {
      const res = await api.get(`/api/products/${productId}`);

      setProductImages((prev) => ({
        ...prev,
        [productId]: res.data.imageUrl,
      }));

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      {/* ❌ Close Cross Button */}
      <button onClick={handleClose} style={styles.closeCross} title="Close & Exit">
        &times;
      </button>

      <header style={styles.headerSection}>
        <div>
          <h2 style={styles.heading}>📦 Order Management</h2>
          <p style={styles.subHeading}>Monitor shipments and verify COD collections</p>
        </div>
        <div style={styles.statsBadge}>Live Orders: {orders.length}</div>
      </header>

      <div style={styles.orderGrid}>
        {orders.map((order) => {
          // 🧠 Logical Check for COD
          const isCOD = order.paymentMethod === "COD";
          const isDelivered = order.status === "DELIVERED";
          const showAsPending = isCOD && !isDelivered;

          return (
            <div key={order.orderId} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.orderId}>Order #{order.orderId}</span>
                <span style={getStatusStyle(order.status)}>
                  {order.status}
                </span>
              </div>

              <div style={styles.infoSection}>
                <div style={styles.amountBox}>
                  <span style={styles.label}>Total Amount</span>
                  <span style={styles.totalText}>₹{order.totalAmount}</span>
                </div>

                <div style={styles.paymentBox}>
                  <span style={styles.label}>Payment Status</span>
                  <span style={{
                    ...styles.paymentText,
                    color: showAsPending ? "#fbbf24" : "#22c55e"
                  }}>
                    {showAsPending ? "Pending Collection" : order.paymentStatus}
                    <span style={{ color: "#94a3b8", fontSize: "12px", marginLeft: "6px" }}>
                      • {order.paymentMethod}
                    </span>
                  </span>
                </div>
              </div>

              <div style={styles.itemsBox}>
                <p style={styles.itemTitle}>Items</p>
                {order.items.map((item) => {
                  fetchProductImage(item.productId);

                  return (
                    <div key={item.productId} style={styles.itemRow}>

                      <img
                        src={`http://localhost:8080/uploads/${productImages[item.productId]}`}
                        alt={item.productName}
                        style={styles.image}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/50";
                        }}
                      />

                      <div>
                        <div>{item.productName}</div>
                        <div style={styles.subText}>
                          {item.quantity} × ₹{item.price} = ₹{item.subtotal}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              <div style={styles.actions}>
                {order.status === "PLACED" && (
                  <>
                    <button
                      style={styles.shipBtn}
                      onClick={() => updateStatus(order.orderId, "SHIPPED")}
                    >
                      🚀 Ship Order
                    </button>
                    <button
                      style={styles.cancelBtn}
                      onClick={() => {
                        if (window.confirm("Cancel this order?")) {
                          updateStatus(order.orderId, "CANCELLED");
                        }
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )}

                {order.status === "SHIPPED" && (
                  <button
                    style={styles.deliverBtn}
                    onClick={() => updateStatus(order.orderId, "DELIVERED")}
                  >
                    ✅ Mark Delivered {isCOD && "& Paid"}
                  </button>
                )}

                {(order.status === "DELIVERED" || order.status === "CANCELLED") && (
                  <div style={styles.completedText}>
                    Order logic finalized.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {orders.length === 0 && (
        <div style={styles.emptyContainer}>
          <p>No active orders currently available.</p>
        </div>
      )}
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
  container: {
    position: "relative",
    padding: "60px 5% 40px",
    background: "#0f172a",
    minHeight: "100vh",
    color: "#f8fafc",
    fontFamily: "'Inter', sans-serif",
  },
  closeCross: {
    position: "fixed",
    top: "20px",
    right: "30px",
    background: "#1e293b",
    border: "1px solid #334155",
    color: "#94a3b8",
    fontSize: "32px",
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 1000,
    lineHeight: 1,
  },
  headerSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },
  heading: {
    fontSize: "30px",
    fontWeight: "800",
    margin: 0,
    background: "linear-gradient(90deg, #6366f1, #a855f7)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  itemRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px",
  },

  image: {
    width: "50px",
    height: "50px",
    objectFit: "cover",
    borderRadius: "6px",
  },

  subText: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  subHeading: { color: "#94a3b8", marginTop: "4px" },
  statsBadge: { background: "#1e293b", padding: "6px 14px", borderRadius: "10px", border: "1px solid #334155", fontSize: "13px", color: "#6366f1", fontWeight: "600" },
  orderGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" },
  card: { background: "#1e293b", borderRadius: "18px", padding: "24px", border: "1px solid #334155" },
  cardHeader: { display: "flex", justifyContent: "space-between", marginBottom: "20px", paddingBottom: "10px", borderBottom: "1px solid #334155" },
  orderId: { fontWeight: "700", color: "#fff" },
  infoSection: { display: "flex", justifyContent: "space-between", marginBottom: "20px" },
  label: { display: "block", fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700" },
  totalText: { fontSize: "18px", fontWeight: "800", color: "#22c55e" },
  paymentText: { fontSize: "13px", fontWeight: "500" },
  itemsBox: { background: "#0f172a", padding: "12px", borderRadius: "10px", marginBottom: "20px" },
  itemTitle: { fontSize: "11px", fontWeight: "700", color: "#6366f1", textTransform: "uppercase", marginBottom: "8px" },
  itemRow: { display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "4px 0", color: "#cbd5e1" },
  actions: { display: "flex", gap: "10px" },
  shipBtn: { flex: 2, background: "#6366f1", border: "none", color: "#fff", padding: "10px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
  deliverBtn: { width: "100%", background: "#22c55e", border: "none", color: "#fff", padding: "10px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
  cancelBtn: { flex: 1, background: "transparent", border: "1px solid #ef4444", color: "#ef4444", padding: "10px", borderRadius: "8px", cursor: "pointer" },
  completedText: { width: "100%", textAlign: "center", fontSize: "12px", color: "#475569", letterSpacing: '0.5px' },
  emptyContainer: { textAlign: "center", padding: "100px", color: "#475569" },

  // BADGE STYLES
  placed: { background: "rgba(250, 204, 21, 0.1)", color: "#facc15", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "700", border: "1px solid rgba(250, 204, 21, 0.2)" },
  shipped: { background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "700", border: "1px solid rgba(59, 130, 246, 0.2)" },
  delivered: { background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "700", border: "1px solid rgba(34, 197, 94, 0.2)" },
  cancelled: { background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "700", border: "1px solid rgba(239, 68, 68, 0.2)" },
};

export default Orders;