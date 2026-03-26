import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);

    const [image, setImage] = useState(null);

    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        quantity: "",
        categoryId: "",
    });

    // 🔥 Fetch product
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
        } catch (err) {
            console.error(err);
        }
    };

    // 🔥 Fetch categories
    const fetchCategories = async () => {
        const res = await api.get("/api/categories");
        setCategories(res.data);
    };

    useEffect(() => {
        fetchProduct();
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    // 🔥 Submit update
    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();

        data.append("name", form.name);
        data.append("description", form.description);
        data.append("price", form.price);
        data.append("quantity", form.quantity);
        data.append("categoryId", form.categoryId);

        if (image) {
            data.append("file", image);
        }

        try {
            await api.put(`/api/products/with-image/${id}`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            alert("Product updated");
            navigate("/products");

        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={styles.container}>
            <h2>Edit Product</h2>

            <form onSubmit={handleSubmit} style={styles.form}>

                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Name"
                    style={styles.input}
                />

                <input
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Description"
                    style={styles.input}
                />

                <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Price"
                    style={styles.input}
                />

                <input
                    name="quantity"
                    type="number"
                    value={form.quantity}
                    onChange={handleChange}
                    placeholder="Quantity"
                    style={styles.input}
                />
                <input
                    type="file"
                    onChange={(e) => setImage(e.target.files[0])}
                    style={styles.input}
                />
                <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    style={styles.input}
                >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>

                <button type="submit" style={styles.button}>
                    Update Product
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
        color: "#fff",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "400px",
    },
    input: {
        padding: "10px",
        background: "#1e293b",
        border: "1px solid #334155",
        color: "#fff",
        borderRadius: "6px",
    },
    button: {
        padding: "10px",
        background: "#3b82f6",
        border: "none",
        color: "#fff",
        borderRadius: "6px",
        cursor: "pointer",
    },
};

export default EditProduct;