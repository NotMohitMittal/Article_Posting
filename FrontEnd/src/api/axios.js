import axios from "axios";

export const AxiosAPI = axios.create({
  baseURL: import.meta.env.MODE === "production" 
    ? "/api" 
    : "http://localhost:3000/api",
  withCredentials: true,
});