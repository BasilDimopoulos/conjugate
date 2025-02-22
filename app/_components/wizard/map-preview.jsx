import { useLazyQuery, useQuery, useReactiveVar } from "@apollo/client";
import { Circle } from "@gm-common/google-maps-circle";
import { CURRENT_ACCOUNT } from "@gm-graphql/localStates/account";
import { GET_ESTIMATES } from "@gm-graphql/queries/ads";
import { GET_ESTIMATED_REACH, REVERSE_GEOCODE_LOCATION } from "@gm-graphql/queries/campaign";
import { getSelectedFacebookAdAccount, getSelectedFacebookPage } from "@gm-lib/campaign";
import { APIProvider, AdvancedMarker, Map } from "@vis.gl/react-google-maps";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";

import { getLocalStringAsNumber } from "./constants";

const states = {
  excellent: {
    message: "Est. Reach - Excellent",
    percentage: 100,
    bar_color: "bg-purple-600",
  },
  good: {
    message: "Est. Reach - Good",
    percentage: 70,
    bar_color: "bg-green-700",
  },
  moderate: {
    message: "Est. Reach - Moderate",
    percentage: 50,
    bar_color: "bg-blue-900",
  },
  poor: {
    message: "Est. Reach - Poor",
    percentage: 15,
    bar_color: "bg-red-800",
  },
  default: {
    message: "Est. Reach - Add locations to estimate total reach",
    percentage: 0,
    bar_color: "bg-gray-600",
  },
};

const mapFacebookToGooglePlace = (locations) => {
  let multiplyFactor = 1;
  if (!locations) return {};
  return locations.map((location, index) => {
    multiplyFactor = location.radiusUnit === "mi" ? 1609.34 : 1000;
    return {
      id: index + 1,
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      circle: {
        radius: location.radius * multiplyFactor,
      },
    };
  });
};

const MapPreview = (props) => {
  const [mapState, setMapState] = useState(states.excellent);
  const [zoom, setZoom] = useState(4);
  const [places, setPlaces] = useState([]);
  const [estimatedAudience, setEstimatedAudience] = useState([0, 0]);
  const adAccountId = getSelectedFacebookAdAccount(props.campaign)?.id;
  const pageId = getSelectedFacebookPage(props.campaign)?.id;

  const addLocation = async (location) => {
    let newLocations;
    if (props.campaign?.targetedLocations) {
      newLocations = [...props.campaign.targetedLocations, location];
    } else {
      newLocations = [location];
    }
    props.updateCampaign({
      targetedLocations: newLocations,
    });
  };

  const [getEstimatedReach, { data: estimatedReachData, loading: loadingReach }] = useLazyQuery(GET_ESTIMATES);

  useEffect(() => {
    if (props.campaign?.targetedLocations) {
      const newPlaces = mapFacebookToGooglePlace(props.campaign.targetedLocations);
      setPlaces([...newPlaces]);
    }
  }, [props.campaign]);

  useEffect(() => {
    if (estimatedReachData?.estimatedReach) {
      const reach = estimatedReachData?.estimatedReach;
      setEstimatedAudience([reach[0], reach[1]]);
    }
  }, [loadingReach, estimatedReachData]);

  useEffect(() => {
    getReach();
  }, [props.campaign]);

  const getReach = async () => {
    const result = await getEstimatedReach({
      variables: {
        internalAdAccountId: adAccountId,
        internalPageId: pageId,
        campaignData: props.campaign,
      },
    });
    const estimates = result.data.estimates;
    const newEstimate = [estimates?.users_lower_bound, estimates?.users_upper_bound];
    setEstimatedAudience(newEstimate);
  };

  useEffect(() => {
    if (estimatedAudience[0] === 0 && (estimatedAudience[1] === 0 || estimatedAudience[1] === 1)) {
      setMapState(states.default);
    } else if (estimatedAudience[0] < 1000) {
      setMapState(states.poor);
    } else if (estimatedAudience[0] < 5000) {
      setMapState(states.moderate);
    } else if (estimatedAudience[0] < 12000) {
      setMapState(states.good);
    } else {
      setMapState(states.excellent);
    }
  }, [estimatedAudience]);

  return (
    <div className="w-[460px] bg-[#F7F7FF] p-4">
      <h3 className="font-bold uppercase tracking-widest text-gm-grey">Map Preview</h3>
      <p className="pt-2 text-gray-800">Begin searching a location to preview it on the map.</p>
      <div className="mt-3 h-[580px] w-full rounded-md bg-white">
        <MapContainer
          places={places}
          marker={props.marker}
          addLocation={addLocation}
          campaign={props.campaign}
          adAccountId={props.adAccountId}
        />
      </div>
      <div className="mt-3 rounded-md bg-white px-3 py-2 shadow-md">
        <div className="flex items-center">
          <span className="material-symbols-outlined text-lg text-[#282827]">my_location</span>
          <h3 className="text-bold ml-2 text-base font-bold text-[#282827]">Estimated audience</h3>
        </div>
        <div className="mt-1 h-2 w-full bg-gray-300">
          <div className={`${mapState.bar_color} h-2`} style={{ width: mapState.percentage + "%" }}></div>
        </div>
        <p className="mt-1 text-sm text-gray-700">{mapState.message}</p>
        {mapState !== states.default && (
          <p className="mt-1 text-sm text-gray-700">
            {getLocalStringAsNumber(estimatedAudience[0])} ~ {getLocalStringAsNumber(estimatedAudience[1])} people
          </p>
        )}
      </div>
    </div>
  );
};

