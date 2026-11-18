import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para siguradong lumabas ang Map Pin icon sa Vite/React
const clinicIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Palitan ito ng exact Latitude at Longitude ng veterinary clinic mo
const CLINIC_LOCATION = {
  name: 'VetCare Main Clinic',
  address: 'J.P. Rizal St., Rodriguez, Rizal',
  lat: 14.7259,
  lng: 121.1422,
};

export default function ClinicMap() {
  // Function para kumuha ng GPS location ng user at magbukas ng Directions
  const handleGetDirections = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const url = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${CLINIC_LOCATION.lat},${CLINIC_LOCATION.lng}`;
          window.open(url, '_blank');
        },
        () => {
          // Kapag naka-off ang GPS ng user, buksan pa rin ang clinic location sa Google Maps
          const url = `https://www.google.com/maps/dir/?api=1&destination=${CLINIC_LOCATION.lat},${CLINIC_LOCATION.lng}`;
          window.open(url, '_blank');
        }
      );
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${CLINIC_LOCATION.lat},${CLINIC_LOCATION.lng}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mt-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Clinic Location & Directions</h2>
          <p className="text-sm text-gray-500">
            📍 {CLINIC_LOCATION.name} — {CLINIC_LOCATION.address}
          </p>
        </div>
        <button
          onClick={handleGetDirections}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 w-fit"
        >
          🧭 Get Directions (GPS)
        </button>
      </div>

      {/* Interactive Map */}
      <div className="h-72 w-full rounded-lg overflow-hidden border z-0 relative">
        <MapContainer
          center={[CLINIC_LOCATION.lat, CLINIC_LOCATION.lng]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[CLINIC_LOCATION.lat, CLINIC_LOCATION.lng]} icon={clinicIcon}>
            <Popup>
              <strong>{CLINIC_LOCATION.name}</strong>
              <br />
              {CLINIC_LOCATION.address}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}