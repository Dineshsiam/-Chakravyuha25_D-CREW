import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A569BD"];

export default function ProductionPredictionDashboard() {
  const [stocks, setStocks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    predicted_completion: 0,
    actual_completion: 0,
    target_completion: 0,
    available_components: 0,
    num_workers_present: 0,
    work_hours: 0,
    age_summary: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ------------------------------
  // Fetch data and predict
  // ------------------------------
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stock and employee data
      const [stockRes, empRes] = await Promise.all([
        fetch("http://127.0.0.1:5000/api/stock"),
        fetch("http://127.0.0.1:5000/api/employees"),
      ]);

      if (!stockRes.ok || !empRes.ok) throw new Error("Failed to fetch data");

      const stockData = await stockRes.json();
      const empData = await empRes.json();

      // Sort stocks by quantity
      stockData.sort((a, b) => b.quantity - a.quantity);

      setStocks(stockData);
      setEmployees(empData);

      // ------------------------------
      // Calculate basic features
      // ------------------------------
      const totalComponents = stockData.reduce((acc, s) => acc + s.quantity, 0);
      const avgQuantity = stockData.length
        ? totalComponents / stockData.length
        : 0;

      const numEmployeesPresent = empData.filter((e) => e.working).length;
      const workHours = numEmployeesPresent * 8; // assuming 8h shift

      const features = {
        customer_order: totalComponents,
        efficiency: numEmployeesPresent > 0 ? 0.9 : 0.7,
        cycle_time_min: avgQuantity,
        manpower: numEmployeesPresent,
        foam_available: totalComponents,
        spring_available: totalComponents,
      };

      // ------------------------------
      // Prediction API
      // ------------------------------
      const predictRes = await fetch("http://127.0.0.1:5000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features }),
      });

      const predictData = await predictRes.json();

      if (!predictRes.ok || predictData.error) {
        throw new Error(predictData.error || "Prediction failed");
      }

      const predictedCompletion =
        parseFloat(predictData.prediction) || totalComponents * 2;
      const actualCompletion = predictedCompletion * 0.92; // example factor
      const targetCompletion = predictedCompletion * 1.1;

      // ------------------------------
      // Age-wise productivity
      // ------------------------------
      const ageGroups = {};
      empData.forEach((e) => {
        const group = `${Math.floor(e.age / 10) * 10}s`;
        if (!ageGroups[group]) ageGroups[group] = { count: 0, working: 0 };
        ageGroups[group].count += 1;
        if (e.working) ageGroups[group].working += 1;
      });

      const ageSummary = Object.keys(ageGroups).map((k) => ({
        age_group: k,
        total: ageGroups[k].count,
        working: ageGroups[k].working,
        efficiency:
          ageGroups[k].count > 0
            ? ((ageGroups[k].working / ageGroups[k].count) * 100).toFixed(0)
            : 0,
      }));

      setDashboardData({
        predicted_completion: predictedCompletion,
        actual_completion: actualCompletion,
        target_completion: targetCompletion,
        available_components: totalComponents,
        num_workers_present: numEmployeesPresent,
        work_hours: workHours,
        age_summary: ageSummary,
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const efficiency =
    dashboardData.predicted_completion > 0
      ? (dashboardData.actual_completion / dashboardData.predicted_completion) *
        100
      : 0;

  const targetGap =
    dashboardData.target_completion > 0
      ? (
          (dashboardData.actual_completion / dashboardData.target_completion) *
          100
        ).toFixed(1)
      : 0;

  const efficiencyColor =
    efficiency >= 90 ? "green" : efficiency >= 70 ? "orange" : "red";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold text-gray-600">
        Loading dashboard data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-8">
      <h1 className="text-3xl font-bold text-center text-gray-800">
        Company Production Prediction Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-600 font-medium">Available Components</h2>
          <p className="text-2xl font-semibold text-indigo-600">
            {dashboardData.available_components.toFixed(0)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-600 font-medium">Predicted Completion</h2>
          <p className="text-2xl font-semibold text-blue-600">
            {dashboardData.predicted_completion.toFixed(0)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-600 font-medium">Actual Completion</h2>
          <p className="text-2xl font-semibold text-green-600">
            {dashboardData.actual_completion.toFixed(0)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-600 font-medium">Target Achieved</h2>
          <p
            className="text-2xl font-semibold"
            style={{ color: efficiencyColor }}
          >
            {targetGap}%
          </p>
          <div className="h-2 w-full bg-gray-200 rounded-full mt-2">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${targetGap > 100 ? 100 : targetGap}%`,
                backgroundColor: efficiencyColor,
              }}
            />
          </div>
        </div>
      </div>

      {/* Workers & Hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <h3 className="text-gray-600 font-medium">Workers Present</h3>
          <p className="text-2xl font-semibold text-indigo-600">
            {dashboardData.num_workers_present}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow text-center">
          <h3 className="text-gray-600 font-medium">Estimated Work Hours</h3>
          <p className="text-2xl font-semibold text-green-600">
            {dashboardData.work_hours}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-center">
            Component Stock Distribution
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={stocks}
                dataKey="quantity"
                nameKey="material"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {stocks.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} units`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-center">
            Predicted vs Actual vs Target Output
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={[
                {
                  name: "Today",
                  Predicted: dashboardData.predicted_completion,
                  Actual: dashboardData.actual_completion,
                  Target: dashboardData.target_completion,
                  WorkHours: dashboardData.work_hours,
                },
              ]}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [`${value}`, name]} />
              <Legend />
              <Bar dataKey="Predicted" fill="#3b82f6" />
              <Bar dataKey="Actual" fill="#10b981" />
              <Bar dataKey="Target" fill="#f59e0b" />
              <Bar dataKey="WorkHours" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Age-wise Productivity */}
      <div className="bg-white p-4 rounded-lg shadow mt-6">
        <h3 className="text-lg font-semibold mb-4 text-center">
          Age-wise Productivity
        </h3>
        <table className="min-w-full bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-2 px-4">Age Group</th>
              <th className="py-2 px-4">Total Employees</th>
              <th className="py-2 px-4">Working</th>
              <th className="py-2 px-4">Efficiency %</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.age_summary.map((age) => (
              <tr key={age.age_group} className="border-b hover:bg-gray-100">
                <td className="py-2 px-4">{age.age_group}</td>
                <td className="py-2 px-4">{age.total}</td>
                <td className="py-2 px-4">{age.working}</td>
                <td className="py-2 px-4">{age.efficiency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
