import React, { useEffect, useState } from "react";

interface SystemInfo {
  architecture: string;
  platform: string;
  osName: string;
  osVersion?: string;
  uptime?: string;
}

export const SystemInfoSection: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/system")
      .then((res) => res.json())
      .then((data) => {
        setSystemInfo(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <section className="system-info"><h2>System Information</h2><div>Loading...</div></section>;
  if (!systemInfo || (systemInfo as any).error) return <section className="system-info"><h2>System Information</h2><div>Error loading system info.</div></section>;

  return (
    <section className="system-info">
      <h2>System Information</h2>
      <div className="info-grid">
        <div><strong>OS Name:</strong> <span>{systemInfo.osName}</span></div>
        <div><strong>Architecture:</strong> <span>{systemInfo.architecture}</span></div>
        <div><strong>Platform:</strong> <span>{systemInfo.platform}</span></div>
        {systemInfo.osVersion && <div><strong>OS Version:</strong> <span>{systemInfo.osVersion}</span></div>}
        {systemInfo.uptime && <div><strong>Uptime:</strong> <span>{systemInfo.uptime}</span></div>}
      </div>
    </section>
  );
};
