import React, { useEffect, useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

// --- CONSTANTS ---
const AVATAR_OPTIONS = ["🍎", "🥑", "🥦", "🥛", "🍯", "🥐", "🍕", "🍔", "🍦", "🍩"];

// --- PRODUCT CARD COMPONENT ---
const ProductCard = memo(({ p, qty, onAdd, onDecrease, navigate, isCompact = false }) => {
    return (
        <div 
            style={isCompact ? styles.compactCard : styles.card}
            onClick={(e) => {
                if (e.target.tagName !== 'BUTTON') {
                    navigate(`/product/${p.id}`);
                }
            }}
        >
            <div style={styles.imagePodium}>
                <img 
                    src={`http://localhost:8080/uploads/${p.imageUrl}`} 
                    alt={p.name} 
                    style={styles.image} 
                    loading="lazy" 
                />
            </div>
            <div style={styles.cardContent}>
                <h4 style={styles.productName}>{p.name}</h4>
                <div style={styles.priceRow}>
                    <span style={styles.price}>₹{p.price}</span>
                    <span style={styles.unit}>/ unit</span>
                </div>
                
                <div style={styles.actionArea}>
                    {qty === 0 ? (
                        <button style={styles.addBtn} onClick={(e) => { e.stopPropagation(); onAdd(p); }}>
                            Add to Cart
                        </button>
                    ) : (
                        <div style={styles.qtyBox} onClick={(e) => e.stopPropagation()}>
                            <button style={styles.qtyBtn} onClick={() => onDecrease(p)}>−</button>
                            <span style={styles.qtyText}>{qty}</span>
                            <button style={styles.qtyBtn} onClick={() => onAdd(p)}>+</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

// --- MAIN HOME COMPONENT ---
function Home() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
    const [isChangingAvatar, setIsChangingAvatar] = useState(false); // 🔥 New State
    const [userAvatar, setUserAvatar] = useState(localStorage.getItem("userAvatar") || "👤"); // 🔥 New State
    const [activeOrder, setActiveOrder] = useState(null); 
    const itemsPerPage = 8; 

    const username = localStorage.getItem("username") || "User";

    useEffect(() => {
        api.get("/api/products?page=0&size=10").then(res => setTopProducts(res.data.content)).catch(() => {});
        api.get("/api/categories").then(res => setCategories(res.data)).catch(() => {});
        
        api.get("/api/orders")
            .then(res => {
                const active = res.data
                    .filter(o => o.status === "PLACED" || o.status === "SHIPPED")
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
                setActiveOrder(active || null);
            })
            .catch(() => {});

        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(storedCart);
    }, []);

    useEffect(() => {
        const url = selectedCategory 
            ? `/api/products/search?categoryId=${selectedCategory}&page=0&size=100` 
            : "/api/products?page=0&size=100";
        api.get(url).then(res => {
            setProducts(res.data.content);
            setCurrentPage(1);
        }).catch(() => setProducts([]));
    }, [selectedCategory]);

    const handleLogout = () => {
        const confirmLogout = window.confirm("Are you sure you want to logout?");
        if (confirmLogout) {
            localStorage.clear();
            setIsSidebarOpen(false);
            navigate("/");
        }
    };

    const selectAvatar = (icon) => {
        setUserAvatar(icon);
        localStorage.setItem("userAvatar", icon);
        setIsChangingAvatar(false);
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const currentItems = filteredProducts.slice(indexOfLastItem - itemsPerPage, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const updateCart = (newCart) => {
        setCart(newCart);
        localStorage.setItem("cart", JSON.stringify(newCart));
    };

    const addToCart = (product) => {
        const newCart = [...cart];
        const existing = newCart.find(i => i.id === product.id);
        existing ? (existing.quantity += 1) : newCart.push({ ...product, quantity: 1 });
        updateCart(newCart);
    };

    const decreaseQty = (product) => {
        const newCart = cart.map(item => 
            item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
        ).filter(item => item.quantity > 0);
        updateCart(newCart);
    };

    const getQty = (id) => cart.find(i => i.id === id)?.quantity || 0;

    return (
        <div style={styles.container}>
            <div 
                style={{ ...styles.blurOverlay, opacity: isSearchFocused ? 1 : 0, visibility: isSearchFocused ? "visible" : "hidden" }} 
                onClick={() => setIsSearchFocused(false)} 
            />

            <div style={{ ...styles.overlay, opacity: isSidebarOpen ? 1 : 0, visibility: isSidebarOpen ? "visible" : "hidden" }} onClick={() => setIsSidebarOpen(false)} />

            <div style={{ ...styles.sidebar, left: isSidebarOpen ? "0" : "-320px", visibility: isSidebarOpen ? "visible" : "hidden" }}>
                {!isChangingAvatar ? (
                    <>
                        <div style={styles.sidebarHeader}>
                            <div style={styles.avatarLarge} onClick={() => setIsChangingAvatar(true)}>
                                <span style={{fontSize: '40px'}}>{userAvatar}</span>
                                <div style={styles.editBadge}>✎</div>
                            </div>
                            <h3 style={styles.sidebarUser}>{username}</h3>
                        </div>
                        <nav style={styles.sidebarNav}>
                            <button style={styles.navLink} onClick={() => { navigate("/profile"); setIsSidebarOpen(false); }}>👤 Profile</button>
                            <button style={styles.navLink} onClick={() => { navigate("/orders"); setIsSidebarOpen(false); }}>📦 My Orders</button>
                            <div style={styles.sidebarDivider} />
                            <button style={styles.logoutBtn} onClick={handleLogout}>🚪 Logout</button>
                        </nav>
                    </>
                ) : (
                    <>
                        <div style={styles.sidebarHeader}>
                            <button onClick={() => setIsChangingAvatar(false)} style={styles.backBtn}>← Back</button>
                            <h3 style={{...styles.sidebarUser, marginTop: '20px'}}>Select Avatar</h3>
                        </div>
                        <div style={styles.avatarGrid}>
                            {AVATAR_OPTIONS.map((icon, idx) => (
                                <button 
                                    key={idx} 
                                    style={userAvatar === icon ? styles.avatarOptionActive : styles.avatarOption} 
                                    onClick={() => selectAvatar(icon)}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div style={styles.centeredContent}>
                <header style={styles.header}>
                    <div style={styles.avatar} onClick={() => { setIsSidebarOpen(true); setIsChangingAvatar(false); }}>
                        {userAvatar}
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <h2 style={styles.logo}>Zatpat</h2>
                        <p style={styles.subtitle}>Fresh delivered fast</p>
                    </div>
                </header>

                {activeOrder && (
                    <div style={styles.activeOrderBanner} onClick={() => navigate(`/orders/${activeOrder.orderId}`)}>
                        <div style={styles.livePulse} />
                        <span style={styles.bannerText}>
                            Your order <strong>#{activeOrder.orderId}</strong> is <strong>{activeOrder.status}</strong>
                        </span>
                        <span style={styles.bannerArrow}>Track →</span>
                    </div>
                )}

                <div style={{ ...styles.searchSection, zIndex: isSearchFocused ? 1002 : 1 }}>
                    <input 
                        type="text" 
                        placeholder="Search for fresh milk, curd, or snacks..." 
                        style={styles.searchInput}
                        value={searchTerm}
                        onFocus={() => setIsSearchFocused(true)}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                    {isSearchFocused && searchTerm.length > 0 && (
                        <div style={styles.smartResults}>
                            {filteredProducts.slice(0, 6).map(p => (
                                <div key={`search-${p.id}`} style={styles.resultTile} onClick={() => navigate(`/product/${p.id}`)}>
                                    <img src={`http://localhost:8080/uploads/${p.imageUrl}`} style={styles.resultImg} alt={p.name}/>
                                    <div>
                                        <div style={styles.resultName}>{p.name}</div>
                                        <div style={styles.resultPrice}>₹{p.price}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <section style={styles.section}>
                    <h3 style={styles.sectionHeader}>🔥 Trending Now</h3>
                    <div style={styles.horizontalScroll}>
                        {topProducts.map(p => (
                            <ProductCard key={`top-${p.id}`} p={p} isCompact={true} qty={getQty(p.id)} onAdd={addToCart} onDecrease={decreaseQty} navigate={navigate} />
                        ))}
                    </div>
                </section>

                <section style={styles.section}>
                    <div style={styles.filterBar}>
                        <h3 style={styles.sectionHeader}>Our Catalog</h3>
                        <select style={styles.glassDropdown} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div style={styles.dynamicGrid}>
                        {currentItems.length > 0 ? (
                            currentItems.map(p => (
                                <ProductCard key={`grid-${p.id}`} p={p} qty={getQty(p.id)} onAdd={addToCart} onDecrease={decreaseQty} navigate={navigate} />
                            ))
                        ) : (
                            <div style={styles.noResults}>No items found for "{searchTerm}"</div>
                        )}
                    </div>
                    {totalPages > 1 && (
                        <div style={styles.paginationRow}>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button key={i + 1} onClick={() => setCurrentPage(i + 1)} style={currentPage === i + 1 ? styles.activePage : styles.inactivePage}>{i + 1}</button>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {cart.length > 0 && (
                <div style={styles.floatingCart} onClick={() => navigate("/cart")}>
                    <span style={styles.cartCount}>{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                    <span>View Cart →</span>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: { minHeight: "100vh", background: "radial-gradient(circle at top, #1e293b 0%, #020617 100%)", color: "#f8fafc", padding: "24px 16px", fontFamily: "'Plus Jakarta Sans', sans-serif", overflowX: "hidden", position: "relative" },
    centeredContent: { maxWidth: "1000px", margin: "0 auto" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
    logo: { margin: 0, fontSize: "28px", fontWeight: "800", background: "linear-gradient(to right, #818cf8, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    subtitle: { fontSize: "12px", color: "#64748b", margin: 0 },
    avatar: { width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", cursor: "pointer" },
    
    activeOrderBanner: { display: "flex", alignItems: "center", background: "rgba(99, 102, 241, 0.15)", border: "1px solid rgba(99, 102, 241, 0.3)", padding: "12px 20px", borderRadius: "16px", marginBottom: "30px", cursor: "pointer" },
    livePulse: { width: "8px", height: "8px", background: "#4ade80", borderRadius: "50%", marginRight: "12px", boxShadow: "0 0 8px #4ade80" },
    bannerText: { fontSize: "14px", flex: 1, color: "#e2e8f0" },
    bannerArrow: { fontSize: "13px", fontWeight: "bold", color: "#818cf8" },

    searchSection: { marginBottom: "40px", position: "relative" },
    searchInput: { width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "16px 20px", color: "#fff", fontSize: "15px", outline: "none", backdropFilter: "blur(10px)" },
    blurOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(12px)", zIndex: 1001, transition: "0.3s ease" },
    smartResults: { position: "absolute", top: "110%", left: 0, width: "100%", background: "#0a0f1d", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" },
    resultTile: { display: "flex", alignItems: "center", gap: "15px", padding: "12px 20px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.05)" },
    resultImg: { width: "45px", height: "45px", background: "#fff", borderRadius: "8px", objectFit: "contain", padding: "4px" },
    resultName: { fontWeight: "600", fontSize: "14px", color: "#f1f5f9" },
    resultPrice: { color: "#4ade80", fontSize: "13px", fontWeight: "800" },

    overlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 1003 },
    sidebar: { position: "fixed", top: 0, width: "300px", height: "100%", background: "#0a0f1d", borderRight: "1px solid rgba(255,255,255,0.1)", zIndex: 1004, transition: "left 0.3s ease-in-out", padding: "40px 24px", display: "flex", flexDirection: "column" },
    sidebarHeader: { textAlign: "center", marginBottom: "40px" },
    avatarLarge: { width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", border: "2px solid rgba(99, 102, 241, 0.3)" },
    editBadge: { position: "absolute", bottom: "0", right: "0", background: "#6366f1", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "#fff", border: "3px solid #0a0f1d" },
    sidebarUser: { fontSize: "20px", fontWeight: "700", color: "#f8fafc", margin: 0 },
    sidebarNav: { display: "flex", flexDirection: "column", gap: "12px" },
    navLink: { background: "rgba(255,255,255,0.03)", border: "none", color: "#94a3b8", padding: "14px 20px", borderRadius: "12px", textAlign: "left", fontSize: "16px", cursor: "pointer" },
    sidebarDivider: { height: "1px", background: "rgba(255,255,255,0.1)", margin: "20px 0" },
    logoutBtn: { background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#ef4444", padding: "14px 20px", borderRadius: "12px", fontSize: "16px", fontWeight: "600", cursor: "pointer" },
    backBtn: { background: "none", border: "none", color: "#818cf8", fontWeight: "bold", cursor: "pointer", fontSize: "16px", alignSelf: "flex-start" },
    avatarGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginTop: "20px" },
    avatarOption: { fontSize: "30px", padding: "15px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", cursor: "pointer" },
    avatarOptionActive: { fontSize: "30px", padding: "15px", background: "rgba(99, 102, 241, 0.2)", border: "1px solid #6366f1", borderRadius: "16px", cursor: "pointer" },

    section: { marginBottom: "50px" },
    sectionHeader: { fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "#94a3b8", marginBottom: "20px" },
    horizontalScroll: { display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "15px", scrollbarWidth: "none" },
    dynamicGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "20px" },
    filterBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
    glassDropdown: { background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "10px 16px", borderRadius: "12px", outline: "none", cursor: "pointer" },
    card: { background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(10px)", borderRadius: "24px", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "12px", display: "flex", flexDirection: "column", cursor: "pointer" },
    compactCard: { minWidth: "160px", background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(10px)", borderRadius: "24px", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "12px", cursor: "pointer" },
    imagePodium: { width: "100%", aspectRatio: "1/1", background: "#fff", borderRadius: "18px", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
    image: { width: "85%", height: "85%", objectFit: "contain" },
    cardContent: { flex: 1, display: "flex", flexDirection: "column" },
    productName: { fontSize: "14px", fontWeight: "600", margin: "0 0 6px 0", color: "#f1f5f9", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", height: "2.8em" },
    priceRow: { display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "14px" },
    price: { fontSize: "18px", fontWeight: "800", color: "#4ade80" },
    unit: { fontSize: "10px", color: "#64748b" },
    actionArea: { height: "36px" },
    addBtn: { width: "100%", height: "100%", background: "#6366f1", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer" },
    qtyBox: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: "12px", height: "100%", border: "1px solid rgba(255,255,255,0.1)" },
    qtyBtn: { background: "none", border: "none", color: "#fff", width: "35px", cursor: "pointer", fontSize: "18px" },
    qtyText: { fontWeight: "800", fontSize: "14px" },
    noResults: { gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "#64748b" },

    paginationRow: { display: "flex", justifyContent: "center", gap: "10px", marginTop: "40px" },
    activePage: { background: "#6366f1", color: "#fff", border: "none", width: "40px", height: "40px", borderRadius: "12px", fontWeight: "bold" },
    inactivePage: { background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "none", width: "40px", height: "40px", borderRadius: "12px", cursor: "pointer" },

    floatingCart: { position: "fixed", bottom: "30px", left: "50%", transform: "translateX(-50%)", background: "#6366f1", padding: "12px 24px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "12px", fontWeight: "700", boxShadow: "0 20px 40px rgba(0,0,0,0.4)", cursor: "pointer", zIndex: 100 },
    cartCount: { background: "#fff", color: "#6366f1", padding: "2px 8px", borderRadius: "8px", fontSize: "12px" }
};

export default Home;