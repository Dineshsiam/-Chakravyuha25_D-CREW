import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function WelcomeHero() {
  const slogans = [
    "Live QR Attendance",
    "Automatic Workforce Analytics",
    "Toggle Attendance Real-time",
    "Visual Dashboard on TV",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setIndex((i) => (i + 1) % slogans.length),
      3500
    );
    return () => clearInterval(t);
  }, []);

  return (
    <header className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#3b0764] text-white">
      {/* Animated background glow */}
      <div className="absolute inset-0">
        <div className="absolute w-[600px] h-[600px] bg-purple-600/30 blur-[150px] rounded-full top-1/3 left-1/4 animate-pulse" />
        <div className="absolute w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full bottom-1/3 right-1/4 animate-pulse delay-1000" />
      </div>

      <div className="text-center relative z-10 space-y-10 px-6">
        {/* Title */}
        <motion.h1
          className="text-5xl sm:text-7xl font-extrabold leading-tight bg-gradient-to-r from-emerald-300 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-lg"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Welcome to Smart Workforce
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mt-4 text-lg sm:text-xl text-slate-300/90 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          Empowering your factory with real-time attendance, predictive
          analytics, and productivity visualization.
        </motion.p>

        {/* Slogan box (fixed height) */}
        <div className="mt-12 flex justify-center">
          <div className="relative w-80 h-14 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="backdrop-blur-md bg-white/10 border border-white/20 px-6 py-3 rounded-2xl shadow-lg text-center">
                  <span className="font-semibold text-emerald-300 tracking-wide text-lg">
                    {slogans[index]}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Get Started Button */}
        <motion.div
          className="mt-20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
         
        </motion.div>
      </div>

      {/* Floating lights */}
      <motion.div
        className="absolute top-10 left-10 w-4 h-4 bg-emerald-400 rounded-full shadow-[0_0_30px_8px_rgba(16,185,129,0.4)]"
        animate={{
          y: [0, -15, 0],
        }}
        transition={{ repeat: Infinity, duration: 3 }}
      />
      <motion.div
        className="absolute bottom-16 right-16 w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_25px_5px_rgba(59,130,246,0.4)]"
        animate={{
          y: [0, 20, 0],
        }}
        transition={{ repeat: Infinity, duration: 4 }}
      />
    </header>
  );
}
