import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // change to your backend URL
  withCredentials: true, // if using cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
