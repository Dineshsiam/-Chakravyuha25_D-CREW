import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function AttendanceScan() {
  const [lastScanned, setLastScanned] = useState(null);
  const [status, setStatus] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    id: "",
    name: "",
    department: "",
  });

  // -------------------------------
  // 📷 QR Code Scanner Setup
  // -------------------------------
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 300 },
      false
    );

    const onScanSuccess = async (scannedText) => {
      try {
        const parsed = JSON.parse(scannedText); // Expecting { id, name, department }
        setLastScanned(parsed);
        setStatus("⏳ Updating attendance...");

        const res = await fetch("http://127.0.0.1:5000/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: parsed.id }),
        });

        const data = await res.json();

        if (data.status === "ok") {
          setStatus(
            `${parsed.name} ${
              data.working ? "checked in ✅" : "checked out ❌"
            } at ${new Date().toLocaleTimeString()}`
          );
          window.dispatchEvent(new Event("attendanceUpdated"));
        } else if (data.status === "unknown_user") {
          setStatus("⚠️ User not found. Please register.");
          setShowAddUser(true);
          setNewUser({
            id: parsed.id,
            name: parsed.name || "",
            department: parsed.department || "",
          });
        } else {
          setStatus("⚠️ Attendance update failed");
        }
      } catch (err) {
        console.error("QR parse or network error", err);
        setStatus("❌ Invalid QR or server error");
      }
    };

    scanner.render(onScanSuccess);
    return () => scanner.clear();
  }, []);

  // -------------------------------
  // 🧍 Add New User
  // -------------------------------
  const handleAddUser = async (e) => {
    e.preventDefault();
    setStatus("⏳ Registering new user...");
    try {
      const res = await fetch("http://127.0.0.1:5000/api/add_employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();

      if (data.status === "created") {
        setStatus("✅ User added successfully!");
        setShowAddUser(false);
        setNewUser({ id: "", name: "", department: "" });
      } else {
        setStatus("⚠️ Failed to add user.");
      }
    } catch (err) {
      console.error("Add user error", err);
      setStatus("❌ Server error while adding user.");
    }
  };

  // -------------------------------
  // 🖥️ UI
  // -------------------------------
  return (
    <div className="flex flex-col items-center mt-8 space-y-6">
      <h2 className="text-3xl font-extrabold text-center text-blue-700 mb-4">
        📷 Employee Attendance Scanner
      </h2>

      {/* QR Scanner Card */}
      <div className="p-4 border-2 border-dashed border-blue-400 rounded-xl shadow-lg">
        <div id="qr-reader" className="w-[320px] h-[320px]" />
        <p className="mt-2 text-center text-gray-600 font-medium">
          Align the employee QR code inside the box
        </p>
      </div>

      {/* Last Scanned Info */}
      {lastScanned && (
        <div className="w-[350px] p-4 rounded-xl shadow-md bg-white flex flex-col items-center space-y-2">
          <p className="text-lg font-semibold text-gray-800">
            👤 {lastScanned.name} ({lastScanned.department})
          </p>
          <p className="text-sm text-gray-500">ID: {lastScanned.id}</p>
          <p
            className={`mt-2 font-medium ${
              status.includes("✅")
                ? "text-green-600"
                : status.includes("❌")
                ? "text-red-600"
                : status.includes("⚠️")
                ? "text-yellow-600"
                : "text-blue-600"
            }`}
          >
            {status}
          </p>
        </div>
      )}

      {/* Toggle Add New User */}
      <button
        onClick={() => setShowAddUser(!showAddUser)}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full shadow-md transition duration-300"
      >
        {showAddUser ? "Close Form ✖️" : "➕ Add New Employee"}
      </button>

      {/* Add New User Form */}
      {showAddUser && (
        <form
          onSubmit={handleAddUser}
          className="w-[350px] p-6 rounded-xl shadow-lg bg-gray-50 flex flex-col space-y-3"
        >
          <h3 className="text-xl font-bold text-center text-blue-700 mb-3">
            Register New Employee
          </h3>

          <input
            type="text"
            placeholder="Employee Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="number"
            placeholder="Age"
            value={newUser.age || ""}
            onChange={(e) => setNewUser({ ...newUser, age: e.target.value })}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="text"
            placeholder="Department"
            value={newUser.department}
            onChange={(e) =>
              setNewUser({ ...newUser, department: e.target.value })
            }
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
            required
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold shadow-md transition duration-300"
          >
            Add Employee
          </button>
        </form>
      )}
    </div>
  );
}
