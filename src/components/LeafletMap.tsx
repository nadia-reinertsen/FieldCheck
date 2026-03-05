import {useEffect,useState} from 'react';
import {GeoJSON,MapContainer,TileLayer} from 'react-leaflet';

// Johan Sverdrup field ID
const JOHAN_SVERDRUP_FIELD_ID = '26376286';

// Default center position (near Johan Sverdrup field)
const DEFAULT_CENTER: [number, number] = [58.8, 70];

export default function LeafletMap() {
  const [johanSverdrupPolygon, setJohanSverdrupPolygon] = useState<any>(null);

  useEffect(() => {
    // Fetch Johan Sverdrup field polygon
    fetch(`https://factmaps.sodir.no/api/rest/services/DataService/Data/FeatureServer/7100/query?where=fldNpdidField=${JOHAN_SVERDRUP_FIELD_ID}&outFields=SHAPE&f=json`, {
      headers: {
        'User-Agent': 'hackathon-test-app'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.features && data.features.length > 0) {
          const wkt = data.features[0].attributes.SHAPE;
          if (wkt) {
            const geoJson = wktToGeoJSON(wkt);
            setJohanSverdrupPolygon(geoJson);
          }
        }
      })
      .catch(err => console.error('Failed to fetch field polygon:', err));
  }, []);

  // Convert WKT to GeoJSON
  const wktToGeoJSON = (wkt: string) => {
    // Simple WKT parser for POLYGON
    const polygonMatch = wkt.match(/POLYGON\s*\(\(([^)]+)\)\)/i);
    if (!polygonMatch) return null;

    const coordinates = polygonMatch[1]
      .split(',')
      .map(coord => coord.trim().split(' ').map(Number))
      .map(([lng, lat]) => [lng, lat]);

    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates]
      },
      properties: {}
    };
  };

  return (
    <div className="h-full w-full">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={9}
        className="h-full w-full rounded-lg shadow"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Johan Sverdrup field polygon */}
        {johanSverdrupPolygon && (
          <GeoJSON
            data={johanSverdrupPolygon}
            style={() => ({
              color: 'blue',
              weight: 4,
              fillColor: 'blue',
              fillOpacity: 0.1,
            })}
            onEachFeature={(feature, layer) => {
              layer.bindTooltip('Johan Sverdrup Oil Field', {
                permanent: true,
                direction: 'center',
                className: 'field-label'
              });
            }}
          />
        )}
        {/* Weather layer hidden */}
        {/*
        <TileLayer
          url="https://tilecache.rainviewer.com/v2/radar/nowcast_1/{z}/{x}/{y}/0/0_0.png"
          opacity={0.5}
          attribution='Weather data from RainViewer (Met.no)'
        />
        */}
      </MapContainer>
    </div>
  );
}