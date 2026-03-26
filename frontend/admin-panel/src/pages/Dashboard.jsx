import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const res = await api.get("/api/orders/stats");
      setStats(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/orders");
      setOrders(res.data.slice(0, 5)); 
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchStats();
    fetchOrders();
  }, []);

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!stats) return <div style={styles.loading}>Loading Dashboard...</div>;

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.heading}>📊 Admin Dashboard</h2>

        <div style={styles.grid}>
          <StatCard title="Total Orders" value={stats.totalOrders} />
          <StatCard title="Total Revenue" value={`₹${stats.totalRevenue?.toLocaleString()}`} />
          <StatCard title="Total Products" value={stats.totalProducts} />
          
          {/* 🔥 CLICKABLE LOW STOCK CARD */}
          <div 
            onClick={() => navigate("/products", { state: { filterLowStock: true } })}
            style={{ cursor: "pointer" }}
          >
            <StatCard 
              title="Low Stock Alert" 
              value={stats.lowStockProducts} 
              danger={stats.lowStockProducts > 0} 
            />
          </div>
        </div>

        <div style={styles.actionRow}>
          <button style={styles.primaryBtn} onClick={() => navigate("/orders")}>📋 View All Orders</button>
          <button style={styles.secondaryBtn} onClick={() => navigate("/products")}>📦 Inventory Management</button>
        </div>

        <div style={styles.card}>
          <h3 style={{ marginBottom: "20px" }}>Recent Activity</h3>
          {orders.length === 0 ? (
            <p style={styles.emptyText}>No recent orders found</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.headerRow}>
                  <th style={styles.th}>Order ID</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Time</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId} style={styles.row}>
                    <td style={styles.td}>#{order.orderId}</td>
                    <td style={styles.td}>₹{order.totalAmount}</td>
                    <td style={styles.td}>{formatTime(order.orderDate || order.createdAt)}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, ...getStatusStyle(order.status) }}>{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

function StatCard({ title, value, danger }) {
  return (
    <div style={{ ...styles.statCard, ...(danger ? styles.dangerCard : {}) }}>
      <p style={styles.statTitle}>{title}</p>
      <h3 style={styles.statValue}>{value}</h3>
      {danger && <p style={{ color: "#ef4444", fontSize: "10px", marginTop: "5px" }}>Click to view items</p>}
    </div>
  );
}

const getStatusStyle = (status) => {
  switch (status) {
    case "PLACED": return { background: "#f59e0b", color: "#fff" };
    case "SHIPPED": return { background: "#3b82f6", color: "#fff" };
    case "DELIVERED": return { background: "#22c55e", color: "#fff" };
    case "CANCELLED": return { background: "#ef4444", color: "#fff" };
    default: return { background: "#64748b", color: "#fff" };
  }
};

const styles = {
  container: { padding: "30px", background: "#0f172a", minHeight: "100vh", color: "#e2e8f0" },
  heading: { marginBottom: "25px", fontSize: "28px", fontWeight: "bold" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "30px" },
  statCard: { background: "#1e293b", padding: "25px", borderRadius: "12px", border: "1px solid #334155", transition: "0.2s" },
  dangerCard: { border: "1px solid #ef4444", background: "rgba(239, 68, 68, 0.05)" },
  statTitle: { color: "#94a3b8", fontSize: "12px", marginBottom: "8px", textTransform: "uppercase" },
  statValue: { fontSize: "28px", fontWeight: "bold" },
  actionRow: { display: "flex", gap: "15px", marginBottom: "30px" },
  primaryBtn: { padding: "12px 24px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  secondaryBtn: { padding: "12px 24px", background: "#1e293b", color: "#fff", border: "1px solid #334155", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  card: { background: "#1e293b", padding: "25px", borderRadius: "12px", border: "1px solid #334155" },
  table: { width: "100%", borderCollapse: "collapse" },
  headerRow: { background: "#334155", textAlign: "left" },
  th: { padding: "15px", color: "#94a3b8" },
  td: { padding: "15px", borderBottom: "1px solid #334155" },
  badge: { padding: "5px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase" },
  loading: { color: "#fff", textAlign: "center", marginTop: "100px", fontSize: "20px" },
  emptyText: { color: "#94a3b8", textAlign: "center", padding: "40px" },
};

export default Dashboard;