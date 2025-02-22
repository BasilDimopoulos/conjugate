import { useQuery } from "@apollo/client";
import ListBox from "@gm-common/listbox";
import { GEOCODE_LOCATION, GET_LOCATIONS } from "@gm-graphql/queries/campaign";
import { getSelectedFacebookAdAccount } from "@gm-lib/campaign";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";

import { styles } from "../../../styles/styles";
import { isJsonStringValid } from "./constants";

const ageFromSelections = [];
const ageToSelections = [];
for (let i = 18; i <= 65; i++) {
  ageFromSelections.push(i.toString());
  ageToSelections.push(i.toString());
}

const LocationDemographics = (props) => {
  const [showSearch, setShowSearch] = useState(false);
  const radiusUnits = ["km", "mi"];
  const radius = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "20",
    "25",
    "30",
    "35",
    "40",
    "45",
    "50",
  ];

  const canSetValues = (type) => {
    if (type === "city" || type === "custom_location" || type === "google_place") {
      return true;
    } else {
      return false;
    }
  };

  const [locationsSelected, setLocationsSelected] = useState([]);

  useEffect(() => {
    if (props.campaign?.targetedLocations?.length > 0) {
      setLocationsSelected(props.campaign?.targetedLocations);
    } else {
      setLocationsSelected([
        {
          key: "",
          name: "",
          region: "",
          country: "",
          type: "",
          radius: "",
          radiusUnit: "",
        },
      ]);
    }
  }, [props?.campaign?.targetedLocations]);
  const targetDivRef = useRef(null);
  const handleClickOutside = (event) => {
    if (targetDivRef.current && !targetDivRef.current.contains(event.target)) {
      setShowSearch(false);
    }
  };
  const [selectableLocations, setSelectableLocations] = useState([]);
  const [ageFrom, setAgeFrom] = useState(props.campaign?.targetedDemographics?.ageFrom || "");
  const [ageTo, setAgeTo] = useState(props.campaign?.targetedDemographics?.ageTo || "");
  const [ageFromInput] = useDebounce(ageFrom, 500);
  const [ageToInput] = useDebounce(ageTo, 500);
  const [gender, setGender] = useState(props.campaign?.targetedDemographics?.gender || "All");
  const [searchIndex, setSearchIndex] = useState(0);
  const [adAccountId, setAdAccountId] = useState(getSelectedFacebookAdAccount(props.campaign)?.id);
  const {
    loading,
    error,
    data: locations,
    refetch,
  } = useQuery(GET_LOCATIONS, {
    variables: {
      adAccountId,
      input: "New York",
    },
  });

  const {
    loadingGeocoding,
    data: geoCoding,
    refetch: refetchGeocoding,
  } = useQuery(GEOCODE_LOCATION, {
    variables: {
      address: "New York, USA",
    },
  });

  const ifValidSearch = (index) => {
    return locationsSelected[index]?.name?.length;
  };

  const createNewLocationField = () => {
    if (readyToAddNewLocation()) {
      setLocationsSelected((prevLocations) => [
        ...prevLocations,
        {
          key: "",
          name: "",
          region: "",
          country: "",
          type: "",
          radius: "",
          radiusUnit: "",
        },
      ]);
    }
  };

  const selectGender = (gender) => {
    props.updateCampaign({
      targetedDemographics: {
        ...props.campaign?.targetedDemographics,
        gender,
      },
    });
  };

  const selectRadius = async (radius, index) => {
    let newLocations;
    setLocationsSelected((prevLocations) => {
      newLocations = [...prevLocations];
      newLocations[index].radius = radius;
      return newLocations;
    });
    props.updateCampaign({ targetedLocations: newLocations });
  };

  const selectRadiusUnit = async (radiusUnit, index) => {
    let newLocations;
    setLocationsSelected((prevLocations) => {
      newLocations = [...prevLocations];
      newLocations[index].radiusUnit = radiusUnit;
      return newLocations;
    });
    props.updateCampaign({
      targetedLocations: newLocations,
    });
  };

  const deleteLocation = async (locationIndex) => {
    const newLocations = locationsSelected;
    newLocations.splice(locationIndex, 1);
    setLocationsSelected(newLocations);
    props.updateCampaign({ targetedLocations: newLocations });
  };

  const searchLocations = async (place, index) => {
    setSearchIndex(index);
    setLocationsSelected((prevLocations) => {
      const newLocations = [...prevLocations];
      newLocations[index].name = place;
      return newLocations;
    });
    setShowSearch(true);
    if (place !== "") {
      const locations = await refetch({
        adAccountId,
        input: place,
      });
      setSelectableLocations(locations.data.locations);
    } else {
      setSelectableLocations([]);
    }
  };

  const readyToAddNewLocation = () => {
    if (locationsSelected.length === 0) {
      return true;
    } else {
      return locationsSelected[locationsSelected.length - 1]?.key;
    }
  };

  const addLocation = async (location, index) => {
    const newLocations = locationsSelected;
    const geoCoordinates = await refetchGeocoding({
      address:
        location.type === "google_place" ? location.name : `${location.name}, ${location.region} ${location.country}`,
    });
    newLocations[index] = {
      key: location?.key?.toString(),
      name: location?.name,
      region: location?.region,
      country: location?.country || "",
      country_code: location?.country_code || "",
      type: location?.type,
      region_id: location?.region_id?.toString() || "",
      radius: location?.type === "city" ? "20" : "1",
      radiusUnit: "km",
      latitude: geoCoordinates?.data.geocodeLocation?.latitude,
      longitude: geoCoordinates?.data.geocodeLocation?.longitude,
    };
    setLocationsSelected(newLocations);
    setShowSearch(false);
    props.updateCampaign({
      targetedLocations: newLocations,
    });
    props?.setMarker(newLocations[index]);
  };

  const setAgeInput = (age, field) => {
    if (field === "ageFrom") {
      setAgeFrom(age);
    } else if (field === "ageTo") {
      setAgeTo(age);
    }
  };

  useEffect(() => {
    if (ageFrom !== props.campaign?.targetedDemographics?.ageFrom) {
      props.updateCampaign({
        targetedDemographics: {
          ...props.campaign?.targetedDemographics,
          ageFrom,
        },
      });
    }
    if (ageTo !== props.campaign?.targetedDemographics?.ageTo) {
      props.updateCampaign({
        targetedDemographics: {
          ...props.campaign?.targetedDemographics,
          ageTo,
        },
      });
    }
  }, [ageFromInput, ageToInput]);

  useEffect(() => {
    // Attach the event listener when the component mounts
    document.addEventListener("click", handleClickOutside);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div>
        {locationsSelected?.map((location, locationIndex) => (
          <div key={locationIndex}>
            <div className="flex items-center gap-x-1">
              <div className="basis-[70%]">
                {locationIndex === 0 && (
                  <label className={`${styles.inputLabel} font-bold text-gray-700`}>Search locations to target </label>
                )}
                <input
                  placeholder="Search Locations"
                  onFocusCapture={() => {
                    if (props?.focusLocation) {
                      props.focusLocation(true);
                    }
                  }}
                  className={`${styles.inputBox} mt-1 focus:ring-1 focus:ring-purple-300`}
                  value={locationsSelected[locationIndex].name}
                  onChange={(e) => searchLocations(e.target.value, locationIndex)}
                  onFocus={() => props.setMarker(location)}
                />
              </div>
              <div className="flex basis-[30%] items-center">
                <div className="w-full">
                  {locationIndex === 0 && (
                    <label className={`${styles.inputLabel} font-bold text-gray-700`}>Radius</label>
                  )}
                  <ListBox
                    disabled={!canSetValues(locationsSelected[locationIndex].type)}
                    items={radius}
                    selected={
                      canSetValues(locationsSelected[locationIndex].type)
                        ? locationsSelected[locationIndex].radius
                        : "--"
                    }
                    onSelect={(value) => selectRadius(value, locationIndex)}
                  />
                </div>
                <div className="w-full">
                  {locationIndex === 0 && (
                    <label className={`${styles.inputLabel} font-bold text-transparent`}>Unit</label>
                  )}

                  <ListBox
                    disabled={!canSetValues(locationsSelected[locationIndex].type)}
                    items={radiusUnits}
                    selected={
                      canSetValues(locationsSelected[locationIndex].type)
                        ? locationsSelected[locationIndex].radiusUnit
                        : "--"
                    }
                    onSelect={(value) => selectRadiusUnit(value, locationIndex)}
                  />
                </div>
              </div>
              <div className="pt-1">
                {locationIndex === 0 && <label className={`${styles.inputLabel} font-bold text-transparent`}></label>}
                <span
                  className={`material-symbols-outlined top-[40%] cursor-pointer text-lg text-gray-600 ${
                    locationIndex === 0 ? "mt-5" : ""
                  }`}
                  onClick={() => deleteLocation(locationIndex)}
                >
                  delete
                </span>
              </div>
            </div>
            <div
              ref={targetDivRef}
              className={
                searchIndex === locationIndex && ifValidSearch(locationIndex) && showSearch
                  ? "absolute  z-50 mb-3 max-h-40 overflow-auto shadow-md"
                  : "hidden"
              }
            >
              {selectableLocations?.map((location, index) => (
                <div
                  key={index}
                  className="flex cursor-pointer items-center gap-x-1 bg-white p-2 text-white hover:bg-gray-200"
                  onClick={() => addLocation(location, locationIndex)}
                >
                  <span className="material-symbols-outlined text-base text-gray-900">location_on</span>
                  <p className="text-sm font-semibold text-gray-700">
                    {location.name}, {location.region} {location.country}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex w-full justify-end">
          <button
            className={`mt-4 flex items-center gap-x-1 rounded-full border border-solid  px-3 py-1 ${
              readyToAddNewLocation() ? "border-purple-500 text-purple-500" : "border-gray-500 text-gray-600"
            }`}
            onClick={() => createNewLocationField()}
          >
            <span className="material-symbols-outlined text-base">add</span>
            <p className="font-bold">Add Location</p>
          </button>
        </div>
      </div>

      <div className="mt-1 flex gap-x-5">
        <div className="basis-1/3">
          <label className={`${styles.inputLabel} font-semibold text-gray-700`}>Gender</label>
          <ListBox items={["All", "Male", "Female"]} selected={gender} onSelect={selectGender} />
        </div>
        <div className="basis-1/3">
          <label className={`${styles.inputLabel} font-semibold text-gray-700`}>Age From</label>
          <ListBox items={ageFromSelections} selected={ageFrom} onSelect={(e) => setAgeInput(e, "ageFrom")} />
        </div>
        <div className="basis-1/3">
          <label className={`${styles.inputLabel} font-semibold text-gray-700`}>Age To</label>
          <ListBox items={ageToSelections} selected={ageTo} onSelect={(e) => setAgeInput(e, "ageTo")} />
        </div>
      </div>
    </>
  );
};

export default LocationDemographics;
