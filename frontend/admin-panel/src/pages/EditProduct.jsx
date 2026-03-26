import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [currentImageUrl, setCurrentImageUrl] = useState("");
    const [isDirty, setIsDirty] = useState(false); // Track if changes were made

    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        quantity: "",
        categoryId: "",
    });

    // 🔥 Navigation Guard: Prevents leaving if form is "dirty"
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    const fetchProduct = async () => {
        try {
            const res = await api.get(`/api/products/${id}`);
            const p = res.data;
            setForm({
                name: p.name,
                description: p.description,
                price: p.price,
                quantity: p.quantity,
                categoryId: p.categoryId,
            });
            setCurrentImageUrl(p.imageUrl);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchProduct();
        const fetchCategories = async () => {
            const res = await api.get("/api/categories");
            setCategories(res.data);
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (!image) { setPreview(null); return; }
        const objectUrl = URL.createObjectURL(image);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [image]);

    const handleChange = (e) => {
        setIsDirty(true); // Mark form as changed
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleClose = () => {
        if (isDirty) {
            const confirmLeave = window.confirm("Discard changes and exit?");
            if (!confirmLeave) return;
        }
        navigate("/products");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        // ... (Same FormData logic as before)
        data.append("name", form.name);
        data.append("description", form.description);
        data.append("price", form.price);
        data.append("quantity", form.quantity);
        data.append("categoryId", form.categoryId);
        if (image) data.append("file", image);

        try {
            await api.put(`/api/products/with-image/${id}`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setIsDirty(false); // Reset dirty state on success
            alert("Product updated successfully!");
            navigate("/products");
        } catch (err) { console.error(err); }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* ❌ Close Cross Button */}
                <button onClick={handleClose} style={styles.closeCross} title="Close">
                    &times;
                </button>

                <header style={styles.header}>
                    <h2 style={styles.title}>Edit Product</h2>
                    <p style={styles.subtitle}>Modify <span style={styles.idText}>#{id}</span></p>
                </header>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.previewContainer}>
                        <div style={styles.previewBox}>
                            <p style={styles.previewLabel}>Current</p>
                            {currentImageUrl ? (
                                <img src={`http://localhost:8080/uploads/${currentImageUrl}`} alt="Current" style={styles.previewImg} />
                            ) : <div style={styles.placeholder}>No Image</div>}
                        </div>
                        {preview && (
                            <div style={styles.previewBox}>
                                <p style={styles.previewLabel}>New</p>
                                <img src={preview} alt="New" style={{...styles.previewImg, borderColor: '#6366f1'}} />
                            </div>
                        )}
                    </div>

                    <input name="name" value={form.name} onChange={handleChange} placeholder="Name" style={styles.input} />
                    <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" style={{ ...styles.input, height: "60px" }} />
                    
                    <div style={styles.row}>
                        <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price" style={{...styles.input, flex: 1}} />
                        <input name="quantity" type="number" value={form.quantity} onChange={handleChange} placeholder="Qty" style={{...styles.input, flex: 1}} />
                    </div>

                    <select name="categoryId" value={form.categoryId} onChange={handleChange} style={styles.select}>
                        <option value="">Select Category</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>

                    <input type="file" onChange={(e) => { setImage(e.target.files[0]); setIsDirty(true); }} style={styles.fileInput} />

                    <button type="submit" style={styles.submitBtn}>Save Changes</button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: { display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", background: "#0f172a", minHeight: "100vh", color: "#f8fafc", fontFamily: "'Inter', sans-serif" },
    card: { 
        position: "relative", // Needed for absolute cross
        background: "#1e293b", 
        padding: "40px 30px 30px 30px", 
        borderRadius: "20px", 
        width: "100%", 
        maxWidth: "500px", 
        border: "1px solid #334155" 
    },
    closeCross: {
        position: "absolute",
        top: "15px",
        right: "15px",
        background: "none",
        border: "none",
        color: "#94a3b8",
        fontSize: "28px",
        cursor: "pointer",
        lineHeight: "1",
        transition: "color 0.2s",
    },
    header: { textAlign: "center", marginBottom: "20px" },
    title: { fontSize: "22px", fontWeight: "700", margin: "0", color: "#fff" },
    subtitle: { color: "#94a3b8", fontSize: "13px" },
    idText: { color: "#6366f1" },
    form: { display: "flex", flexDirection: "column", gap: "15px" },
    previewContainer: { display: "flex", gap: "10px", justifyContent: "center", background: "#0f172a", padding: "10px", borderRadius: "10px" },
    previewBox: { textAlign: "center" },
    previewLabel: { fontSize: "10px", color: "#6366f1", marginBottom: "4px" },
    previewImg: { width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px" },
    placeholder: { width: "80px", height: "80px", background: "#1e293b", borderRadius: "6px" },
    input: { padding: "12px", background: "#0f172a", border: "1px solid #334155", color: "#fff", borderRadius: "8px", outline: "none" },
    select: { padding: "12px", background: "#0f172a", border: "1px solid #334155", color: "#fff", borderRadius: "8px" },
    fileInput: { fontSize: "12px", color: "#94a3b8" },
    submitBtn: { padding: "14px", background: "#6366f1", border: "none", color: "#fff", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
};

export default EditProduct;