import React, { useState, useEffect } from "react";

export default function AttendanceList() {
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDept, setFilterDept] = useState("All");
  const [filterAge, setFilterAge] = useState("All");

  const fetchEmployees = async () => {
    const res = await fetch("http://127.0.0.1:5000/api/employees");
    const data = await res.json();
    setEmployees(data);
    setFiltered(data);
  };

  useEffect(() => {
    fetchEmployees();
    const interval = setInterval(fetchEmployees, 5000); // auto-refresh every 5 sec
    return () => clearInterval(interval);
  }, []);

  // ✅ Utility to compute total work time
  const calculateWorkTime = (login, logout) => {
    if (!login || !logout) return "-";
    const start = new Date(`1970-01-01T${login}`);
    const end = new Date(`1970-01-01T${logout}`);
    const diff = (end - start) / (1000 * 60 * 60);
    return diff.toFixed(2) + " hrs";
  };

  // ✅ Determine today's attendance state
  const getAttendanceState = (emp) => {
    const today = new Date().toISOString().split("T")[0];
    const todayAttendance = emp.attendance.find((a) => a.date === today);

    if (!todayAttendance || !todayAttendance.login_time) return "Absent";
    if (todayAttendance.login_time && todayAttendance.logout_time)
      return "Checked Out";
    return "Present";
  };

  // ✅ Filter logic
  useEffect(() => {
    let temp = [...employees];

    if (filterStatus !== "All") {
      temp = temp.filter((emp) => getAttendanceState(emp) === filterStatus);
    }

    if (filterDept !== "All") {
      temp = temp.filter((emp) => emp.department === filterDept);
    }

    if (filterAge !== "All") {
      temp = temp.filter((emp) => {
        if (filterAge === "18-25") return emp.age >= 18 && emp.age <= 25;
        if (filterAge === "26-35") return emp.age >= 26 && emp.age <= 35;
        if (filterAge === "36-50") return emp.age >= 36 && emp.age <= 50;
        if (filterAge === "50+") return emp.age > 50;
        return true;
      });
    }

    setFiltered(temp);
  }, [filterStatus, filterDept, filterAge, employees]);

  const departments = [
    "All",
    ...new Set(employees.map((emp) => emp.department)),
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        🕒 Attendance Dashboard
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-6 mb-6 bg-white p-4 rounded-lg shadow">
        {/* Status Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1">
            Attendance Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border rounded-lg shadow-sm"
          >
            <option value="All">All</option>
            <option value="Present">Present (Active)</option>
            <option value="Checked Out">Checked Out</option>
            <option value="Absent">Absent</option>
          </select>
        </div>

        {/* Department Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1">
            Department
          </label>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="p-2 border rounded-lg shadow-sm"
          >
            {departments.map((d, i) => (
              <option key={i} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Age Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1">
            Age Group
          </label>
          <select
            value={filterAge}
            onChange={(e) => setFilterAge(e.target.value)}
            className="p-2 border rounded-lg shadow-sm"
          >
            <option value="All">All Ages</option>
            <option value="18-25">18 - 25</option>
            <option value="26-35">26 - 35</option>
            <option value="36-50">36 - 50</option>
            <option value="50+">50+</option>
          </select>
        </div>
      </div>

      {/* Attendance Table */}
      <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
        <thead className="bg-gray-200">
          <tr className="text-left">
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Age</th>
            <th className="py-2 px-4 border-b">Department</th>
            <th className="py-2 px-4 border-b">Login Time</th>
            <th className="py-2 px-4 border-b">Logout Time</th>
            <th className="py-2 px-4 border-b">Total Work</th>
            <th className="py-2 px-4 border-b">Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((emp) => {
            const today = new Date().toISOString().split("T")[0];
            const todayAttendance = emp.attendance.find(
              (a) => a.date === today
            );
            const login = todayAttendance?.login_time || "-";
            const logout = todayAttendance?.logout_time || "-";
            const total = calculateWorkTime(login, logout);
            const status = getAttendanceState(emp);

            let rowColor = "bg-red-50"; // default Absent
            if (status === "Present") rowColor = "bg-green-50";
            if (status === "Checked Out") rowColor = "bg-blue-50";

            return (
              <tr
                key={emp.id}
                className={`text-center hover:bg-gray-50 ${rowColor}`}
              >
                <td className="py-2 px-4 border-b">{emp.id}</td>
                <td className="py-2 px-4 border-b">{emp.name}</td>
                <td className="py-2 px-4 border-b">{emp.age}</td>
                <td className="py-2 px-4 border-b">{emp.department}</td>
                <td className="py-2 px-4 border-b">{login}</td>
                <td className="py-2 px-4 border-b">{logout}</td>
                <td className="py-2 px-4 border-b">{total}</td>
                <td className="py-2 px-4 border-b font-semibold">
                  {status === "Present"
                    ? "🟢 Present (Active)"
                    : status === "Checked Out"
                    ? "🔵 Checked Out"
                    : "❌ Absent"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
