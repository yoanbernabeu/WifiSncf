import { BrowserWindow } from "electron";
import { SncfClient } from "../api/sncf";
import { TrayManager } from "../tray";
import type { TrainData } from "../../shared/types/train";
import { IPC_CHANNELS } from "../../shared/constants/ipcChannels";

const POLL_INTERVAL = 15_000; // 15 secondes

export class PollingService {
  private client: SncfClient;
  private trayManager: TrayManager;
  private timer: ReturnType<typeof setInterval> | null = null;
  private graphLoaded = false;
  private currentData: TrainData = {
    details: null,
    gps: null,
    connection: null,
    graph: null,
    lastUpdated: 0,
    error: null,
  };

  constructor(trayManager: TrayManager) {
    this.client = new SncfClient();
    this.trayManager = trayManager;
  }

  start(): void {
    this.poll();
    this.timer = setInterval(() => this.poll(), POLL_INTERVAL);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  getData(): TrainData {
    return this.currentData;
  }

  async refresh(): Promise<void> {
    await this.poll();
  }

  private async poll(): Promise<void> {
    try {
      const promises: [
        ReturnType<typeof this.client.getTrainDetails>,
        ReturnType<typeof this.client.getTrainGps>,
        ReturnType<typeof this.client.getConnectionStatus>,
      ] = [
        this.client.getTrainDetails(),
        this.client.getTrainGps(),
        this.client.getConnectionStatus(),
      ];

      const [details, gps, connection] = await Promise.allSettled(promises);

      // Le graph ne change pas, on le charge une seule fois
      if (!this.graphLoaded) {
        try {
          this.currentData.graph = await this.client.getTrainGraph();
          this.graphLoaded = true;
        } catch { /* ignore */ }
      }

      this.currentData = {
        details:
          details.status === "fulfilled" ? details.value : this.currentData.details,
        gps: gps.status === "fulfilled" ? gps.value : this.currentData.gps,
        connection:
          connection.status === "fulfilled"
            ? connection.value
            : this.currentData.connection,
        graph: this.currentData.graph,
        lastUpdated: Date.now(),
        error: null,
      };

      this.updateTray();
      this.notifyRenderer();
    } catch (err) {
      this.currentData.error =
        err instanceof Error ? err.message : "Erreur inconnue";
      this.currentData.lastUpdated = Date.now();
      this.notifyRenderer();
    }
  }

  private updateTray(): void {
    const { details, gps } = this.currentData;
    if (!details) {
      this.trayManager.updateTitle("Wifi SNCF");
      return;
    }

    const nextStop = this.getNextStop();
    const speed = gps ? Math.round(gps.speed * 3.6) : null; // m/s → km/h

    let title = `🚄 ${details.number}`;

    if (nextStop) {
      if (nextStop.isDelayed) {
        title += ` · +${nextStop.delay}min`;
      } else {
        title += ` · À l'heure`;
      }
    }

    if (speed !== null) {
      title += ` · ${speed} km/h`;
    }

    this.trayManager.updateTitle(title);
  }

  private getNextStop() {
    if (!this.currentData.details) return null;
    const now = new Date();
    return this.currentData.details.stops.find(
      (stop) => new Date(stop.realDate) > now
    );
  }

  private notifyRenderer(): void {
    this.trayManager.sendToRenderer(
      IPC_CHANNELS.TRAIN_DATA_UPDATED,
      this.currentData
    );
  }
}
