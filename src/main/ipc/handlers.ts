import { ipcMain, shell } from "electron";
import { IPC_CHANNELS } from "../../shared/constants/ipcChannels";
import type { PollingService } from "../services/polling";
import type { TrayManager } from "../tray";

export function setupIpcHandlers(
  pollingService: PollingService,
  trayManager: TrayManager
): void {
  ipcMain.handle(IPC_CHANNELS.TRAIN_GET_DATA, () => {
    return pollingService.getData();
  });

  ipcMain.handle(IPC_CHANNELS.TRAIN_REFRESH, async () => {
    await pollingService.refresh();
    return pollingService.getData();
  });

  ipcMain.handle(IPC_CHANNELS.APP_QUIT, () => {
    process.exit(0);
  });

  ipcMain.handle(IPC_CHANNELS.APP_HIDE_MENU, () => {
    trayManager.hideMenu();
  });

  ipcMain.handle(IPC_CHANNELS.APP_OPEN_EXTERNAL, (_event, url: string) => {
    shell.openExternal(url);
  });
}
