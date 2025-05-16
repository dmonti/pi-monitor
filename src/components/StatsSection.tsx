import React, { useEffect, useState } from "react";

interface StatsData {
  cpu: { usage: string; temperature: string; cores: string };
  memory: { used: string; total: string; usage: string };
  swap: { used: string; total: string; usage: string };
  disk: { used: string; total: string; usage: string };
  network: { download: string; upload: string; active: string };
}

const MOCK_STATS: StatsData = {
  cpu: { usage: "24%", temperature: "47°C", cores: "4" },
  memory: { used: "2.1 GB", total: "8 GB", usage: "26%" },
  swap: { used: "512 MB", total: "2 GB", usage: "25%" },
  disk: { used: "120 GB", total: "256 GB", usage: "47%" },
  network: { download: "12.3 Mbps", upload: "2.1 Mbps", active: "eth0" }
};

export const StatsSection: React.FC = () => {
  // Replace this with real fetch logic when API endpoints are ready
  const [stats] = useState(MOCK_STATS);

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
