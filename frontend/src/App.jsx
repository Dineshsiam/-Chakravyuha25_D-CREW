import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";

export default function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Dashboard</Link> | <Link to="/attendance">Attendance</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/attendance" element={<Attendance />} />
      </Routes>
    </BrowserRouter>
  );
}
