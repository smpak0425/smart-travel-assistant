import React from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';

const MAP_CONTAINER_STYLE = {
    width: '100%',
    height: '100%',
    borderRadius: '16px',
};

const DEFAULT_CENTER = { lat: 48.8566, lng: 2.3522 }; // 파리 (기본값)

function MiniMap({ apiKey, origin, destination }) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey,
    });

    const [directions, setDirections] = React.useState(null);
    const [center, setCenter] = React.useState(DEFAULT_CENTER);

    React.useEffect(() => {
        if (isLoaded && window.google && origin && destination) {
            const directionsService = new window.google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: origin,
                    destination: destination,
                    travelMode: window.google.maps.TravelMode.TRANSIT,
                },
                (result, status) => {
                    if (status === window.google.maps.DirectionsStatus.OK) {
                        setDirections(result);
                        const leg = result.routes[0].legs[0];
                        setCenter(leg.start_location.toJSON());
                    } else {
                        // TRANSIT 실패 시 DRIVING으로 재시도
                        directionsService.route(
                            {
                                origin: origin,
                                destination: destination,
                                travelMode: window.google.maps.TravelMode.DRIVING,
                            },
                            (result2, status2) => {
                                if (status2 === window.google.maps.DirectionsStatus.OK) {
                                    setDirections(result2);
                                    const leg = result2.routes[0].legs[0];
                                    setCenter(leg.start_location.toJSON());
                                } else {
                                    console.error('Directions error:', status2);
                                }
                            }
                        );
                    }
                }
            );
        }
    }, [isLoaded, origin, destination]);

    if (!isLoaded) return <div className="map-placeholder pulse">지도를 불러오는 중...</div>;

    return (
        <div style={{ height: '240px', width: '100%', padding: '12px 16px 0 16px' }}>
            <GoogleMap
                mapContainerStyle={MAP_CONTAINER_STYLE}
                center={center}
                zoom={14}
                options={{
                    disableDefaultUI: true,
                    styles: [
                        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
                        { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
                        { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
                        { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
                        { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
                        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
                        { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
                        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
                        { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
                        { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
                        { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
                        { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
                        { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
                        { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
                        { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
                    ],
                }}
            >
                {directions && (
                    <DirectionsRenderer
                        directions={directions}
                        options={{
                            suppressMarkers: false,
                            polylineOptions: {
                                strokeColor: '#4b82f3',
                                strokeWeight: 5,
                            },
                        }}
                    />
                )}
            </GoogleMap>
        </div>
    );
}

export default MiniMap;
