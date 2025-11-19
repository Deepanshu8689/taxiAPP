import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import '../../styles/common/mapWithRoutes.css'
import { useParams } from "react-router-dom";

export default function MapWithRoute() {
    const { pickupLat, pickupLng, dropLat, dropLng } = useParams();

    // Convert all params to numbers
    const pickup = { lat: Number(pickupLat), lng: Number(pickupLng) };
    const drop = { lat: Number(dropLat), lng: Number(dropLng) };

    const [route, setRoute] = useState(null);
    
    const fetchRoute = async () => {
        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${drop.lng},${drop.lat}?overview=full&geometries=geojson`;

            const res = await fetch(url);
            const data = await res.json();

            if (!data.routes || !data.routes.length) return;

            const coordinates = data.routes[0].geometry.coordinates;

            setRoute(coordinates.map(([lng, lat]) => [lat, lng]));
        } catch (err) {
            console.error("Error fetching route", err);
        }
    };

    useEffect(() => {
        fetchRoute();
    }, []);

    return (
        <div className="map-wrapper">
            <MapContainer
                center={[pickup.lat, pickup.lng]}
                zoom={12}
                scrollWheelZoom
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <Marker position={[pickup.lat, pickup.lng]}>
                    <Popup>Pickup</Popup>
                </Marker>

                <Marker position={[drop.lat, drop.lng]}>
                    <Popup>Drop</Popup>
                </Marker>

                {route && <Polyline positions={route} />}
            </MapContainer>
        </div>
    );
}
