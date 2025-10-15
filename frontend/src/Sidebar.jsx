import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  const links = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Scan Attendance", path: "/attendance" },
    { name: "Attendance List", path: "/attendance-list" },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Factory Tracker</h1>
      <nav className="flex flex-col gap-3">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`p-2 rounded hover:bg-gray-700 transition ${
              location.pathname === link.path ? "bg-gray-700" : ""
            }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
