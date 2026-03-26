import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function AddProduct() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    categoryId: "",
  });

  // 🔥 1. Navigation Guard (Block Back/Forward)
  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);
    const handlePopState = () => {
      if (isDirty) {
        if (window.confirm("You have unsaved changes. Use the 'X' to exit?")) {
          navigate("/products");
        } else {
          window.history.pushState(null, null, window.location.pathname);
        }
      } else {
        navigate("/products");
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate, isDirty]);

  // 🔥 2. Image Preview Logic
  useEffect(() => {
    if (!image) { setPreview(null); return; }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/categories");
      setCategories(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleChange = (e) => {
    setIsDirty(true);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    if (isDirty && !window.confirm("Discard new product details?")) return;
    navigate("/products");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("file", image);
    data.append("name", form.name);
    data.append("description", form.description);
    data.append("price", form.price);
    data.append("quantity", form.quantity);
    data.append("categoryId", form.categoryId);

    try {
      await api.post("/api/products/with-image", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setIsDirty(false);
      alert("Product added successfully");
      navigate("/products", { replace: true });
    } catch (err) {
      alert("Error adding product");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* ❌ Close Cross */}
        <button onClick={handleClose} style={styles.closeCross}>&times;</button>

        <header style={styles.header}>
          <h2 style={styles.title}>Add New Product</h2>
          <p style={styles.subtitle}>Fill in the details to expand your inventory</p>
        </header>

        <form onSubmit={handleSubmit} style={styles.form}>
          
          {/* Preview Section */}
          <div style={styles.previewContainer}>
            {preview ? (
              <img src={preview} alt="Preview" style={styles.previewImg} />
            ) : (
              <div style={styles.placeholder}>
                <span style={{ fontSize: "24px" }}>📷</span>
                <p style={{ fontSize: "12px", margin: "5px 0 0" }}>No Image Selected</p>
              </div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Product Name</label>
            <input name="name" placeholder="Enter name" onChange={handleChange} required style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Description</label>
            <textarea name="description" placeholder="Short description..." onChange={handleChange} style={{ ...styles.input, height: "60px", resize: "none" }} />
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>Price (₹)</label>
              <input name="price" type="number" placeholder="0.00" onChange={handleChange} required style={styles.input} />
            </div>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>Stock Quantity</label>
              <input name="quantity" type="number" placeholder="0" onChange={handleChange} required style={styles.input} />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Category</label>
            <select name="categoryId" onChange={handleChange} required style={styles.select}>
              <option value="">Select a category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Product Photo</label>
            <input type="file" onChange={(e) => { setImage(e.target.files[0]); setIsDirty(true); }} required style={styles.fileInput} />
          </div>

          <button type="submit" style={styles.submitBtn}>
            Create Product
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 20px", background: "#0f172a", minHeight: "100vh", color: "#f8fafc", fontFamily: "'Inter', sans-serif" },
  card: { position: "relative", background: "#1e293b", padding: "40px 30px", borderRadius: "24px", width: "100%", maxWidth: "500px", border: "1px solid #334155", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" },
  closeCross: { position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "#94a3b8", fontSize: "32px", cursor: "pointer", lineHeight: "1" },
  header: { textAlign: "center", marginBottom: "25px" },
  title: { fontSize: "26px", fontWeight: "700", margin: "0", background: "linear-gradient(90deg, #22c55e, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  subtitle: { color: "#94a3b8", fontSize: "14px", marginTop: "5px" },
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  previewContainer: { display: "flex", justifyContent: "center", background: "#0f172a", padding: "15px", borderRadius: "16px", border: "2px dashed #334155" },
  previewImg: { width: "120px", height: "120px", objectFit: "cover", borderRadius: "12px", border: "2px solid #22c55e" },
  placeholder: { height: "120px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#475569" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#cbd5e1", marginLeft: "4px" },
  input: { padding: "12px", background: "#0f172a", border: "1px solid #334155", color: "#fff", borderRadius: "10px", outline: "none", transition: "border 0.2s" },
  select: { padding: "12px", background: "#0f172a", border: "1px solid #334155", color: "#fff", borderRadius: "10px", outline: "none" },
  row: { display: "flex", gap: "15px" },
  fileInput: { fontSize: "12px", color: "#94a3b8" },
  submitBtn: { marginTop: "10px", padding: "14px", background: "#22c55e", border: "none", color: "#fff", borderRadius: "12px", fontWeight: "700", fontSize: "16px", cursor: "pointer", transition: "opacity 0.2s" },
};

export default AddProduct;