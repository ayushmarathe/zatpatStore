import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isTodayOnly, setIsTodayOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
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
      setOrders(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchStats();
    fetchOrders();
  }, []);

  const processedOrders = useMemo(() => {
    let filtered = [...orders];
    if (isTodayOnly) {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(o => (o.orderDate || o.createdAt)?.startsWith(today));
    }
    return filtered;
  }, [orders, isTodayOnly]);

  const totalPages = Math.ceil(processedOrders.length / itemsPerPage);
  const paginatedOrders = processedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        <header style={styles.headerRowMain}>
            <h2 style={styles.heading}>📊 Admin Dashboard</h2>
            <div style={styles.dateDisplay}>
                {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </div>
        </header>

        <div style={styles.grid}>
          <StatCard title="Total Orders" value={stats.totalOrders} />
          <StatCard title="Total Revenue" value={`₹${stats.totalRevenue?.toLocaleString()}`} />
          <StatCard title="Total Products" value={stats.totalProducts} />
          <div onClick={() => navigate("/products", { state: { filterLowStock: true } })} style={{ cursor: "pointer" }}>
            <StatCard title="Low Stock Alert" value={stats.lowStockProducts} danger={stats.lowStockProducts > 0} />
          </div>
        </div>

        <div style={styles.actionRow}>
          <button style={styles.primaryBtn} onClick={() => navigate("/orders")}>📋 All Orders</button>
          <button style={styles.primaryBtn} onClick={() => navigate("/products")}>📦 Inventory</button>
          <button style={styles.primaryBtn} onClick={() => navigate("/users")}>👤 Users</button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
                <h3 style={{ margin: 0 }}>Recent Activity</h3>
                <span style={styles.subText}>{isTodayOnly ? "Live data for today" : "All recent history"}</span>
            </div>
            <button 
                onClick={() => { setIsTodayOnly(!isTodayOnly); setCurrentPage(1); }} 
                style={isTodayOnly ? styles.toggleBtnActive : styles.toggleBtn}
            >
                {isTodayOnly ? "📅 Viewing Today" : "📅 Show Today Only"}
            </button>
          </div>
          
          {paginatedOrders.length === 0 ? (
            <p style={styles.emptyText}>No orders found for this selection</p>
          ) : (
            <>
            <table style={styles.table}>
              <thead>
                <tr style={styles.headerRow}>
                  <th style={styles.th}>Order ID</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Time</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr key={order.orderId} style={styles.row}>
                    <td style={styles.td}>#{order.orderId}</td>
                    <td style={{ ...styles.td, fontWeight: "bold", color: "#22c55e" }}>₹{order.totalAmount}</td>
                    <td style={styles.td}>{formatTime(order.orderDate || order.createdAt)}</td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <span style={{ ...styles.badge, ...getStatusStyle(order.status) }}>{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={styles.paginationFooter}>
                <button 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(currentPage - 1)} 
                    style={currentPage === 1 ? styles.pageBtnDisabled : styles.pageBtn}
                >Prev</button>
                <span style={styles.pageText}>Page {currentPage} of {totalPages || 1}</span>
                <button 
                    disabled={currentPage === totalPages || totalPages === 0} 
                    onClick={() => setCurrentPage(currentPage + 1)} 
                    style={(currentPage === totalPages || totalPages === 0) ? styles.pageBtnDisabled : styles.pageBtn}
                >Next</button>
            </div>
            </>
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
      {danger && <p style={{ color: "#ef4444", fontSize: "11px", marginTop: "8px", fontWeight: "600" }}>⚠️ Review Stock</p>}
    </div>
  );
}

const getStatusStyle = (status) => {
  switch (status) {
    case "PLACED": return { background: "rgba(245, 158, 11, 0.1)", color: "#facc15", border: "1px solid rgba(245, 158, 11, 0.2)" };
    case "SHIPPED": return { background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", border: "1px solid rgba(59, 130, 246, 0.2)" };
    case "DELIVERED": return { background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", border: "1px solid rgba(34, 197, 94, 0.2)" };
    case "CANCELLED": return { background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)" };
    default: return { background: "#334155", color: "#94a3b8" };
  }
};

const styles = {
  container: { padding: "40px 5%", background: "#0f172a", minHeight: "100vh", color: "#f8fafc", fontFamily: "'Inter', sans-serif" },
  headerRowMain: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  heading: { margin: 0, fontSize: "28px", fontWeight: "800", background: "linear-gradient(90deg, #6366f1, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  dateDisplay: { background: "#1e293b", padding: "6px 14px", borderRadius: "10px", color: "#64748b", fontSize: "14px", fontWeight: "600", border: "1px solid #334155" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "30px" },
  statCard: { background: "#1e293b", padding: "25px", borderRadius: "16px", border: "1px solid #334155" },
  dangerCard: { border: "1px solid #ef4444", background: "rgba(239, 68, 68, 0.02)" },
  statTitle: { color: "#94a3b8", fontSize: "12px", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600" },
  statValue: { fontSize: "32px", fontWeight: "800", margin: 0 },
  actionRow: { display: "flex", gap: "15px", marginBottom: "40px" },
  primaryBtn: { padding: "12px 20px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700" },
  card: { background: "#1e293b", padding: "30px", borderRadius: "20px", border: "1px solid #334155" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" },
  toggleBtn: { background: "transparent", border: "1px solid #334155", color: "#94a3b8", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" },
  toggleBtnActive: { background: "#6366f1", border: "1px solid #6366f1", color: "#fff", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  subText: { fontSize: "13px", color: "#64748b" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "15px", color: "#94a3b8", fontSize: "11px", textTransform: "uppercase", borderBottom: "1px solid #334155", textAlign: 'left' },
  td: { padding: "18px 15px", borderBottom: "1px solid #334155", fontSize: "14px" },
  badge: { padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "700" },
  paginationFooter: { display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", marginTop: "25px" },
  pageBtn: { background: "#334155", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" },
  pageBtnDisabled: { background: "#1e293b", color: "#475569", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "not-allowed", fontSize: "12px" },
  pageText: { fontSize: "13px", color: "#94a3b8" },
  loading: { color: "#fff", textAlign: "center", marginTop: "100px", fontSize: "20px" },
  emptyText: { color: "#94a3b8", textAlign: "center", padding: "40px" },
};

export default Dashboard;