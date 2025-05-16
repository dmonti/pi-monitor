import { useEffect, useState } from "react";
import { SystemInfoSection } from "./SystemInfoSection";
import { StatsSection } from "./StatsSection";

export default function HomePage() {
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/info")
      .then((res) => res.json())
      .then((data) => {
        setInfo(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.toString());
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div className="dashboard-container">
      <header>
        <h1>Monitor Dashboard</h1>
        <p className="subtitle">System Overview</p>
      </header>
      <main>
        <SystemInfoSection />
        <StatsSection />
      </main>
    </div>
  );
}