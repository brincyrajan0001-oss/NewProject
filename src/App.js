// // import logo from './logo.svg';
// // import './App.css';

// // function App() {
// //   return (
// //     <div className="App">
// //       <header className="App-header">
// //         <img src={logo} className="App-logo" alt="logo" />
// //         <p>
// //           Edit <code>src/App.js</code> and save to reload.
// //         </p>
// //         <a
// //           className="App-link"
// //           href="https://reactjs.org"
// //           target="_blank"
// //           rel="noopener noreferrer"
// //         >
// //           Learn React
// //         </a>
// //       </header>
// //     </div>
// //   );
// // }

// // export default App;
// import React from "react";
// import CreatePatientForm from "../src/Components/CreatePatientForm";
// import FindPatient from "../src/Components/FindPatient";
// import "./App.css";

// function App() {
//   return (
//     <div className="app-container">
//       <CreatePatientForm />
//       <FindPatient />
//     </div>
//   );
// }

// export default App;
// src/App.js
import React, { useState } from "react";
import CreatePatientForm from "./Components/CreatePatientForm";
import FindPatient from "./Components/FindPatient";
import "./App.css";
import hospitalIcon from "../src/healthcare.png"

export default function App() {
  const [activeTab, setActiveTab] = useState("create");

  return (
    <div className="app-container">
      <h1 className="app-title"> <img src={hospitalIcon} alt="Hospital Icon" className="icon" width={30} height={30}/> Patient Management Portal</h1>

      <div className="tab-buttons">
        <button
          className={activeTab === "create" ? "tab active" : "tab"}
          onClick={() => setActiveTab("create")}
        >
          Create Patient
        </button>
        <button
          className={activeTab === "find" ? "tab active" : "tab"}
          onClick={() => setActiveTab("find")}
        >
          Find Patient
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "create" ? <CreatePatientForm /> : <FindPatient />}
      </div>
    </div>
  );
}
