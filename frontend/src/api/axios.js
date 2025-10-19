import axios from "axios";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "https://togetha.onrender.com/api";
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // if using cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
