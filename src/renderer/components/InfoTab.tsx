import type { TrainGps, TrainDetails, ConnectionStatus } from "../../shared/types/train";

interface InfoTabProps {
  gps: TrainGps | null;
  details: TrainDetails;
  connection: ConnectionStatus | null;
}

const SERVICE_LABELS: Record<string, string> = {
  OCEBA: "Bar / Restauration",
  OCEWF: "WiFi",
  OCEPI: "Prises electriques",
  OCEHP: "Accessibilite PMR",
  OCECM: "1ere classe",
  OCENY: "Espace famille",
  OCEPP: "Espace Pro",
};

function headingToCardinal(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  const idx = Math.round(deg / 45) % 8;
  return dirs[idx];
}

function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(0)} km`;
  return `${Math.round(meters)} m`;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });
}

export function InfoTab({ gps, details, connection }: InfoTabProps) {
  const now = new Date();
  const nextStop = details.stops.find((s) => new Date(s.realDate) > now);
  const progress = nextStop?.progress ?? details.stops[0]?.progress;

  return (
    <div className="info-tab">
      {/* Trajet */}
      <div className="info-section">
        <div className="info-section-title">Trajet</div>
        <div className="info-grid">
          {progress && (
            <>
              <div className="info-item">
                <span className="info-item-label">Parcouru</span>
                <span className="info-item-value">
                  {formatDistance(progress.traveledDistance)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-item-label">Restant</span>
                <span className="info-item-value">
                  {formatDistance(progress.remainingDistance)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-item-label">Progression</span>
                <span className="info-item-value">
                  {Math.round(progress.progressPercentage)}%
                </span>
              </div>
            </>
          )}
          <div className="info-item">
            <span className="info-item-label">N° train</span>
            <span className="info-item-value">{details.number}</span>
          </div>
          <div className="info-item">
            <span className="info-item-label">ID rame</span>
            <span className="info-item-value">{details.trainId}</span>
          </div>
          <div className="info-item">
            <span className="info-item-label">Arrets</span>
            <span className="info-item-value">{details.stops.length}</span>
          </div>
        </div>
      </div>

      {/* GPS */}
      {gps && (
        <div className="info-section">
          <div className="info-section-title">Position GPS</div>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-item-label">Vitesse</span>
              <span className="info-item-value">
                {Math.round(gps.speed * 3.6)} km/h
              </span>
            </div>
            <div className="info-item">
              <span className="info-item-label">Direction</span>
              <span className="info-item-value">
                {headingToCardinal(gps.heading)} ({Math.round(gps.heading)}°)
              </span>
            </div>
            <div className="info-item">
              <span className="info-item-label">Altitude</span>
              <span className="info-item-value">
                {Math.round(gps.altitude)} m
              </span>
            </div>
            <div className="info-item">
              <span className="info-item-label">Satellites</span>
              <span className="info-item-value">{gps.fix}</span>
            </div>
            <div className="info-item">
              <span className="info-item-label">Latitude</span>
              <span className="info-item-value mono">
                {gps.latitude.toFixed(4)}
              </span>
            </div>
            <div className="info-item">
              <span className="info-item-label">Longitude</span>
              <span className="info-item-value mono">
                {gps.longitude.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Services a bord */}
      {details.onboardServices.length > 0 && (
        <div className="info-section">
          <div className="info-section-title">Services a bord</div>
          <div className="services-list">
            {details.onboardServices.map((code) => (
              <div key={code} className="service-chip">
                {SERVICE_LABELS[code] ?? code}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WiFi */}
      {connection && (
        <div className="info-section">
          <div className="info-section-title">Connexion WiFi</div>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-item-label">Bande passante</span>
              <span className="info-item-value">
                {(connection.granted_bandwidth / 1000).toFixed(0)} Mbps
              </span>
            </div>
            <div className="info-item">
              <span className="info-item-label">Classe</span>
              <span className="info-item-value">{connection.service_class}</span>
            </div>
            <div className="info-item">
              <span className="info-item-label">Reset quota</span>
              <span className="info-item-value">
                {formatTime(connection.next_reset)}
              </span>
            </div>
            <div className="info-item">
              <span className="info-item-label">Statut</span>
              <span className="info-item-value" style={{
                color: connection.active ? "var(--green)" : "var(--red)"
              }}>
                {connection.active ? "Actif" : "Inactif"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
