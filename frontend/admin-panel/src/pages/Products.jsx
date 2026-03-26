import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom"; // 🔥 Added useLocation
import Navbar from "../components/Navbar";

function Products() {
    const location = useLocation(); // 🔥 To catch Dashboard state
    const [isLowStockFilter, setIsLowStockFilter] = useState(location.state?.filterLowStock || false);
    
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0); 
    const navigate = useNavigate();

    useEffect(() => {
        window.history.pushState(null, null, window.location.pathname);
        const handlePopState = () => {
            if (window.confirm("Return to Dashboard?")) {
                navigate("/dashboard");
            } else {
                window.history.pushState(null, null, window.location.pathname);
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [navigate]);

    const fetchCategories = async () => {
        try {
            const res = await api.get("/api/categories");
            setCategories(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchProducts = async () => {
        try {
            let url = `/api/products?page=${page}&size=12`; 

            // 🔥 Logic for Low Stock Endpoint
            if (isLowStockFilter) {
                url = `/api/products/low-stock?threshold=10`;
            } else if (selectedCategory !== "") {
                url = `/api/products/search?categoryId=${selectedCategory}&page=${page}&size=12`;
            }

            const res = await api.get(url);
            
            // 🔥 Logic to handle both Page object and simple Array (Low Stock)
            if (res.data.content) {
                setProducts(res.data.content);
                setTotalPages(res.data.totalPages);
            } else {
                // For low-stock List return
                setProducts(res.data);
                setTotalPages(1); 
            }
        } catch (err) { console.error(err); }
    };

    const handleClearFilter = () => {
        setIsLowStockFilter(false);
        setPage(0);
    };

    useEffect(() => { fetchCategories(); }, []);
    useEffect(() => { fetchProducts(); }, [page, selectedCategory, isLowStockFilter]);

    const renderPageNumbers = () => {
        const pages = [];
        for (let i = 0; i < totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setPage(i)}
                    style={page === i ? styles.activePageBtn : styles.pageNumberBtn}
                >
                    {i + 1}
                </button>
            );
        }
        return pages;
    };

    const handleDelete = async (id) => {
        const password = prompt("Enter admin password to delete:");
        if (password !== "admin123") return;
        try { await api.delete(`/api/products/${id}`); fetchProducts(); } catch (err) { console.error(err); }
    };

    const increaseStock = async (id) => {
        const amount = prompt("Enter amount:");
        if (!amount) return;
        try { await api.put(`/api/products/${id}/increase?amount=${amount}`); fetchProducts(); } catch (err) { console.error(err); }
    };

    const decreaseStock = async (id) => {
        const amount = prompt("Enter amount:");
        if (!amount) return;
        try { await api.put(`/api/products/${id}/decrease?amount=${amount}`); fetchProducts(); } catch (err) { console.error(err); }
    };

    return (
        <div style={styles.container}>
            <button onClick={() => navigate("/dashboard")} style={styles.closeCross}>&times;</button>

            <header style={styles.header}>
                <div>
                    <h2 style={styles.heading}>Product Inventory</h2>
                    <p style={styles.subHeading}>Directly manage stock levels and categories.</p>
                </div>
                <button onClick={() => navigate("/add-product")} style={styles.addBtn}>+ Add Product</button>
            </header>

            {/* 🔥 ADDED LOW STOCK BANNER */}
            {isLowStockFilter && (
                <div style={styles.alertBanner}>
                    <span>⚠️ Showing items with <strong>Qty &lt; 10</strong></span>
                    <button onClick={handleClearFilter} style={styles.clearBtn}>View All Products</button>
                </div>
            )}

            <div style={styles.filterSection}>
                <p style={styles.filterLabel}>Category Filter</p>
                <select
                    value={selectedCategory}
                    disabled={isLowStockFilter} // 🔥 Disable during low-stock mode
                    onChange={(e) => { setSelectedCategory(e.target.value ? Number(e.target.value) : ""); setPage(0); }}
                    style={{...styles.select, opacity: isLowStockFilter ? 0.5 : 1}}
                >
                    <option value="">All Categories</option>
                    {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
            </div>

            <div style={styles.grid}>
                {products.map((p) => (
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
                                <button style={styles.stockBtnIn} onClick={() => increaseStock(p.id)}>+</button>
                                <button style={styles.stockBtnDe} onClick={() => decreaseStock(p.id)}>-</button>
                                <button style={styles.editBtn} onClick={() => navigate(`/edit-product/${p.id}`)}>Edit</button>
                                <button style={styles.deleteBtn} onClick={() => handleDelete(p.id)}>Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <footer style={styles.pagination}>
                <button onClick={() => setPage(page - 1)} disabled={page === 0} style={page === 0 ? styles.pageBtnDisabled : styles.pageBtn}>
                    Prev
                </button>
                <div style={styles.pageNumberContainer}>
                    {renderPageNumbers()}
                </div>
                <button onClick={() => setPage(page + 1)} disabled={page === totalPages - 1 || isLowStockFilter} style={(page === totalPages - 1 || isLowStockFilter) ? styles.pageBtnDisabled : styles.pageBtn}>
                    Next
                </button>
            </footer>
        </div>
    );
}

const styles = {
    // Existing styles kept exactly as is
    container: { position: "relative", padding: "60px 5% 40px", background: "#0f172a", minHeight: "100vh", color: "#f8fafc", fontFamily: "'Inter', sans-serif" },
    closeCross: { position: "fixed", top: "20px", right: "30px", background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", fontSize: "32px", width: "45px", height: "45px", borderRadius: "50%", cursor: "pointer", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" },
    heading: { fontSize: "30px", fontWeight: "800", background: "linear-gradient(90deg, #6366f1, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    subHeading: { color: "#94a3b8", fontSize: "14px" },
    addBtn: { background: "#6366f1", color: "#fff", padding: "12px 24px", borderRadius: "12px", border: "none", fontWeight: "700", cursor: "pointer" },
    filterSection: { marginBottom: "30px" },
    filterLabel: { fontSize: "11px", fontWeight: "700", color: "#6366f1", textTransform: "uppercase", marginBottom: "8px" },
    select: { padding: "12px", borderRadius: "10px", background: "#1e293b", border: "1px solid #334155", color: "#fff", width: "220px" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "25px" },
    productCard: { background: "#1e293b", borderRadius: "18px", overflow: "hidden", border: "1px solid #334155" },
    imageContainer: { position: "relative", height: "200px", background: "#0f172a" },
    image: { width: "100%", height: "100%", objectFit: "cover" },
    idBadge: { position: "absolute", top: "12px", left: "12px", background: "rgba(15,23,42,0.8)", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", color: "#fff" },
    cardBody: { padding: "20px" },
    productName: { fontSize: "18px", fontWeight: "700", marginBottom: "10px" },
    priceRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
    price: { fontSize: "20px", fontWeight: "800", color: "#22c55e" },
    stockLabel: { fontSize: "13px" },
    actionGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
    stockBtnIn: { background: "#10b981", color: "#fff", border: "none", borderRadius: "8px", padding: "10px", cursor: "pointer" },
    stockBtnDe: { background: "#f59e0b", color: "#fff", border: "none", borderRadius: "8px", padding: "10px", cursor: "pointer" },
    editBtn: { background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", padding: "10px", cursor: "pointer" },
    deleteBtn: { background: "#ef4444", color: "#fff", border: "none", borderRadius: "8px", padding: "10px", cursor: "pointer" },
    pagination: { marginTop: "50px", display: "flex", justifyContent: "center", gap: "15px", alignItems: "center" },
    pageBtn: { background: "#1e293b", color: "#fff", padding: "8px 16px", borderRadius: "8px", border: "1px solid #334155", cursor: "pointer", fontWeight: "600" },
    pageBtnDisabled: { background: "#0f172a", color: "#475569", padding: "8px 16px", borderRadius: "8px", border: "1px solid #1e293b", cursor: "not-allowed" },
    pageNumberContainer: { display: "flex", gap: "8px" },
    pageNumberBtn: { background: "transparent", color: "#94a3b8", border: "1px solid #334155", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", transition: "0.2s" },
    activePageBtn: { background: "#6366f1", color: "#fff", border: "1px solid #6366f1", padding: "8px 14px", borderRadius: "8px", fontWeight: "700", cursor: "default" },
    
    // 🔥 New Alert Banner Styles
    alertBanner: { background: "#f59e0b", color: "#fff", padding: "12px 25px", borderRadius: "12px", marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 15px rgba(245, 158, 11, 0.2)" },
    clearBtn: { background: "#fff", color: "#f59e0b", border: "none", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }
};

export default Products;