const MapContainer = (props) => {
  const INITIAL_CAMERA = {
    center: {
      lat: -37.812517542565544,
      lng: 144.9468784772845,
    },
    zoom: 11,
  };

  useEffect(() => {
    if (props.marker && props.marker.latitude && props.marker.longitude) {
      handleCameraChange({
        detail: {
          center: { lat: parseFloat(props.marker.latitude), lng: parseFloat(props.marker.longitude) },
          zoom: 14,
        },
      });
    }
  }, [props.marker]);

  const [cameraProps, setCameraProps] = useState(INITIAL_CAMERA);
  const handleCameraChange = useCallback((ev) => setCameraProps(ev.detail));
  const [places, setPlaces] = useState(props.places);

  const [addingPin, setAddingPin] = useState(false);

  const { data: reverseGeoCoding, refetch: reverseGeocode } = useQuery(REVERSE_GEOCODE_LOCATION, {
    variables: {
      lat: 34.8873025,
      long: 138.626233,
    },
  });

  const addLocation = async (coordinates) => {
    const latitude = coordinates?.detail?.latLng.lat;
    const longitude = coordinates?.detail?.latLng.lng;
    const nameData = await reverseGeocode({ lat: latitude, long: longitude });
    const name = nameData?.data?.reverseGeocodeLocation?.name;
    const newLocation = {
      radius: "1",
      radiusUnit: "km",
      latitude,
      longitude,
      name: name && name !== "" ? name : latitude + ", " + longitude,
      type: "custom_location",
      key: Math.random().toString(),
    };
    props.addLocation(newLocation);
  };

  useEffect(() => {
    setPlaces(props.places);
  }, [props.places]);

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY} libraries={["marker"]}>
      <Map
        mapId={"bf51a910020fa25a"}
        style={{ height: "100%", width: "100%" }}
        {...cameraProps}
        onCameraChanged={handleCameraChange}
        disableDefaultUI={true}
        gestureHandling={addingPin ? "none" : "auto"}
        onClick={(e) => {
          if (addingPin) {
            addLocation(e);
            setAddingPin(false);
          }
        }}
      >
        {places.map((place) => {
          if (place.latitude && place.longitude) {
            return (
              <Fragment key={place.id}>
                <Circle
                  fillColor="#38ACEC"
                  strokeColor="#38ACEC"
                  strokeWeight="0"
                  center={{ lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) }}
                  {...place.circle}
                />
                <AdvancedMarker
                  position={{ lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) }}
                  onClick={() => {
                    handleCameraChange({
                      detail: {
                        center: { lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) },
                        zoom: 14,
                      },
                    });
                  }}
                />
              </Fragment>
            );
          }
        })}
      </Map>
      <div className="relative z-40 w-full cursor-pointer">
        <button
          className="absolute right-2 -mt-11 bg-gray-900"
          onClick={() => {
            setAddingPin(!addingPin);
          }}
        >
          <div className="flex items-center gap-x-1 p-1">
            <span className="material-symbols-outlined text-xs font-semibold text-white">
              {!addingPin ? "add_location" : "cancel"}
            </span>
            <p className="text-xs font-bold text-white">{!addingPin ? "Add Pin" : "Cancel"}</p>
          </div>
        </button>
      </div>
    </APIProvider>
  );
};

export default MapPreview;
