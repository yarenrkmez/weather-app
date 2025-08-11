import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { useLocalStorage } from "hooks/useLocalStorage";

/** Şehir kartlarının depolandığı tip.
 *  Ekleme anında tüm veriler olmayabileceği için (API sonra çekiliyor)
 *  çoğu alan opsiyonel hale getirildi.
 */
export interface CityWeather {
  id: string;
  city: string;
  temperature?: number;
  description?: string;
  icon?: string;
  humidity?: number;
  windSpeed?: number;
  forecast?: any;
  latitude?: number;
  longitude?: number;
}

type AddCityInput =
  | string
  | {
      city: string;
      latitude?: number;
      longitude?: number;
      id?: string;
    };

type CityWeatherContextType = {
  cities: CityWeather[];
  addCity: (city: AddCityInput) => void;
  updateCity: (city: CityWeather) => void;
  /** id YA DA city (isim) vererek silme */
  removeCity: (idOrCity: string) => void;
};

const CityWeatherContext = createContext<CityWeatherContextType | undefined>(
  undefined
);

export const useCityWeather = (): CityWeatherContextType => {
  const context = useContext(CityWeatherContext);
  if (!context)
    throw new Error("useCityWeather must be used within CityWeatherProvider");
  return context;
};

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // @ts-ignore
    return crypto.randomUUID();
  }
  return `id_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export const CityWeatherProvider = ({ children }: { children: ReactNode }) => {
  const [cities, setCities] = useLocalStorage<CityWeather[]>("cities", []);

  const addCity = useCallback(
    (input: AddCityInput) => {
      const name = typeof input === "string" ? input : input.city;
      const lat = typeof input === "string" ? undefined : input.latitude;
      const lon = typeof input === "string" ? undefined : input.longitude;
      const providedId = typeof input === "string" ? undefined : input.id;

      const trimmed = name.trim();
      if (!trimmed) return;

      setCities((prev) => {
        const idx = prev.findIndex(
          (c) => c.city.toLowerCase() === trimmed.toLowerCase()
        );
        if (idx > -1) {
          const current = prev[idx];
          const merged: CityWeather = {
            ...current,
            latitude: current.latitude ?? lat,
            longitude: current.longitude ?? lon,
          };
          const next = prev.slice();
          next[idx] = merged;
          return next;
        }

        const newCity: CityWeather = {
          id: providedId ?? uuid(),
          city: trimmed,
          latitude: lat,
          longitude: lon,
        };
        return [...prev, newCity];
      });
    },
    [setCities]
  );

  const updateCity = useCallback(
    (city: CityWeather) => {
      setCities((prev) => prev.map((c) => (c.id === city.id ? city : c)));
    },
    [setCities]
  );

  const removeCity = useCallback(
    (idOrCity: string) => {
      const key = idOrCity.trim().toLowerCase();
      setCities((prev) =>
        prev.filter(
          (c) => c.id.toLowerCase() !== key && c.city.toLowerCase() !== key
        )
      );
    },
    [setCities]
  );

  return (
    <CityWeatherContext.Provider
      value={{ cities, addCity, updateCity, removeCity }}
    >
      {children}
    </CityWeatherContext.Provider>
  );
};
