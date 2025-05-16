import { SystemInfoCollector } from "./System";

export class LinuxInfoCollector extends SystemInfoCollector {
  async getSystemStats(): Promise<Record<string, any>> {
    // CPU usage: top -bn1 | grep 'Cpu(s)'
    const cpuOut = Bun.spawnSync(["sh", "-c", "top -bn1 | grep 'Cpu(s)' | awk '{print $2 + $4}'"]).stdout.toString().trim();
    const cpuUsage = cpuOut ? `${parseFloat(cpuOut).toFixed(1)}%` : "N/A";
    // CPU temp: try /sys/class/thermal/thermal_zone0/temp (Raspberry Pi, some Linux)
    let cpuTemp = "N/A";
    try {
      const tempOut = Bun.spawnSync(["cat", "/sys/class/thermal/thermal_zone0/temp"]);
      if (tempOut.exitCode === 0) {
        cpuTemp = `${(parseInt(tempOut.stdout.toString()) / 1000).toFixed(1)}°C`;
      }
    } catch {
      console.error('Error collecting CPU temp stats');
    }
    // CPU cores
    const coresOut = Bun.spawnSync(["nproc"]).stdout.toString().trim();
    // Memory: free -m
    const memOut = Bun.spawnSync(["free", "-m"]).stdout.toString();
    const memLines = memOut.split("\n");
    let memUsed = "N/A", memTotal = "N/A", memUsage = "N/A", swapUsed = "N/A", swapTotal = "N/A", swapUsage = "N/A";
    if (memLines.length > 1 && memLines[1]) {
      const memParts = memLines[1].split(/\s+/);
      if (memParts[1] !== undefined && memParts[2] !== undefined && memParts[1] !== "" && memParts[2] !== "") {
        memTotal = `${parseInt(memParts[1])} MB`;
        memUsed = `${parseInt(memParts[2])} MB`;
        memUsage = `${((parseInt(memParts[2]) / parseInt(memParts[1])) * 100).toFixed(0)}%`;
      }
    }
    if (memLines.length > 2 && memLines[2]) {
      const swapParts = memLines[2].split(/\s+/);
      if (swapParts[1] !== undefined && swapParts[2] !== undefined && swapParts[1] !== "" && swapParts[2] !== "") {
        swapTotal = `${parseInt(swapParts[1])} MB`;
        swapUsed = `${parseInt(swapParts[2])} MB`;
        swapUsage = parseInt(swapParts[1]) > 0 ? `${((parseInt(swapParts[2]) / parseInt(swapParts[1])) * 100).toFixed(0)}%` : "0%";
      }
    }
    // Disk: df -h /
    const diskOut = Bun.spawnSync(["df", "-h", "/"]).stdout.toString();
    const diskLines = diskOut.split("\n");
    let diskUsed = "N/A", diskTotal = "N/A", diskUsage = "N/A";
    if (diskLines.length > 1 && diskLines[1]) {
      const diskParts = diskLines[1].split(/\s+/);
      if (diskParts[1] !== undefined && diskParts[2] !== undefined && diskParts[4] !== undefined && diskParts[1] !== "" && diskParts[2] !== "" && diskParts[4] !== "") {
        diskTotal = diskParts[1];
        diskUsed = diskParts[2];
        diskUsage = diskParts[4];
      }
    }
    // Network: ip -j address
    let netDownload = "N/A", netUpload = "N/A", netActive = "N/A";
    try {
      const ipOut = Bun.spawnSync(["ip", "-j", "address"]).stdout.toString();
      const ipJson = JSON.parse(ipOut);
      const active = ipJson.find((iface: any) => iface && iface.operstate === "UP" && typeof iface.ifname === "string");
      if (active && typeof active.ifname === "string") {
        netActive = active.ifname;
      }
    } catch (err) { console.error('Error collecting network stats:', err); }
    // No easy cross-platform way to get live net speeds in one shot
    return {
      cpu: { usage: cpuUsage, temperature: cpuTemp, cores: coresOut },
      memory: { used: memUsed, total: memTotal, usage: memUsage },
      swap: { used: swapUsed, total: swapTotal, usage: swapUsage },
      disk: { used: diskUsed, total: diskTotal, usage: diskUsage },
      network: { download: netDownload, upload: netUpload, active: netActive }
    };
  }
  getArchitecture(): string {
    return Bun.spawnSync(["uname", "-m"]).stdout.toString().trim();
  }

  getKernel(): string {
    return Bun.spawnSync(["uname", "-r"]).stdout.toString().trim();
  }

  getPlatform(): string {
    return Bun.spawnSync(["uname", "-s"]).stdout.toString().trim();
  }

  getOSName(): string {
    return this.getDistroName();
  }

  getDistroName(): string {
    const lsb = Bun.spawnSync(["lsb_release", "-ds"]);
    if (lsb.exitCode === 0) {
      return lsb.stdout.toString().replace(/"/g, "").trim();
    }
    // Fallback to /etc/os-release
    const osRelease = Bun.spawnSync(["cat", "/etc/os-release"]);
    if (osRelease.exitCode === 0) {
      const match = osRelease.stdout.toString().match(/^PRETTY_NAME="?([^"]+)"?/m);
      return match && match[1] ? match[1] : "Unknown";
    }
    return "Unknown";
  }

  getOSVersion(): string {
    const lsb = Bun.spawnSync(["lsb_release", "-rs"]);
    if (lsb.exitCode === 0) {
      return lsb.stdout.toString().trim();
    }
    // Fallback to /etc/os-release
    const osRelease = Bun.spawnSync(["cat", "/etc/os-release"]);
    if (osRelease.exitCode === 0) {
      const match = osRelease.stdout.toString().match(/^VERSION_ID="?([^"]+)"?/m);
      return match && match[1] ? match[1] : "Unknown";
    }
    return "Unknown";
  }


}
