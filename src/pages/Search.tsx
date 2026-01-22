import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { useSearchParams } from "react-router-dom";
import { fetchProducts } from "../services/products/query";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "../providers/RQClientProvider";

export default function Search() {
  const [loading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  const LIMIT = 12;

  const debouncedSearch = useDebounce(searchQuery, 500);

  const {
    data: products,
    isPending,
    isSuccess,
  } = useQuery({
    queryKey: ["product", page, debouncedSearch],
    queryFn: () =>
      fetchProducts({
        title: debouncedSearch,
        offset: (page - 1) * LIMIT,
        limit: LIMIT,
      }),
  });

  const prefetchNextPageProduct = useCallback(
    (page: number, isLastPage: boolean) => {
      if (isLastPage) return;

      queryClient.prefetchQuery({
        queryKey: ["product", page, debouncedSearch],
        queryFn: () =>
          fetchProducts({
            title: debouncedSearch,
            offset: (page - 1) * LIMIT,
            limit: LIMIT,
          }),
      });
    },
    [debouncedSearch]
  );

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!endRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting) {
          prefetchNextPageProduct(page + 1, false);
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(endRef.current);

    return () => observer.disconnect();
  }, [page, prefetchNextPageProduct]);

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevBtn = () => {
    goToPage(page - 1);
    scrollToTop();
  };

  const handleNextBtn = () => {
    goToPage(page + 1);
    scrollToTop();
  };

  return (
    <div style={{ maxWidth: 1024, marginInline: "auto", padding: 16 }}>
      <h1>Products</h1>

    <div style={{ width: "100%", }}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => updateSearch(e.target.value)}
            style={{
              padding: 8,
              width: "100%",
              maxWidth: 253,
              marginBottom: 16,
            }}
          />
    </div>

      {isPending && <p>Loading...</p>}

      {isSuccess && products?.length === 0 && <p>No products found</p>}

      {isSuccess && (
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          }}
        >
          {products?.map((product) => (
            <div
              key={product.id}
              style={{
                border: "1px solid #ddd",
                padding: 12,
                borderRadius: 8,
                maxWidth: 250,
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
      <div
        style={{
          marginTop: 24,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <button
          disabled={page === 1 || loading}
          onClick={handlePrevBtn}
        >
          Previous
        </button>

        <span style={{fontSize: "14px"}}>Page {page}</span>

        <button
          disabled={(products?.length || 0) < LIMIT || loading}
          onClick={handleNextBtn}
        >
          Next
        </button>
      </div>

      {/* Sentinel */}
      <div ref={endRef} style={{ height: 1 }} />
    </div>
  );
}
