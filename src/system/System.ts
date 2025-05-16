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

  private static _statsPromise: Promise<Record<string, any>> | null = null;

  static async getStats(): Promise<Record<string, any>> {
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
    // If a stats load is already in-flight, await it
    if (this._statsPromise) {
      return this._statsPromise;
    }
    // No cache or cache expired: fetch and cache immediately, synchronizing
    this._statsPromise = (async () => {
      await this.refreshSystemStats();
      this._statsPromise = null;
      return this._cachedStats || { error: "Failed to collect system stats." };
    })();
    return this._statsPromise;
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
      if (collector && typeof (collector as any).getStats === "function") {
        this._cachedStats = await (collector as any).getStats();
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

  private static _infoPromise: Promise<Record<string, any>> | null = null;

  static async getInfo(): Promise<Record<string, any>> {
    if (this._cachedInfo) {
      return this._cachedInfo;
    }
    // If a load is already in-flight, await it
    if (this._infoPromise) {
      return this._infoPromise;
    }
    this._infoPromise = (async () => {
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
        this._infoPromise = null;
        return info;
      } catch (err) {
        console.error('Error in getInfo:', err);
        this._infoPromise = null;
        return { error: "Failed to collect system info." };
      }
    })();
    return this._infoPromise;
  }

  // Optional: method to clear the cache if needed
  static clearInfoCache() {
    this._cachedInfo = null;
  }
}

// Bootstrap: Warm up system info and stats caches at startup
(async () => {
  try {
    await Promise.all([
      SystemInfoCollector.getInfo(),
      SystemInfoCollector.getStats()
    ]);
    // Optionally log success
    // console.log('System info and stats caches loaded at startup');
  } catch (err) {
    console.error('Error preloading system info/stats:', err);
  }
})();