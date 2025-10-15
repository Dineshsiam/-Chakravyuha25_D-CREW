import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("http://127.0.0.1:5000/api/production");
      const d = await res.json();
      setData(d);
    };
    load();
    const interval = setInterval(load, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h2>Factory Dashboard</h2>
      <p>Present Workers: {data.present}</p>
      <p>Expected Output: {data.expected_output}</p>
      <p>Efficiency: {data.efficiency}%</p>

      <Line
        data={{
          labels: data.history.map((x) => x.date),
          datasets: [
            {
              label: "Daily Output",
              data: data.history.map((x) => x.spring + x.cirrus),
            },
          ],
        }}
      />
    </div>
  );
}
