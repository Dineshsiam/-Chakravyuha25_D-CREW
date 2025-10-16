import React, { useEffect, useState } from "react";

export default function StockManagement() {
  const [stocks, setStocks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [productionData, setProductionData] = useState({});
  const [formData, setFormData] = useState({
    material: "",
    category: "",
    quantity: "",
    unit: "",
    avg_daily_use: "",
    lead_time_days: "",
    demand_trend: "",
  });
  const [loading, setLoading] = useState(true);

  // --------------------- Fetch Data ---------------------
  const fetchData = async () => {
    try {
      setLoading(true);
      const [stockRes, empRes, prodRes] = await Promise.all([
        fetch("http://127.0.0.1:5000/api/stock"),
        fetch("http://127.0.0.1:5000/api/employees"),
        fetch("http://127.0.0.1:5000/api/stock_stats"),
      ]);

      const stockData = await stockRes.json();
      const empData = await empRes.json();
      const prodData = await prodRes.json();

      console.log("Stocks:", stockData);
      console.log("Employees:", empData);
      console.log("Production Data:", prodData);

      setStocks(stockData);
      setEmployees(empData);
      setProductionData(prodData || {});

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --------------------- Add Stock ---------------------
  const addStock = async (e) => {
    e.preventDefault();
    if (
      !formData.material ||
      !formData.unit ||
      !formData.quantity ||
      !formData.avg_daily_use
    ) {
      alert("Please fill all required fields!");
      return;
    }
    try {
      await fetch("http://127.0.0.1:5000/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          material: formData.material,
          category: formData.category || "General",
          quantity: parseInt(formData.quantity, 10),
          unit: formData.unit,
          avg_daily_use: parseInt(formData.avg_daily_use, 10),
          lead_time_days: parseInt(formData.lead_time_days || 1, 10),
          demand_trend: parseFloat(formData.demand_trend || 1.0),
          last_restock: new Date().toISOString().split("T")[0],
        }),
      });
      setFormData({
        material: "",
        category: "",
        quantity: "",
        unit: "",
        avg_daily_use: "",
        lead_time_days: "",
        demand_trend: "",
      });
      fetchData();
    } catch (err) {
      console.error("Error adding stock:", err);
    }
  };

  // --------------------- Remove Stock ---------------------
  const removeStock = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stock?")) return;
    try {
      await fetch(`http://127.0.0.1:5000/api/stock/${id}`, {
        method: "DELETE",
      });
      fetchData();
    } catch (err) {
      console.error("Error deleting stock:", err);
    }
  };

  // --------------------- Helpers ---------------------
  const remainingStockAfterLeadTime = (stock) => {
    const projectedUse = stock.avg_daily_use * (stock.lead_time_days || 1);
    return stock.quantity - projectedUse;
  };

  const getTodayStatus = (emp) => {
    const today = new Date().toISOString().split("T")[0];
    const todayAttendance = emp.attendance?.find((a) => a.date === today);
    if (!todayAttendance || !todayAttendance.login_time) return "Absent";
    if (todayAttendance.logout_time) return "Checked Out";
    return "Present";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold text-gray-600">
        Loading data...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-8">
      <h1 className="text-3xl font-bold text-center text-gray-800">
        📦 Stock & Production Dashboard
      </h1>

      {/* Add Stock Form */}
      <form
        onSubmit={addStock}
        className="flex flex-wrap gap-4 items-center justify-center bg-white p-4 rounded-lg shadow"
      >
        <input
          type="text"
          placeholder="Material"
          className="border p-2 rounded w-48"
          value={formData.material}
          onChange={(e) =>
            setFormData({ ...formData, material: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Category"
          className="border p-2 rounded w-32"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Quantity"
          min="0"
          className="border p-2 rounded w-24"
          value={formData.quantity}
          onChange={(e) =>
            setFormData({ ...formData, quantity: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Unit"
          className="border p-2 rounded w-24"
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
        />
        <input
          type="number"
          placeholder="Avg Daily Use"
          min="0"
          className="border p-2 rounded w-32"
          value={formData.avg_daily_use}
          onChange={(e) =>
            setFormData({ ...formData, avg_daily_use: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Lead Time (days)"
          min="0"
          className="border p-2 rounded w-32"
          value={formData.lead_time_days}
          onChange={(e) =>
            setFormData({ ...formData, lead_time_days: e.target.value })
          }
        />
        <input
          type="number"
          step="0.1"
          placeholder="Demand Trend"
          className="border p-2 rounded w-24"
          value={formData.demand_trend}
          onChange={(e) =>
            setFormData({ ...formData, demand_trend: e.target.value })
          }
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Stock
        </button>
      </form>

      {/* Stock Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead className="bg-blue-700 text-white">
            <tr>
              <th className="py-2 px-4">ID</th>
              <th className="py-2 px-4">Material</th>
              <th className="py-2 px-4">Category</th>
              <th className="py-2 px-4">Qty</th>
              <th className="py-2 px-4">Unit</th>
              <th className="py-2 px-4">Avg Daily Use</th>
              <th className="py-2 px-4">Lead Time (days)</th>
              <th className="py-2 px-4">Last Restock</th>
              <th className="py-2 px-4">Demand Trend</th>
              <th className="py-2 px-4">Stock Status</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stocks.length > 0 ? (
              stocks.map((item) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-gray-100 transition-all"
                >
                  <td className="py-2 px-4">{item.id}</td>
                  <td className="py-2 px-4">{item.material}</td>
                  <td className="py-2 px-4">{item.category}</td>
                  <td className="py-2 px-4">{item.quantity}</td>
                  <td className="py-2 px-4">{item.unit || "pcs"}</td>
                  <td className="py-2 px-4">{item.avg_daily_use}</td>
                  <td className="py-2 px-4">{item.lead_time_days}</td>
                  <td className="py-2 px-4">{item.last_restock}</td>
                  <td className="py-2 px-4">{item.demand_trend}</td>
                  <td className="py-2 px-4">
                    {remainingStockAfterLeadTime(item) < 0 ? (
                      <span className="text-red-600 font-bold">Reorder!</span>
                    ) : (
                      <span className="text-green-600">OK</span>
                    )}
                  </td>
                  <td className="py-2 px-4 space-x-2">
                    <button
                      onClick={() => removeStock(item.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="11"
                  className="text-center py-4 text-gray-500 italic"
                >
                  No stock data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Employees Status */}
      <h2 className="text-2xl font-semibold mt-8">👷 Employee Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {employees.map((emp) => {
          const status = getTodayStatus(emp);
          const color =
            status === "Present"
              ? "bg-green-600"
              : status === "Checked Out"
              ? "bg-blue-600"
              : "bg-gray-500";
          return (
            <div
              key={emp.id}
              className="bg-white p-4 rounded shadow flex flex-col items-center"
            >
              <img
                src={`http://127.0.0.1:5000/api/qr/${emp.id}`}
                alt="QR"
                className="w-16 h-16 mb-2"
              />
              <div className="font-bold">{emp.name}</div>
              <div className="text-sm">{emp.department}</div>
              <div className={`mt-2 px-2 py-1 rounded text-white ${color}`}>
                {status === "Present"
                  ? "Working"
                  : status === "Checked Out"
                  ? "Checked Out"
                  : "Absent"}
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="text-2xl font-semibold mt-8">🏭 Production Summary</h2>
      {productionData && productionData.predicted_completion !== undefined ? (
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-2 px-4">Predicted Output</th>
              <th className="py-2 px-4">Actual Output</th>
              <th className="py-2 px-4">Efficiency %</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-100">
              <td className="py-2 px-4">
                {productionData.predicted_completion}
              </td>
              <td className="py-2 px-4">{productionData.actual_completion}</td>
              <td className="py-2 px-4">{productionData.efficiency}%</td>
            </tr>
          </tbody>
        </table>
      ) : (
        <div className="text-gray-500 py-4 text-center">
          No production data available
        </div>
      )}
    </div>
  );
}
