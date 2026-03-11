/**
 * Fetch a grid of weather data from MET Norway's Locationforecast API.
 * We request a sparse grid around the North Sea / Johan Sverdrup area
 * so we can interpolate wind + temperature across the viewport.
 */

import { TempGridPoint } from './TemperatureLayer';
import { WindGridPoint } from './WindLayer';

// Grid points spanning roughly 56–62°N,  -1–7°E  (North Sea region)
const GRID_COORDS: [number, number][] = [];

const LAT_MIN = 56;
const LAT_MAX = 62;
const LON_MIN = -1;
const LON_MAX = 7;
const STEP = 1.5; // ~1.5° spacing → ~5×6 = 30 requests

for (let lat = LAT_MIN; lat <= LAT_MAX; lat += STEP) {
  for (let lon = LON_MIN; lon <= LON_MAX; lon += STEP) {
    GRID_COORDS.push([parseFloat(lat.toFixed(2)), parseFloat(lon.toFixed(2))]);
  }
}

interface RawWeatherPoint {
  lat: number;
  lon: number;
  temperature: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  pressure: number;
  cloudCover: number;
  symbolCode: string;
}

export interface WeatherGridResult {
  points: RawWeatherPoint[];
  windGrid: WindGridPoint[];
  tempGrid: TempGridPoint[];
  updatedAt: string;
}

/**
 * Wind direction from met.no is "wind FROM direction" in degrees.
 * Convert to u,v components (east-ward, north-ward).
 */
function dirSpeedToUV(dir: number, speed: number): { u: number; v: number } {
  const rad = (dir * Math.PI) / 180;
  // Wind FROM dir → meteorological convention: add 180° to get movement direction
  return {
    u: -speed * Math.sin(rad),
    v: -speed * Math.cos(rad),
  };
}

export async function fetchWeatherGrid(): Promise<WeatherGridResult> {
  // Use small delay between requests to be polite to met.no
  const points: RawWeatherPoint[] = [];
  let updatedAt = '';

  // Fetch in batches of 6 to avoid hammering the API
  const batchSize = 6;
  for (let i = 0; i < GRID_COORDS.length; i += batchSize) {
    const batch = GRID_COORDS.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async ([lat, lon]) => {
        try {
          const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;
          const res = await fetch(url, {
            headers: { 'User-Agent': 'hackathon-test-app github.com/test' },
          });
          if (!res.ok) return null;
          return res.json();
        } catch {
          return null;
        }
      })
    );

    for (let j = 0; j < results.length; j++) {
      const data = results[j];
      if (!data?.properties?.timeseries?.[0]) continue;
      const [lat, lon] = batch[j];
      const first = data.properties.timeseries[0];
      const d = first.data.instant.details;
      if (!updatedAt) updatedAt = data.properties.meta.updated_at;

      points.push({
        lat,
        lon,
        temperature: d.air_temperature,
        windSpeed: d.wind_speed,
        windDirection: d.wind_from_direction,
        humidity: d.relative_humidity,
        pressure: d.air_pressure_at_sea_level,
        cloudCover: d.cloud_area_fraction,
        symbolCode:
          first.data.next_1_hours?.summary?.symbol_code ??
          first.data.next_6_hours?.summary?.symbol_code ??
          'cloudy',
      });
    }

    // Small pause between batches
    if (i + batchSize < GRID_COORDS.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  const windGrid: WindGridPoint[] = points.map(p => {
    const { u, v } = dirSpeedToUV(p.windDirection, p.windSpeed);
    return { lat: p.lat, lon: p.lon, u, v, speed: p.windSpeed };
  });

  const tempGrid: TempGridPoint[] = points.map(p => ({
    lat: p.lat,
    lon: p.lon,
    temperature: p.temperature,
  }));

  return { points, windGrid, tempGrid, updatedAt };
}
