import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function AddProduct() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    categoryId: "",
  });

  const [image, setImage] = useState(null);

  // 🔥 Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 🔥 Handle change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 🔥 Submit form
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
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Product added successfully");

      navigate("/products");

    } catch (err) {
      console.error(err);
      alert("Error adding product");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>➕ Add Product</h2>

      <form onSubmit={handleSubmit} style={styles.form}>

        <input
          name="name"
          placeholder="Product Name"
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          name="description"
          placeholder="Description"
          onChange={handleChange}
          style={styles.input}
        />

        <input
          name="price"
          type="number"
          placeholder="Price"
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          name="quantity"
          type="number"
          placeholder="Quantity"
          onChange={handleChange}
          required
          style={styles.input}
        />

        {/* Category Dropdown */}
        <select
          name="categoryId"
          onChange={handleChange}
          required
          style={styles.input}
        >
          <option value="">Select Category</option>

          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Image Upload */}
        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          Add Product
        </button>
      </form>
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
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxWidth: "400px",
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #334155",
    background: "#1e293b",
    color: "#fff",
  },

  button: {
    padding: "10px",
    background: "#22c55e",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
  },
};

export default AddProduct;