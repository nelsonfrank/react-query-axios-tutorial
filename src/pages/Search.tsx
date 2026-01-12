import { useEffect, useState } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { useSearchParams } from "react-router-dom";

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

const gridStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
  gridTemplateColumns: `
    repeat(
      2 auto-fit,
      minmax(180px, 1fr)
    )
  `,
};

export default function Search() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  const LIMIT = 12;

  const debouncedSearch = useDebounce(searchQuery, 500);

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

const updateSearch = (value: string) => {
    setSearchParams({
      q: value,
      page: "1", // reset page on new search
    });
  };

  const goToPage = (newPage: number) => {
    setSearchParams({
      q: searchQuery,
      page: String(newPage),
    });
  };


  return (
    <div style={{ maxWidth: 1024, marginInline: "auto", padding: 16 }}>
      <h1>Products</h1>

      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => updateSearch(e.target.value)}
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
          style={gridStyle}
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
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/150";
                }}
              />
              <h3>{product.title}</h3>
              <p>${product.price}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div style={{ marginTop: 24, display: "flex", gap: 12, alignItems: "center" }}>
        <button
          disabled={page === 1 || loading}
          onClick={() => goToPage(page - 1)}
        >
          Previous
        </button>

        <span>Page {page}</span>

        <button
          disabled={products.length < LIMIT || loading}
          onClick={() => goToPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
