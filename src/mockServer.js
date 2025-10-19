// // src/mockServer.js
// let patients = [];
// let etagCounter = 1;

// export const mockServer = {
//   createPatient: async (data) => {
//     if (!data.firstName || !data.lastName || !data.mrn) {
//       return { error: "All fields are required" };
//     }

//     const existing = patients.find((p) => p.mrn === data.mrn);
//     if (existing) {
//       return { error: "Patient with this MRN already exists" };
//     }

//     const newPatient = { ...data, id: Date.now(), etag: `v${etagCounter++}` };
//     patients.push(newPatient);
//     return { data: newPatient };
//   },

//   searchPatients: async (query) => {
//     const q = query.toLowerCase();
//     return patients.filter(
//       (p) => p.mrn.includes(q) || p.lastName.toLowerCase().includes(q)
//     );
//   },

//   getPatient: async (id) => patients.find((p) => p.id === id),

//   updatePatient: async (id, data, etag) => {
//     const index = patients.findIndex((p) => p.id === id);
//     if (index === -1) return { error: "Not found" };

//     const current = patients[index];
//     if (current.etag !== etag) {
//       return { error: "412 Precondition Failed", conflict: current };
//     }

//     const updated = { ...current, ...data, etag: `v${etagCounter++}` };
//     patients[index] = updated;
//     return { data: updated };
//   },
// };
