import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [productImages, setProductImages] = useState({});
  const [filterStatus, setFilterStatus] = useState("ALL");

  // 🔥 Filter States
  const [searchId, setSearchId] = useState(""); // New: Search ID State
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const navigate = useNavigate();

  // Navigation Guard logic kept exactly as is...
  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);
    const handlePopState = () => {
      if (window.confirm("Do you want to leave Order Management?")) {
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

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/orders/${id}/status?status=${status}`);
      fetchOrders();
    } catch (err) { console.error(err); }
  };

  const fetchProductImage = async (productId) => {
    if (productImages[productId]) return;
    try {
      const res = await api.get(`/api/products/${productId}`);
      setProductImages((prev) => ({ ...prev, [productId]: res.data.imageUrl }));
    } catch (err) { console.error(err); }
  };

  // 🔍 UPDATED: Advanced Dynamic Filtering Logic with Search ID
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 0. Search ID Filter (Checks if Order ID contains the search string)
      const matchesSearch = !searchId || order.orderId.toString().includes(searchId);

      // 1. Status Filter
      const matchesStatus =
        filterStatus === "ALL" ||
        (filterStatus === "LIVE" && (order.status === "PLACED" || order.status === "SHIPPED")) ||
        (filterStatus === "COMPLETED" && order.status === "DELIVERED") ||
        (filterStatus === "CANCELLED" && order.status === "CANCELLED");

      // 2. Price Filter
      const matchesPrice =
        (!minPrice || order.totalAmount >= parseFloat(minPrice)) &&
        (!maxPrice || order.totalAmount <= parseFloat(maxPrice));

      // 3. Date Filter
      const rawDate = order.orderDate || order.createdAt;
      const normalizedOrderDate = rawDate ? rawDate.split('T')[0] : "";
      const matchesDate =
        (!startDate || normalizedOrderDate >= startDate) &&
        (!endDate || normalizedOrderDate <= endDate);

      return matchesSearch && matchesStatus && matchesPrice && matchesDate;
    });
  }, [orders, searchId, filterStatus, minPrice, maxPrice, startDate, endDate]);

  const stats = useMemo(() => ({
    total: filteredOrders.length,
    live: filteredOrders.filter(o => o.status === "PLACED" || o.status === "SHIPPED").length,
    completed: filteredOrders.filter(o => o.status === "DELIVERED").length
  }), [filteredOrders]);

  const resetFilters = () => {
    setSearchId(""); // Reset Search
    setMinPrice(""); setMaxPrice(""); setStartDate(""); setEndDate(""); setFilterStatus("ALL");
  };

  return (
    <div style={styles.container}>
      <button onClick={() => navigate("/dashboard")} style={styles.closeCross} title="Close">&times;</button>

      <header style={styles.headerSection}>
        <div>
          <h2 style={styles.heading}>📦 Order Management</h2>
          <p style={styles.subHeading}>Monitor shipments and verify collections</p>
        </div>
        <div style={styles.statsRow}>
          <div style={styles.statItem}><span style={styles.statVal}>{stats.total}</span> Total</div>
          <div style={styles.statItem}><span style={{ ...styles.statVal, color: '#fbbf24' }}>{stats.live}</span> Live</div>
          <div style={styles.statItem}><span style={{ ...styles.statVal, color: '#22c55e' }}>{stats.completed}</span> Done</div>
        </div>
      </header>

      <div style={styles.tabBar}>
        {["ALL", "LIVE", "COMPLETED", "CANCELLED"].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={filterStatus === status ? styles.activeTab : styles.tab}
          >
            {status}
          </button>
        ))}
      </div>

      <div style={styles.filterBar}>
        {/* 🔥 NEW: SEARCH BY ORDER ID */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Search Order</label>
          <input 
            type="text" 
            placeholder="Type Order ID..." 
            value={searchId} 
            onChange={e => setSearchId(e.target.value)} 
            style={styles.searchIdInput} 
          />
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Price Range (₹)</label>
          <div style={styles.inputRow}>
            <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} style={styles.miniInput} />
            <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={styles.miniInput} />
          </div>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Date Range</label>
          <div style={styles.inputRow}>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={styles.miniInput} />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={styles.miniInput} />
          </div>
        </div>

        <button onClick={resetFilters} style={styles.resetBtn}>Reset All</button>
      </div>

      <div style={styles.orderGrid}>
        {filteredOrders.map((order) => {
          const isCOD = order.paymentMethod === "COD";
          const isDelivered = order.status === "DELIVERED";
          const showAsPending = isCOD && !isDelivered;

          return (
            <div key={order.orderId} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <div style={styles.orderId}>Order #{order.orderId}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {order.orderDate ? order.orderDate.split('T')[0] : "No Date"}
                  </div>
                </div>
                <span style={getStatusStyle(order.status)}>{order.status}</span>
              </div>

              <div style={styles.infoSection}>
                <div>
                  <span style={styles.label}>Amount</span>
                  <span style={styles.totalText}>₹{order.totalAmount}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={styles.label}>Status</span>
                  <span style={{ ...styles.paymentText, color: showAsPending ? "#fbbf24" : "#22c55e" }}>
                    {showAsPending ? "Pending COD" : order.paymentStatus}
                  </span>
                </div>
              </div>

              <div style={styles.itemsBox}>
                {order.items.map((item) => {
                  fetchProductImage(item.productId);
                  return (
                    <div key={item.productId} style={styles.itemRow}>
                      <img src={`http://localhost:8080/uploads/${productImages[item.productId]}`} alt="" style={styles.itemImage} onError={e => e.target.src = "https://via.placeholder.com/50"} />
                      <div style={{ flex: 1 }}>
                        <div style={styles.itemName}>{item.productName}</div>
                        <div style={styles.itemMeta}>{item.quantity} × ₹{item.price}</div>
                      </div>
                      <div style={styles.itemSubtotal}>₹{item.subtotal}</div>
                    </div>
                  );
                })}
              </div>

              <div style={styles.actions}>
                {order.status === "PLACED" && (
                  <>
                    <button style={styles.shipBtn} onClick={() => updateStatus(order.orderId, "SHIPPED")}>🚀 Ship</button>
                    <button style={styles.cancelBtn} onClick={() => window.confirm("Cancel order?") && updateStatus(order.orderId, "CANCELLED")}>Cancel</button>
                  </>
                )}
                {order.status === "SHIPPED" && (
                  <button style={styles.deliverBtn} onClick={() => updateStatus(order.orderId, "DELIVERED")}>✅ Deliver & Pay</button>
                )}
                {(order.status === "DELIVERED" || order.status === "CANCELLED") && (
                  <div style={styles.completedText}>Order Processed</div>
                )}
                <button
                  style={styles.billBtn}
                  onClick={() => navigate(`/bill/${order.orderId}`)}
                >
                  📄 View Bill
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {filteredOrders.length === 0 && <div style={styles.emptyContainer}>No matches found.</div>}
    </div>
  );
}

