import React from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function Attendance() {
  React.useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
    scanner.render((decodedText) => {
      fetch("http://127.0.0.1:5000/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: decodedText }),
      });
    });
  }, []);

  return (
    <div>
      <h2>Scan QR for Attendance</h2>
      <div id="reader" style={{ width: "300px" }}></div>
    </div>
  );
}
