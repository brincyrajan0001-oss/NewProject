// import React, { useEffect, useState } from "react";
// import { mockServer } from "../mockServer";


// export default function PatientDetails({ patientId, goBack }) {
//   const [patient, setPatient] = useState(null);
//   const [edit, setEdit] = useState({});
//   const [error, setError] = useState("");
//   const [mergeHint, setMergeHint] = useState("");

//   useEffect(() => {
//     mockServer.getPatient(patientId).then(setPatient);
//   }, [patientId]);

//   const handleUpdate = async () => {
//     const res = await mockServer.updatePatient(patient.id, edit, patient.etag);
//     if (res.error === "412 Precondition Failed") {
//       setMergeHint("Another update occurred. Refetching...");
//       setTimeout(async () => {
//         const fresh = await mockServer.getPatient(patient.id);
//         setPatient(fresh);
//         setMergeHint("Data refreshed. Please review and update again.");
//       }, 1000);
//     } else if (res.error) {
//       setError(res.error);
//     } else {
//       setPatient(res.data);
//       setMergeHint("");
//     }
//   };

//   if (!patient) return <p>Loading...</p>;

//   return (
//     <div className="panel">
//         {/* <div className="buton-back">
//     <button onClick={goBack}>← Back</button>
//   </div> */}
//    <button onClick={goBack} className="back-btn">← Back</button>

//       <h2>
//         {patient.firstName} {patient.lastName}
//       </h2>
//       <p style={{ fontSize: "14px" }}>MRN: {patient.mrn}</p>
//       <p className="etag" style={{ fontSize: "14px" }}>ETag: {patient.etag}</p>
//       <label>Edit Last Name</label>
//       <input
//         value={edit.lastName || ""}
//         onChange={(e) => setEdit({ lastName: e.target.value })}
//         placeholder="Enter new last name"
//       />
//      <div className="buton-create"> <button onClick={handleUpdate}>Update</button></div> 
//       {error && <div className="error">{error}</div>}
//       {mergeHint && <div style={{ color: "orange" }}>{mergeHint}</div>}
//     </div>
//   );
// }
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
        setPatient({ ...res.data.data, etag: res.etag });
        setEdit(res.data.data); // initialize edit with patient data
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    const res = await updatePatient(patient.id, edit, patient.etag);
    if (res.error === "412 Precondition Failed") {
      setMergeHint("Another update occurred. Refetching...");
      await loadPatient();
    } else if (res.data) {
      setPatient({ ...res.data.data, etag: res.data.etag });
      setMergeHint("");
      setError("");
    }
  };

  if (!patient) return <p>Loading...</p>;

  const handleChange = (field, value) => {
    setEdit(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="panel">
      <button onClick={goBack} className="back-btn">← Back</button>

      <h2>{patient.firstName} {patient.lastName}</h2>
      <p style={{ fontSize: "14px" }}>MRN: {patient.mrn}</p>
      <p className="etag" style={{ fontSize: "14px" }}>ETag: {patient.etag}</p>

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
          value={edit.dob ? edit.dob.split("T")[0] : ""}
          onChange={(e) => handleChange("dob", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Sex</label>
        <select
          value={edit.sex || ""}
          onChange={(e) => handleChange("sex", e.target.value)}
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
