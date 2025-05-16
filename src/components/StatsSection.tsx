import React, { useEffect, useState } from "react";

interface StatsData {
  cpu: { usage: string; temperature: string; cores: string };
  memory: { used: string; total: string; usage: string };
  swap: { used: string; total: string; usage: string };
  disk: { used: string; total: string; usage: string };
  network: { download: string; upload: string; active: string };
}

export const StatsSection: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/system/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch stats");
        return res.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.toString());
        setLoading(false);
      });
  }, []);

  if (loading) return <section className="stats"><div>Loading...</div></section>;
  if (error || !stats) return <section className="stats"><div style={{ color: 'red' }}>Error loading stats.</div></section>;

  return (
    <section className="stats">
      <div className="stat-card">
        <h3>CPU</h3>
        <ul>
          <li>Usage: <span>{stats.cpu.usage}</span></li>
          <li>Temperature: <span>{stats.cpu.temperature}</span></li>
          <li>Cores: <span>{stats.cpu.cores}</span></li>
        </ul>
      </div>
      <div className="stat-card">
        <h3>Memory</h3>
        <ul>
          <li>Used: <span>{stats.memory.used}</span></li>
          <li>Total: <span>{stats.memory.total}</span></li>
          <li>Usage: <span>{stats.memory.usage}</span></li>
        </ul>
      </div>
      <div className="stat-card">
        <h3>Swap</h3>
        <ul>
          <li>Used: <span>{stats.swap.used}</span></li>
          <li>Total: <span>{stats.swap.total}</span></li>
          <li>Usage: <span>{stats.swap.usage}</span></li>
        </ul>
      </div>
      <div className="stat-card">
        <h3>Disk</h3>
        <ul>
          <li>Used: <span>{stats.disk.used}</span></li>
          <li>Total: <span>{stats.disk.total}</span></li>
          <li>Usage: <span>{stats.disk.usage}</span></li>
        </ul>
      </div>
      <div className="stat-card">
        <h3>Network</h3>
        <ul>
          <li>Download: <span>{stats.network.download}</span></li>
          <li>Upload: <span>{stats.network.upload}</span></li>
          <li>Active: <span>{stats.network.active}</span></li>
        </ul>
      </div>
    </section>
  );
};
