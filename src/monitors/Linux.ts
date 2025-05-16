import { SystemInfoCollector } from "./System";

export class LinuxInfoCollector extends SystemInfoCollector {
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
