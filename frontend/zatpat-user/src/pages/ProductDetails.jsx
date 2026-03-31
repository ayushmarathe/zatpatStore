import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [cart, setCart] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(storedCart);

        api.get(`/api/products/${id}`)
            .then(res => {
                setProduct(res.data);
                if (res.data.categoryId) {
                    api.get(`/api/products/search?categoryId=${res.data.categoryId}&size=6`)
                        .then(rel => {
                            const list = rel.data.content || [];
                            setRelated(list.filter(item => item.id !== parseInt(id)));
                        })
                        .catch(() => setRelated([]));
                }
            })
            .catch(() => navigate("/"));
    }, [id, navigate]);

    const updateCart = (newCart) => {
        setCart(newCart);
        localStorage.setItem("cart", JSON.stringify(newCart));
    };

    const addToCart = () => {
        const newCart = [...cart];
        const existing = newCart.find(i => i.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            newCart.push({ ...product, quantity: 1 });
        }
        updateCart(newCart);
    };

    const decreaseQty = () => {
        const newCart = cart.map(item => 
            item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
        ).filter(item => item.quantity > 0);
        updateCart(newCart);
    };

    const getQty = () => {
        return cart.find(i => i.id === (product?.id))?.quantity || 0;
    };

    // Calculate total items for the floating button
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    if (!product) return <div style={styles.loading}>Loading...</div>;

    const currentQty = getQty();

    return (
        <div style={styles.container}>
            <div style={styles.wrapper}>
                <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
                
                <div style={styles.mainGrid}>
                    <div style={styles.imageSection}>
                        <img src={`http://localhost:8080/uploads/${product.imageUrl}`} alt={product.name} style={styles.mainImage} />
                    </div>

                    <div style={styles.infoSection}>
                        <span style={styles.categoryBadge}>{product.categoryName}</span>
                        <h1 style={styles.title}>{product.name}</h1>
                        <p style={styles.price}>₹{product.price}</p>
                        <p style={styles.description}>{product.description || "Freshness guaranteed with every order."}</p>
                        
                        <div style={styles.actionArea}>
                            {currentQty === 0 ? (
                                <button 
                                    style={styles.addBtn} 
                                    onClick={addToCart}
                                    disabled={product.quantity <= 0}
                                >
                                    {product.quantity > 0 ? "Add to Cart" : "Out of Stock"}
                                </button>
                            ) : (
                                <div style={styles.qtyBox}>
                                    <button style={styles.qtyBtn} onClick={decreaseQty}>−</button>
                                    <span style={styles.qtyText}>{currentQty}</span>
                                    <button style={styles.qtyBtn} onClick={addToCart}>+</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {related.length > 0 && (
                    <section style={styles.relatedSection}>
                        <h3 style={styles.sectionHeader}>Related Items</h3>
                        <div style={styles.relatedGrid}>
                            {related.map(p => (
                                <div key={p.id} onClick={() => navigate(`/product/${p.id}`)} style={styles.miniCard}>
                                    <div style={styles.miniImgBox}><img src={`http://localhost:8080/uploads/${p.imageUrl}`} style={styles.miniImg} /></div>
                                    <p style={styles.miniName}>{p.name}</p>
                                    <strong style={styles.miniPrice}>₹{p.price}</strong>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* FLOATING CART BUTTON (Synced with Home.jsx) */}
            {totalItems > 0 && (
                <div style={styles.floatingCart} onClick={() => navigate("/cart")}>
                    <span style={styles.cartCount}>{totalItems}</span>
                    <span>View Cart</span>
                    <span>→</span>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: { minHeight: "100vh", background: "radial-gradient(circle at top, #1e293b 0%, #020617 100%)", color: "#fff", padding: "40px 20px", position: "relative" },
    wrapper: { maxWidth: "1000px", margin: "0 auto" },
    backBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#818cf8", padding: "8px 16px", borderRadius: "10px", cursor: "pointer", marginBottom: "30px" },
    mainGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px", marginBottom: "60px" },
    imageSection: { background: "#fff", borderRadius: "24px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "center" },
    mainImage: { width: "100%", maxHeight: "350px", objectFit: "contain" },
    infoSection: { display: "flex", flexDirection: "column", justifyContent: "center" },
    categoryBadge: { color: "#818cf8", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "10px" },
    title: { fontSize: "32px", fontWeight: "800", margin: "0 0 10px 0" },
    price: { fontSize: "28px", color: "#4ade80", fontWeight: "800", marginBottom: "20px" },
    description: { color: "#94a3b8", lineHeight: "1.6", marginBottom: "30px" },
    actionArea: { height: "50px", width: "220px" },
    addBtn: { width: "100%", height: "100%", background: "#6366f1", color: "#fff", border: "none", borderRadius: "14px", fontWeight: "bold", cursor: "pointer", fontSize: "16px" },
    qtyBox: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: "14px", height: "100%", border: "1px solid rgba(255,255,255,0.1)" },
    qtyBtn: { background: "none", border: "none", color: "#fff", width: "50px", height: "100%", cursor: "pointer", fontSize: "20px" },
    qtyText: { fontSize: "18px", fontWeight: "800" },
    relatedSection: { borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "40px" },
    sectionHeader: { color: "#94a3b8", fontSize: "16px", marginBottom: "20px" },
    relatedGrid: { display: "flex", gap: "15px", overflowX: "auto", paddingBottom: "10px" },
    miniCard: { minWidth: "150px", background: "rgba(30, 41, 59, 0.4)", padding: "12px", borderRadius: "18px", textAlign: "center", cursor: "pointer", border: "1px solid rgba(255,255,255,0.05)" },
    miniImgBox: { background: "#fff", borderRadius: "12px", padding: "5px", marginBottom: "8px" },
    miniImg: { width: "80px", height: "80px", objectFit: "contain" },
    miniName: { fontSize: "12px", fontWeight: "600", color: "#f1f5f9", margin: "0 0 4px 0" },
    miniPrice: { color: "#4ade80", fontSize: "14px" },
    loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#818cf8" },

    // Floating Cart Styles (Matched with Home)
    floatingCart: { 
        position: "fixed", bottom: "30px", left: "50%", transform: "translateX(-50%)", 
        background: "#6366f1", padding: "12px 24px", borderRadius: "20px", display: "flex", 
        alignItems: "center", gap: "12px", fontWeight: "700", boxShadow: "0 20px 40px rgba(0,0,0,0.4)", cursor: "pointer", zIndex: 100 
    },
    cartCount: { background: "#fff", color: "#6366f1", padding: "2px 8px", borderRadius: "8px", fontSize: "12px" }
};

export default ProductDetails;