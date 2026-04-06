import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { MapPin, Info } from 'lucide-react';

// Leaflet CSS must be included — inject it if not already present
const injectLeafletCSS = () => {
  if (document.getElementById('leaflet-css')) return;
  const link = document.createElement('link');
  link.id = 'leaflet-css';
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
};

export default function ShipmentMap({ location }) {
  React.useEffect(() => { injectLeafletCSS(); }, []);

  if (!location || location.mode === 'none') {
    return (
      <div className="flex items-center justify-center h-32 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
        <div className="text-center text-gray-400">
          <MapPin className="w-6 h-6 mx-auto mb-1 opacity-40" />
          <p className="text-xs">Carrier has not provided mappable location yet</p>
        </div>
      </div>
    );
  }

  const { lat, lng, mode, label } = location;

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={[lat, lng]}
        zoom={mode === 'exact' ? 14 : 10}
        style={{ height: '180px', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {mode === 'exact' ? (
          <Marker position={[lat, lng]}>
            <Popup>{label || 'Package location'}</Popup>
          </Marker>
        ) : (
          <>
            <Marker position={[lat, lng]}>
              <Popup>{label || 'Approximate location'}</Popup>
            </Marker>
            <Circle
              center={[lat, lng]}
              radius={8000}
              pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.08, weight: 1.5 }}
            />
          </>
        )}
      </MapContainer>
      <div className={`flex items-center gap-1.5 px-3 py-1.5 text-xs ${
        mode === 'exact' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
      }`}>
        <Info className="w-3 h-3 flex-shrink-0" />
        {mode === 'exact'
          ? 'Exact carrier-reported location'
          : 'Approximate location based on latest carrier scan'}
      </div>
    </div>
  );
}