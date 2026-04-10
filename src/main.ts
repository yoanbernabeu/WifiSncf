import { app } from "electron";
import { TrayManager } from "./main/tray";
import { PollingService } from "./main/services/polling";
import { setupIpcHandlers } from "./main/ipc/handlers";

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

app.on("ready", () => {
  app.dock?.hide();

  const trayManager = new TrayManager();
  const pollingService = new PollingService(trayManager);

  setupIpcHandlers(pollingService, trayManager);
  pollingService.start();
});

app.on("window-all-closed", () => {
  // Ne rien faire - l'app reste en menu bar
});