// getStatusStyle and style object remain mostly the same...

const styles = {
  // ... existing styles ...
  container: { position: "relative", padding: "60px 5% 40px", background: "#0f172a", minHeight: "100vh", color: "#f8fafc", fontFamily: "'Inter', sans-serif" },
  closeCross: { position: "fixed", top: "20px", right: "30px", background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", fontSize: "32px", width: "45px", height: "45px", borderRadius: "50%", cursor: "pointer", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" },
  headerSection: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  heading: { fontSize: "28px", fontWeight: "800", margin: 0, background: "linear-gradient(90deg, #6366f1, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  subHeading: { color: "#64748b", fontSize: "14px" },
  statsRow: { display: "flex", gap: "12px" },
  statItem: { background: "#1e293b", padding: "8px 14px", borderRadius: "10px", border: "1px solid #334155", fontSize: "12px", color: "#94a3b8" },
  statVal: { color: "#fff", fontWeight: "800", fontSize: "15px", marginRight: "4px" },
  tabBar: { display: "flex", gap: "10px", marginBottom: "20px" },
  tab: { background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontWeight: "600", padding: "8px 16px" },
  activeTab: { background: "#6366f1", border: "none", color: "#fff", cursor: "pointer", fontWeight: "600", padding: "8px 16px", borderRadius: "8px" },
  
  filterBar: { display: "flex", flexWrap: "wrap", gap: "20px", background: "#1e293b", padding: "20px", borderRadius: "15px", marginBottom: "30px", alignItems: "flex-end", border: "1px solid #334155" },
  filterGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  filterLabel: { fontSize: "10px", fontWeight: "700", color: "#6366f1", textTransform: "uppercase" },
  
  // 🔥 STYLE FOR SEARCH INPUT
  searchIdInput: { background: "#0f172a", border: "1px solid #6366f1", color: "#fff", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", outline: "none", width: "160px" },
  
  inputRow: { display: "flex", gap: "10px" },
  miniInput: { background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", outline: "none", width: "135px" },
  resetBtn: { background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid #ef4444", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "12px" },
  
  orderGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "25px" },
  card: { background: "#1e293b", borderRadius: "20px", padding: "24px", border: "1px solid #334155" },
  cardHeader: { display: "flex", justifyContent: "space-between", marginBottom: "20px", borderBottom: "1px solid #334155", paddingBottom: "12px" },
  orderId: { fontWeight: "700", color: "#fff" },
  infoSection: { display: "flex", justifyContent: "space-between", marginBottom: "20px" },
  label: { display: "block", fontSize: "10px", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" },
  totalText: { fontSize: "20px", fontWeight: "800", color: "#fff" },
  paymentText: { fontSize: "13px", fontWeight: "600" },
  itemsBox: { background: "#0f172a", padding: "12px", borderRadius: "14px", marginBottom: "20px" },
  itemRow: { display: "flex", alignItems: "center", gap: "12px", padding: "8px 0", borderBottom: "1px solid #1e293b" },
  itemImage: { width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px" },
  itemName: { fontSize: "13px", fontWeight: "600", color: "#f8fafc" },
  itemMeta: { fontSize: "11px", color: "#64748b" },
  itemSubtotal: { fontSize: "13px", fontWeight: "700", color: "#cbd5e1" },
  actions: { display: "flex", gap: "10px" },
  shipBtn: { flex: 2, background: "#6366f1", color: "#fff", border: "none", padding: "10px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
  deliverBtn: { width: "100%", background: "#22c55e", color: "#fff", border: "none", padding: "10px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
  cancelBtn: { flex: 1, background: "transparent", border: "1px solid #ef4444", color: "#ef4444", padding: "10px", borderRadius: "8px", cursor: "pointer" },
  completedText: { flex: 2, textAlign: "center", color: "#64748b", fontSize: "12px", fontStyle: "italic", alignSelf: "center" },
  emptyContainer: { textAlign: "center", padding: "100px", color: "#475569" },
  placed: { background: "rgba(250, 204, 21, 0.1)", color: "#facc15", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "800" },
  shipped: { background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "800" },
  delivered: { background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "800" },
  cancelled: { background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "800" },
  billBtn: { flex: 1, background: "transparent", border: "1px solid #6366f1", color: "#6366f1", padding: "10px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
};

const getStatusStyle = (status) => {
  switch (status) {
    case "PLACED": return styles.placed;
    case "SHIPPED": return styles.shipped;
    case "DELIVERED": return styles.delivered;
    case "CANCELLED": return styles.cancelled;
    default: return {};
  }
};

export default Orders;