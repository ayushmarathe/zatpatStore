import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";



function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [page, setPage] = useState(0);
    const navigate = useNavigate();
    // 🔥 Fetch categories
    const fetchCategories = async () => {
        try {
            const res = await api.get("/api/categories");
            setCategories(res.data);
        } catch (err) {
            console.error("Error fetching categories", err);
        }
    };

    // 🔥 Fetch products
    const fetchProducts = async () => {
        try {
            let url = `/api/products?page=${page}&size=10`;

            if (selectedCategory !== "") {
                url = `/api/products/search?categoryId=${selectedCategory}&page=${page}&size=10`;
            }

            const res = await api.get(url);
            setProducts(res.data.content || res.data);

        } catch (err) {
            console.error("Error fetching products", err);
        }
        console.log("Selected Category:", selectedCategory);
    };

    // 🔥 Delete product
    const deleteProduct = async (id) => {
        try {
            await api.delete(`/api/products/${id}`);
            fetchProducts();
        } catch (err) {
            console.error("Error deleting product", err);
        }
    };
    const handleDelete = async (id) => {
        const password = prompt("Enter admin password to delete:");

        if (password !== "admin123") {
            alert("Wrong password");
            return;
        }

        try {
            await api.delete(`/api/products/${id}`);
            fetchProducts();
        } catch (err) {
            console.error(err);
        }
    };

    const increaseStock = async (id) => {
        const amount = prompt("Enter amount to increase:");

        if (!amount) return;

        try {
            await api.put(`/api/products/${id}/increase?amount=${amount}`);
            fetchProducts();
        } catch (err) {
            console.error(err);
        }
    };

    const decreaseStock = async (id) => {
        const amount = prompt("Enter amount to decrease:");

        if (!amount) return;

        try {
            await api.put(`/api/products/${id}/decrease?amount=${amount}`);
            fetchProducts();
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [page, selectedCategory]);

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>📦 Product Management</h2>

            {/* 🔽 CATEGORY FILTER */}
            <div style={styles.topBar}>
                <select
                    value={selectedCategory}
                    onChange={(e) => {
                        const value = e.target.value;
                        setSelectedCategory(value ? Number(value) : "");
                        setPage(0);
                    }}
                    style={styles.select}
                >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
                <button
                    onClick={() => navigate("/add-product")}
                    style={{
                        marginBottom: "20px",
                        marginLeft: "20px",
                        padding: "10px",
                        background: "#22c55e",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer"
                    }}
                >
                    ➕ Add Product
                </button>
            </div>

            {/* 🧾 TABLE */}
            <div style={styles.card}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.headerRow}>
                            <th>ID</th>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {products.map((p) => (
                            <tr key={p.id} style={styles.row}>
                                <td>{p.id}</td>

                                <td>
                                    <img
                                        src={`http://localhost:8080/uploads/${p.imageUrl}`}
                                        alt={p.name}
                                        style={styles.image}
                                    />
                                </td>

                                <td>{p.name}</td>
                                <td>₹{p.price}</td>
                                <td>{p.quantity}</td>
                                <td style={{ display: "flex", gap: "8px" }}>
                                    <button
                                        style={styles.increaseBtn}
                                        onClick={() => increaseStock(p.id)}
                                    >
                                        +
                                    </button>

                                    <button
                                        style={styles.decreaseBtn}
                                        onClick={() => decreaseStock(p.id)}
                                    >
                                        -
                                    </button>
                                    <button
                                        style={styles.editBtn}
                                        onClick={() => navigate(`/edit-product/${p.id}`)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        style={styles.deleteBtn}
                                        onClick={() => handleDelete(p.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {products.length === 0 && (
                    <p style={styles.emptyText}>No products found</p>
                )}
            </div>

            {/* 🔁 PAGINATION */}
            <div style={styles.pagination}>
                <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 0}
                    style={styles.pageBtn}
                >
                    ◀ Prev
                </button>

                <span style={styles.pageText}>Page {page + 1}</span>

                <button
                    onClick={() => setPage(page + 1)}
                    style={styles.pageBtn}
                >
                    Next ▶
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: "30px",
        background: "#0f172a",
        minHeight: "100vh",
        color: "#e2e8f0",
    },

    heading: {
        marginBottom: "20px",
        fontSize: "24px",
    },

    topBar: {
        marginBottom: "20px",
    },

    select: {
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #334155",
        background: "#1e293b",
        color: "#fff",
    },

    card: {
        background: "#1e293b",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
    },
    
    image: {
        width: "50px",
        height: "50px",
        objectFit: "cover",
        borderRadius: "6px",
    },

    headerRow: {
        background: "#334155",
        textAlign: "left",
    },

    row: {
        borderBottom: "1px solid #334155",
    },

    deleteBtn: {
        background: "#ef4444",
        color: "#fff",
        border: "none",
        padding: "6px 12px",
        borderRadius: "6px",
        cursor: "pointer",
    },

    pagination: {
        marginTop: "20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
    },

    pageBtn: {
        padding: "8px 12px",
        borderRadius: "6px",
        border: "none",
        background: "#3b82f6",
        color: "#fff",
        cursor: "pointer",
    },

    pageText: {
        fontWeight: "bold",
    },

    emptyText: {
        textAlign: "center",
        padding: "20px",
        color: "#94a3b8",
    },
    increaseBtn: {
        background: "#22c55e",
        color: "#fff",
        border: "none",
        padding: "6px 10px",
        borderRadius: "6px",
        cursor: "pointer",
    },

    decreaseBtn: {
        background: "#f59e0b",
        color: "#fff",
        border: "none",
        padding: "6px 10px",
        borderRadius: "6px",
        cursor: "pointer",
    },
    editBtn: {
        background: "#3b82f6",
        color: "#fff",
        border: "none",
        padding: "6px 12px",
        borderRadius: "6px",
        cursor: "pointer",
    },
};

export default Products;