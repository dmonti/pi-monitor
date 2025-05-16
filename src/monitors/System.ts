export abstract class SystemInfoCollector {
  abstract getArchitecture(): string;
  abstract getPlatform(): string;
  abstract getOSName(): string;
  abstract getOSVersion(): string;

  getAllInfo() {
    return {
      architecture: this.getArchitecture(),
      platform: this.getPlatform(),
      osName: this.getOSName(),
      osVersion: this.getOSVersion()
    };
  }

  static getCurrentSystemCollector(): SystemInfoCollector | null {
    try {
      if (process.platform === "linux") {
        const { LinuxInfoCollector } = require("./Linux");
        return new LinuxInfoCollector();
      } else if (process.platform === "win32") {
        const { WindowsInfoCollector } = require("./Windows");
        return new WindowsInfoCollector();
      }
    } catch (err) {
      // ignore
    }
    return null;
  }

  private static _cachedSystemInfo: Record<string, any> | null = null;

  static getSystemInfo(): Record<string, any> {
    if (this._cachedSystemInfo) return this._cachedSystemInfo;
    const collector = this.getCurrentSystemCollector();
    this._cachedSystemInfo = collector ? collector.getAllInfo() : { error: "Unsupported platform", platform: process.platform };
    return this._cachedSystemInfo;
  }
}