
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const restaurantIcon = L.divIcon({
  className: "foodie-marker-wrapper",
  html: '<div class="foodie-map-marker"><span>🍴</span></div>',
  iconSize: [34, 42],
  iconAnchor: [17, 42]
});

function RestaurantMap({ location, restaurants, googleMapsSearch }) {
  return (
    <MapContainer
      center={[location.lat, location.lon]}
      zoom={14}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[location.lat, location.lon]}>
        <Popup>Your current location</Popup>
      </Marker>

      {restaurants.map((restaurant) => (
        <Marker
          key={restaurant.id}
          position={[restaurant.latitude, restaurant.longitude]}
          icon={restaurantIcon}
        >
          <Popup>
            <strong>{restaurant.name}</strong>
            <br />
            {restaurant.cuisine}
            <br />
            <a
              href={googleMapsSearch(restaurant)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Google Maps
            </a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default RestaurantMap;
