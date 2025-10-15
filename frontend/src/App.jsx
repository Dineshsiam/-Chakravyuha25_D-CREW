// App.jsx
import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import AttendanceList from "./pages/AttendanceList";
import WelcomeHero from "./WelcomeHero";

export default function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-100">
        <Routes>
          <Route path="/" element={<WelcomeHero />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/attendance-list" element={<AttendanceList />} />
        </Routes>
      </div>
    </div>
  );
}
