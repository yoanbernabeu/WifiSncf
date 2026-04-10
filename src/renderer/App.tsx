import { useState, useEffect, useCallback } from "react";
import type { TrainData, TrainStop } from "../shared/types/train";
import { StopItem } from "./components/StopItem";
import { TrainMap } from "./components/TrainMap";
import { InfoTab } from "./components/InfoTab";

type Tab = "trajet" | "carte" | "infos";

export function App() {
  const [data, setData] = useState<TrainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("trajet");

  const fetchData = useCallback(async () => {
    try {
      const result = await window.wifisncf.getTrainData();
      setData(result);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const unsub = window.wifisncf.onDataUpdated((d) => {
      setData(d);
      setLoading(false);
    });
    return unsub;
  }, [fetchData]);

  const onEnter = () => window.wifisncf.notifyMouseEnter();
  const onLeave = () => window.wifisncf.notifyMouseLeave();

  if (loading || !data?.details) {
    return (
      <div className="card" onMouseEnter={onEnter} onMouseLeave={onLeave}>
        <div className="loading-state">
          <div className="loading-spinner" />
          <span className="loading-text">Connexion au train...</span>
        </div>
      </div>
    );
  }

  const { details, gps, connection, graph } = data;
  const now = new Date();
  const departure = details.stops[0];
  const arrival = details.stops[details.stops.length - 1];
  const nextIdx = details.stops.findIndex((s) => new Date(s.realDate) > now);
  const nextStop = nextIdx >= 0 ? details.stops[nextIdx] : null;
  const speed = gps ? Math.round(gps.speed * 3.6) : null; // m/s -> km/h

  // Progression reelle depuis l'API
  const apiProgress = nextStop?.progress ?? departure?.progress;
  const progress = apiProgress
    ? Math.round(apiProgress.progressPercentage)
    : Math.round(((nextIdx >= 0 ? nextIdx : details.stops.length) / (details.stops.length - 1)) * 100);

  const fmtMB = (kb: number) => {
    if (kb >= 1_000_000) return `${(kb / 1_000_000).toFixed(1)} Go`;
    if (kb >= 1_000) return `${(kb / 1_000).toFixed(0)} Mo`;
    return `${kb} Ko`;
  };

  const shortName = (label: string) => label.split(" - ")[0];

  return (
    <div className="card" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {/* Journey progress */}
      <div className="journey-bar">
        <div className="journey-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Header */}
      <div className="header">
        <div className="header-left">
          <div className="train-id">TGV {details.number}</div>
          <div className="train-route">
            {shortName(departure.label)} → {shortName(arrival.label)}
          </div>
        </div>
        <div className="header-stats">
          {nextStop?.isDelayed && (
            <div className="stat">
              <div className="stat-value small" style={{ color: "var(--red)" }}>
                +{nextStop.delay}
              </div>
              <div className="stat-label">min</div>
            </div>
          )}
          <div className="stat">
            <div className="stat-value">{speed ?? "—"}</div>
            <div className="stat-label">km/h</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${tab === "trajet" ? "active" : ""}`}
          onClick={() => setTab("trajet")}
        >
          Trajet
        </button>
        <button
          className={`tab ${tab === "carte" ? "active" : ""}`}
          onClick={() => setTab("carte")}
        >
          Carte
        </button>
        <button
          className={`tab ${tab === "infos" ? "active" : ""}`}
          onClick={() => setTab("infos")}
        >
          Infos
        </button>
      </div>

      {/* Tab content */}
      {tab === "trajet" && (
        <>
          {details.events.length > 0 && (
            <div className="alert">
              <span className="alert-dot" />
              {details.events[0].text}
            </div>
          )}
          <div className="timeline">
            {details.stops.map((stop: TrainStop, i: number) => (
              <StopItem
                key={stop.code}
                stop={stop}
                isPassed={i < (nextIdx >= 0 ? nextIdx : details.stops.length)}
                isNext={i === nextIdx}
              />
            ))}
          </div>
        </>
      )}

      {tab === "carte" && (
        <div className="map-container">
          <TrainMap gps={gps} stops={details.stops} graph={graph} />
        </div>
      )}

      {tab === "infos" && (
        <InfoTab gps={gps} details={details} connection={connection} />
      )}

      {/* Footer */}
      {connection && (
        <div className="footer">
          <span className={`wifi-dot ${connection.active ? "on" : "off"}`} />
          <span>WiFi {connection.active ? "actif" : "inactif"}</span>
          <span className="footer-data">
            {fmtMB(connection.consumed_data)} / {fmtMB(connection.consumed_data + connection.remaining_data)}
          </span>
        </div>
      )}
    </div>
  );
}
