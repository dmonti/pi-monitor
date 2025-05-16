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
    };
  }

  private static linuxInstance: SystemInfoCollector | null = null;
  private static windowsInstance: SystemInfoCollector | null = null;

  private static _cachedStats: Record<string, any> | null = null;
  private static _cachedStatsTime: number = 0;
  private static _refreshingStats: boolean = false;

  static async getSystemStats(): Promise<Record<string, any>> {
    const now = Date.now();
    const cacheAge = now - this._cachedStatsTime;
    const maxAge = 60 * 1000; // 1 minute
    // If cache is valid, return it and refresh in background if needed
    if (this._cachedStats && cacheAge < maxAge) {
      // Schedule async refresh if cache is older than 45s
      if (!this._refreshingStats && cacheAge > 45 * 1000) {
        this._refreshingStats = true;
        (async () => {
          await this.refreshSystemStats();
          this._refreshingStats = false;
        })();
      }
      return this._cachedStats;
    }
    // No cache or cache expired: fetch and cache immediately
    await this.refreshSystemStats();
    return this._cachedStats || { error: "Failed to collect system stats." };
  }

  private static async refreshSystemStats() {
    try {
      let collector: SystemInfoCollector | null = null;
      if (process.platform === "linux") {
        if (!this.linuxInstance) {
          const { LinuxInfoCollector } = await import("./Linux");
          this.linuxInstance = new LinuxInfoCollector();
        }
        collector = this.linuxInstance;
      } else if (process.platform === "win32") {
        if (!this.windowsInstance) {
          const { WindowsInfoCollector } = await import("./Windows");
          this.windowsInstance = new WindowsInfoCollector();
        }
        collector = this.windowsInstance;
      }
      if (collector && typeof (collector as any).getSystemStats === "function") {
        this._cachedStats = await (collector as any).getSystemStats();
        this._cachedStatsTime = Date.now();
      } else {
        this._cachedStats = { error: "Unsupported platform or missing collector implementation." };
        this._cachedStatsTime = Date.now();
      }
    } catch (err) {
      console.error('Error in refreshSystemStats:', err);
      this._cachedStats = { error: "Failed to collect system stats." };
      this._cachedStatsTime = Date.now();
    }
  }


  private static _cachedInfo: Record<string, any> | null = null;

  static async getInfo(): Promise<Record<string, any>> {
    if (this._cachedInfo) {
      return this._cachedInfo;
    }
    try {
      let collector: SystemInfoCollector | null = null;
      if (process.platform === "linux") {
        if (!this.linuxInstance) {
          const { LinuxInfoCollector } = await import("./Linux");
          this.linuxInstance = new LinuxInfoCollector();
        }
        collector = this.linuxInstance;
      } else if (process.platform === "win32") {
        if (!this.windowsInstance) {
          const { WindowsInfoCollector } = await import("./Windows");
          this.windowsInstance = new WindowsInfoCollector();
        }
        collector = this.windowsInstance;
      }
      let info: Record<string, any>;
      if (collector && typeof (collector as any).getInfo === "function") {
        info = await (collector as any).getInfo();
      } else if (collector && typeof collector.getAllInfo === "function") {
        info = collector.getAllInfo();
      } else {
        info = { error: "Unsupported platform or missing collector implementation." };
      }
      this._cachedInfo = info;
      return info;
    } catch (err) {
      console.error('Error in getInfo:', err);
      return { error: "Failed to collect system info." };
    }
  }

  // Optional: method to clear the cache if needed
  static clearInfoCache() {
    this._cachedInfo = null;
  }

}