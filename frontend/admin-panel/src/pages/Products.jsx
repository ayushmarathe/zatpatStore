import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";

function Products() {
    const location = useLocation();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    
    // 🔍 Search & Filter States
    const [searchQuery, setSearchQuery] = useState(""); // 🔥 New Search State
    const [filterTab, setFilterTab] = useState(location.state?.filterLowStock ? "LOW" : "ALL");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [minQty, setMinQty] = useState("");
    const [maxQty, setMaxQty] = useState("");

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

    const fetchData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                api.get("/api/products?page=0&size=1000"), 
                api.get("/api/categories")
            ]);
            const prodData = prodRes.data.content || prodRes.data;
            setProducts(prodData);
            setCategories(catRes.data);
        } catch (err) { console.error("Error fetching data:", err); }
    };

    useEffect(() => { fetchData(); }, []);

    // 🔍 Smart Filter Logic (Including ID and Name)
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            // Smart Search Logic
            const searchLower = searchQuery.toLowerCase().trim();
            const matchesSearch = !searchQuery || 
                p.name.toLowerCase().includes(searchLower) || 
                p.id.toString() === searchLower; // Exact match for ID, partial for Name

            const matchesTab = filterTab === "ALL" || (filterTab === "LOW" && p.quantity < 10);
            const matchesCat = !selectedCategory || p.categoryId === Number(selectedCategory);
            const matchesPrice = (!minPrice || p.price >= parseFloat(minPrice)) && 
                                (!maxPrice || p.price <= parseFloat(maxPrice));
            const matchesQty = (!minQty || p.quantity >= parseInt(minQty)) && 
                               (!maxQty || p.quantity <= parseInt(maxQty));
            
            return matchesSearch && matchesTab && matchesCat && matchesPrice && matchesQty;
        });
    }, [products, searchQuery, filterTab, selectedCategory, minPrice, maxPrice, minQty, maxQty]);

    const stats = useMemo(() => ({
        total: products.length,
        lowStock: products.filter(p => p.quantity < 10).length
    }), [products]);

    const resetFilters = () => {
        setSearchQuery(""); setSelectedCategory(""); setMinPrice(""); setMaxPrice(""); setMinQty(""); setMaxQty(""); setFilterTab("ALL");
    };

    const handleDelete = async (id) => {
        if (prompt("Enter admin password to delete:") !== "admin123") return;
        try { await api.delete(`/api/products/${id}`); fetchData(); } catch (err) { console.error(err); }
    };

    const adjustStock = async (id, type) => {
        const amt = prompt(`Enter amount to ${type}:`);
        if (!amt) return;
        try { await api.put(`/api/products/${id}/${type}?amount=${amt}`); fetchData(); } catch (err) { console.error(err); }
    };

    return (
        <div style={styles.container}>
            <button onClick={() => navigate("/dashboard")} style={styles.closeCross}>&times;</button>

            <header style={styles.headerSection}>
                <div>
                    <h2 style={styles.heading}>📦 Product Inventory</h2>
                    <p style={styles.subHeading}>Control stock levels and product visibility</p>
                </div>
                
                <div style={styles.statsRow}>
                    <div style={styles.statItem}><span style={styles.statVal}>{stats.total}</span> Total</div>
                    <div style={styles.statItem}><span style={{...styles.statVal, color: '#ef4444'}}>{stats.lowStock}</span> Low Stock</div>
                    <button onClick={() => navigate("/add-product")} style={styles.addBtn}>+ Add Product</button>
                </div>
            </header>

            {/* 🔍 Smart Search Bar */}
            <div style={styles.searchSection}>
                <input 
                    type="text" 
                    placeholder="Search by ID or Product Name..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchBar}
                />
            </div>

            <div style={styles.tabBar}>
                {["ALL", "LOW"].map(tab => (
                    <button key={tab} onClick={() => setFilterTab(tab)} style={filterTab === tab ? styles.activeTab : styles.tab}>
                        {tab === "LOW" ? "⚠️ Low Stock" : "All Products"}
                    </button>
                ))}
            </div>

            <div style={styles.filterBar}>
                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Category</label>
                    <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={styles.miniInput}>
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Price (₹)</label>
                    <div style={styles.inputRow}>
                        <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} style={styles.miniInput} />
                        <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={styles.miniInput} />
                    </div>
                </div>

                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Quantity</label>
                    <div style={styles.inputRow}>
                        <input type="number" placeholder="Min" value={minQty} onChange={e => setMinQty(e.target.value)} style={styles.miniInput} />
                        <input type="number" placeholder="Max" value={maxQty} onChange={e => setMaxQty(e.target.value)} style={styles.miniInput} />
                    </div>
                </div>

                <button onClick={resetFilters} style={styles.resetBtn}>Reset</button>
            </div>

            <div style={styles.grid}>
                {filteredProducts.map((p) => (
                    <div key={p.id} style={styles.productCard}>
                        <div style={styles.imageContainer}>
                            <img src={`http://localhost:8080/uploads/${p.imageUrl}`} alt={p.name} style={styles.image} />
                            <span style={styles.idBadge}>#{p.id}</span>
                        </div>
                        <div style={styles.cardBody}>
                            <h3 style={styles.productName}>{p.name}</h3>
                            <div style={styles.priceRow}>
                                <span style={styles.price}>₹{p.price}</span>
                                <span style={{...styles.stockLabel, color: p.quantity < 10 ? "#ef4444" : "#94a3b8"}}>
                                    Stock: {p.quantity}
                                </span>
                            </div>
                            <div style={styles.actionGrid}>
                                <button style={styles.stockBtnIn} onClick={() => adjustStock(p.id, "increase")}>+</button>
                                <button style={styles.stockBtnDe} onClick={() => adjustStock(p.id, "decrease")}>-</button>
                                <button style={styles.editBtn} onClick={() => navigate(`/edit-product/${p.id}`)}>Edit</button>
                                <button style={styles.deleteBtn} onClick={() => handleDelete(p.id)}>Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div style={styles.emptyContainer}>No products found matching "{searchQuery}"</div>
            )}
        </div>
    );
}

