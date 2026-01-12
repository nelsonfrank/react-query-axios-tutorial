import { useEffect, useState } from "react";
import { useDebounce } from "../hooks/useDebounce";

interface Product {
  id: number;
  title: string;
  price: number;
  images: string[];
}

import axios from "axios";

const api = axios.create({
  baseURL: "https://api.escuelajs.co/api/v1",
  timeout: 10000,
});

const fetchProducts = async (title?: string) => {
  const response = await api.get("/products", {
    params: title ? { title } : {},
  });

  return response.data;
};

export default function Search() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);


  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts(debouncedSearch);
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [debouncedSearch]);


  return (
     <div style={{ padding: 24 }}>
      <h1>Products</h1>

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: 8,
          width: "100%",
          maxWidth: 300,
          marginBottom: 16,
        }}
      />

      {loading && <p>Loading...</p>}

      {!loading && products.length === 0 && <p>No products found</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              border: "1px solid #ddd",
              padding: 12,
              borderRadius: 8,
            }}
          >
            <img
              src={product.images[0]}
              alt={product.title}
              style={{
                width: "100%",
                height: 150,
                objectFit: "cover",
              }}
            />
            <h3>{product.title}</h3>
            <p>${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
