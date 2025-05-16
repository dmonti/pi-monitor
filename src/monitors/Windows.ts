import { SystemInfoCollector } from "./System";

export class WindowsInfoCollector extends SystemInfoCollector {
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
