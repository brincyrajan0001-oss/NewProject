import axios from "axios";
import ApiConfig from "./ApiConfig";

const API_KEY = "change-me-secure-api-key-here";

const api = axios.create({
  baseURL: ApiConfig.BASE_URL + ApiConfig.PATH,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
});

// Create patient
export const createPatient = async (data) => {
  const res = await api.post("patients", data);
  return res.data;
};

// Search patients
export const searchPatients = async (query) => {
  const res = await api.get(`patients?search=${query}`);
  return res.data;
};

// Get patient by ID with ETag
export const getPatient = async (id) => {
    try {
      const res = await api.get(`patients/${id}`);
  
      // Prefer header, fallback to response body field
      const etag = res.headers["etag"] || res.data.data?.etag || null;
  
      return { data: res.data, etag };
    } catch (err) {
      if (err.response?.status === 304) {
        return { notModified: true };
      }
      throw err;
    }
  };
  
export const updatePatient = async (id, data, etag) => {

    const payload = { ...data };
    delete payload.etag;
  
    try {
      const res = await api.put(`patients/${id}`, payload, {
        headers: {
          "If-Match": `"${etag}"`,
          "x-api-key": API_KEY,
        },
      });
      return { data: res.data };
    } catch (err) {
      console.error("Update failed:", err.response?.status, err.response?.data);
      if (err.response?.status === 412) {
        return { error: "412 Precondition Failed" };
      } else if (err.response?.status === 428) {
        return { error: "PRECONDITION_REQUIRED" };
      }
      throw err;
    }
  };
  
  