const styles = {
    container: { position: "relative", padding: "60px 5% 40px", background: "#0f172a", minHeight: "100vh", color: "#f8fafc", fontFamily: "'Inter', sans-serif" },
    closeCross: { position: "fixed", top: "20px", right: "30px", background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", fontSize: "32px", width: "45px", height: "45px", borderRadius: "50%", cursor: "pointer", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" },
    headerSection: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
    heading: { fontSize: "28px", fontWeight: "800", margin: 0, background: "linear-gradient(90deg, #6366f1, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    subHeading: { color: "#64748b", fontSize: "14px" },
    statsRow: { display: "flex", gap: "15px", alignItems: "center" },
    statItem: { background: "#1e293b", padding: "8px 15px", borderRadius: "10px", border: "1px solid #334155", fontSize: "12px", color: "#94a3b8" },
    statVal: { color: "#fff", fontWeight: "800", fontSize: "15px", marginRight: "4px" },
    addBtn: { background: "#6366f1", color: "#fff", padding: "10px 20px", borderRadius: "10px", border: "none", fontWeight: "700", cursor: "pointer" },
    
    searchSection: { marginBottom: "20px" },
    searchBar: { width: "100%", padding: "15px 20px", borderRadius: "15px", background: "#1e293b", border: "1px solid #334155", color: "#fff", fontSize: "16px", outline: "none" },
    
    tabBar: { display: "flex", gap: "10px", marginBottom: "20px" },
    tab: { background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontWeight: "600", padding: "8px 16px" },
    activeTab: { background: "#6366f1", border: "none", color: "#fff", cursor: "pointer", fontWeight: "600", padding: "8px 16px", borderRadius: "8px" },
    filterBar: { display: "flex", flexWrap: "wrap", gap: "20px", background: "#1e293b", padding: "20px", borderRadius: "15px", marginBottom: "30px", alignItems: "flex-end", border: "1px solid #334155" },
    filterGroup: { display: "flex", flexDirection: "column", gap: "6px" },
    filterLabel: { fontSize: "10px", fontWeight: "700", color: "#6366f1", textTransform: "uppercase" },
    inputRow: { display: "flex", gap: "10px" },
    miniInput: { background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", outline: "none", width: "130px" },
    resetBtn: { background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid #ef4444", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "12px" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "25px" },
    productCard: { background: "#1e293b", borderRadius: "18px", overflow: "hidden", border: "1px solid #334155" },
    imageContainer: { position: "relative", height: "200px", background: "#0f172a" },
    image: { width: "100%", height: "100%", objectFit: "cover" },
    idBadge: { position: "absolute", top: "12px", left: "12px", background: "rgba(15,23,42,0.8)", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", color: "#fff" },
    cardBody: { padding: "20px" },
    productName: { fontSize: "17px", fontWeight: "700", color: "#fff", margin: "0 0 10px 0" },
    priceRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
    price: { fontSize: "19px", fontWeight: "800", color: "#22c55e" },
    stockLabel: { fontSize: "13px", fontWeight: "600" },
    actionGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
    stockBtnIn: { background: "#10b981", color: "#fff", border: "none", borderRadius: "8px", padding: "10px", cursor: "pointer", fontWeight: "800" },
    stockBtnDe: { background: "#f59e0b", color: "#fff", border: "none", borderRadius: "8px", padding: "10px", cursor: "pointer", fontWeight: "800" },
    editBtn: { background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", padding: "10px", cursor: "pointer", fontWeight: "600" },
    deleteBtn: { background: "#ef4444", color: "#fff", border: "none", borderRadius: "8px", padding: "10px", cursor: "pointer", fontWeight: "600" },
    emptyContainer: { textAlign: "center", padding: "100px", color: "#475569", fontSize: "18px" },
};

export default Products;