import {MapContainer,TileLayer} from 'react-leaflet';

// Default center position (near Johan Sverdrup field)
const DEFAULT_CENTER: [number, number] = [58.8, 2.8];

export default function JohanSverdrupMap() {
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
      </MapContainer>
    </div>
  );
}
