import type { TrainStop } from "../../shared/types/train";

interface StopItemProps {
  stop: TrainStop;
  isPassed: boolean;
  isNext: boolean;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });
}

export function StopItem({ stop, isPassed, isNext }: StopItemProps) {
  const cls = ["stop", isPassed && "passed", isNext && "next"]
    .filter(Boolean)
    .join(" ");

  const hasDelay = stop.isDelayed && stop.theoricDate !== stop.realDate;

  return (
    <div className={cls}>
      <div className="rail">
        <div className="rail-line-top" />
        <div className="dot" />
        <div className="rail-line-bottom" />
      </div>
      <div className="stop-content">
        <div className="stop-main">
          <div className="stop-name">{stop.label}</div>
          <div className="stop-meta">
            {hasDelay && (
              <span className="stop-time cancelled">
                {formatTime(stop.theoricDate)}
              </span>
            )}
            <span className="stop-time">{formatTime(stop.realDate)}</span>
            {stop.duration > 0 && (
              <span className="stop-duration">{stop.duration} min</span>
            )}
          </div>
        </div>
        {stop.isDelayed ? (
          <span className="stop-badge late">+{stop.delay}</span>
        ) : (
          <span className="stop-badge ok">OK</span>
        )}
      </div>
    </div>
  );
}
