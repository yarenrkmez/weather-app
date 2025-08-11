import { mapWmo } from "constants/wmo";

type TFn = (key: string) => string;

function degToCompass(deg?: number) {
  if (deg == null || !Number.isFinite(deg)) return "-";
  const dirs = [
    "K",
    "KKD",
    "KD",
    "DKD",
    "D",
    "DGD",
    "GD",
    "GGD",
    "G",
    "GGB",
    "GB",
    "DGB",
    "B",
    "BKB",
    "KB",
    "KKB",
  ];
  const ix = Math.round((deg % 360) / 22.5) % 16;
  return dirs[ix] ?? "K";
}

function nearestHourlyIndex(targetISO?: string, hourlyTimes?: string[]) {
  if (!targetISO || !hourlyTimes?.length) return -1;
  const target = new Date(targetISO).getTime();
  let best = -1,
    bestDiff = Number.POSITIVE_INFINITY;
  for (let i = 0; i < hourlyTimes.length; i++) {
    const diff = Math.abs(new Date(hourlyTimes[i]).getTime() - target);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return best;
}

function pickCurrentHumidity(json: any): number | null {
  const cw = json?.current_weather ?? json?.current;
  const times: string[] = json?.hourly?.time ?? [];
  const hums: number[] = json?.hourly?.relative_humidity_2m ?? [];
  if (!cw || times.length === 0 || hums.length === 0) return null;
  const idx = nearestHourlyIndex(cw.time, times);
  const val = idx > -1 ? Number(hums[idx]) : NaN;
  return Number.isFinite(val) ? val : null;
}

function buildDailyHumidityAvg(json: any): Record<string, number> {
  const times: string[] = json?.hourly?.time ?? [];
  const hums: number[] = json?.hourly?.relative_humidity_2m ?? [];
  const buckets: Record<string, number[]> = {};
  for (let i = 0; i < times.length; i++) {
    const d = times[i]?.slice(0, 10);
    const h = hums[i];
    if (!d || !Number.isFinite(h)) continue;
    (buckets[d] ||= []).push(Number(h));
  }
  const out: Record<string, number> = {};
  Object.keys(buckets).forEach((d) => {
    const arr = buckets[d];
    const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
    out[d] = Math.round(avg);
  });
  return out;
}

export function mapOpenMeteoToCard(weather: any, t: TFn) {
  const cw = weather?.current_weather ?? weather?.current ?? {};
  const daily = weather?.daily ?? {};

  const currentUnits =
    weather?.current_weather_units ?? weather?.units?.current ?? {};
  const dailyUnits = weather?.daily_units ?? weather?.units?.daily ?? {};

  const code = Number.isFinite(Number(cw.weathercode))
    ? Number(cw.weathercode)
    : undefined;
  const { key, icon } = mapWmo(code, cw?.is_day);

  const humidity = pickCurrentHumidity(weather);
  const windSpeed = Number.isFinite(Number(cw.windspeed))
    ? Number(cw.windspeed)
    : 0;
  const windDirectionDeg = Number.isFinite(Number(cw.winddirection))
    ? Number(cw.winddirection)
    : null;

  const humidityAvgByDate = buildDailyHumidityAvg(weather);

  const times: string[] = daily?.time ?? [];
  const tmax: number[] = daily?.temperature_2m_max ?? [];
  const tmin: number[] = daily?.temperature_2m_min ?? [];
  const prcp: number[] =
    daily?.precipitation_sum ?? Array(times.length).fill(0);

  const rows = times.map((date, i) => ({
    date,
    min: Number.isFinite(Number(tmin[i])) ? Number(tmin[i]) : null,
    max: Number.isFinite(Number(tmax[i])) ? Number(tmax[i]) : null,
    precipitation: Number.isFinite(Number(prcp[i])) ? Number(prcp[i]) : null,
    humidityAvg: Number.isFinite(Number(humidityAvgByDate[date]))
      ? Number(humidityAvgByDate[date])
      : null,
  }));

  return {
    temperature: Number.isFinite(Number(cw.temperature))
      ? Number(cw.temperature)
      : 0,
    description: t(key),
    descriptionKey: key,
    icon,
    humidity: humidity ?? 0,
    windSpeed,
    windDirectionDeg,
    windDirectionText:
      windDirectionDeg == null ? "-" : degToCompass(windDirectionDeg),
    isDay: cw?.is_day === 1 || cw?.is_day === true,
    code: code ?? null,
    forecast: {
      time: times,
      temperature_2m_max: tmax,
      temperature_2m_min: tmin,
      precipitation_sum: prcp,
      humidity_avg_by_date: humidityAvgByDate,
      rows,
    },
    current_weather_units: currentUnits,
    daily_units: dailyUnits,
    units: { current: currentUnits, daily: dailyUnits },
    meta: {
      latitude: weather?.latitude ?? null,
      longitude: weather?.longitude ?? null,
      timezone: weather?.timezone ?? null,
      utc_offset_seconds: weather?.utc_offset_seconds ?? null,
    },
  };
}
