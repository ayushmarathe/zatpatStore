import { useEffect, useState } from "react";
import api from "../api/axios";

function Products() {

    const [products, setProducts] = useState([]);

    useEffect(() => {
        api.get("/api/products?page=0&size=20")
            .then(res => setProducts(res.data.content))
            .catch(console.error);
    }, []);

    return (
        <div>
            <h2>Products</h2>

            {products.map(p => (
                <div key={p.id}>
                    <h3>{p.name}</h3>
                    <p>₹{p.price}</p>

                    <img
                        src={`http://localhost:8080/uploads/${p.imageUrl}`}
                        width="100"
                    />

                    <button>Buy Now</button>
                </div>
            ))}
        </div>
    );
}

export default Products;