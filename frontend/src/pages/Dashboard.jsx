import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [data, setData] = useState({
    predicted_output: 0,
    actual_output: 0,
    efficiency: 0,
    ageSegmentation: [],
    departments: [],
  });

  const fetchData = async () => {
    const res = await fetch("http://127.0.0.1:5000/api/dashboard");
    const json = await res.json();
    setData(json);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const efficiency =
    data.efficiency || (data.actual_output / data.predicted_output) * 100 || 0;

  return (
    <div className="p-6 space-y-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Workforce & Production Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded p-4">
          <h3 className="font-bold mb-2">Predicted Production</h3>
          <p className="text-2xl font-semibold text-blue-600">
            {data.predicted_output} Units
          </p>
        </div>

        <div className="bg-white shadow rounded p-4">
          <h3 className="font-bold mb-2">Actual Production</h3>
          <p className="text-2xl font-semibold text-green-600">
            {data.actual_output} Units
          </p>
        </div>

        <div className="bg-white shadow rounded p-4">
          <h3 className="font-bold mb-2">Efficiency</h3>
          <p className="text-2xl font-semibold text-purple-600">
            {efficiency.toFixed(2)}%
          </p>
          <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
            <div
              className="bg-purple-600 h-4 rounded-full"
              style={{ width: `${efficiency}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Age Segmentation Chart */}
      <div className="bg-white shadow rounded p-4">
        <h3 className="font-bold mb-2">Age-Based Workforce Segmentation</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.ageSegmentation}>
            <XAxis dataKey="age_group" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" name="Workers Count" />
            <Bar
              dataKey="productivity"
              fill="#10b981"
              name="Avg Productivity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Department Production Chart */}
      <div className="bg-white shadow rounded p-4">
        <h3 className="font-bold mb-2">Department Production</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.departments}>
            <XAxis dataKey="department" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="achieved" fill="#f97316" name="Achieved" />
            <Bar dataKey="target" fill="#3b82f6" name="Target" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
