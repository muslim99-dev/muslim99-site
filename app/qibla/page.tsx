"use client";

import { useEffect, useState } from "react";

const KAABA = { lat: 21.4225, lon: 39.8262 };

function toRad(d: number) {
  return (d * Math.PI) / 180;
}
function toDeg(r: number) {
  return (r * 180) / Math.PI;
}

function qiblaBearing(lat: number, lon: number) {
  const phi1 = toRad(lat);
  const phi2 = toRad(KAABA.lat);
  const dLambda = toRad(KAABA.lon - lon);
  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function distanceKm(lat: number, lon: number) {
  const R = 6371;
  const dLat = toRad(KAABA.lat - lat);
  const dLon = toRad(KAABA.lon - lon);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(KAABA.lat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function QiblaPage() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "denied" | "loading">("loading");
  const [sensorEnabled, setSensorEnabled] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setStatus("idle");
      },
      () => setStatus("denied"),
      { timeout: 8000 }
    );
  }, []);

  function enableCompass() {
    const anyDOE = DeviceOrientationEvent as any;
    if (typeof anyDOE?.requestPermission === "function") {
      anyDOE.requestPermission().then((res: string) => {
        if (res === "granted") attachOrientation();
      });
    } else {
      attachOrientation();
    }
  }

  function attachOrientation() {
    setSensorEnabled(true);
    window.addEventListener("deviceorientation", (e: any) => {
      const compassHeading = e.webkitCompassHeading ?? (e.alpha != null ? 360 - e.alpha : null);
      if (compassHeading != null) setHeading(compassHeading);
    });
  }

  const bearing = coords ? qiblaBearing(coords.lat, coords.lon) : null;
  const distance = coords ? distanceKm(coords.lat, coords.lon) : null;
  const needleRotation = bearing != null ? bearing - (heading ?? 0) : 0;

  return (
    <div className="mx-auto max-w-md px-5 py-10 text-center">
      <h1 className="text-2xl sm:text-3xl font-semibold text-teal-dark">Qibla</h1>
      <p className="mt-2 text-sm text-muted">The direction of the Kaaba from your location.</p>

      {status === "denied" && (
        <div className="mt-8 rounded-card border border-border bg-white p-6">
          <p className="text-teal-dark font-medium">Location access is unavailable.</p>
          <p className="text-sm text-muted mt-1">Enable location permissions to calculate your Qibla direction.</p>
        </div>
      )}

      {bearing != null && (
        <>
          <div className="mt-10 relative mx-auto h-72 w-72">
            <div className="absolute inset-0 rounded-full border-[3px] border-border bg-white shadow-card" />
            {["N", "E", "S", "W"].map((d, i) => (
              <span
                key={d}
                className="absolute text-xs text-muted font-medium"
                style={{
                  top: i === 2 ? "auto" : i === 0 ? "10px" : "50%",
                  bottom: i === 2 ? "10px" : "auto",
                  left: i === 3 ? "10px" : i === 1 ? "auto" : "50%",
                  right: i === 1 ? "10px" : "auto",
                  transform: i === 0 || i === 2 ? "translateX(-50%)" : "translateY(-50%)"
                }}
              >
                {d}
              </span>
            ))}
            <div
              className="absolute left-1/2 top-1/2 h-28 w-1.5 -ml-[3px] -mt-28 origin-bottom rounded-full bg-primary transition-transform duration-300"
              style={{ transform: `rotate(${needleRotation}deg)` }}
            />
            <div className="absolute left-1/2 top-1/2 h-3 w-3 -ml-1.5 -mt-1.5 rounded-full bg-teal-dark" />
          </div>

          <p className="mt-8 text-lg font-medium text-teal-dark">{bearing.toFixed(1)}° from North</p>
          <p className="text-sm text-muted mt-1">{distance?.toFixed(0)} km to the Kaaba</p>

          {!sensorEnabled && (
            <button onClick={enableCompass} className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white">
              Calibrate with device compass
            </button>
          )}
          {sensorEnabled && heading == null && (
            <p className="mt-4 text-xs text-muted">Move your device in a figure-8 to calibrate its compass.</p>
          )}
          <p className="mt-6 text-xs text-muted max-w-sm mx-auto">
            Without a compass sensor, the needle shows the calculated bearing from true north — orient yourself with a
            separate compass app if needed.
          </p>
        </>
      )}
    </div>
  );
}
