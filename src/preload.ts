import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "./shared/constants/ipcChannels";
import type { TrainData } from "./shared/types/train";

const api = {
  getTrainData: (): Promise<TrainData> =>
    ipcRenderer.invoke(IPC_CHANNELS.TRAIN_GET_DATA),

  refresh: (): Promise<TrainData> =>
    ipcRenderer.invoke(IPC_CHANNELS.TRAIN_REFRESH),

  quit: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.APP_QUIT),

  hideMenu: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.APP_HIDE_MENU),

  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.APP_OPEN_EXTERNAL, url),

  onDataUpdated: (callback: (data: TrainData) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: TrainData) =>
      callback(data);
    ipcRenderer.on(IPC_CHANNELS.TRAIN_DATA_UPDATED, handler);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.TRAIN_DATA_UPDATED, handler);
    };
  },

  // Hover tracking pour garder la pill visible
  notifyMouseEnter: () => ipcRenderer.send("pill:mouseenter"),
  notifyMouseLeave: () => ipcRenderer.send("pill:mouseleave"),
};

contextBridge.exposeInMainWorld("wifisncf", api);
