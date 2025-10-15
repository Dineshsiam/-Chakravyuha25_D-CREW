import React, { useEffect, useState } from "react";

export default function AttendanceList() {
  const [employees, setEmployees] = useState([]);

  const fetchData = async () => {
    const res = await fetch("http://127.0.0.1:5000/api/attendance");
    const json = await res.json();
    setEmployees(json);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // real-time refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">
        Real-Time Attendance List
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-2 px-4 text-left">ID</th>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Age</th>
              <th className="py-2 px-4 text-left">Department</th>
              <th className="py-2 px-4 text-left">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b hover:bg-gray-100">
                <td className="py-2 px-4">{emp.id}</td>
                <td className="py-2 px-4">{emp.name}</td>
                <td className="py-2 px-4">{emp.age}</td>
                <td className="py-2 px-4">{emp.department}</td>
                <td
                  className={`py-2 px-4 font-semibold ${
                    emp.working ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {emp.working ? "Present" : "Absent"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
