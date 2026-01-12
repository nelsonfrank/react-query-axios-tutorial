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
interface FetchProductsParams {
  title?: string;
  offset?: number;
  limit?: number;
}

const fetchProducts = async ({
  title,
  offset = 0,
  limit = 10,
}: FetchProductsParams) => {
  const response = await api.get("/products", {
    params: {
      title,
      offset,
      limit,
    },
  });

  return response.data;
};

export default function Search() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const LIMIT = 12;

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts({
          title: debouncedSearch,
          offset: (page - 1) * LIMIT,
          limit: LIMIT,
        });
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [debouncedSearch, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return (
    <div style={{ maxWidth: 1024, marginInline: "auto", padding: 16 }}>
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

      {!loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(200px, 1fr))",
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
      )}

      {/* Pagination Controls */}
      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <button
          disabled={page === 1 || loading}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </button>

        <span>Page {page}</span>

        <button
          disabled={products.length < LIMIT || loading}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
