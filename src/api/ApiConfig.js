const BASE_URL = "http://localhost:8080/";
// const BASE_URL = "https://stage.edsys.in:3014/";
const PATH = "api/v1/";
const ApiConfig = {
  BASE_URL: BASE_URL,
  PATH: PATH,
  //Dashboard
  PATIENT_CREATE: BASE_URL + PATH + "patients",
  PATIENT_SEARCH: BASE_URL + PATH + "patients",
  PATIENT_DETAILS: (id) => BASE_URL + PATH + `patients/${id}`, // for single patient

}
export default ApiConfig;
// const BASE_URL = "http://localhost:8080/";

// const ApiConfig = {
//   PATIENT_CREATE: `${BASE_URL}api/v1/patients`,
// };

// export default ApiConfig;
