import React, { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function Attendance() {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });

    scanner.render(async (decodedText) => {
      // Toggle attendance by sending POST request
      const res = await fetch("http://127.0.0.1:5000/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: decodedText }),
      });
      const data = await res.json();
      alert(
        `Attendance for ID ${decodedText} is now ${
          data.working ? "Present" : "Absent"
        }`
      );
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Scan QR to Toggle Attendance</h1>
      <div
        id="reader"
        className="w-80 h-80 bg-white shadow-lg rounded-lg border border-gray-300"
      ></div>
    </div>
  );
}
