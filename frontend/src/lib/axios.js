import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://recon-x-backend.onrender.com",
});

export default axiosInstance;
