import axios, { type AxiosInstance } from "axios";
import type {
  TrainDetails,
  TrainGps,
  ConnectionStatus,
  TrainGraph,
} from "../../shared/types/train";

const BASE_URL = "https://wifi.sncf";

export class SncfClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
    });
  }

  async getTrainDetails(): Promise<TrainDetails> {
    const { data } = await this.client.get<TrainDetails>(
      "/router/api/train/details"
    );
    return data;
  }

  async getTrainGps(): Promise<TrainGps> {
    const { data } = await this.client.get<TrainGps>("/router/api/train/gps");
    return data;
  }

  async getConnectionStatus(): Promise<ConnectionStatus> {
    const { data } = await this.client.get<ConnectionStatus>(
      "/router/api/connection/status"
    );
    return data;
  }

  async getTrainGraph(): Promise<TrainGraph> {
    const { data } = await this.client.get<TrainGraph>(
      "/router/api/train/graph"
    );
    return data;
  }
}
