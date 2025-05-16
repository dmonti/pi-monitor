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

  static async getSystemStats(): Promise<Record<string, any>> {
    try {
      // Dynamically import correct collector and delegate
      let collector: SystemInfoCollector | null = null;
      if (process.platform === "linux") {
        const { LinuxInfoCollector } = await import("./Linux");
        collector = new LinuxInfoCollector();
      } else if (process.platform === "win32") {
        const { WindowsInfoCollector } = await import("./Windows");
        collector = new WindowsInfoCollector();
      }
      if (collector && typeof (collector as any).getSystemStats === "function") {
        return await (collector as any).getSystemStats();
      }
      return { error: "Unsupported platform or missing collector implementation." };
    } catch (err) {
      console.error('Error in getSystemStats:', err);
      return { error: "Failed to collect system stats." };
    }
  }
}