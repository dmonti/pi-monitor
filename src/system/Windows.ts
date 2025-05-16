import { SystemInfoCollector } from "./System";

export class WindowsInfoCollector extends SystemInfoCollector {
  async getSystemStats(): Promise<Record<string, any>> {
    // CPU usage: typeperf "\Processor(_Total)\% Processor Time" -sc 1
    let cpuUsage = "N/A";
    try {
      const cpuOut = Bun.spawnSync(["powershell", "-Command", "Get-Counter '\\Processor(_Total)\\% Processor Time' -SampleInterval 1 -MaxSamples 1 | Select-Object -ExpandProperty CounterSamples | Select-Object -ExpandProperty CookedValue"]).stdout.toString();
      const match = cpuOut.match(/\d+/);
      if (match) cpuUsage = `${match[0]}%`;
    } catch (err) { console.error('Error collecting CPU usage stats:', err); }
    // CPU temp: not easily available on Windows without extra tools
    let cpuTemp = "N/A";
    // CPU cores
    let coresOut = "N/A";
    try {
      const coreOut = Bun.spawnSync(["powershell", "-Command", "Get-WmiObject Win32_Processor | Select-Object -ExpandProperty NumberOfCores"]).stdout.toString();
      const lines = coreOut.split("\n").map(l => l.trim()).filter(Boolean);
      if (lines[0]) coresOut = lines[0];
    } catch (err) { console.error('Error collecting CPU cores stats:', err); }
    // Memory: Get-WmiObject Win32_OperatingSystem
    let memUsed = "N/A", memTotal = "N/A", memUsage = "N/A";
    try {
      const memOut = Bun.spawnSync(["powershell", "-Command", "$os = Get-WmiObject Win32_OperatingSystem; $os.FreePhysicalMemory; $os.TotalVisibleMemorySize"]).stdout.toString();
      const lines = memOut.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length >= 2 && lines[0] !== undefined && lines[1] !== undefined && lines[0] !== "" && lines[1] !== "") {
        const free = parseInt(lines[0]);
        const total = parseInt(lines[1]);
        if (!isNaN(free) && !isNaN(total)) {
          const used = total - free;
          memTotal = `${(total / 1024).toFixed(0)} MB`;
          memUsed = `${(used / 1024).toFixed(0)} MB`;
          memUsage = `${((used / total) * 100).toFixed(0)}%`;
        }
      }
    } catch (err) { console.error('Error collecting memory stats:', err); }
    // Swap: Get-WmiObject Win32_PageFileUsage
    let swapUsed = "N/A", swapTotal = "N/A", swapUsage = "N/A";
    try {
      const swapOut = Bun.spawnSync(["powershell", "-Command", "Get-WmiObject Win32_PageFileUsage | Select-Object AllocatedBaseSize,CurrentUsage"]).stdout.toString();
      // Example output:
      // AllocatedBaseSize CurrentUsage
      // 2432              76
      const lines = swapOut.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length >= 2 && lines[1] !== undefined && lines[1] !== "") {
        const values = lines[1].split(/\s+/);
        if (values.length >= 2 && values[0] !== undefined && values[1] !== undefined && values[0] !== "" && values[1] !== "") {
          const total = parseInt(values[0]);
          const used = parseInt(values[1]);
          if (!isNaN(total) && !isNaN(used)) {
            swapTotal = `${total} MB`;
            swapUsed = `${used} MB`;
            swapUsage = total > 0 ? `${((used / total) * 100).toFixed(0)}%` : "0%";
          }
        }
      }
    } catch (err) { console.error('Error collecting swap stats:', err); }
    // Disk: Get-WmiObject Win32_LogicalDisk
    let diskUsed = "N/A", diskTotal = "N/A", diskUsage = "N/A";
    try {
      const diskOut = Bun.spawnSync(["powershell", "-Command", "Get-WmiObject Win32_LogicalDisk | Where-Object { $_.DriveType -eq 3 } | Select-Object Size,FreeSpace"]).stdout.toString();
      // Example output:
      // Size      FreeSpace
      // 256052966400 120000000000
      const lines = diskOut.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length >= 2 && lines[1] !== undefined && lines[1] !== "") {
        const values = lines[1].split(/\s+/);
        if (values.length >= 2 && values[0] !== undefined && values[1] !== undefined && values[0] !== "" && values[1] !== "") {
          const total = parseInt(values[0]);
          const free = parseInt(values[1]);
          if (!isNaN(total) && !isNaN(free)) {
            const used = total - free;
            diskTotal = `${(total / (1024 ** 3)).toFixed(1)} GB`;
            diskUsed = `${(used / (1024 ** 3)).toFixed(1)} GB`;
            diskUsage = total > 0 ? `${((used / total) * 100).toFixed(0)}%` : "0%";
          }
        }
      }
    } catch (err) { console.error('Error collecting disk stats:', err); }
    // Network: Get-NetAdapter
    let netActive = "N/A";
    try {
      const netOut = Bun.spawnSync(["powershell", "-Command", "Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } | Select-Object -First 1 -ExpandProperty Name"]).stdout.toString();
      const lines = netOut.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines[0]) netActive = lines[0];
    } catch (err) { console.error('Error collecting network stats:', err); }
    return {
      cpu: { usage: cpuUsage, temperature: cpuTemp, cores: coresOut },
      memory: { used: memUsed, total: memTotal, usage: memUsage },
      swap: { used: swapUsed, total: swapTotal, usage: swapUsage },
      disk: { used: diskUsed, total: diskTotal, usage: diskUsage },
      network: { download: "N/A", upload: "N/A", active: netActive }
    };
  }
  getArchitecture(): string {
    return process.arch;
  }

  getPlatform(): string {
    return process.platform;
  }

  getOSName(): string {
    // Try WMIC first, but handle if not available
    try {
      const wmic = Bun.spawnSync(["wmic", "os", "get", "Caption"]);
      if (wmic.exitCode === 0) {
        const lines = wmic.stdout.toString().split("\n").map(l => l.trim()).filter(Boolean);
        return lines[1] ?? "Unknown";
      }
    } catch (err) {
      // wmic not found, ignore and try next
    }
    // Fallback to systeminfo
    try {
      const sysinfo = Bun.spawnSync(["systeminfo"]);
      if (sysinfo.exitCode === 0) {
        const match = sysinfo.stdout.toString().match(/OS Name:\s*(.+)/);
        return match && match[1] ? match[1].trim() : "Unknown";
      }
    } catch (err) {
      // systeminfo not found, fallback
    }
    return "Unknown";
  }

  getOSVersion(): string {
    // Try WMIC first, but handle if not available
    try {
      const wmic = Bun.spawnSync(["wmic", "os", "get", "Version"]);
      if (wmic.exitCode === 0) {
        const lines = wmic.stdout.toString().split("\n").map(l => l.trim()).filter(Boolean);
        return lines[1] ?? "Unknown";
      }
    } catch (err) {
      // wmic not found, ignore and try next
    }
    // Fallback to systeminfo
    try {
      const sysinfo = Bun.spawnSync(["systeminfo"]);
      if (sysinfo.exitCode === 0) {
        const match = sysinfo.stdout.toString().match(/OS Version:\s*(.+)/);
        return match && match[1] ? match[1].trim() : "Unknown";
      }
    } catch (err) {
      // systeminfo not found, fallback
    }
    return "Unknown";
  }


}
