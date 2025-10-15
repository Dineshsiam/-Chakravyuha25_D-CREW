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
    <header className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-700 text-white">
      <div className="text-center space-y-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight">
            Welcome!
          </h1>
          <p className="mt-4 text-lg text-slate-200/90 max-w-xl mx-auto">
            Real-time workforce attendance, production analytics, and prediction
            dashboard for your factory.
          </p>
        </motion.div>

        <div className="mt-8 text-sm text-slate-300 flex justify-center gap-3">
          <span>Slogan:</span>
          <div className="relative h-6 w-72 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -18, opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="absolute left-0"
              >
                <span className="font-medium text-emerald-200">
                  {slogans[index]}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
