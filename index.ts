var t0 = Date.now()

import pkg from './package.json' assert { type: 'json' }
console.log(`Starting ${pkg.name} v${pkg.version} using Bun v${Bun.version} with PID ${process.pid}`)

import homepage from "./public/index.html";

const server = Bun.serve({
  port: process.env.SERVER_PORT || 3000,
  idleTimeout: 60,
  development: {
    hmr: true
  },
  routes: {
    "/": homepage,
    "/api/info": {
      async GET() {
        return Response.json({name: pkg.name, version: pkg.version});
      }
    },
    "/api/system": {
      async GET(req) {
        let collector: any = null;
        if (process.platform === "linux") {
          const { LinuxInfoCollector } = await import("./src/system/Linux");
          collector = new LinuxInfoCollector();
        } else if (process.platform === "win32") {
          const { WindowsInfoCollector } = await import("./src/system/Windows");
          collector = new WindowsInfoCollector();
        }
        return Response.json(collector ? collector.getAllInfo() : { error: "Unsupported platform", platform: process.platform });
      }
    },
    "/api/system/stats": {
      async GET() {
        const { SystemInfoCollector } = await import("./src/system/System");
        const stats = await SystemInfoCollector.getSystemStats();
        return Response.json(stats);
      }
    }
  }
})

console.log(`Bun server initialized with port ${server.port} (http)`)
console.log(`Started ${pkg.name} in ${Date.now() - t0}ms`)