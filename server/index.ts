import { createApp } from "./app";
import { setupVite, serveStatic, log } from "./vite";
import axios from "axios";

(async () => {
  const { app, server } = await createApp();

  // Set up automatic bounty sync every hour
  const syncBounties = async () => {
    try {
      log('Starting automatic bounty sync...');
      const port = 5000;
      await axios.post(`http://0.0.0.0:${port}/api/bounties/sync`);
      log('Automatic bounty sync completed successfully');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        log('Error during automatic bounty sync:',
          err.message,
          err.response?.data || 'No response data'
        );
      } else {
        log('Error during automatic bounty sync:', err instanceof Error ? err.message : String(err));
      }
    }
  };

  // Initial sync on server start
  log('Initiating first bounty sync on server start...');
  setTimeout(syncBounties, 5000); // Wait 5 seconds for server to be fully ready

  // Then sync every hour
  setInterval(syncBounties, 60 * 60 * 1000);

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();