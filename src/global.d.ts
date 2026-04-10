import type { TrainData } from "./shared/types/train";

declare global {
  interface Window {
    wifisncf: {
      getTrainData: () => Promise<TrainData>;
      refresh: () => Promise<TrainData>;
      quit: () => Promise<void>;
      hideMenu: () => Promise<void>;
      openExternal: (url: string) => Promise<void>;
      onDataUpdated: (callback: (data: TrainData) => void) => () => void;
      notifyMouseEnter: () => void;
      notifyMouseLeave: () => void;
    };
  }
}
