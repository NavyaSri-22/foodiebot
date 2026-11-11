
import { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  MapPin,
  LocateFixed,
  Clock3,
  ExternalLink,
  Utensils,
  RefreshCw
} from "lucide-react";

// Load the map component dynamically
const RestaurantMap = lazy(
  () => import("../components/RestaurantMap")
);

// Calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRadians = (value) => value * Math.PI / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const distance =
    6371 * 2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return distance;
}

function Restaurants() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Find nearby restaurants using browser location
  const findRestaurants = () => {
    setError("");

    if (!navigator.geolocation) {
      setError("Your browser does not support location access.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setLocation({ lat, lon });

        try {
          const response = await fetch(
            `https://foodiebot-c61x.onrender.com/api/restaurants?lat=`
          );

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(
              data.message || "Unable to find restaurants."
            );
          }

          setRestaurants(data.restaurants || []);
          setHasSearched(true);

          if (!data.restaurants?.length) {
            setError(
              "No listed restaurants were found nearby. Try Google Maps for more options."
            );
          }

        } catch (err) {
          console.error("Restaurant search error:", err);

          setError(
            err.message || "Unable to load restaurants. Please try again."
          );

          setRestaurants([]);
          setHasSearched(true);

        } finally {
          setLoading(false);
        }
      },

      (geoError) => {
        setLoading(false);

        if (geoError.code === 1) {
          setError(
            "Location permission was denied. Please allow location access in your browser settings."
          );
        } else if (geoError.code === 2) {
          setError("Your current location could not be determined.");
        } else {
          setError("Location request timed out. Please try again.");
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  };

  // Open an individual restaurant in Google Maps
  const googleMapsSearch = (restaurant) => {
    const query =
      `${restaurant.name} ${restaurant.latitude},${restaurant.longitude}`;

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  // Open nearby restaurants in Google Maps
  const mapsForNearby = location
    ? `https://www.google.com/maps/search/restaurants/@${location.lat},${location.lon},14z`
    : "https://www.google.com/maps/search/restaurants/";

  return (
    <div className="restaurants-page">

      {/* Header */}
      <header className="restaurants-header">

        <button
          className="restaurant-back-btn"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div className="restaurant-brand">

          <div className="restaurant-brand-icon">
            <Utensils size={22} />
          </div>

          <div>
            <h2>FoodieBot</h2>
            <span>Restaurant Discovery</span>
          </div>

        </div>

        <span className="restaurant-header-label">
          <MapPin size={16} />
          Explore nearby
        </span>

      </header>

      <main className="restaurants-main">

        {/* Introduction */}
        <section className="restaurants-intro">

          <span className="restaurant-section-label">
            DISCOVER GREAT FOOD
          </span>

          <h1>Find restaurants near you!</h1>

          <p>
            Explore nearby restaurants, cafés and food places.
            Discover your next favourite food spot with FoodieBot.
          </p>

          <button
            className="find-restaurants-btn"
            onClick={findRestaurants}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="restaurant-spin" />
                Finding restaurants...
              </>
            ) : (
              <>
                <LocateFixed size={19} />
                Find Restaurants Near Me
              </>
            )}
          </button>

          <p className="location-note">
            <MapPin size={14} />
            Your browser will ask permission to access your location.
          </p>

          {error && (
            <div className="restaurant-error" role="status">
              {error}
            </div>
          )}

        </section>

        {/* Interactive Map */}
        <section className="restaurant-map-section">

          <div className="restaurant-section-heading">

            <div>
              <h2>Explore on Map</h2>
              <p>Find food places around your location.</p>
            </div>

            {restaurants.length > 0 && (
              <span className="restaurant-count">
                {restaurants.length} places found
              </span>
            )}

          </div>

          {location ? (

            <div className="restaurant-map">

              <Suspense
                fallback={
                  <div className="restaurant-map-placeholder">
                    <RefreshCw size={28} />
                    <h3>Loading your food map...</h3>
                  </div>
                }
              >
                <RestaurantMap
                  location={location}
                  restaurants={restaurants}
                  googleMapsSearch={googleMapsSearch}
                />
              </Suspense>

            </div>

          ) : (

            <div className="restaurant-map-placeholder">

              <div className="map-placeholder-icon">
                <MapPin size={38} />
              </div>

              <h3>Your food map starts here!</h3>

              <p>
                Allow location access to see restaurants on the map.
              </p>

            </div>

          )}

        </section>

        {/* Restaurant List */}
        <section className="restaurant-list-section">

          <div className="restaurant-section-heading">

            <div>
              <h2>Nearby Food Places</h2>

              <p>
                {hasSearched
                  ? "Restaurant information from OpenStreetMap."
                  : "Discover places around your current location."}
              </p>
            </div>

          </div>

          {restaurants.length > 0 ? (

            <div className="restaurant-grid">

              {restaurants.map((restaurant) => {

                const distance = calculateDistance(
                  location.lat,
                  location.lon,
                  restaurant.latitude,
                  restaurant.longitude
                );

                return (

                  <article
                    className="restaurant-card"
                    key={restaurant.id}
                  >

                    <div className="restaurant-card-icon">
                      <Utensils size={25} />
                    </div>

                    <div className="restaurant-card-details">

                      <h3>{restaurant.name}</h3>

                      <span className="restaurant-cuisine">
                        {restaurant.cuisine}
                      </span>

                      <p>
                        <MapPin size={14} />
                        {restaurant.address}
                      </p>

                      <p>
                        <Clock3 size={14} />
                        {restaurant.openingHours}
                      </p>

                      <span className="restaurant-distance">
                        {distance < 1
                          ? `${Math.round(distance * 1000)} m away`
                          : `${distance.toFixed(1)} km away`}
                      </span>

                    </div>

                    <a
                      href={googleMapsSearch(restaurant)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="restaurant-maps-link"
                    >
                      <ExternalLink size={16} />
                      Google Maps
                    </a>

                  </article>

                );
              })}

            </div>

          ) : (

            !loading && (

              <div className="restaurant-empty">

                <Utensils size={35} />

                <h3>
                  {hasSearched
                    ? "No restaurant listings found"
                    : "Ready for a food adventure?"}
                </h3>

                <p>
                  {hasSearched
                    ? "Try searching Google Maps for more nearby choices."
                    : "Click Find Restaurants Near Me to discover food places."}
                </p>

              </div>

            )

          )}

          {/* Google Maps Option */}
          <div className="google-maps-banner">

            <div>
              <h3>Want to explore more?</h3>

              <p>
                Search additional restaurants and get directions
                through Google Maps.
              </p>
            </div>

            <a
              href={mapsForNearby}
              target="_blank"
              rel="noopener noreferrer"
              className="google-maps-btn"
            >
              Open Google Maps
              <ExternalLink size={16} />
            </a>

          </div>

        </section>

        <p className="restaurant-data-note">
          Restaurant listings are based on OpenStreetMap community data.
          Some details may be missing or outdated. Always verify
          information before visiting.
        </p>

      </main>

    </div>
  );
}

export default Restaurants;
