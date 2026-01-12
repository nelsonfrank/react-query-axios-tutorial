import { API } from "../../libs/axios";

interface FetchProductsParams {
  title?: string;
  offset?: number;
  limit?: number;
}

interface Product {
  id: number;
  title: string;
  price: number;
  images: string[];
}
export const fetchProducts = async ({
  title,
  offset = 0,
  limit = 10,
}: FetchProductsParams) => {
  const response = await API.get<Product[]>("/products", {
    params: {
      title,
      offset,
      limit,
    },
  });

  return response.data;
};