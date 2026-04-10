import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { TrainGps, TrainStop, TrainGraph } from "../../shared/types/train";

interface TrainMapProps {
  gps: TrainGps | null;
  stops: TrainStop[];
  graph: TrainGraph | null;
}

export function TrainMap({ gps, stops, graph }: TrainMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const trainMarkerRef = useRef<L.CircleMarker | null>(null);
  const routeLayerRef = useRef<L.GeoJSON | null>(null);
  const stopsLayerRef = useRef<L.LayerGroup | null>(null);
  const hasFitted = useRef(false);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: true,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
    });

    // Tuile unique CartoDB Voyager dark - propre et lisible
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 18, subdomains: "abcd" }
    ).addTo(map);

    mapRef.current = map;
    map.setView([46, 2.5], 6);

    // Quand le container devient visible (switch onglet), recalculer + refit
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
      // Refit sur le trace apres invalidateSize
      if (routeLayerRef.current) {
        const bounds = routeLayerRef.current.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40], animate: false });
        }
      }
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      hasFitted.current = false;
    };
  }, []);

  // Trace GeoJSON
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !graph) return;

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
    }

    routeLayerRef.current = L.geoJSON(graph, {
      style: {
        color: "#6993ff",
        weight: 3,
        opacity: 0.8,
        lineCap: "round",
        lineJoin: "round",
      },
    }).addTo(map);

    // Fit immediat
    const bounds = routeLayerRef.current.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], animate: false });
      hasFitted.current = true;
    }
  }, [graph]);

  // Markers des gares
  useEffect(() => {
    const map = mapRef.current;
    if (!map || stops.length === 0) return;

    if (stopsLayerRef.current) {
      map.removeLayer(stopsLayerRef.current);
    }

    const now = new Date();
    const group = L.layerGroup();

    stops.forEach((stop, i) => {
      if (!stop.coordinates) return;
      const isPassed = new Date(stop.realDate) < now;
      const isTerminus = i === 0 || i === stops.length - 1;

      const marker = L.circleMarker(
        [stop.coordinates.latitude, stop.coordinates.longitude],
        {
          radius: isTerminus ? 5 : 3.5,
          color: isPassed ? "#6993ff" : "#52525b",
          fillColor: isPassed ? "#6993ff" : "#18181b",
          fillOpacity: 1,
          weight: isTerminus ? 2 : 1.5,
        }
      );

      const name = stop.label.split(" - ")[0];
      marker.bindTooltip(name, {
        className: "map-tooltip",
        direction: "top",
        offset: [0, -6],
        permanent: isTerminus,
      });

      group.addLayer(marker);
    });

    group.addTo(map);
    stopsLayerRef.current = group;

    return () => {
      map.removeLayer(group);
    };
  }, [stops]);

  // Position du train
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !gps?.latitude) return;

    if (trainMarkerRef.current) {
      trainMarkerRef.current.setLatLng([gps.latitude, gps.longitude]);
    } else {
      trainMarkerRef.current = L.circleMarker(
        [gps.latitude, gps.longitude],
        {
          radius: 6,
          color: "#fff",
          fillColor: "#6993ff",
          fillOpacity: 1,
          weight: 2,
          className: "train-marker",
        }
      ).addTo(map);

      trainMarkerRef.current.bindTooltip("Position actuelle", {
        className: "map-tooltip",
        direction: "top",
        offset: [0, -8],
      });
    }
  }, [gps?.latitude, gps?.longitude]);

  return <div ref={containerRef} className="train-map" />;
}
