// src/api/ApiService.js
import axios from "axios";
import ApiConfig from "./ApiConfig";

const API_KEY = "change-me-secure-api-key-here"; // replace with your .env value

const api = axios.create({
  baseURL: ApiConfig.BASE_URL + ApiConfig.PATH,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
});

// ---- Patient APIs ----

// Create patient (POST /patients)
export const createPatient = async (data) => {
  const res = await api.post("patients", data);
  return res.data;
};

// Search patients (GET /patients?search=...)
export const searchPatients = async (query) => {
  const res = await api.get(`patients?search=${query}`);
  return res.data;
};

// Get patient by ID (GET /patients/:id)
export const getPatient = async (id, etag = null) => {
  const headers = etag ? { "If-None-Match": etag } : {};
  try {
    const res = await api.get(`patients/${id}`, { headers });
    return { data: res.data, etag: res.headers.etag };
  } catch (err) {
    if (err.response?.status === 304) {
      return { notModified: true }; // handle 304 Not Modified
    }
    throw err;
  }
};

// Update patient (PUT /patients/:id)
export const updatePatient = async (id, data, etag) => {
  try {
    const res = await api.put(`patients/${id}`, data, {
      headers: { "If-Match": etag },
    });
    return { data: res.data };
  } catch (err) {
    if (err.response?.status === 412) {
      return { error: "412 Precondition Failed" };
    }
    throw err;
  }
};
