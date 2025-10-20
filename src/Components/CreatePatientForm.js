import React, { useState } from "react";
import axios from "axios";
import ApiConfig from "../api/ApiConfig"; 

export default function CreatePatientForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    sex: "",
    phone: "",
    email: "",
    addressLine1: "",
    city: "",
    postalCode: "",
    countryCode: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage("");
    setError("");
  };

  const createPatient = async (e) => {
    e.preventDefault();
  
  
    const dobDate = new Date(form.dob);
    const today = new Date();
    if (dobDate >= today) {
      setError("❌ Date of birth must be in the past");
      return;
    }
  
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(form.phone)) {
      setError("❌ Phone must be in E.164 format (e.g., +1234567890)");
      return;
    }
  
 
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": "change-me-secure-api-key-here", 
    };
    
  
    try {
      const response = await axios.post(ApiConfig.PATIENT_CREATE, form, { headers });
      alert("✅ Patient created successfully!");
      // setMessage("✅ Patient created successfully!");
      setError("");
      console.log("API Response:", response.data);
  
 
      setForm({
        firstName: "",
        lastName: "",
        dob: "",
        sex: "",
        phone: "",
        email: "",
        addressLine1: "",
        city: "",
        postalCode: "",
        countryCode: "",
      });
    } catch (error) {
      console.error("❌ API Error:", error);
  
      if (error.response?.data?.error?.details) {
        const details = error.response.data.error.details
          .map((d) => `${d.path}: ${d.msg}`)
          .join(", ");
        setError(`❌ Validation failed: ${details}`);
      } else {
        setError("❌ Failed to create patient. Try again.");
      }
    }
  };
  
  return (
    <div className="panel">
      <h2>Create Patient</h2>

      <form onSubmit={createPatient} className="patient-form">
     
        <div className="form-row">
          <label>First Name</label>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <label>Last Name</label>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <label>Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <label>Sex</label>
          <select name="sex" value={form.sex} onChange={handleChange} required style={{ width: "100%" }}>
            <option value="">Select</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

      
        <div className="form-row">
          <label>Phone</label>
          <input
            type="tel"
            name="phone"
            placeholder="+91XXXXXXXXXX"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="example@email.com"
            value={form.email}
            onChange={handleChange}
          />
        </div>

       
        <div className="form-row">
          <label>Address Line 1</label>
          <input
            name="addressLine1"
            value={form.addressLine1}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label>City</label>
          <input name="city" value={form.city} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>Postal Code</label>
          <input
            name="postalCode"
            value={form.postalCode}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label>Country Code</label>
          <input
            name="countryCode"
            placeholder="e.g., IN, US"
            value={form.countryCode}
            onChange={handleChange}
          />
        </div>

       
        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}

        <div className="button-container">
          <button type="submit" className="button-create">
            Create Patient
          </button>
        </div>
      </form>
    </div>
  );
}
