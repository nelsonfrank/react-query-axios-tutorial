import axios from "axios";


export const BASE_API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export const API = axios.create({
  baseURL: BASE_API_URL,
  timeout: 10000,
});