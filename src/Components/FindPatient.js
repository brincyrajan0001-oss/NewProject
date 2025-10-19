// import React, { useState } from "react";
// import { mockServer } from "../mockServer";
// import PatientDetails from "./PatientDetails";

// export default function FindPatient() {
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState([]);
//   const [selected, setSelected] = useState(null);

//   const handleSearch = async () => {
//     const res = await mockServer.searchPatients(query);
//     setResults(res);
//   };

//   if (selected)
//     return (
//       <PatientDetails patientId={selected.id} goBack={() => setSelected(null)} />
//     );

//   return (
//     <div className="panel">
//       <h2>Find Patient</h2>
//       <input
//         placeholder="Search by MRN or Last Name"
//         value={query}
//         onChange={(e) => setQuery(e.target.value)}
//       />
//         <div className="buton-create" style={{marginBottom:"10px"}}>
//       <button onClick={handleSearch}>Search</button></div>
//       <div className="patient-list">
//         {results.map((p) => (
//           <div
//             key={p.id}
//             className="patient-card"
//             onClick={() => setSelected(p)}
//             style={{ cursor: "pointer" }}
//           >
//             <strong>
//               {p.firstName} {p.lastName}
//             </strong>
//             <div style={{ fontSize: "14px" }}>MRN: {p.mrn}</div>

//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
// import React, { useState } from "react";
// import PatientDetails from "./PatientDetails";
// import { searchPatients } from "../api/ApiService";

// export default function FindPatient() {
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState([]);
//   const [selected, setSelected] = useState(null);
//   const [searched, setSearched] = useState(false); // to know if search was attempted

//   const handleSearch = async () => {
//     const trimmed = query.trim();
//     if (!trimmed) {
//       setResults([]);
//       setSearched(false);
//       return;
//     }

//     try {
//       const res = await searchPatients(trimmed);
//       setResults(res.data || []);
//       setSearched(true);
//     } catch (err) {
//       console.error("Search failed:", err);
//       setSearched(true);
//       setResults([]);
//     }
//   };

//   if (selected)
//     return (
//       <PatientDetails patientId={selected.id} goBack={() => setSelected(null)} />
//     );

//   return (
//     <div className="panel">
//       <h2>Find Patient</h2>

//       <input
//         placeholder="Search by MRN or Last Name"
//         value={query}
//         onChange={(e) => setQuery(e.target.value)}
//         onKeyDown={(e) => e.key === "Enter" && handleSearch()}
//       />

//       <div className="buton-create" style={{ marginBottom: "10px" }}>
//         <button onClick={handleSearch}>Search</button>
//       </div>

//       {/* show list only when results exist AND user searched */}
//       {searched && results.length > 0 && (
//         <div className="patient-list">
//           {results.map((p) => (
//             <div
//               key={p.id}
//               className="patient-card"
//               onClick={() => setSelected(p)}
//               style={{ cursor: "pointer" }}
//             >
//               <strong>
//                 {p.firstName} {p.lastName}
//               </strong>
//               <div style={{ fontSize: "14px" }}>MRN: {p.mrn}</div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* optional: show message if no results */}
//       {searched && results.length === 0 && (
//         <p style={{ color: "gray", fontSize: "14px" }}>No matching patients found.</p>
//       )}
//     </div>
//   );
// }
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

      {/* <div className="search-bar">
        <input
          placeholder="Search by MRN or Last Name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button onClick={handleSearch}>Search</button>
      </div> */}
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
                    <div className="dob">DOB: {p.dob?.split("T")[0]}</div>
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
