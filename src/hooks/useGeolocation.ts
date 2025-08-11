/* eslint-disable no-restricted-globals */
import { useCallback, useEffect, useState } from "react";

type Status = "idle" | "prompt" | "granted" | "denied";
type ErrorKey =
  | "errors.location_unsupported"
  | "errors.location_insecure"
  | "errors.location_denied"
  | "errors.location_unavailable"
  | "errors.location_timeout"
  | "errors.location_failed"
  | null;

export function useGeolocation() {
  const [status, setStatus] = useState<Status>("idle");
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<ErrorKey>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // @ts-ignore
        const p = await navigator.permissions?.query({ name: "geolocation" });
        if (!mounted || !p) return;
        setStatus(p.state as Status);
        p.onchange = () => setStatus((p.state as Status) || "idle");
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const secureOk =
    typeof window !== "undefined" &&
    (window.isSecureContext ||
      location.protocol === "https:" ||
      location.hostname === "localhost");

  const requestLocation = useCallback(async () => {
    setErrorKey(null);

    if (!("geolocation" in navigator)) {
      setErrorKey("errors.location_unsupported");
      throw new Error("UNSUPPORTED");
    }
    if (!secureOk) {
      setErrorKey("errors.location_insecure");
      throw new Error("INSECURE_CONTEXT");
    }

    setLoading(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        });
      });
      return {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };
    } catch (e: any) {
      const code = e?.code;
      if (code === 1) setErrorKey("errors.location_denied");
      else if (code === 2) setErrorKey("errors.location_unavailable");
      else if (code === 3) setErrorKey("errors.location_timeout");
      else setErrorKey("errors.location_failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [secureOk]);

  return { status, loading, errorKey, requestLocation };
}
