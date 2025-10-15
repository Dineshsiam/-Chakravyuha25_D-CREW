import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ScanLine, ListOrdered, BarChart3, Factory } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const links = [
    { name: "Home", path: "/", icon: <Home size={18} /> },
    {
      name: "Scan Attendance",
      path: "/attendance",
      icon: <ScanLine size={18} />,
    },
    {
      name: "Attendance List",
      path: "/attendance-list",
      icon: <ListOrdered size={18} />,
    },
    { name: "Dashboard", path: "/dashboard", icon: <BarChart3 size={18} /> },
  ];

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-64 bg-gradient-to-b from-gray-900 via-indigo-900 to-purple-800 
                 text-white min-h-screen shadow-2xl flex flex-col p-5 border-r border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center justify-center mb-10 gap-2">
        <Factory className="text-emerald-300" size={28} />
        <h1 className="text-2xl font-extrabold tracking-wide">
          Factory<span className="text-emerald-300">Track</span>
        </h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-3">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link key={link.path} to={link.path}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium 
                transition-all duration-300 cursor-pointer
                ${
                  isActive
                    ? "bg-emerald-600/30 text-emerald-300 border border-emerald-400/50 shadow-md"
                    : "hover:bg-emerald-500/10 hover:text-emerald-200"
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout Section */}
      <div className="mt-auto pt-10 border-t border-gray-700 text-center">
        <p className="text-xs text-gray-400">© 2025 FactoryTrack</p>
      </div>
    </motion.aside>
  );
}
