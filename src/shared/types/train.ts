export interface TrainGps {
  success: boolean;
  fix: number;
  timestamp: number;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  heading: number;
}

export interface TrainStop {
  code: string;
  label: string;
  services: Record<string, boolean>;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  progress?: {
    progressPercentage: number;
    traveledDistance: number;
    remainingDistance: number;
  };
  theoricDate: string;
  realDate: string;
  isRemoved: boolean;
  isCreated: boolean;
  isDiversion: boolean;
  delay: number;
  isDelayed: boolean;
  delayReason?: string;
  duration: number;
}

export interface TrainEvent {
  text: string;
  type: string;
}

export interface TrainDetails {
  number: string;
  events: TrainEvent[];
  onboardServices: string[];
  additionalServices: Record<string, unknown>;
  stops: TrainStop[];
  stationUicCodes: {
    departure: string;
    arrival: string;
  };
  trainId: string;
}

export interface ConnectionStatus {
  active: boolean;
  status_code: number;
  status_description: string;
  service_class: number;
  granted_bandwidth: number;
  remaining_data: number;
  consumed_data: number;
  next_reset: number;
  profileId: string;
}

export type TrainGraph = GeoJSON.FeatureCollection;

export interface TrainData {
  details: TrainDetails | null;
  gps: TrainGps | null;
  connection: ConnectionStatus | null;
  graph: TrainGraph | null;
  lastUpdated: number;
  error: string | null;
}
