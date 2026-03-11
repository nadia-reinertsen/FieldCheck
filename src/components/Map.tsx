import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet';

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

export default function Map() {
  const [fieldGeoJSON, setFieldGeoJSON] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(SODIR_URL)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.features && data.features.length > 0) {
          setFieldGeoJSON(data);
        } else {
          setError('No polygon data returned');
        }
      })
      .catch(err => setError(err.message));
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={9}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {fieldGeoJSON && (
          <GeoJSON
            data={fieldGeoJSON}
            style={{
              color: '#e63946',
              weight: 3,
              fillColor: '#e63946',
              fillOpacity: 0.2,
            }}
            onEachFeature={(feature, layer) => {
              const name = feature.properties?.fldName ?? 'Johan Sverdrup';
              layer.bindPopup(`<strong>${name}</strong>`);
              layer.bindTooltip(name, { permanent: true, direction: 'center', className: 'field-label' });
            }}
          />
        )}
      </MapContainer>
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
