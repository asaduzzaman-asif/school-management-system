import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AcademicSetup from "./pages/AcademicSetup";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Attendance from "./pages/Attendance";
import Exams from "./pages/Exams";
import Fees from "./pages/Fees";
import Expenses from "./pages/Expenses";
import Assets from "./pages/Assets";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} /> 
          <Route path="academic-setup" element={<AcademicSetup />} /> 
          <Route path="students" element={<Students />} /> 
          <Route path="teachers" element={<Teachers />} /> 
          <Route path="attendance" element={<Attendance />} />
          <Route path="exams" element={<Exams />} /> 
          <Route path="fees" element={<Fees />} /> 
          <Route path="expenses" element={<Expenses />} /> 
          <Route path="assets" element={<Assets />} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;