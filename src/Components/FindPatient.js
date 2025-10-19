import React, { useState } from "react";
import PatientDetails from "./PatientDetails";
import { searchPatients } from "../api/ApiService";


export default function FindPatient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searched, setSearched] = useState(false);
  const [expandedIds, setExpandedIds] = useState([]);

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setSearched(false);
      return;
    }

    try {
      const res = await searchPatients(trimmed);
      setResults(res.data || []);
      setSearched(true);
    } catch (err) {
      console.error("Search failed:", err);
      setSearched(true);
      setResults([]);
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (selected)
    return (
      <PatientDetails patientId={selected.id} goBack={() => setSelected(null)} />
    );

  return (
    <div className="panel">
      <h2>Find Patient</h2>

     
       <input
        placeholder="Search by MRN or Last Name"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />

      <div className="buton-create" style={{ marginBottom: "10px" }}>
        <button onClick={handleSearch}>Search</button>
      </div>

      {searched && results.length > 0 && (
        <div className="patient-grid">
          {results.map((p) => {
            const expanded = expandedIds.includes(p.id);
            return (
              <div key={p.id} className="patient-card">
                <div className="card-header">
                  <div>
                    <strong>
                      {p.firstName} {p.lastName}
                    </strong>
                    <div className="mrn">MRN: {p.mrn}</div>
                    <div className="dob">DOB: {p.dob}</div>
                  </div>
                  <div>
                    <button
                      className="expand-btn"
                      onClick={() => toggleExpand(p.id)}
                    >
                      {expanded ? "Hide Details ▲" : "Show Details ▼"}
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div className="card-details">
                    <div>Sex: {p.sex}</div>
                    <div>Phone: {p.phone}</div>
                    <div>Email: {p.email}</div>
                    <div>
                      Address: {p.addressLine1}, {p.city}, {p.postalCode},{" "}
                      {p.countryCode}
                    </div>
                  </div>
                )}

                <div className="card-footer">
                  <button onClick={() => setSelected(p)}>Edit</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {searched && results.length === 0 && (
        <p style={{ color: "gray", fontSize: "14px" }}>No matching patients found.</p>
      )}
    </div>
  );
}
