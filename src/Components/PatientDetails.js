import React, { useEffect, useState } from "react";
import { getPatient, updatePatient } from "../api/ApiService";

export default function PatientDetails({ patientId, goBack }) {
  const [patient, setPatient] = useState(null);
  const [edit, setEdit] = useState({});
  const [error, setError] = useState("");
  const [mergeHint, setMergeHint] = useState("");

  useEffect(() => {
    loadPatient();
  }, [patientId]);


  const loadPatient = async () => {
    try {
      const res = await getPatient(patientId);
      if (!res.notModified) {
        const patientData = res.data.data;
        const formattedDob = patientData.dob ? patientData.dob.split("T")[0] : "";
        setPatient({ ...res.data.data, etag: res.etag });
        setEdit({ ...patientData, dob: formattedDob });
      
      
        
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  
  const handleUpdate = async () => {
    console.log("Sending update:", {
      id: patient.id,
      data: edit,
      etag: patient.etag,
    });
    const res = await updatePatient(patient.id, edit, patient.etag);
    if (res.error === "412 Precondition Failed") {
      setMergeHint("Another update occurred. Refetching...");
      await loadPatient();
    } else if (res.data) {
      setPatient({ ...res.data.data, etag: res.data.etag });
      setMergeHint("");
      setError("");
      alert("✅ Patient updated successfully!");
    }
    console.log(handleUpdate,'handleupdate')
  };
  console.log(patient,'patient')
  if (!patient) return <p>Loading...</p>;

  const handleChange = (field, value) => {
    setEdit(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="panel">
      <button onClick={goBack} className="back-btn">← Back</button>

      <h2>{patient.firstName} {patient.lastName}</h2>
      <p style={{ fontSize: "14px" }}>  <span style={{ color: "#60A5FA", fontWeight: "600" }}>MRN:</span> {patient.mrn}</p>
      <p className="etag" style={{ fontSize: "14px"}}> <span style={{ color: "#60A5FA", fontWeight: "600" }}>ETag:</span>{patient.etag || "Not available"}</p>

      <div className="form-group">
        <label>MRN</label>
        <input
          value={edit.mrn || ""}
          onChange={(e) => handleChange("mrn", e.target.value)}
          placeholder="Enter MRN"
        />
      </div>

      <div className="form-group">
        <label>First Name</label>
        <input
          value={edit.firstName || ""}
          onChange={(e) => handleChange("firstName", e.target.value)}
          placeholder="Enter first name"
          
        />
      </div>

      <div className="form-group">
        <label>Last Name</label>
        <input
          value={edit.lastName || ""}
          onChange={(e) => handleChange("lastName", e.target.value)}
          placeholder="Enter last name"
        />
      </div>

      <div className="form-group">
        <label>Date of Birth</label>
        <input
          type="date"
          // value={edit.dob ? edit.dob.split("T")[0] : ""}
          value={edit.dob  || ""}
          onChange={(e) => handleChange("dob", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Sex</label>
        <select
          value={edit.sex || ""}
          onChange={(e) => handleChange("sex", e.target.value)}
          style={{ width: "100%" }}
        >
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label>Phone</label>
        <input
          value={edit.phone || ""}
          onChange={(e) => handleChange("phone", e.target.value)}
          placeholder="Enter phone"
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          value={edit.email || ""}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="Enter email"
        />
      </div>

      <div className="form-group">
        <label>Address Line 1</label>
        <input
          value={edit.addressLine1 || ""}
          onChange={(e) => handleChange("addressLine1", e.target.value)}
          placeholder="Enter address"
        />
      </div>

      <div className="form-group">
        <label>City</label>
        <input
          value={edit.city || ""}
          onChange={(e) => handleChange("city", e.target.value)}
          placeholder="Enter city"
        />
      </div>

      <div className="form-group">
        <label>Postal Code</label>
        <input
          value={edit.postalCode || ""}
          onChange={(e) => handleChange("postalCode", e.target.value)}
          placeholder="Enter postal code"
        />
      </div>

      <div className="form-group">
        <label>Country Code</label>
        <input
          value={edit.countryCode || ""}
          onChange={(e) => handleChange("countryCode", e.target.value)}
          placeholder="Enter country code"
        />
      </div>

      <div className="buton-create">
        <button onClick={handleUpdate}>Update</button>
      </div>

      {error && <div className="error">{error}</div>}
      {mergeHint && <div style={{ color: "orange" }}>{mergeHint}</div>}
    </div>
  );
}
