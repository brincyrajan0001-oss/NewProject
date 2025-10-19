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
