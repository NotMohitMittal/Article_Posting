import axios from "axios";

export const AxiosAPI = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

