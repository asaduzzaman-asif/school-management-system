import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard"; // নতুন ইম্পোর্ট
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Fees from "./pages/Fees";
import Expenses from "./pages/Expenses";
import Assets from "./pages/Assets";     

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* নিচের লাইনটি আপডেট করা হয়েছে */}
          <Route index element={<Dashboard />} /> 
          
          <Route path="students" element={<Students />} /> 
          <Route path="teachers" element={<Teachers />} /> 
          <Route path="fees" element={<Fees />} /> 
          <Route path="expenses" element={<Expenses />} /> 
          <Route path="assets" element={<Assets />} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;