import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function Users() {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState("ACTIVE");
    const [searchQuery, setSearchQuery] = useState(""); // 🔥 New: Search state
    const navigate = useNavigate();

    // 🔥 Navigation Guard
    useEffect(() => {
        window.history.pushState(null, null, window.location.pathname);
        const handlePopState = () => {
            if (window.confirm("Return to Dashboard?")) navigate("/dashboard");
            else window.history.pushState(null, null, window.location.pathname);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            const res = await api.get("/api/orders/users/stats");
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // 🔍 Advanced Filter & Search Logic
    const filteredUsers = useMemo(() => {
        const now = new Date();
        
        return users.filter(u => {
            // 1. Search Filter
            const matchesSearch = !searchQuery || u.username.toLowerCase().includes(searchQuery.toLowerCase().trim());

            // 2. Status Filter
            const lastOrder = u.lastOrderDate ? new Date(u.lastOrderDate) : null;
            let matchesStatus = true;

            if (filter === "ACTIVE") matchesStatus = u.totalOrders > 0;
            else if (filter === "INACTIVE") {
                if (!lastOrder) matchesStatus = true;
                else {
                    const diffDays = (now - lastOrder) / (1000 * 60 * 60 * 24);
                    matchesStatus = diffDays > 60;
                }
            }
            else if (filter === "RECENT") {
                if (!lastOrder) matchesStatus = false;
                else {
                    const diffDays = (now - lastOrder) / (1000 * 60 * 60 * 24);
                    matchesStatus = diffDays <= 7;
                }
            }

            return matchesSearch && matchesStatus;
        });
    }, [users, filter, searchQuery]);

    return (
        <div style={styles.container}>
            {/* ❌ Close Cross Button */}
            <button onClick={() => navigate("/dashboard")} style={styles.closeCross} title="Close">&times;</button>

            <header style={styles.header}>
                <div>
                    <h2 style={styles.heading}>👤 Users Overview</h2>
                    <p style={styles.subHeading}>Analyze customer behavior and order history</p>
                </div>
            </header>

            {/* 🛠 FILTER & SEARCH BAR */}
            <div style={styles.filterSection}>
                <div style={styles.filterGroup}>
                    <label style={styles.label}>Quick Search</label>
                    <input 
                        type="text" 
                        placeholder="Search by username..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={styles.searchBar}
                    />
                </div>

                <div style={styles.filterGroup}>
                    <label style={styles.label}>Segment</label>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={styles.select}
                    >
                        <option value="ACTIVE">Active Users</option>
                        <option value="RECENT">Recent Users (7 Days)</option>
                        <option value="INACTIVE">Inactive (60+ Days)</option>
                        <option value="ALL">All Users</option>
                    </select>
                </div>
            </div>

            <div style={styles.grid}>
                {filteredUsers.map((u) => (
                    <div key={u.id} style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h3 style={styles.userName}>{u.username}</h3>
                            <span style={styles.roleTag}>{u.role}</span>
                        </div>

                        <div style={styles.statRow}>
                            <span style={styles.cardLabel}>Total Orders</span>
                            <span style={{ 
                                fontWeight: "700", 
                                color: u.totalOrders > 0 ? "#22c55e" : "#64748b" 
                            }}>
                                {u.totalOrders}
                            </span>
                        </div>

                        <div style={styles.statRow}>
                            <span style={styles.cardLabel}>Total Spent</span>
                            <span style={styles.spentValue}>₹{u.totalSpent.toLocaleString()}</span>
                        </div>

                        <p style={styles.lastOrderDate}>
                            Last Order: {u.lastOrderDate
                                ? new Date(u.lastOrderDate).toLocaleDateString()
                                : "No orders recorded"}
                        </p>

                        <button
                            style={styles.btn}
                            onClick={() => navigate(`/user-orders/${u.username}`)}
                        >
                            View Order History
                        </button>

                        {u.totalOrders > 5 && (
                            <div style={styles.topBuyerBadge}>🏆 Top Buyer</div>
                        )}
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div style={styles.emptyContainer}>No users found matching your filters.</div>
            )}
        </div>
    );
}

const styles = {
    container: { position: "relative", padding: "60px 5% 40px", background: "#0f172a", minHeight: "100vh", color: "#f8fafc", fontFamily: "'Inter', sans-serif" },
    closeCross: { position: "fixed", top: "20px", right: "30px", background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", fontSize: "32px", width: "45px", height: "45px", borderRadius: "50%", cursor: "pointer", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" },
    header: { marginBottom: "40px" },
    heading: { fontSize: "30px", fontWeight: "800", margin: 0, background: "linear-gradient(90deg, #6366f1, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    subHeading: { color: "#94a3b8", marginTop: "4px" },
    
    filterSection: { display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap", alignItems: "flex-end" },
    filterGroup: { display: "flex", flexDirection: "column", gap: "8px" },
    label: { fontSize: "11px", fontWeight: "700", color: "#6366f1", textTransform: "uppercase" },
    searchBar: { padding: "12px 16px", borderRadius: "10px", background: "#1e293b", border: "1px solid #334155", color: "#fff", width: "250px", outline: "none" },
    select: { padding: "12px", borderRadius: "10px", background: "#1e293b", border: "1px solid #334155", color: "#fff", width: "200px", cursor: "pointer", outline: "none" },
    
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "25px" },
    card: { background: "#1e293b", padding: "24px", borderRadius: "18px", border: "1px solid #334155", position: "relative" },
    cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" },
    userName: { fontSize: "18px", fontWeight: "700", margin: 0, color: "#fff" },
    roleTag: { fontSize: "10px", fontWeight: "800", background: "rgba(99, 102, 241, 0.1)", color: "#6366f1", padding: "4px 8px", borderRadius: "6px", textTransform: "uppercase" },
    statRow: { display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px" },
    cardLabel: { color: "#94a3b8" },
    spentValue: { fontWeight: "700", color: "#22c55e" },
    lastOrderDate: { fontSize: "12px", color: "#64748b", marginTop: "15px", fontStyle: "italic" },
    
    btn: { marginTop: "20px", padding: "12px", width: "100%", background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: "10px", color: "#a5b4fc", fontWeight: "600", cursor: "pointer", transition: "0.2s" },
    topBuyerBadge: { marginTop: "12px", background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "700", textAlign: "center", border: "1px solid rgba(34, 197, 94, 0.2)" },
    emptyContainer: { textAlign: "center", padding: "100px", color: "#475569", fontSize: "18px" }
};

export default Users;