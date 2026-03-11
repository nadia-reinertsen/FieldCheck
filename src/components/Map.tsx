import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GeoJSON, MapContainer, TileLayer, useMap } from 'react-leaflet';
import { fetchWeatherGrid, WeatherGridResult } from './fetchWeatherGrid';
import { TemperatureLayer } from './TemperatureLayer';
import { WindGridPoint, WindLayer } from './WindLayer';

// Fix default marker icon broken by webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const DEFAULT_CENTER: [number, number] = [58.8, 2.8];

// ArcGIS FeatureServer – fields layer, Johan Sverdrup field ID
const SODIR_URL =
  'https://factmaps.sodir.no/api/rest/services/DataService/Data/FeatureServer/7100/query' +
  '?where=fldNpdidField%3D26376286' +
  '&outFields=fldName' +
  '&outSR=4326' +
  '&f=geojson';

type ActiveLayer = 'wind' | 'temp' | 'both' | 'none';

/* ------------------------------------------------------------------ */
/*  Sub-component: manages custom canvas layers on the Leaflet map    */
/* ------------------------------------------------------------------ */
function CanvasLayers({
  windGrid,
  tempGrid,
  active,
}: {
  windGrid: WindGridPoint[];
  tempGrid: { lat: number; lon: number; temperature: number }[];
  active: ActiveLayer;
}) {
  const map = useMap();
  const windRef = useRef<WindLayer | null>(null);
  const tempRef = useRef<TemperatureLayer | null>(null);

  // Wind layer
  useEffect(() => {
    if ((active === 'wind' || active === 'both') && windGrid.length) {
      if (!windRef.current) {
        windRef.current = new WindLayer(windGrid);
        windRef.current.addTo(map);
      } else {
        windRef.current.setGrid(windGrid);
      }
    } else if (windRef.current) {
      map.removeLayer(windRef.current);
      windRef.current = null;
    }
    return () => {
      if (windRef.current) {
        map.removeLayer(windRef.current);
        windRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windGrid, active]);

  // Temperature layer
  useEffect(() => {
    if ((active === 'temp' || active === 'both') && tempGrid.length) {
      if (!tempRef.current) {
        tempRef.current = new TemperatureLayer(tempGrid);
        tempRef.current.addTo(map);
      } else {
        tempRef.current.setGrid(tempGrid);
      }
    } else if (tempRef.current) {
      map.removeLayer(tempRef.current);
      tempRef.current = null;
    }
    return () => {
      if (tempRef.current) {
        map.removeLayer(tempRef.current);
        tempRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempGrid, active]);

  return null;
}

/* ------------------------------------------------------------------ */
/*  Main Map component                                                */
/* ------------------------------------------------------------------ */
export default function Map() {
  const [fieldGeoJSON, setFieldGeoJSON] = useState<any>(null);
  const [weatherGrid, setWeatherGrid] = useState<WeatherGridResult | null>(null);
  const [activeLayer, setActiveLayer] = useState<ActiveLayer>('wind');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* Fetch field polygon */
  useEffect(() => {
    fetch(SODIR_URL)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.features?.length) setFieldGeoJSON(data);
      })
      .catch(err => setError(err.message));
  }, []);

  /* Fetch weather grid */
  useEffect(() => {
    setLoading(true);
    fetchWeatherGrid()
      .then(result => {
        setWeatherGrid(result);
        setLoading(false);
      })
      .catch(err => {
        console.error('Weather grid fetch failed:', err);
        setLoading(false);
      });
  }, []);

  const cycleLayer = useCallback(() => {
    setActiveLayer(prev => {
      const order: ActiveLayer[] = ['wind', 'temp', 'both', 'none'];
      return order[(order.indexOf(prev) + 1) % order.length];
    });
  }, []);

  const layerLabel: Record<ActiveLayer, string> = {
    wind: '💨 Wind',
    temp: '🌡 Temperature',
    both: '💨+🌡 Both',
    none: '🗺 None',
  };

  // Pick a representative weather point near field center for the HUD
  const centerWeather = weatherGrid?.points.find(
    p => Math.abs(p.lat - 58.8) < 1.6 && Math.abs(p.lon - 2.8) < 1.6
  ) ?? weatherGrid?.points[0];

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative', background: '#0a0a1a' }}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        {/* Dark atmospheric tiles – nullschool style */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
        />
        {/* Subtle labels on top */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
          pane="shadowPane"
        />

        {/* Johan Sverdrup field polygon */}
        {fieldGeoJSON && (
          <GeoJSON
            data={fieldGeoJSON}
            style={{
              color: '#00ffd5',
              weight: 2,
              fillColor: '#00ffd5',
              fillOpacity: 0.12,
              dashArray: '6 3',
            }}
            onEachFeature={(feature, layer) => {
              const name = feature.properties?.fldName ?? 'Johan Sverdrup';
              layer.bindTooltip(name, { permanent: true, direction: 'center', className: 'field-label-dark' });
            }}
          />
        )}

        {/* Canvas visualisation layers */}
        {weatherGrid && (
          <CanvasLayers
            windGrid={weatherGrid.windGrid}
            tempGrid={weatherGrid.tempGrid}
            active={activeLayer}
          />
        )}
      </MapContainer>

      {/* ---- HUD overlay controls ---- */}

      {/* Layer toggle */}
      <button
        onClick={cycleLayer}
        style={{
          position: 'absolute', top: 16, left: 16, zIndex: 1000,
          background: 'rgba(10,10,26,0.85)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
          color: '#eee', padding: '8px 16px', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', letterSpacing: 0.3,
        }}
      >
        Layer: {layerLabel[activeLayer]}
      </button>

      {/* Loading indicator */}
      {loading && (
        <div style={{
          position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, background: 'rgba(10,10,26,0.85)',
          border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
          color: '#8af', padding: '8px 18px', fontSize: 13, fontWeight: 500,
        }}>
          Fetching weather grid…
        </div>
      )}

      {/* Weather HUD (top right) */}
      {centerWeather && (
        <div style={{
          position: 'absolute', top: 16, right: 16, zIndex: 1000,
          background: 'rgba(10,10,26,0.85)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
          color: '#eee', padding: '12px 18px', fontFamily: 'monospace',
          minWidth: 180,
        }}>
          <div style={{ fontSize: 11, color: '#8af', marginBottom: 6, letterSpacing: 1 }}>
            JOHAN SVERDRUP
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>
              {centerWeather.temperature.toFixed(1)}°
            </span>
            <span style={{ fontSize: 12, color: '#aaa' }}>C</span>
          </div>
          <div style={{ fontSize: 12, color: '#ccc', marginTop: 6, lineHeight: 1.8 }}>
            💨 {centerWeather.windSpeed.toFixed(1)} m/s &nbsp;
            {windDirectionLabel(centerWeather.windDirection)}<br />
            💧 {centerWeather.humidity.toFixed(0)}% &nbsp;
            ☁ {centerWeather.cloudCover.toFixed(0)}%<br />
            ⬇ {centerWeather.pressure.toFixed(0)} hPa
          </div>
          {weatherGrid && (
            <div style={{ fontSize: 9, color: '#666', marginTop: 8 }}>
              {new Date(weatherGrid.updatedAt).toLocaleString()} · MET Norway
            </div>
          )}
        </div>
      )}

      {/* Wind colour legend */}
      {(activeLayer === 'wind' || activeLayer === 'both') && (
        <div style={{
          position: 'absolute', bottom: 24, left: 16, zIndex: 1000,
          background: 'rgba(10,10,26,0.85)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
          padding: '8px 12px', color: '#ccc', fontSize: 11,
        }}>
          <div style={{ marginBottom: 4, fontWeight: 600, letterSpacing: 0.5 }}>Wind Speed (m/s)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <div style={{ width: 120, height: 10, borderRadius: 4, background: 'linear-gradient(to right, rgb(60,120,240), rgb(80,200,220), rgb(80,240,120), rgb(240,240,60), rgb(240,120,40), rgb(240,40,60), rgb(200,40,200))' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: 120, fontSize: 9, marginTop: 2 }}>
            <span>0</span><span>5</span><span>10</span><span>20</span><span>30+</span>
          </div>
        </div>
      )}

      {/* Temperature colour legend */}
      {(activeLayer === 'temp' || activeLayer === 'both') && (
        <div style={{
          position: 'absolute', bottom: 24, right: 16, zIndex: 1000,
          background: 'rgba(10,10,26,0.85)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
          padding: '8px 12px', color: '#ccc', fontSize: 11,
        }}>
          <div style={{ marginBottom: 4, fontWeight: 600, letterSpacing: 0.5 }}>Temperature (°C)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <div style={{ width: 120, height: 10, borderRadius: 4, background: 'linear-gradient(to right, rgb(20,0,120), rgb(60,140,240), rgb(80,210,240), rgb(100,240,80), rgb(240,220,40), rgb(240,80,30), rgb(180,20,20))' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: 120, fontSize: 9, marginTop: 2 }}>
            <span>-30</span><span>-5</span><span>0</span><span>10</span><span>20</span><span>40</span>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
          background: '#c0392b', color: 'white', padding: '8px 16px', borderRadius: 6,
          fontSize: 14, zIndex: 1000,
        }}>
          Failed to load field polygon: {error}
        </div>
      )}
    </div>
  );
}

function windDirectionLabel(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}
